import fs from "fs";
import path from "path";

/* Note: run with: npx ts-node src/write_csp.ts values/te-tst/portal-kpnthings.yaml < csp.json */
/* Or pipe from read_csp.ts: npx ts-node src/read_csp.ts values/te-tst/portal-kpnthings.yaml | npx ts-node src/write_csp.ts values/te-dev/portal-kpnthings.yaml */

// Get command line arguments
const yamlFilePath = process.argv[2];

if (!yamlFilePath) {
  console.error("Error: Please provide a YAML file path as an argument.");
  console.error("Usage: npx ts-node src/write_csp.ts values/te-tst/portal-kpnthings.yaml < csp.json");
  console.error("Or pipe: npx ts-node src/read_csp.ts source.yaml | npx ts-node src/write_csp.ts target.yaml");
  process.exit(1);
}

const yamlPath = path.join(__dirname, "..", yamlFilePath);
if (!fs.existsSync(yamlPath)) {
  console.error(`Error: YAML file not found: ${yamlPath}`);
  process.exit(1);
}

// Read YAML file
const yamlContent = fs.readFileSync(yamlPath, "utf8");

// Read JSON from stdin
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

const run = async () => {
  try {
    // Read JSON from stdin
    const jsonContent = await readStdin();
    
    if (!jsonContent) {
      console.error("Error: No JSON data provided via stdin.");
      console.error("Usage: npx ts-node src/write_csp.ts values/te-tst/portal-kpnthings.yaml < csp.json");
      process.exit(1);
    }
    
    // Parse the JSON CSP data
    const cspJson: Record<string, string[]> = JSON.parse(jsonContent);
    
    // Convert JSON back to CSP string format
    const cspDirectives = Object.entries(cspJson)
      .map(([directive, values]) => {
        return `${directive} ${values.join(" ")}`;
      })
      .join("; ");
    
    // Find and replace the existing CSP in the YAML
    const cspRegex = /(add_header Content-Security-Policy ")(.*?)(";)/s;
    const cspMatch = yamlContent.match(cspRegex);
    
    if (!cspMatch) {
      console.error("Content-Security-Policy header not found in YAML file.");
      process.exit(1);
    }
    
    // Replace the CSP content while preserving the header format
    const updatedYamlContent = yamlContent.replace(
      cspRegex,
      `$1${cspDirectives}$3`
    );
    
    // Write the updated content back to the YAML file
    fs.writeFileSync(yamlPath, updatedYamlContent, "utf8");
    
    console.log(`✅ Successfully updated CSP in: ${yamlPath}`);
    console.log(`📄 Applied CSP from stdin`);
    console.log(`🔒 New CSP contains ${Object.keys(cspJson).length} directives`);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error: Invalid JSON format in stdin input.");
    } else {
      console.error(`Error: ${error}`);
    }
    process.exit(1);
  }
};

run();
