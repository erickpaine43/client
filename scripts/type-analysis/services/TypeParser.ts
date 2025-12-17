import * as ts from 'typescript';
import { TypeDefinition, TypeKind } from '../models/TypeDefinition';

export class TypeParser {
  constructor(
    private program: ts.Program,
    private checker: ts.TypeChecker
  ) {}

  parseTypeDefinitions(sourceFiles: ts.SourceFile[]): TypeDefinition[] {
    const definitions: TypeDefinition[] = [];

    for (const sourceFile of sourceFiles) {
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node)) {
          const definition = this.extractTypeDefinition(node, sourceFile);
          if (definition) {
            definitions.push(definition);
          }
        }
      });
    }

    return definitions;
  }

  private extractTypeDefinition(node: ts.Node, sourceFile: ts.SourceFile): TypeDefinition | null {
    const name = this.getNodeName(node);
    if (!name) return null;

    const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

    return {
      name,
      filePath: sourceFile.fileName,
      lineNumber,
      kind: this.getTypeKind(node),
      structure: node,
      imports: this.extractImports(sourceFile),
      exports: this.extractExports(sourceFile),
      usage: [] // Will be populated by usage analysis
    };
  }

  private getNodeName(node: ts.Node): string | undefined {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node)) {
      return node.name?.getText();
    }
    return undefined;
  }

  private getTypeKind(node: ts.Node): TypeKind {
    if (ts.isInterfaceDeclaration(node)) return 'interface';
    if (ts.isTypeAliasDeclaration(node)) return 'type';
    if (ts.isEnumDeclaration(node)) return 'enum';
    if (ts.isClassDeclaration(node)) return 'class';
    throw new Error('Unknown type kind');
  }

  private extractImports(sourceFile: ts.SourceFile): string[] {
    const imports: string[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        imports.push(node.moduleSpecifier.getText().replace(/['"]/g, ''));
      }
    });

    return imports;
  }

  private extractExports(sourceFile: ts.SourceFile): string[] {
    const exports: string[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(element => {
            exports.push(element.name.getText());
          });
        }
      } else if (ts.isVariableStatement(node) && node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        // Handle export const/let/var
        node.declarationList.declarations.forEach(decl => {
          if (ts.isVariableDeclaration(decl) && decl.name && ts.isIdentifier(decl.name)) {
            exports.push(decl.name.getText());
          }
        });
      } else if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) &&
                 node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        const name = this.getNodeName(node);
        if (name) exports.push(name);
      }
    });

    return exports;
  }
}
