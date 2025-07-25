#!/usr/bin/env node

import { readCSP } from './read_headers';
import { writeCSP } from './write_headers';

/* Note: run with: npx ts-node src/ingress-headers.ts read example/ingress.yaml */
/* Or: npx ts-node src/ingress-headers.ts write target.yaml < headers.json */
/* Or pipe: npx ts-node src/ingress-headers.ts read source.yaml | npx ts-node src/ingress-headers.ts write target.yaml */

const showUsage = () => {
  console.error("Usage:");
  console.error("  ingress-headers read <yaml-file>                  # Extract CSP from YAML file");
  console.error("  ingress-headers write <yaml-file> < headers.json  # Update CSP in YAML file from stdin");
  console.error("");
  console.error("Examples:");
  console.error("  ingress-headers read example/ingress.yaml");
  console.error("  ingress-headers write target.yaml < headers.json");
  console.error("  ingress-headers read source.yaml | ingress-headers write target.yaml");
};

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

const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("Error: Missing required arguments.");
    showUsage();
    process.exit(1);
  }

  const command = args[0];
  const yamlFile = args[1];

  switch (command) {
    case 'read':
      try {
        const cspJson = readCSP(yamlFile);
        console.log(JSON.stringify(cspJson, null, 2));
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
      break;

    case 'write':
      try {
        // Read JSON from stdin
        const jsonContent = await readStdin();
        
        if (!jsonContent) {
          console.error("Error: No JSON data provided via stdin.");
          console.error("Usage: ingress-headers write <yaml-file> < headers.json");
          process.exit(1);
        }
        
        // Parse the JSON CSP data
        const cspJson = JSON.parse(jsonContent);
        
        const result = await writeCSP(yamlFile, cspJson);
        
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
      break;

    default:
      console.error(`Error: Unknown command '${command}'. Expected 'read' or 'write'.`);
      showUsage();
      process.exit(1);
  }
};

// CLI functionality when run directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
