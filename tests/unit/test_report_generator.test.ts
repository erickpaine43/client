/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReportGenerator } from '../../scripts/type-analysis/services/ReportGenerator';
import { TypeDefinition } from '../../scripts/type-analysis/models/TypeDefinition';
import { CategorizedTypes } from '../../scripts/type-analysis/models/TypeCategory';
import { ConflictAnalysis } from '../../scripts/type-analysis/models/TypeConflict';

describe('ReportGenerator', () => {
  let reportGenerator: ReportGenerator;

  beforeEach(() => {
    reportGenerator = new ReportGenerator();
  });

  describe('generateSummary', () => {
    it('should generate summary with correct type counts', () => {
      const types: TypeDefinition[] = [
        {
          name: 'User',
          filePath: 'types/common.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        },
        {
          name: 'Campaign',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized: CategorizedTypes = {
        'Backend/DB': [types[1]],
        'Frontend/UI': [],
        'Shared/Common': [types[0]]
      };

      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: []
      };

      const summary = (reportGenerator as unknown as { generateSummary: (t: unknown[], c: unknown, cf: unknown) => any }).generateSummary(types, categorized, conflicts);

      expect((summary as any).totalTypes).toBe(2);
      expect((summary as any).totalDuplicates).toBe(0);
      expect((summary as any).totalConflicts).toBe(0);
      expect((summary as any).categoriesBreakdown['Backend/DB']).toBe(1);
      expect((summary as any).categoriesBreakdown['Frontend/UI']).toBe(0);
      expect((summary as any).categoriesBreakdown['Shared/Common']).toBe(1);
    });
  });

  describe('generateCategoryReports', () => {
    it('should generate category reports with type summaries', () => {
      const types: TypeDefinition[] = [
        {
          name: 'User',
          filePath: 'types/common.ts',
          lineNumber: 5,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized: CategorizedTypes = {
        'Backend/DB': [],
        'Frontend/UI': [],
        'Shared/Common': [types[0]]
      };

      const reports = (reportGenerator as unknown as { generateCategoryReports: (c: unknown) => unknown[] }).generateCategoryReports(categorized);

      expect(reports).toHaveLength(3);
      const sharedCategory = reports.find((r: unknown) => (r as { categoryName: string }).categoryName === 'Shared/Common');
      expect((sharedCategory as any)?.typeCount).toBe(1);
      expect((sharedCategory as any)?.types[0]).toEqual({
        name: 'User',
        filePath: 'types/common.ts',
        lineNumber: 5,
        kind: 'interface'
      });
      expect((sharedCategory as any)?.description).toContain('Common domain entities');
    });
  });

  describe('generateConflictReports', () => {
    it('should generate conflict reports from conflict analysis', () => {
      const types: TypeDefinition[] = [
        {
          name: 'TestType',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        },
        {
          name: 'TestType',
          filePath: 'components/TestType.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const conflicts: ConflictAnalysis = {
        conflicts: [
          {
            typeName: 'TestType',
            definitions: types,
            conflictType: 'semantic-conflict',
            resolution: 'create-layer-specific-variants',
            breakingChanges: true,
            description: 'Type exists in multiple layers'
          }
        ],
        totalDuplicates: 0,
        totalConflicts: 1,
        recommendations: []
      };

      const reports = (reportGenerator as unknown as { generateConflictReports: (c: unknown) => unknown[] }).generateConflictReports(conflicts);

      expect(reports).toHaveLength(1);
      expect((reports[0] as any).typeName).toBe('TestType');
      expect((reports[0] as any).conflictType).toBe('semantic-conflict');
      expect((reports[0] as any).locations).toEqual(['types/api.ts:1', 'components/TestType.ts:1']);
      expect((reports[0] as any).resolution).toBe('create-layer-specific-variants');
      expect((reports[0] as any).breakingChanges).toBe(true);
    });
  });

  describe('generateMarkdownReport', () => {
    it('should generate markdown with summary table', () => {
      const types: TypeDefinition[] = [
        {
          name: 'TestType',
          filePath: 'types/test.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized: CategorizedTypes = {
        'Backend/DB': [],
        'Frontend/UI': [],
        'Shared/Common': [types[0]]
      };

      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: ['Test recommendation']
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      expect(markdown).toContain('# Type Analysis Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('**Total Types**: 1');
      expect(markdown).toContain('**Duplicated Types**: 0');
      expect(markdown).toContain('**Layer Conflicts**: 0');
      expect(markdown).toContain('| Category | Count | Description |');
      expect(markdown).toContain('| Shared/Common | 1 |');
      expect(markdown).toContain('## Recommendations');
      expect(markdown).toContain('Test recommendation');
    });

    it('should include type categories section with tables', () => {
      const types: TypeDefinition[] = [
        {
          name: 'UserType',
          filePath: 'types/user.ts',
          lineNumber: 10,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized: CategorizedTypes = {
        'Backend/DB': [],
        'Frontend/UI': [],
        'Shared/Common': [types[0]]
      };

      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: []
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      expect(markdown).toContain('## Type Categories');
      expect(markdown).toContain('### Shared/Common (1 types)');
      expect(markdown).toContain('Common domain entities, validation schemas, and shared utility types');
      expect(markdown).toContain('| Type Name | File | Line |');
      expect(markdown).toContain('| UserType | user.ts | 10 |');
    });

    it('should include conflicts section when conflicts exist', () => {
      const types: TypeDefinition[] = [
        {
          name: 'ConflictType',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        },
        {
          name: 'ConflictType',
          filePath: 'components/ui.ts',
          lineNumber: 5,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        }
      ];

      const categorized: CategorizedTypes = {
        'Backend/DB': [types[0]],
        'Frontend/UI': [types[1]],
        'Shared/Common': []
      };

      const conflicts: ConflictAnalysis = {
        conflicts: [
          {
            typeName: 'ConflictType',
            definitions: types,
            conflictType: 'semantic-conflict',
            resolution: 'create-layer-specific-variants',
            breakingChanges: true,
            description: 'Type spans multiple architectural layers'
          }
        ],
        totalDuplicates: 0,
        totalConflicts: 1,
        recommendations: ['Create layer-specific variants for ConflictType']
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      expect(markdown).toContain('## Conflicts');
      expect(markdown).toContain('### ConflictType');
      expect(markdown).toContain('- **Type**: semantic-conflict');
      expect(markdown).toContain('- **Resolution**: create-layer-specific-variants');
      expect(markdown).toContain('- **Breaking Changes**: Yes');
      expect(markdown).toContain('- **Description**: Type spans multiple architectural layers');
      expect(markdown).toContain('**Locations**:');
      expect(markdown).toContain('- types/api.ts:1');
      expect(markdown).toContain('- components/ui.ts:5');
    });

    it('should handle empty recommendations', () => {
      const types: TypeDefinition[] = [];
      const categorized: CategorizedTypes = {
        'Backend/DB': [],
        'Frontend/UI': [],
        'Shared/Common': []
      };
      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: []
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      // When there are no recommendations, the section is not included
      expect(markdown).not.toContain('## Recommendations');
    });
  });

  describe('getCategoryDescription', () => {
    it('should return correct descriptions for each category', () => {
      expect((reportGenerator as unknown as { getCategoryDescription: (category: string) => string }).getCategoryDescription('Backend/DB')).toContain('database schemas');
      expect((reportGenerator as unknown as { getCategoryDescription: (category: string) => string }).getCategoryDescription('Frontend/UI')).toContain('UI components');
      expect((reportGenerator as unknown as { getCategoryDescription: (category: string) => string }).getCategoryDescription('Shared/Common')).toContain('Common domain entities');
      expect((reportGenerator as unknown as { getCategoryDescription: (category: string) => string }).getCategoryDescription('Unknown')).toBe('Uncategorized types');
    });
  });
});
