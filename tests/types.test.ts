import { describe, it, expect } from 'vitest'
import type { CSPDirectives, CSPWriteResult } from '../src/types'

describe('Type definitions', () => {
  describe('CSPDirectives', () => {
    it('should accept valid CSP directive structure', () => {
      const validCSP: CSPDirectives = {
        'default-src': ['\'self\'', 'https://example.com'],
        'script-src': ['\'self\'', '\'unsafe-inline\''],
        'img-src': ['\'self\'', 'data:', 'https://images.example.com']
      }
      
      expect(validCSP['default-src']).toEqual(['\'self\'', 'https://example.com'])
      expect(validCSP['script-src']).toEqual(['\'self\'', '\'unsafe-inline\''])
      expect(validCSP['img-src']).toEqual(['\'self\'', 'data:', 'https://images.example.com'])
    })

    it('should accept empty directive arrays', () => {
      const cspWithEmpty: CSPDirectives = {
        'default-src': ['\'self\''],
        'empty-directive': []
      }
      
      expect(cspWithEmpty['empty-directive']).toEqual([])
    })

    it('should accept dynamic directive names', () => {
      const dynamicCSP: CSPDirectives = {}
      dynamicCSP['custom-directive'] = ['https://custom.example.com']
      
      expect(dynamicCSP['custom-directive']).toEqual(['https://custom.example.com'])
    })
  })

  describe('CSPWriteResult', () => {
    it('should define the correct structure', () => {
      const writeResult: CSPWriteResult = {
        success: true,
        message: 'Successfully updated CSP',
        filePath: '/path/to/file.yaml',
        directiveCount: 5
      }
      
      expect(writeResult.success).toBe(true)
      expect(writeResult.message).toBe('Successfully updated CSP')
      expect(writeResult.filePath).toBe('/path/to/file.yaml')
      expect(writeResult.directiveCount).toBe(5)
    })

    it('should handle failure case', () => {
      const failureResult: CSPWriteResult = {
        success: false,
        message: 'Failed to update CSP',
        filePath: '/path/to/file.yaml',
        directiveCount: 0
      }
      
      expect(failureResult.success).toBe(false)
      expect(failureResult.message).toBe('Failed to update CSP')
    })
  })
})
