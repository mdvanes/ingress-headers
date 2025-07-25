[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/mdvanes/ingress-headers/ci.yml)](https://github.com/mdvanes/ingress-headers/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/%40mdworld%2Fingress-headers?cb)](https://www.npmjs.com/package/@mdworld/ingress-headers)

# ingress-headers

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

## Installation

```bash
npm i -g @mdworld/ingress-headers
```

## Usage

### As a Library

```typescript
import { readCSP, writeCSP, CSPDirectives } from "ingress-headers";

// Read CSP from YAML file
const cspData: CSPDirectives = readCSP("path/to/ingress.yaml");

// Write CSP to YAML file
await writeCSP("path/to/target.yaml", cspData);
```

### Command Line Tools

After installation, you can use the unified CLI tool:

```bash
# Extracts CSP from a YAML file and outputs it as JSON to stdout
ingress-headers read example/ingress.yaml > headers.json

# Updates CSP in a YAML file using JSON input from stdin
ingress-headers write example/ingress.yaml < headers.json

# Pipe from read to write, this will just copy the CSP header to another YAML
ingress-headers read source.yaml | ingress-headers write target.yaml
```

### Development Mode

Installation:

```bash
npm install
npm run build
```

```bash
# Unified command (recommended)
npx ts-node src/ingress-headers.ts read example/ingress.yaml
npx ts-node src/ingress-headers.ts write target.yaml < headers.json
npx ts-node src/ingress-headers.ts read source.yaml | npx ts-node src/ingress-headers.ts write target.yaml

# Individual commands (for development)
npx ts-node src/read_headers.ts example/ingress.yaml
npx ts-node src/read_headers.ts source.yaml | npx ts-node src/write_headers.ts target.yaml
```
