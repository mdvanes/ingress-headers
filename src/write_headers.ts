#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { CSPDirectives } from "./read_headers.js";

/* Note: run with: npx ts-node src/write_headers.ts values/te-tst/portal-kpnthings.yaml < headers.json */
/* Or pipe from read_headers.ts: npx ts-node src/read_headers.ts values/te-tst/portal-kpnthings.yaml | npx ts-node src/write_headers.ts values/te-dev/portal-kpnthings.yaml */

/**
 * Updates a YAML file with new Content Security Policy directives
 * @param yamlFilePath - Path to the YAML file to update
 * @param cspData - CSP directives object
 * @returns Promise resolving to success message
 */
export async function writeCSP(yamlFilePath: string, cspData: CSPDirectives): Promise<string> {
  const yamlPath = path.resolve(yamlFilePath);
  
  if (!fs.existsSync(yamlPath)) {
    throw new Error(`YAML file not found: ${yamlPath}`);
  }

  // Read YAML file
  const yamlContent = fs.readFileSync(yamlPath, "utf8");

  // Convert JSON back to CSP string format
  const cspDirectives = Object.entries(cspData)
    .map(([directive, values]) => {
      return `${directive} ${Array.isArray(values) ? values.join(" ") : values}`;
    })
    .join("; ");

  // Find and replace the existing CSP in the YAML
  const cspRegex = /(add_header Content-Security-Policy ")(.*?)(";)/s;
  const cspMatch = yamlContent.match(cspRegex);

  if (!cspMatch) {
    throw new Error("Content-Security-Policy header not found in YAML file.");
  }

  // Replace the CSP content while preserving the header format
  const updatedYamlContent = yamlContent.replace(
    cspRegex,
    `$1${cspDirectives}$3`
  );

  // Write the updated content back to the YAML file
  fs.writeFileSync(yamlPath, updatedYamlContent, "utf8");

  return `Successfully updated CSP in: ${yamlPath}`;
}

// Read JSON from stdin helper function
const readStdin = (): Promise<string> => {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
  });
};

// CLI functionality when run directly
// CLI usage when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const yamlFilePath = process.argv[2];

  if (!yamlFilePath) {
    console.error("Error: Please provide a YAML file path as an argument.");
    console.error("Usage: npx ts-node src/write_headers.ts values/te-tst/portal-kpnthings.yaml < headers.json");
    console.error("Or pipe: npx ts-node src/read_headers.ts source.yaml | npx ts-node src/write_headers.ts target.yaml");
    process.exit(1);
  }

  const run = async () => {
    try {
      // Read JSON from stdin
      const jsonContent = await readStdin();
      
      if (!jsonContent) {
        console.error("Error: No JSON data provided via stdin.");
        console.error("Usage: npx ts-node src/write_headers.ts values/te-tst/portal-kpnthings.yaml < headers.json");
        process.exit(1);
      }
      
      // Parse the JSON CSP data
      const cspJson: CSPDirectives = JSON.parse(jsonContent);
      
      const result = await writeCSP(yamlFilePath, cspJson);
      
      console.log(`✅ ${result}`);
      console.log(`📄 Applied CSP from stdin`);
      console.log(`🔒 New CSP contains ${Object.keys(cspJson).length} directives`);
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Error: Invalid JSON format in stdin input.");
      } else {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      process.exit(1);
    }
  };

  run();
}
