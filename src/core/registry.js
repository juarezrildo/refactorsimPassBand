import { BPSK } from './modulations/bpsk.js';
import { QPSK } from './modulations/qpsk.js';
import { PSK8 } from './modulations/psk8.js';
import { QAM16, QAM64 } from './modulations/qam.js';

class ModulationRegistry {
  constructor() {
    /** @type {Map<string, any>} */
    this._schemes = new Map();
  }

  /**
   * Registra un nuevo esquema de modulación.
   * @param {any} scheme
   */
  register(scheme) {
    if (!scheme || !scheme.name) {
      throw new Error('El esquema de modulación debe poseer un nombre válido.');
    }
    this._schemes.set(scheme.name, scheme);
  }

  /**
   * Obtiene un esquema de modulación por su nombre.
   * @param {string} name
   * @returns {any}
   */
  get(name) {
    const scheme = this._schemes.get(name);
    if (!scheme) {
      throw new Error(`Modulación no registrada: "${name}"`);
    }
    return scheme;
  }

  /**
   * Retorna los nombres de todas las modulaciones registradas.
   * @returns {string[]}
   */
  getNames() {
    return Array.from(this._schemes.keys());
  }

  /**
   * Verifica si una modulación está registrada.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this._schemes.has(name);
  }
}

export const registry = new ModulationRegistry();

// Registro de las modulaciones estándar de la v1
registry.register(BPSK);
registry.register(QPSK);
registry.register(PSK8);
registry.register(QAM16);
registry.register(QAM64);
