import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { readCSP } from '../src/read_headers'
import { writeCSP } from '../src/write_headers'
import type { CSPDirectives } from '../src/types'

describe('ingress-headers integration tests', () => {
  const testDataDir = path.join(__dirname, 'test-data')
  const originalIngressPath = path.join(__dirname, '..', 'example', 'ingress.yaml')
  const testIngressPath = path.join(testDataDir, 'test-ingress.yaml')
  const testOutputPath = path.join(testDataDir, 'test-output.yaml')

  beforeEach(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true })
    }
    
    // Copy original ingress.yaml to test location
    if (fs.existsSync(originalIngressPath)) {
      fs.copyFileSync(originalIngressPath, testIngressPath)
    }
  })

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath)
    }
  })

  describe('readCSP', () => {
    it('should read CSP from example ingress.yaml correctly', () => {
      const result = readCSP(originalIngressPath)
      
      // Verify the structure
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
      
      // Check for expected CSP directives
      expect(result['frame-ancestors']).toEqual(['\'self\''])
      expect(result['default-src']).toContain('\'self\'')
      expect(result['default-src']).toContain('\'unsafe-inline\'')
      expect(result['default-src']).toContain('*.company.com')
      expect(result['default-src']).toContain('*.service.com')
      
      // Verify script-src contains expected values
      expect(result['script-src']).toContain('\'self\'')
      expect(result['script-src']).toContain('\'unsafe-eval\'')
      expect(result['script-src']).toContain('\'unsafe-inline\'')
      
      // Check that values are sorted
      expect(result['default-src']).toEqual([...result['default-src']].sort())
      expect(result['script-src']).toEqual([...result['script-src']].sort())
    })

    it('should throw error for non-existent file', () => {
      expect(() => readCSP('non-existent-file.yaml')).toThrow('File not found')
    })

    it('should throw error for file without CSP header', () => {
      const invalidYamlPath = path.join(testDataDir, 'invalid.yaml')
      fs.writeFileSync(invalidYamlPath, 'my_ingress:\n  nameOverride: "test"\n')
      
      expect(() => readCSP(invalidYamlPath)).toThrow('Content-Security-Policy header not found')
      
      fs.unlinkSync(invalidYamlPath)
    })
  })

  describe('writeCSP', () => {
    it('should write CSP to YAML file correctly', async () => {
      // First read the original CSP
      const originalCSP = readCSP(originalIngressPath)
      
      // Modify some values for testing
      const modifiedCSP: CSPDirectives = {
        ...originalCSP,
        'default-src': ['\'self\'', 'test.example.com'],
        'script-src': ['\'self\'', '\'unsafe-inline\'', 'scripts.example.com']
      }
      
      // Write to test file
      await writeCSP(testIngressPath, modifiedCSP)
      
      // Read back and verify
      const writtenCSP = readCSP(testIngressPath)
      expect(writtenCSP['default-src']).toEqual(['\'self\'', 'test.example.com'])
      expect(writtenCSP['script-src']).toEqual(['\'self\'', '\'unsafe-inline\'', 'scripts.example.com'])
    })

    it('should preserve YAML structure when updating CSP', async () => {
      const originalContent = fs.readFileSync(testIngressPath, 'utf8')
      const originalCSP = readCSP(testIngressPath)
      
      // Write back the same CSP
      await writeCSP(testIngressPath, originalCSP)
      
      const newContent = fs.readFileSync(testIngressPath, 'utf8')
      
      // The file structure should be preserved (except for the CSP line)
      expect(newContent).toContain('my_ingress:')
      expect(newContent).toContain('nameOverride:')
      expect(newContent).toContain('hosts:')
      expect(newContent).toContain('tlsEnabled:')
    })

    it('should throw error for non-existent file', async () => {
      const testCSP: CSPDirectives = { 'default-src': ['\'self\''] }
      
      await expect(writeCSP('non-existent-file.yaml', testCSP))
        .rejects.toThrow('YAML file not found')
    })

    it('should throw error for file without CSP header', async () => {
      const invalidYamlPath = path.join(testDataDir, 'invalid-write.yaml')
      fs.writeFileSync(invalidYamlPath, 'my_ingress:\n  nameOverride: "test"\n')
      
      const testCSP: CSPDirectives = { 'default-src': ['\'self\''] }
      
      await expect(writeCSP(invalidYamlPath, testCSP))
        .rejects.toThrow('Content-Security-Policy header not found')
      
      fs.unlinkSync(invalidYamlPath)
    })
  })

  describe('round-trip operations', () => {
    it('should maintain data integrity in read -> write -> read cycle', async () => {
      // Read original
      const originalCSP = readCSP(originalIngressPath)
      
      // Write to test file
      await writeCSP(testIngressPath, originalCSP)
      
      // Read back
      const roundTripCSP = readCSP(testIngressPath)
      
      // Should be identical
      expect(roundTripCSP).toEqual(originalCSP)
    })

    it('should handle complex CSP modifications correctly', async () => {
      const originalCSP = readCSP(originalIngressPath)
      
      // Create a complex modification
      const modifiedCSP: CSPDirectives = {
        ...originalCSP,
        'default-src': ['\'self\'', 'https://api.example.com', 'https://cdn.example.com'],
        'script-src': ['\'self\'', '\'unsafe-inline\'', 'https://scripts.example.com'],
        'img-src': ['\'self\'', 'data:', 'https://images.example.com'],
        'new-directive': ['https://new.example.com']
      }
      
      // Write and read back
      await writeCSP(testIngressPath, modifiedCSP)
      const result = readCSP(testIngressPath)
      
      // Verify all modifications
      expect(result['default-src']).toEqual(['\'self\'', 'https://api.example.com', 'https://cdn.example.com'])
      expect(result['script-src']).toEqual(['\'self\'', '\'unsafe-inline\'', 'https://scripts.example.com'])
      expect(result['img-src']).toEqual(['\'self\'', 'data:', 'https://images.example.com'])
      expect(result['new-directive']).toEqual(['https://new.example.com'])
    })
  })

  describe('CSP parsing edge cases', () => {
    it('should handle empty directive values', async () => {
      const originalCSP = readCSP(originalIngressPath)
      const cspWithEmpty: CSPDirectives = {
        ...originalCSP,
        'empty-directive': []
      }
      
      await writeCSP(testIngressPath, cspWithEmpty)
      const result = readCSP(testIngressPath)
      
      // Empty directive should create "empty-directive " (with space)
      expect(result['empty-directive']).toEqual([])
    })

    it('should handle single-value directives', async () => {
      const originalCSP = readCSP(originalIngressPath)
      const cspWithSingle: CSPDirectives = {
        ...originalCSP,
        'single-directive': ['https://single.example.com']
      }
      
      await writeCSP(testIngressPath, cspWithSingle)
      const result = readCSP(testIngressPath)
      
      expect(result['single-directive']).toEqual(['https://single.example.com'])
    })

    it('should sort directive values consistently', () => {
      const result = readCSP(originalIngressPath)
      
      // Verify that all directives with multiple values are sorted
      Object.values(result).forEach(values => {
        if (values.length > 1) {
          expect(values).toEqual([...values].sort())
        }
      })
    })
  })
})
