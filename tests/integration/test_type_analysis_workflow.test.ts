import * as ts from 'typescript';
import { TypeParser } from '../../scripts/type-analysis/services/TypeParser';
import { TypeCategorizer } from '../../scripts/type-analysis/services/TypeCategorizer';

describe('Type Analysis Workflow Integration', () => {
  let parser: TypeParser;
  let categorizer: TypeCategorizer;

  beforeEach(() => {
    const mockProgram = {} as ts.Program;
    const mockChecker = {} as ts.TypeChecker;
    parser = new TypeParser(mockProgram, mockChecker);
    categorizer = new TypeCategorizer();
  });

  describe('Complete type analysis workflow', () => {
    it('should parse and categorize a complete codebase sample', () => {
      // Create a comprehensive sample of different type definitions
      const sourceFiles = [
        ts.createSourceFile(
          'types/api.ts',
          `
          export interface CampaignResponse {
            id: string;
            name: string;
            status: CampaignStatus;
          }

          export interface UserRequest {
            email: string;
            password: string;
          }
          `,
          ts.ScriptTarget.ES2020,
          true
        ),
        ts.createSourceFile(
          'types/database.ts',
          `
          export interface UserSchema {
            id: string;
            email: string;
            createdAt: Date;
          }

          export type CampaignStatus = 'active' | 'inactive' | 'draft';
          `,
          ts.ScriptTarget.ES2020,
          true
        ),
        ts.createSourceFile(
          'components/Button/types.ts',
          `
          export interface ButtonProps {
            children: React.ReactNode;
            onClick?: () => void;
            variant?: 'primary' | 'secondary';
          }
          `,
          ts.ScriptTarget.ES2020,
          true
        ),
        ts.createSourceFile(
          'components/auth/LoginForm.ts',
          `
          export interface LoginFormData {
            email: string;
            password: string;
            rememberMe?: boolean;
          }
          `,
          ts.ScriptTarget.ES2020,
          true
        ),
        ts.createSourceFile(
          'types/common.ts',
          `
          export interface User {
            id: string;
            email: string;
            name: string;
          }

          export interface Campaign {
            id: string;
            name: string;
            userId: string;
          }

          export interface EmailValidation {
            email: string;
            isValid: boolean;
            errors: string[];
          }

          export type ApiResponse<T> = {
            data: T;
            success: boolean;
            message?: string;
          };
          `,
          ts.ScriptTarget.ES2020,
          true
        )
      ];

      // Step 1: Parse all type definitions
      const typeDefinitions = parser.parseTypeDefinitions(sourceFiles);

      // Verify parsing results
      expect(typeDefinitions).toHaveLength(10); // All interfaces and types should be found

      // Check specific type definitions
      const campaignResponse = typeDefinitions.find(t => t.name === 'CampaignResponse');
      expect(campaignResponse).toBeDefined();
      expect(campaignResponse?.kind).toBe('interface');
      expect(campaignResponse?.filePath).toBe('types/api.ts');

      const buttonProps = typeDefinitions.find(t => t.name === 'ButtonProps');
      expect(buttonProps).toBeDefined();
      expect(buttonProps?.kind).toBe('interface');

      // Step 2: Categorize types
      const categorized = categorizer.categorizeTypes(typeDefinitions);

      // Verify categorization
      expect(categorized['Backend/DB']).toContainEqual(
        expect.objectContaining({ name: 'CampaignResponse' })
      );
      expect(categorized['Backend/DB']).toContainEqual(
        expect.objectContaining({ name: 'UserRequest' })
      );
      expect(categorized['Backend/DB']).toContainEqual(
        expect.objectContaining({ name: 'UserSchema' })
      );
      expect(categorized['Backend/DB']).toContainEqual(
        expect.objectContaining({ name: 'ApiResponse' })
      );
      expect(categorized['Backend/DB']).toContainEqual(
        expect.objectContaining({ name: 'CampaignStatus' })
      );

      expect(categorized['Frontend/UI']).toContainEqual(
        expect.objectContaining({ name: 'ButtonProps' })
      );
      expect(categorized['Frontend/UI']).toContainEqual(
        expect.objectContaining({ name: 'LoginFormData' })
      );

      expect(categorized['Shared/Common']).toContainEqual(
        expect.objectContaining({ name: 'User' })
      );
      expect(categorized['Shared/Common']).toContainEqual(
        expect.objectContaining({ name: 'Campaign' })
      );
      expect(categorized['Shared/Common']).toContainEqual(
        expect.objectContaining({ name: 'EmailValidation' })
      );

      // Verify category counts
      expect(categorized['Backend/DB']).toHaveLength(4);
      expect(categorized['Frontend/UI']).toHaveLength(2);
      expect(categorized['Shared/Common']).toHaveLength(4);
    });

    it('should handle empty source files gracefully', () => {
      const sourceFiles: ts.SourceFile[] = [];

      const typeDefinitions = parser.parseTypeDefinitions(sourceFiles);
      const categorized = categorizer.categorizeTypes(typeDefinitions);

      expect(typeDefinitions).toHaveLength(0);
      expect(categorized['Backend/DB']).toHaveLength(0);
      expect(categorized['Frontend/UI']).toHaveLength(0);
      expect(categorized['Shared/Common']).toHaveLength(0);
    });

    it('should process single source file correctly', () => {
      const sourceFile = ts.createSourceFile(
        'types/single.ts',
        `
        export interface TestInterface {
          id: string;
        }

        export type TestType = string;
        `,
        ts.ScriptTarget.ES2020,
        true
      );

      const typeDefinitions = parser.parseTypeDefinitions([sourceFile]);
      const categorized = categorizer.categorizeTypes(typeDefinitions);

      expect(typeDefinitions).toHaveLength(2);
      expect(categorized['Shared/Common']).toHaveLength(2);
    });

    it('should maintain type relationships and metadata', () => {
      const sourceFile = ts.createSourceFile(
        'types/metadata.ts',
        `
        import { CommonType } from './common';

        export interface TestType {
          id: string;
          common: CommonType;
        }
        `,
        ts.ScriptTarget.ES2020,
        true
      );

      const typeDefinitions = parser.parseTypeDefinitions([sourceFile]);

      expect(typeDefinitions).toHaveLength(1);
      const testType = typeDefinitions[0];
      expect(testType.name).toBe('TestType');
      expect(testType.imports).toContain('./common');
      expect(testType.exports).toContain('TestType');
      expect(testType.lineNumber).toBeGreaterThan(0);
    });
  });
});
