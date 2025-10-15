import { TypeDefinition } from '../models/TypeDefinition';
import { CategorizedTypes } from '../models/TypeCategory';
import { ConflictAnalysis } from '../models/TypeConflict';

export interface AnalysisReport {
  summary: ReportSummary;
  categories: CategoryReport[];
  conflicts: ConflictReport[];
  recommendations: string[];
}

export interface ReportSummary {
  totalTypes: number;
  totalDuplicates: number;
  totalConflicts: number;
  categoriesBreakdown: Record<string, number>;
}

export interface CategoryReport {
  categoryName: string;
  typeCount: number;
  types: TypeSummary[];
  description: string;
}

export interface TypeSummary {
  name: string;
  filePath: string;
  lineNumber: number;
  kind: string;
}

export interface ConflictReport {
  typeName: string;
  conflictType: string;
  locations: string[];
  resolution: string;
  breakingChanges: boolean;
  description: string;
}

export class ReportGenerator {
  generateReport(types: TypeDefinition[], categorized: CategorizedTypes, conflicts: ConflictAnalysis): AnalysisReport {
    return {
      summary: this.generateSummary(types, categorized, conflicts),
      categories: this.generateCategoryReports(categorized),
      conflicts: this.generateConflictReports(conflicts),
      recommendations: conflicts.recommendations
    };
  }

  generateMarkdownReport(report: AnalysisReport): string {
    let markdown = '# Type Analysis Report\n\n';

    // Summary section
    markdown += '## Summary\n\n';
    markdown += `- **Total Types**: ${report.summary.totalTypes}\n`;
    markdown += `- **Duplicated Types**: ${report.summary.totalDuplicates}\n`;
    markdown += `- **Layer Conflicts**: ${report.summary.totalConflicts}\n\n`;

    markdown += '| Category | Count | Description |\n';
    markdown += '|----------|-------|-------------|\n';
    for (const [category, count] of Object.entries(report.summary.categoriesBreakdown)) {
      const description = this.getCategoryDescription(category);
      markdown += `| ${category} | ${count} | ${description} |\n`;
    }
    markdown += '\n';

    // Categories section
    markdown += '## Type Categories\n\n';
    for (const category of report.categories) {
      markdown += `### ${category.categoryName} (${category.typeCount} types)\n\n`;
      markdown += `${category.description}\n\n`;

      if (category.types.length > 0) {
        markdown += '| Type Name | File | Line |\n';
        markdown += '|-----------|------|------|\n';
        for (const type of category.types) {
          const fileName = type.filePath.split('/').pop() || type.filePath;
          markdown += `| ${type.name} | ${fileName} | ${type.lineNumber} |\n`;
        }
        markdown += '\n';
      }
    }

    // Conflicts section
    if (report.conflicts.length > 0) {
      markdown += '## Conflicts\n\n';
      for (const conflict of report.conflicts) {
        markdown += `### ${conflict.typeName}\n\n`;
        markdown += `- **Type**: ${conflict.conflictType}\n`;
        markdown += `- **Resolution**: ${conflict.resolution}\n`;
        markdown += `- **Breaking Changes**: ${conflict.breakingChanges ? 'Yes' : 'No'}\n`;
        markdown += `- **Description**: ${conflict.description}\n\n`;

        markdown += '**Locations**:\n';
        for (const location of conflict.locations) {
          markdown += `- ${location}\n`;
        }
        markdown += '\n';
      }
    }

    // Recommendations section
    if (report.recommendations.length > 0) {
      markdown += '## Recommendations\n\n';
      for (const recommendation of report.recommendations) {
        markdown += `- ${recommendation}\n`;
      }
      markdown += '\n';
    }

    return markdown;
  }

  private generateSummary(types: TypeDefinition[], categorized: CategorizedTypes, conflicts: ConflictAnalysis): ReportSummary {
    const categoriesBreakdown: Record<string, number> = {};
    for (const [category, typeList] of Object.entries(categorized)) {
      categoriesBreakdown[category] = typeList.length;
    }

    return {
      totalTypes: types.length,
      totalDuplicates: conflicts.totalDuplicates,
      totalConflicts: conflicts.totalConflicts,
      categoriesBreakdown
    };
  }

  private generateCategoryReports(categorized: CategorizedTypes): CategoryReport[] {
    const reports: CategoryReport[] = [];

    for (const [categoryName, types] of Object.entries(categorized)) {
      const typeSummaries: TypeSummary[] = types.map((type: TypeDefinition) => ({
        name: type.name,
        filePath: type.filePath,
        lineNumber: type.lineNumber,
        kind: type.kind
      }));

      reports.push({
        categoryName,
        typeCount: types.length,
        types: typeSummaries,
        description: this.getCategoryDescription(categoryName)
      });
    }

    return reports;
  }

  private generateConflictReports(conflicts: ConflictAnalysis): ConflictReport[] {
    return conflicts.conflicts.map(conflict => ({
      typeName: conflict.typeName,
      conflictType: conflict.conflictType,
      locations: conflict.definitions.map(d => `${d.filePath}:${d.lineNumber}`),
      resolution: conflict.resolution,
      breakingChanges: conflict.breakingChanges,
      description: conflict.description
    }));
  }

  private getCategoryDescription(category: string): string {
    switch (category) {
      case 'Backend/DB':
        return 'Types related to database schemas, API responses, and backend data structures';
      case 'Frontend/UI':
        return 'Types for UI components, form data, and user interface state management';
      case 'Shared/Common':
        return 'Common domain entities, validation schemas, and shared utility types';
      default:
        return 'Uncategorized types';
    }
  }
}
