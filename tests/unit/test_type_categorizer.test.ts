import { TypeCategorizer } from '../../scripts/type-analysis/services/TypeCategorizer';
import { TypeDefinition } from '../../scripts/type-analysis/models/TypeDefinition';

describe('TypeCategorizer', () => {
  let categorizer: TypeCategorizer;

  beforeEach(() => {
    categorizer = new TypeCategorizer();
  });

  describe('categorizeType', () => {
    it('should categorize API response types as Backend/DB', () => {
      const typeDef: TypeDefinition = {
        name: 'CampaignResponse',
        filePath: 'types/api.ts',
        lineNumber: 1,
        kind: 'interface',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Backend/DB');
    });

    it('should categorize database schema types as Backend/DB', () => {
      const typeDef: TypeDefinition = {
        name: 'UserSchema',
        filePath: 'types/database.ts',
        lineNumber: 1,
        kind: 'interface',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Backend/DB');
    });

    it('should categorize UI component prop types as Frontend/UI', () => {
      const typeDef: TypeDefinition = {
        name: 'ButtonProps',
        filePath: 'components/Button/types.ts',
        lineNumber: 1,
        kind: 'interface',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Frontend/UI');
    });

    it('should categorize form data types as Frontend/UI', () => {
      const typeDef: TypeDefinition = {
        name: 'LoginFormData',
        filePath: 'components/auth/LoginForm.ts',
        lineNumber: 1,
        kind: 'type',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Frontend/UI');
    });

    it('should categorize domain entities as Shared/Common', () => {
      const typeDef: TypeDefinition = {
        name: 'User',
        filePath: 'types/common.ts',
        lineNumber: 1,
        kind: 'interface',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Shared/Common');
    });

    it('should categorize validation schemas as Shared/Common', () => {
      const typeDef: TypeDefinition = {
        name: 'EmailValidation',
        filePath: 'types/validation.ts',
        lineNumber: 1,
        kind: 'type',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Shared/Common');
    });

    it('should categorize utility types as Backend/DB when they contain api', () => {
      const typeDef: TypeDefinition = {
        name: 'ApiResponse',
        filePath: 'types/common.ts',
        lineNumber: 1,
        kind: 'type',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Backend/DB');
    });

    it('should handle unknown patterns as Shared/Common', () => {
      const typeDef: TypeDefinition = {
        name: 'UnknownType',
        filePath: 'types/misc.ts',
        lineNumber: 1,
        kind: 'interface',
        structure: {},
        imports: [],
        exports: [],
        usage: []
      };

      const category = categorizer.categorizeType(typeDef);

      expect(category).toBe('Shared/Common');
    });
  });

  describe('categorizeTypes', () => {
    it('should categorize multiple types', () => {
      const types: TypeDefinition[] = [
        {
          name: 'UserResponse',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        },
        {
          name: 'ButtonProps',
          filePath: 'components/Button/types.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized = categorizer.categorizeTypes(types);

      expect(categorized['Backend/DB']).toHaveLength(1);
      expect(categorized['Backend/DB'][0].name).toBe('UserResponse');
      expect(categorized['Frontend/UI']).toHaveLength(1);
      expect(categorized['Frontend/UI'][0].name).toBe('ButtonProps');
    });

    it('should handle empty type list', () => {
      const categorized = categorizer.categorizeTypes([]);

      expect(categorized['Backend/DB']).toHaveLength(0);
      expect(categorized['Frontend/UI']).toHaveLength(0);
      expect(categorized['Shared/Common']).toHaveLength(0);
    });
  });
});
