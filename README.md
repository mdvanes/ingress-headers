# Ingress Headers

A TypeScript utility for extracting and managing Content Security Policy (CSP) headers from Kubernetes ingress YAML files.

## Purpose

This package provides tools to:

- **Read** CSP policies from ingress YAML configurations and convert them to structured JSON format
- **Write** CSP policies in ingress YAML files using JSON input

## Use Cases

- **Environment Migration**: Easily copy CSP policies from one environment to another
- **Policy Analysis**: Convert complex CSP strings into readable JSON format for analysis
- **Bulk Updates**: Programmatically update CSP policies across multiple ingress configurations
- **CSP Debugging**: Break down CSP directives into organized, sortable JSON structures

## Tools

### `read_csp.ts`

Extracts Content Security Policy from ingress YAML files and outputs structured JSON.

```bash
npx ts-node src/read_csp.ts example/ingress.yaml
```

**Output**: JSON object with CSP directives organized by type (e.g., `default-src`, `script-src`, `img-src`)

### `write_csp.ts`

Updates Content Security Policy in ingress YAML files using JSON input from stdin.

```bash
# Direct input
npx ts-node src/write_csp.ts target-ingress.yaml < csp.json

# Piped from read_csp.ts
npx ts-node src/read_csp.ts source-ingress.yaml | npx ts-node src/write_csp.ts target-ingress.yaml
```

## Installation

```bash
npm install ingress-headers
```

For development:
```bash
npm install
npm run build
```

## Usage

### As a Library

```typescript
import { readCSP, writeCSP, CSPDirectives } from 'ingress-headers';

// Read CSP from YAML file
const cspData: CSPDirectives = readCSP('path/to/ingress.yaml');

// Write CSP to YAML file
await writeCSP('path/to/target.yaml', cspData);
```

### Command Line Tools

After installation, you can use the CLI tools:

```bash
# Extract CSP from YAML (globally available after npm install -g)
ingress-headers-read example/ingress.yaml

# Update CSP in YAML file
ingress-headers-read source.yaml | ingress-headers-write target.yaml
```

### Development Mode

```bash
# Extract CSP from YAML
npx ts-node src/read_csp.ts example/ingress.yaml

# Update CSP in YAML file  
npx ts-node src/read_csp.ts source.yaml | npx ts-node src/write_csp.ts target.yaml
```

## Requirements

- Node.js >= 14
- TypeScript (for development)

## Build Process

The package is built using TypeScript and generates:
- **JavaScript files** (`.js`) - Compiled TypeScript code
- **Declaration files** (`.d.ts`) - TypeScript type definitions  
- **Source maps** (`.d.ts.map`) - For debugging support

```bash
npm run build    # Compile TypeScript to JavaScript
npm run clean    # Remove dist/ directory
npm run prepare  # Clean and build (runs automatically before publishing)
```

## Example Workflow

1. **Extract** CSP from source environment:

   ```bash
   npx ts-node src/read_csp.ts example/ingress.yaml > current-csp.json
   ```

2. **Modify** the JSON file as needed

3. **Apply** to target environment:
   ```bash
   npx ts-node src/write_csp.ts target/ingress.yaml < current-csp.json
   ```
