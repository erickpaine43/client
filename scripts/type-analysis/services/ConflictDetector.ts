import { TypeDefinition } from '../models/TypeDefinition';
import { TypeConflict, ConflictAnalysis } from '../models/TypeConflict';

export class ConflictDetector {
  detectConflicts(types: TypeDefinition[]): TypeConflict[] {
    const conflicts: TypeConflict[] = [];
    const typeGroups = this.groupTypesByName(types);

    for (const [typeName, definitions] of Array.from(typeGroups)) {
      if (definitions.length > 1) {
        const conflict = this.analyzeTypeConflict(typeName, definitions);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  analyzeConflicts(types: TypeDefinition[]): ConflictAnalysis {
    const conflicts = this.detectConflicts(types);

    return {
      conflicts,
      totalDuplicates: conflicts.filter(c => c.conflictType === 'exact-duplicate').length,
      totalConflicts: conflicts.length,
      recommendations: this.generateRecommendations(conflicts)
    };
  }

  private groupTypesByName(types: TypeDefinition[]): Map<string, TypeDefinition[]> {
    const groups = new Map<string, TypeDefinition[]>();

    for (const type of types) {
      const existing = groups.get(type.name);
      if (!existing) {
        groups.set(type.name, [type]);
      } else {
        existing.push(type);
      }
    }

    return groups;
  }

  private analyzeTypeConflict(typeName: string, definitions: TypeDefinition[]): TypeConflict | null {
    if (definitions.length < 2) return null;

    // Check for exact duplicates
    if (this.areExactDuplicates(definitions)) {
      return {
        typeName,
        definitions,
        conflictType: 'exact-duplicate',
        resolution: 'merge-into-shared-base',
        breakingChanges: false,
        description: `Exact duplicate type definitions found in ${definitions.length} locations`
      };
    }

    // Check for semantic conflicts (different structures)
    if (this.haveSemanticConflicts(definitions)) {
      return {
        typeName,
        definitions,
        conflictType: 'semantic-conflict',
        resolution: 'create-layer-specific-variants',
        breakingChanges: true,
        description: `Type has different structures across files, indicating layer-specific variations`
      };
    }

    // Check for naming conflicts (same name, potentially different purposes)
    return {
      typeName,
      definitions,
      conflictType: 'naming-conflict',
      resolution: 'consolidate-with-renaming',
      breakingChanges: false,
      description: `Type name used in multiple contexts, may benefit from consolidation`
    };
  }

  private areExactDuplicates(definitions: TypeDefinition[]): boolean {
    if (definitions.length < 2) return false;

    // Simple check: compare basic properties instead of full AST structure
    const firstDef = definitions[0];
    return definitions.every(def =>
      def.name === firstDef.name &&
      def.kind === firstDef.kind &&
      def.filePath === firstDef.filePath
    );
  }

  private haveSemanticConflicts(definitions: TypeDefinition[]): boolean {
    if (definitions.length < 2) return false;

    // Check if types are in different file paths that suggest different layers
    const backendPaths = definitions.filter(d =>
      d.filePath.includes('/api/') ||
      d.filePath.includes('/database/') ||
      d.filePath.includes('/backend/')
    );

    const frontendPaths = definitions.filter(d =>
      d.filePath.includes('/components/') ||
      d.filePath.includes('/ui/') ||
      d.filePath.includes('/pages/')
    );

    // If we have both backend and frontend definitions, likely semantic conflict
    return backendPaths.length > 0 && frontendPaths.length > 0;
  }

  private generateRecommendations(conflicts: TypeConflict[]): string[] {
    const recommendations: string[] = [];

    if (conflicts.length === 0) {
      recommendations.push('No type conflicts detected. Codebase has good type organization.');
      return recommendations;
    }

    const exactDuplicates = conflicts.filter(c => c.conflictType === 'exact-duplicate');
    const semanticConflicts = conflicts.filter(c => c.conflictType === 'semantic-conflict');
    const namingConflicts = conflicts.filter(c => c.conflictType === 'naming-conflict');

    if (exactDuplicates.length > 0) {
      recommendations.push(`${exactDuplicates.length} exact duplicate types found. Consider consolidating into shared definitions.`);
    }

    if (semanticConflicts.length > 0) {
      recommendations.push(`${semanticConflicts.length} semantic conflicts detected. Create layer-specific type variants with shared bases.`);
    }

    if (namingConflicts.length > 0) {
      recommendations.push(`${namingConflicts.length} naming conflicts identified. Review and potentially rename for clarity.`);
    }

    recommendations.push('Review breaking changes before implementing consolidation recommendations.');

    return recommendations;
  }
}
