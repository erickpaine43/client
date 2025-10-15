export type TypeKind = 'interface' | 'type' | 'enum' | 'class';

export interface TypeDefinition {
  name: string;
  filePath: string;
  lineNumber: number;
  kind: TypeKind;
  structure: unknown; // TypeScript AST node
  imports: string[];
  exports: string[];
  usage: UsagePattern[];
}

export interface UsagePattern {
  typeName: string;
  filePath: string;
  usageType: UsageType;
  lineNumber: number;
}

export type UsageType = 'import' | 'extends' | 'implements' | 'property-type';
