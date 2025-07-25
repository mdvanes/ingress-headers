/**
 * Ingress Headers - A TypeScript utility for managing Content Security Policy headers
 * from Kubernetes ingress YAML files.
 */

export { readCSP, CSPDirectives } from './read_csp';
export { writeCSP } from './write_csp';

// Re-export types
export * from './types';
