import * as ts from 'typescript';
import { TypeParser } from '../../scripts/type-analysis/services/TypeParser';

describe('TypeParser', () => {
  let parser: TypeParser;
  let mockProgram: ts.Program;
  let mockChecker: ts.TypeChecker;

  beforeEach(() => {
    // Create mock TypeScript program and checker
    mockProgram = {} as ts.Program;
    mockChecker = {} as ts.TypeChecker;
    parser = new TypeParser(mockProgram, mockChecker);
  });

  describe('parseTypeDefinitions', () => {
    it('should parse interface definitions', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'interface User { id: string; name: string; }',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toMatchObject({
        name: 'User',
        kind: 'interface',
        filePath: 'test.ts'
      });
    });

    it('should parse type alias definitions', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'type UserId = string;',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toMatchObject({
        name: 'UserId',
        kind: 'type',
        filePath: 'test.ts'
      });
    });

    it('should parse enum definitions', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'enum Status { Active, Inactive }',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(1);
      expect(definitions[0]).toMatchObject({
        name: 'Status',
        kind: 'enum',
        filePath: 'test.ts'
      });
    });

    it('should extract import statements', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'import { Campaign } from "./campaign";\ninterface User { campaign: Campaign; }',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions[0].imports).toContain('./campaign');
    });

    it('should extract export statements', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'export interface User { id: string; }',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions[0].exports).toContain('User');
    });

    it('should skip non-type statements', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'const x = 1;\nfunction test() {}\ninterface User {}',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(1);
      expect(definitions[0].name).toBe('User');
    });

    it('should handle empty source files', () => {
      const sourceFile = ts.createSourceFile(
        'empty.ts',
        '',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(0);
    });

    it('should handle multiple type definitions in one file', () => {
      const sourceFile = ts.createSourceFile(
        'test.ts',
        'interface User { id: string; }\ntype UserId = string;\nenum Status { Active }',
        ts.ScriptTarget.ES2020,
        true
      );

      const definitions = parser.parseTypeDefinitions([sourceFile]);

      expect(definitions).toHaveLength(3);
      const names = definitions.map((d: { name: string }) => d.name);
      expect(names).toEqual(expect.arrayContaining(['User', 'UserId', 'Status']));
    });
  });
});
