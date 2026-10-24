import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODS = { 'BPSK': 2, 'QPSK': 4, '8-PSK': 8, '16-QAM': 16, '64-QAM': 64 };
const gray = n => n ^ (n >> 1);
const pop = n => {
  let c = 0;
  while (n) {
    c += n & 1;
    n >>= 1;
  }
  return c;
};

function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.3275911 * z);
  const r = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z);
  return x >= 0 ? r : 2 - r;
}

const Q = x => 0.5 * erfc(x / Math.SQRT2);

function build(name) {
  const M = MODS[name], k = Math.log2(M), p = [];
  if (name === 'BPSK') {
    p.push({ x: 1, y: 0, l: 0 }, { x: -1, y: 0, l: 1 });
  } else if (name === 'QAM' || name.indexOf('QAM') > 0) {
    const L = Math.sqrt(M), h = k / 2, s = 1 / Math.sqrt(2 * (M - 1) / 3);
    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        p.push({ x: (2 * i - (L - 1)) * s, y: (2 * j - (L - 1)) * s, l: (gray(i) << h) | gray(j) });
      }
    }
  } else {
    const off = M === 4 ? Math.PI / 4 : 0;
    for (let i = 0; i < M; i++) {
      p.push({ x: Math.cos(2 * Math.PI * i / M + off), y: Math.sin(2 * Math.PI * i / M + off), l: gray(i) });
    }
  }
  return { M, k, p };
}

function theory(name, gdb) {
  const g = Math.pow(10, gdb / 10), M = MODS[name], k = Math.log2(M);
  if (M <= 4) return Q(Math.sqrt(2 * g));
  if (name === '8-PSK') return Math.min(0.5, 2 * Q(Math.sqrt(2 * k * g) * Math.sin(Math.PI / M)) / k);
  return Math.min(0.5, (4 / k) * (1 - 1 / Math.sqrt(M)) * Q(Math.sqrt(3 * k * g / (M - 1))));
}

function needed(name, target) {
  let lo = 0, hi = 40;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    theory(name, m) > target ? lo = m : hi = m;
  }
  return hi;
}

function mk(a) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function simulateOriginal(name, gdb, N, seed) {
  const rnd = mk(+seed || 1);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const c = build(name), g = Math.pow(10, gdb / 10), sd = Math.sqrt((1 / c.k) / g / 2);
  let be = 0, se = 0;
  for (let n = 0; n < N; n++) {
    const t = c.p[(rnd() * c.M) | 0];
    const x = t.x + sd * gauss();
    const y = t.y + sd * gauss();
    let b = c.p[0], bd = 1e9;
    for (const q of c.p) {
      const d = (q.x - x) * (q.x - x) + (q.y - y) * (q.y - y);
      if (d < bd) {
        bd = d;
        b = q;
      }
    }
    const e = pop(b.l ^ t.l);
    be += e;
    if (e) se++;
  }
  return { be, se, N, bits: N * c.k };
}

// Validación rápida de valores de control
console.log('Verificando valores de control (semilla 1, 100.000 símbolos)...');
const checks = [
  { mod: 'QPSK', snr: 6, expected: 500 },
  { mod: '8-PSK', snr: 10, expected: 303 },
  { mod: '16-QAM', snr: 10, expected: 726 },
  { mod: '64-QAM', snr: 14, expected: 1290 },
  { mod: 'BPSK', snr: 10, expected: 0 },
];

for (const c of checks) {
  const res = simulateOriginal(c.mod, c.snr, 100000, 1);
  const pass = res.be === c.expected;
  console.log(`- ${c.mod} @ ${c.snr} dB: ${res.be} errores de bit (Esperado: ${c.expected}) -> ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) {
    throw new Error(`Fallo de verificación en ${c.mod} @ ${c.snr} dB`);
  }
}

// Generación de matriz dorada
console.log('\nGenerando dataset de regresión dorada (tests/golden/v1.json)...');
const modulations = ['BPSK', 'QPSK', '8-PSK', '16-QAM', '64-QAM'];
const ebn0List = [0, 4, 6, 8, 10, 14, 16, 20];
const nList = [1000, 20000, 100000];
const seeds = [1, 2, 3];

const goldenData = {
  version: '1.0',
  createdAt: new Date().toISOString(),
  theoryEbN0For1eNeg5: {},
  results: []
};

for (const mod of modulations) {
  goldenData.theoryEbN0For1eNeg5[mod] = needed(mod, 1e-5);
}

let totalSimulations = modulations.length * ebn0List.length * nList.length * seeds.length;
let completed = 0;

for (const mod of modulations) {
  for (const ebn0 of ebn0List) {
    const berTh = theory(mod, ebn0);
    for (const N of nList) {
      for (const seed of seeds) {
        const sim = simulateOriginal(mod, ebn0, N, seed);
        goldenData.results.push({
          mod,
          ebn0,
          N,
          seed,
          bits: sim.bits,
          be: sim.be,
          se: sim.se,
          berSim: sim.be / sim.bits,
          berTheory: berTh
        });
        completed++;
      }
    }
  }
}

const outDir = path.resolve(__dirname, '../tests/golden');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outFile = path.join(outDir, 'v1.json');
fs.writeFileSync(outFile, JSON.stringify(goldenData, null, 2), 'utf8');
console.log(`Completado: ${completed}/${totalSimulations} escenarios guardados en ${outFile}`);
