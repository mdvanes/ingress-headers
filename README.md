# CSP Helper

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
npm install
```

## Requirements

- Node.js
- TypeScript
- ts-node

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
