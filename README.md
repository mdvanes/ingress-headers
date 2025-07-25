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

### `read_headers.ts`

Extracts Content Security Policy from ingress YAML files and outputs structured JSON.

```bash
npx ts-node src/read_headers.ts example/ingress.yaml
```

**Output**: JSON object with CSP directives organized by type (e.g., `default-src`, `script-src`, `img-src`)

### `write_headers.ts`

Updates Content Security Policy in ingress YAML files using JSON input from stdin.

```bash
# Direct input
npx ts-node src/write_headers.ts target-ingress.yaml < headers.json

# Piped from read_headers.ts
npx ts-node src/read_headers.ts source-ingress.yaml | npx ts-node src/write_headers.ts target-ingress.yaml
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

After installation, you can use the unified CLI tool:

```bash
# Extract CSP from YAML (globally available after npm install -g)
ingress-headers read example/ingress.yaml

# Update CSP in YAML file
ingress-headers write target.yaml < headers.json

# Pipe from read to write
ingress-headers read source.yaml | ingress-headers write target.yaml
```

## CLI Usage

The `ingress-headers` command supports two operations:

### Read Command
Extracts CSP from a YAML file and outputs it as JSON:
```bash
ingress-headers read <yaml-file>
```

### Write Command  
Updates CSP in a YAML file using JSON input from stdin:
```bash
ingress-headers write <yaml-file> < headers.json
```

### Combined Operations
You can pipe the output from read directly to write:
```bash
ingress-headers read source.yaml | ingress-headers write target.yaml
```

### Development Mode

```bash
# Unified command (recommended)
npx ts-node src/ingress-headers.ts read example/ingress.yaml
npx ts-node src/ingress-headers.ts write target.yaml < headers.json
npx ts-node src/ingress-headers.ts read source.yaml | npx ts-node src/ingress-headers.ts write target.yaml

# Individual commands (for development)
npx ts-node src/read_headers.ts example/ingress.yaml
npx ts-node src/read_headers.ts source.yaml | npx ts-node src/write_headers.ts target.yaml
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
   ingress-headers read example/ingress.yaml > current-headers.json
   ```

2. **Modify** the JSON file as needed

3. **Apply** to target environment:
   ```bash
   ingress-headers write target/ingress.yaml < current-headers.json
   ```
