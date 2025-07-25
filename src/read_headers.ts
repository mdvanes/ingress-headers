#!/usr/bin/env node

import fs from "fs";
import path from "path";

/* Note: run with: npx ts-node src/read_headers.ts example/ingress.yaml */

export interface CSPDirectives {
  [directiveName: string]: string[];
}

/**
 * Reads a YAML file and extracts the Content Security Policy, returning it as a structured JSON object
 * @param yamlFilePath - Path to the YAML file containing the CSP
 * @returns CSP directives organized by type
 */
export function readCSP(yamlFilePath: string): CSPDirectives {
  const yamlPath = path.resolve(yamlFilePath);
  
  if (!fs.existsSync(yamlPath)) {
    throw new Error(`File not found: ${yamlPath}`);
  }

  const yamlContent = fs.readFileSync(yamlPath, "utf8");

  // Extract the Content-Security-Policy line
  const cspMatch = yamlContent.match(
    /add_header Content-Security-Policy "(.*?)";/s
  );
  
  if (!cspMatch) {
    throw new Error("Content-Security-Policy header not found.");
  }

  const csp = cspMatch[1];

  // Split directives
  const directives = csp
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);

  const cspJson = directives.reduce<Record<string, string[]>>((acc, directive) => {
    const [name, ...values] = directive.split(" ");
    acc[name] = values.map((value) => value.trim()).sort();
    return acc;
  }, {});

  return cspJson;
}

// CLI functionality when run directly
if (require.main === module) {
  const yamlFilePath = process.argv[2];
  if (!yamlFilePath) {
    console.error("Error: Please provide a YAML file path as an argument.");
    console.error("Usage: npx ts-node src/read_headers.ts example/ingress.yaml");
    process.exit(1);
  }

  try {
    const cspJson = readCSP(yamlFilePath);
    console.log(JSON.stringify(cspJson, null, 2));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
