/**
 * Type definitions for CSP Helper
 */

export interface CSPDirectives {
  [directiveName: string]: string[];
}

export interface CSPWriteResult {
  success: boolean;
  message: string;
  filePath: string;
  directiveCount: number;
}
