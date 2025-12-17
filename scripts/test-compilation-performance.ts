#!/usr/bin/env node

/**
 * Compilation Performance Test Script
 * 
 * This script tests different TypeScript configurations and schema complexities
 * to identify the root cause of "Convex type instantiation is excessively deep" warnings.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

interface CompilationResult {
  configName: string;
  duration: number;
  warnings: number;
  errors: number;
  success: boolean;
  output: string;
}

interface TsConfig {
  compilerOptions: Record<string, unknown>;
}

interface TestConfig {
  name: string;
  tsconfig: TsConfig;
  description: string;
}

// Test configurations to evaluate
const testConfigs: TestConfig[] = [
  {
    name: 'baseline',
    description: 'Current production configuration',
    tsconfig: {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
          "@types/*": ["./types/*"]
        }
      }
    }
  },
  {
    name: 'reduced-strictness',
    description: 'Reduced type checking strictness',
    tsconfig: {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false, // Reduced strictness
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
          "@types/*": ["./types/*"]
        }
      }
    }
  },
  {
    name: 'no-incremental',
    description: 'Disabled incremental compilation',
    tsconfig: {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: false, // Disabled incremental
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
          "@types/*": ["./types/*"]
        }
      }
    }
  },
  {
    name: 'legacy-module-resolution',
    description: 'Legacy module resolution strategy',
    tsconfig: {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node", // Legacy resolution
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
          "@types/*": ["./types/*"]
        }
      }
    }
  }
];

class CompilationTester {
  private originalTsConfig: string;
  private results: CompilationResult[] = [];

  constructor() {
    // Backup original tsconfig
    this.originalTsConfig = readFileSync('tsconfig.json', 'utf8');
  }

  async runTests(): Promise<void> {
    console.log('🔍 Starting TypeScript compilation performance analysis...\n');

    for (const config of testConfigs) {
      console.log(`📋 Testing configuration: ${config.name}`);
      console.log(`   Description: ${config.description}`);
      
      const result = await this.testConfiguration(config);
      this.results.push(result);
      
      console.log(`   ✅ Duration: ${result.duration}ms`);
      console.log(`   ⚠️  Warnings: ${result.warnings}`);
      console.log(`   ❌ Errors: ${result.errors}`);
      console.log(`   📊 Success: ${result.success ? 'Yes' : 'No'}\n`);
    }

    this.generateReport();
    this.restoreOriginalConfig();
  }

  private async testConfiguration(config: TestConfig): Promise<CompilationResult> {
    // Write test configuration
    writeFileSync('tsconfig.json', JSON.stringify(config.tsconfig, null, 2));

    const startTime = Date.now();
    let output = '';
    let success = false;

    try {
      // Run TypeScript compilation
      output = execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        timeout: 60000, // 60 second timeout
        stdio: 'pipe'
      });
      success = true;
    } catch (error: unknown) {
      if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
        const execError = error as Error & { stdout: string; stderr: string };
        output = execError.stdout + execError.stderr;
      } else {
        output = String(error);
      }
      success = false;
    }

    const duration = Date.now() - startTime;

    // Count warnings and errors
    const warnings = this.countMatches(output, /warning/gi);
    const convexWarnings = this.countMatches(output, /convex type instantiation is excessively deep/gi);
    const errors = this.countMatches(output, /error/gi);

    return {
      configName: config.name,
      duration,
      warnings: warnings + convexWarnings,
      errors,
      success,
      output
    };
  }

  private countMatches(text: string, pattern: RegExp): number {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }

  private generateReport(): void {
    console.log('📊 COMPILATION PERFORMANCE ANALYSIS REPORT');
    console.log('=' .repeat(60));
    
    // Summary table
    console.log('\n📈 Performance Summary:');
    console.log('Configuration'.padEnd(20) + 'Duration'.padEnd(12) + 'Warnings'.padEnd(12) + 'Errors'.padEnd(10) + 'Success');
    console.log('-'.repeat(60));
    
    for (const result of this.results) {
      const duration = `${result.duration}ms`;
      const warnings = result.warnings.toString();
      const errors = result.errors.toString();
      const success = result.success ? '✅' : '❌';
      
      console.log(
        result.configName.padEnd(20) +
        duration.padEnd(12) +
        warnings.padEnd(12) +
        errors.padEnd(10) +
        success
      );
    }

    // Analysis
    console.log('\n🔍 Analysis:');
    
    const baseline = this.results.find(r => r.configName === 'baseline');
    if (baseline) {
      console.log(`• Baseline warnings: ${baseline.warnings}`);
      console.log(`• Baseline duration: ${baseline.duration}ms`);
      
      for (const result of this.results) {
        if (result.configName !== 'baseline') {
          const warningDiff = result.warnings - baseline.warnings;
          const durationDiff = result.duration - baseline.duration;
          
          console.log(`• ${result.configName}:`);
          console.log(`  - Warning change: ${warningDiff > 0 ? '+' : ''}${warningDiff}`);
          console.log(`  - Duration change: ${durationDiff > 0 ? '+' : ''}${durationDiff}ms`);
        }
      }
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    const bestPerforming = this.results
      .filter(r => r.success)
      .sort((a, b) => a.warnings - b.warnings || a.duration - b.duration)[0];
    
    if (bestPerforming && bestPerforming.configName !== 'baseline') {
      console.log(`• Consider using '${bestPerforming.configName}' configuration for fewer warnings`);
    } else {
      console.log('• Current configuration appears optimal for warning reduction');
    }

    const fastestCompiling = this.results
      .filter(r => r.success)
      .sort((a, b) => a.duration - b.duration)[0];
    
    if (fastestCompiling && fastestCompiling.configName !== 'baseline') {
      console.log(`• Consider using '${fastestCompiling.configName}' configuration for faster compilation`);
    }

    // Save detailed report
    const detailedReport = {
      timestamp: new Date().toISOString(),
      results: this.results,
      analysis: {
        baseline: baseline || null,
        bestPerforming: bestPerforming || null,
        fastestCompiling: fastestCompiling || null,
      }
    };

    writeFileSync('compilation-analysis-report.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n📄 Detailed report saved to: compilation-analysis-report.json');
  }

  private restoreOriginalConfig(): void {
    writeFileSync('tsconfig.json', this.originalTsConfig);
    console.log('\n🔄 Original tsconfig.json restored');
  }
}

// Schema complexity analysis
class SchemaComplexityAnalyzer {
  analyzeCurrentSchema(): void {
    console.log('\n🏗️  SCHEMA COMPLEXITY ANALYSIS');
    console.log('=' .repeat(60));

    const schemaPath = 'convex/schema.ts';
    if (!existsSync(schemaPath)) {
      console.log('❌ Schema file not found');
      return;
    }

    const schemaContent = readFileSync(schemaPath, 'utf8');
    
    // Analyze schema complexity metrics
    const metrics = {
      totalTables: this.countMatches(schemaContent, /defineTable\(/g),
      totalIndexes: this.countMatches(schemaContent, /\.index\(/g),
      unionTypes: this.countMatches(schemaContent, /v\.union\(/g),
      objectTypes: this.countMatches(schemaContent, /v\.object\(/g),
      arrayTypes: this.countMatches(schemaContent, /v\.array\(/g),
      optionalFields: this.countMatches(schemaContent, /v\.optional\(/g),
      literalTypes: this.countMatches(schemaContent, /v\.literal\(/g),
    };

    console.log('📊 Schema Complexity Metrics:');
    console.log(`• Total Tables: ${metrics.totalTables}`);
    console.log(`• Total Indexes: ${metrics.totalIndexes}`);
    console.log(`• Union Types: ${metrics.unionTypes}`);
    console.log(`• Object Types: ${metrics.objectTypes}`);
    console.log(`• Array Types: ${metrics.arrayTypes}`);
    console.log(`• Optional Fields: ${metrics.optionalFields}`);
    console.log(`• Literal Types: ${metrics.literalTypes}`);

    // Calculate complexity score
    const complexityScore = 
      metrics.unionTypes * 3 +
      metrics.objectTypes * 2 +
      metrics.arrayTypes * 2 +
      metrics.optionalFields * 1 +
      metrics.literalTypes * 0.5;

    console.log(`\n🎯 Complexity Score: ${complexityScore.toFixed(1)}`);
    
    if (complexityScore > 100) {
      console.log('⚠️  High complexity detected - likely contributing to type instantiation issues');
    } else if (complexityScore > 50) {
      console.log('⚡ Moderate complexity - may contribute to compilation warnings');
    } else {
      console.log('✅ Low complexity - unlikely to cause type issues');
    }

    // Identify problematic patterns
    console.log('\n🔍 Problematic Patterns:');
    
    if (metrics.unionTypes > 10) {
      console.log('• High number of union types may cause deep type instantiation');
    }
    
    if (metrics.objectTypes > 15) {
      console.log('• Many nested objects increase type complexity');
    }
    
    if (metrics.optionalFields > 30) {
      console.log('• Excessive optional fields create complex type unions');
    }

    // Recommendations
    console.log('\n💡 Schema Optimization Recommendations:');
    console.log('• Consider flattening deeply nested objects');
    console.log('• Reduce union type complexity where possible');
    console.log('• Use string enums instead of literal unions for large sets');
    console.log('• Consider splitting large tables into smaller, focused tables');
  }

  private countMatches(text: string, pattern: RegExp): number {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }
}

// Main execution
async function main() {
  try {
    const tester = new CompilationTester();
    await tester.runTests();
    
    const analyzer = new SchemaComplexityAnalyzer();
    analyzer.analyzeCurrentSchema();
    
    console.log('\n✅ Analysis complete!');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
