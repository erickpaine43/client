#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { TypeParser } from '../services/TypeParser';
import { TypeCategorizer } from '../services/TypeCategorizer';
import { ConflictDetector } from '../services/ConflictDetector';
import { ReportGenerator } from '../services/ReportGenerator';

interface AnalysisOptions {
  directory?: string;
  output?: string;
  includeDeps?: boolean;
  format?: 'markdown' | 'json';
  verbose?: boolean;
}

class TypeAnalysisCLI {
  private options: AnalysisOptions;

  constructor(options: AnalysisOptions = {}) {
    this.options = {
      directory: options.directory || './types',
      output: options.output || './type-analysis-report.md',
      includeDeps: options.includeDeps || false,
      format: options.format || 'markdown',
      verbose: options.verbose || false
    };
  }

  async run(): Promise<void> {
    try {
      console.log('🔍 Starting TypeScript type analysis...');

      // Find TypeScript files
      const sourceFiles = this.findTypeScriptFiles();
      if (sourceFiles.length === 0) {
        console.warn('⚠️  No TypeScript files found in the specified directory.');
        return;
      }

      if (this.options.verbose) {
        console.log(`📁 Found ${sourceFiles.length} TypeScript files`);
      }

      // Create TypeScript program
      const program = ts.createProgram(sourceFiles, {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        skipLibCheck: true
      });

      const checker = program.getTypeChecker();

      // Initialize services
      const parser = new TypeParser(program, checker);
      const categorizer = new TypeCategorizer();
      const conflictDetector = new ConflictDetector();
      const reportGenerator = new ReportGenerator();

      // Parse type definitions
      const typeDefinitions = parser.parseTypeDefinitions([...program.getSourceFiles()]);
      if (this.options.verbose) {
        console.log(`📊 Parsed ${typeDefinitions.length} type definitions`);
      }

      // Categorize types
      const categorized = categorizer.categorizeTypes(typeDefinitions);

      // Analyze conflicts
      const conflicts = conflictDetector.analyzeConflicts(typeDefinitions);

      // Generate report
      const report = reportGenerator.generateReport(typeDefinitions, categorized, conflicts);

      // Output report
      const output = this.options.output!;
      if (this.options.format === 'json') {
        const jsonOutput = JSON.stringify(report, null, 2);
        if (output === 'stdout') {
          console.log(jsonOutput);
        } else {
          const jsonPath = output.replace('.md', '.json');
          fs.writeFileSync(jsonPath, jsonOutput);
          console.log(`✅ JSON report saved to ${jsonPath}`);
        }
      } else {
        const markdownReport = reportGenerator.generateMarkdownReport(report);
        if (output === 'stdout') {
          console.log(markdownReport);
        } else {
          fs.writeFileSync(output, markdownReport);
          console.log(`✅ Markdown report saved to ${output}`);
        }
      }

      console.log('🎉 Type analysis completed successfully!');

    } catch (error) {
      console.error('❌ Error during type analysis:', error);
      process.exit(1);
    }
  }

  private findTypeScriptFiles(): string[] {
    const baseDir = path.resolve(this.options.directory!);
    const files: string[] = [];

    function scanDirectory(dir: string): void {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    }

    if (fs.existsSync(baseDir)) {
      scanDirectory(baseDir);
    } else {
      console.warn(`⚠️  Directory ${baseDir} does not exist.`);
    }

    return files;
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: AnalysisOptions = {};

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--directory':
      case '-d':
        options.directory = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--include-deps':
        options.includeDeps = true;
        break;
      case '--format':
      case '-f':
        options.format = args[++i] as 'markdown' | 'json';
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: analyze-types [options]

Options:
  -d, --directory <dir>    Directory to analyze (default: ./types)
  -o, --output <file>      Output file path (default: ./type-analysis-report.md)
  --include-deps           Include external dependencies in analysis
  -f, --format <format>    Output format: markdown or json (default: markdown)
  -v, --verbose            Enable verbose logging
  -h, --help               Show this help message

Examples:
  analyze-types
  analyze-types --directory ./src --output ./reports/types.md --verbose
  analyze-types --format json --output stdout
        `);
        process.exit(0);
    }
  }

  const cli = new TypeAnalysisCLI(options);
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
