import { ReportGenerator } from '../../scripts/type-analysis/services/ReportGenerator';
import { TypeDefinition } from '../../scripts/type-analysis/models/TypeDefinition';
import { CategorizedTypes } from '../../scripts/type-analysis/models/TypeCategory';
import { ConflictAnalysis } from '../../scripts/type-analysis/models/TypeConflict';

describe('Report Generation Integration', () => {
  let reportGenerator: ReportGenerator;

  beforeEach(() => {
    reportGenerator = new ReportGenerator();
  });

  describe('Complete report generation workflow', () => {
    it('should generate a complete analysis report from sample data', () => {
      // Sample type definitions
      const types: TypeDefinition[] = [
        {
          name: 'User',
          filePath: 'types/common.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: ['User'],
          usage: []
        },
        {
          name: 'CampaignResponse',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: ['CampaignResponse'],
          usage: []
        },
        {
          name: 'ButtonProps',
          filePath: 'components/Button/types.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: ['ButtonProps'],
          usage: []
        }
      ];

      // Sample categorization
      const categorized: CategorizedTypes = {
        'Backend/DB': [types[1]], // CampaignResponse
        'Frontend/UI': [types[2]], // ButtonProps
        'Shared/Common': [types[0]] // User
      };

      // Sample conflict analysis
      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: ['No conflicts detected. Good type organization.']
      };

      // Generate report
      const report = reportGenerator.generateReport(types, categorized, conflicts);

      // Verify report structure
      expect(report.summary.totalTypes).toBe(3);
      expect(report.summary.totalDuplicates).toBe(0);
      expect(report.summary.totalConflicts).toBe(0);
      expect(report.summary.categoriesBreakdown['Backend/DB']).toBe(1);
      expect(report.summary.categoriesBreakdown['Frontend/UI']).toBe(1);
      expect(report.summary.categoriesBreakdown['Shared/Common']).toBe(1);

      // Verify categories
      expect(report.categories).toHaveLength(3);
      const backendCategory = report.categories.find(c => c.categoryName === 'Backend/DB');
      expect(backendCategory?.typeCount).toBe(1);
      expect(backendCategory?.types[0].name).toBe('CampaignResponse');

      // Verify recommendations
      expect(report.recommendations).toContain('No conflicts detected. Good type organization.');
    });

    it('should generate markdown report with proper formatting', () => {
      const types: TypeDefinition[] = [
        {
          name: 'TestType',
          filePath: 'types/test.ts',
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

      const conflicts: ConflictAnalysis = {
        conflicts: [],
        totalDuplicates: 0,
        totalConflicts: 0,
        recommendations: ['Sample recommendation']
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      // Verify markdown structure
      expect(markdown).toContain('# Type Analysis Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('**Total Types**: 1');
      expect(markdown).toContain('**Duplicated Types**: 0');
      expect(markdown).toContain('## Type Categories');
      expect(markdown).toContain('Shared/Common');
      expect(markdown).toContain('TestType');
      expect(markdown).toContain('test.ts');
      expect(markdown).toContain('Sample recommendation');
    });

    it('should handle reports with conflicts correctly', () => {
      const types: TypeDefinition[] = [
        {
          name: 'ConflictingType',
          filePath: 'types/api.ts',
          lineNumber: 1,
          kind: 'interface',
          structure: {},
          imports: [],
          exports: [],
          usage: []
        },
        {
          name: 'ConflictingType',
          filePath: 'types/ui.ts',
          lineNumber: 1,
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
            typeName: 'ConflictingType',
            definitions: types,
            conflictType: 'semantic-conflict',
            resolution: 'create-layer-specific-variants',
            breakingChanges: true,
            description: 'Type exists in both backend and frontend layers'
          }
        ],
        totalDuplicates: 0,
        totalConflicts: 1,
        recommendations: ['Consider creating layer-specific variants']
      };

      const report = reportGenerator.generateReport(types, categorized, conflicts);
      const markdown = reportGenerator.generateMarkdownReport(report);

      // Verify conflict reporting
      expect(markdown).toContain('## Conflicts');
      expect(markdown).toContain('ConflictingType');
      expect(markdown).toContain('semantic-conflict');
      expect(markdown).toContain('create-layer-specific-variants');
      expect(markdown).toContain('**Breaking Changes**: Yes');
      expect(markdown).toContain('Consider creating layer-specific variants');
    });

    it('should generate empty report for no types', () => {
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

      expect(report.summary.totalTypes).toBe(0);
      expect(report.categories).toHaveLength(3); // Empty categories still present
      expect(report.conflicts).toHaveLength(0);
    });

    it('should include detailed type information in category reports', () => {
      const types: TypeDefinition[] = [
        {
          name: 'DetailedType',
          filePath: 'src/types/detailed.ts',
          lineNumber: 42,
          kind: 'type',
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

      expect(report.categories[2].types[0]).toEqual({
        name: 'DetailedType',
        filePath: 'src/types/detailed.ts',
        lineNumber: 42,
        kind: 'type'
      });
    });
  });
});
