import fs from "fs";
import path from "path";

/* Note: run with: npx ts-node src/read_csp.ts example/ingress.yaml */

// Get the YAML file path from command line arguments
const yamlFilePath = process.argv[2];
if (!yamlFilePath) {
  console.error("Error: Please provide a YAML file path as an argument.");
  console.error("Usage: npx ts-node src/read_csp.ts example/ingress.yaml");
  process.exit(1);
}

const yamlPath = path.join(__dirname, "..", yamlFilePath);
if (!fs.existsSync(yamlPath)) {
  console.error(`Error: File not found: ${yamlPath}`);
  process.exit(1);
}

const yamlContent = fs.readFileSync(yamlPath, "utf8");

const run = () => {
  // Extract the Content-Security-Policy line
  const cspMatch = yamlContent.match(
    /add_header Content-Security-Policy "(.*?)";/s
  );
  if (!cspMatch) {
    console.error("Content-Security-Policy header not found.");
    process.exit(1);
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
};

const cspJson = run();
console.log(JSON.stringify(cspJson, null, 2));
