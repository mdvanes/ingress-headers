/**
 * Ingress Headers - A TypeScript utility for managing Content Security Policy headers
 * from Kubernetes ingress YAML files.
 */

export { readCSP, CSPDirectives } from './read_headers';
export { writeCSP } from './write_headers';

// Re-export types
export * from './types';
