import { TypeDefinition } from './TypeDefinition';

export type ConflictType = 'exact-duplicate' | 'semantic-conflict' | 'naming-conflict';

export type ResolutionStrategy =
  | 'merge-into-shared-base'
  | 'create-layer-specific-variants'
  | 'consolidate-with-renaming'
  | 'keep-separate-with-documentation';

export interface TypeConflict {
  typeName: string;
  definitions: TypeDefinition[];
  conflictType: ConflictType;
  resolution: ResolutionStrategy;
  breakingChanges: boolean;
  description: string;
}

export interface ConflictAnalysis {
  conflicts: TypeConflict[];
  totalDuplicates: number;
  totalConflicts: number;
  recommendations: string[];
}
