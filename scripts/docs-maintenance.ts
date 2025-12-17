#!/usr/bin/env tsx

/**
 * Documentation Maintenance Tool
 * 
 * Consolidated tool for maintaining documentation quality:
 * - Link validation
 * - Reference validation  
 * - Freshness checking
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';

interface ValidationResult {
  passed: number;
  failed: number;
  issues: string[];
}

interface FreshnessResult {
  fresh: number;
  stale: number;
  outdated: number;
  alerts: string[];
}

/**
 * Link Validator - Validates all markdown links
 */
class LinkValidator {
  private results: ValidationResult = { passed: 0, failed: 0, issues: [] };

  async validateLinks(): Promise<ValidationResult> {
    console.log('🔗 Validating documentation links...\n');
    
    const docFiles = await glob('docs/**/*.md');
    
    for (const file of docFiles) {
      await this.validateFile(file);
    }
    
    return this.results;
  }

  private async validateFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const links = this.extractLinks(content);
      
      for (const link of links) {
        if (this.isValidLink(link, filePath)) {
          this.results.passed++;
        } else {
          this.results.failed++;
          this.results.issues.push(`${filePath}: Broken link "${link}"`);
        }
      }
    } catch (error) {
      this.results.issues.push(`${filePath}: Error reading file - ${error}`);
    }
  }

  private extractLinks(content: string): string[] {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: string[] = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[2]);
    }
    
    return links;
  }

  private isValidLink(link: string, filePath: string): boolean {
    // Skip external URLs
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return true;
    }
    
    // Handle relative paths
    if (link.startsWith('./') || link.startsWith('../') || !link.startsWith('/')) {
      const resolvedPath = join(dirname(filePath), link);
      return existsSync(resolvedPath);
    }
    
    // Handle absolute paths from project root
    return existsSync(link.startsWith('/') ? link.slice(1) : link);
  }
}

/**
 * Reference Validator - Validates cross-document references
 */
class ReferenceValidator {
  private results: ValidationResult = { passed: 0, failed: 0, issues: [] };

  async validateReferences(): Promise<ValidationResult> {
    console.log('📚 Validating cross-references...\n');
    
    const docFiles = await glob('docs/**/*.md');
    
    for (const file of docFiles) {
      await this.validateFileReferences(file);
    }
    
    return this.results;
  }

  private async validateFileReferences(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const references = this.extractReferences(content);
      
      for (const ref of references) {
        if (this.isValidReference(ref, filePath)) {
          this.results.passed++;
        } else {
          this.results.failed++;
          this.results.issues.push(`${filePath}: Broken reference "${ref}"`);
        }
      }
    } catch (error) {
      this.results.issues.push(`${filePath}: Error reading file - ${error}`);
    }
  }

  private extractReferences(content: string): string[] {
    // Extract file references like [text](./path/file.md)
    const refRegex = /\[([^\]]+)\]\(([^)]+\.md[^)]*)\)/g;
    const references: string[] = [];
    let match;
    
    while ((match = refRegex.exec(content)) !== null) {
      references.push(match[2]);
    }
    
    return references;
  }

  private isValidReference(ref: string, filePath: string): boolean {
    // Remove anchor if present
    const [path] = ref.split('#');
    
    // Resolve relative to current file
    const resolvedPath = join(dirname(filePath), path);
    return existsSync(resolvedPath);
  }
}

/**
 * Freshness Checker - Monitors documentation age
 */
class FreshnessChecker {
  private results: FreshnessResult = { fresh: 0, stale: 0, outdated: 0, alerts: [] };
  
  // Ownership rules - days before considered stale
  private ownershipRules = [
    { pattern: 'docs/README.md', owner: 'tech-lead', maxAge: 30 },
    { pattern: 'docs/*/README.md', owner: 'tech-lead', maxAge: 60 },
    { pattern: 'docs/analytics/**/*.md', owner: 'analytics-lead', maxAge: 60 },
    { pattern: 'docs/development/**/*.md', owner: 'dev-team', maxAge: 90 },
    { pattern: 'lib/**/README.md', owner: 'module-owner', maxAge: 90 },
  ];

  async checkFreshness(): Promise<FreshnessResult> {
    console.log('📅 Checking documentation freshness...\n');
    
    const docFiles = await glob('docs/**/*.md');
    
    for (const file of docFiles) {
      await this.checkFileFreshness(file);
    }
    
    return this.results;
  }

  private async checkFileFreshness(filePath: string): Promise<void> {
    try {
      const stats = statSync(filePath);
      const ageInDays = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      
      const rule = this.findOwnershipRule(filePath);
      const maxAge = rule?.maxAge || 120; // Default 4 months
      const owner = rule?.owner || 'unknown';
      
      if (ageInDays <= maxAge * 0.7) {
        this.results.fresh++;
      } else if (ageInDays <= maxAge) {
        this.results.stale++;
        this.results.alerts.push(`${filePath}: Stale (${ageInDays} days old, owner: ${owner})`);
      } else {
        this.results.outdated++;
        this.results.alerts.push(`${filePath}: OUTDATED (${ageInDays} days old, owner: ${owner}) - NEEDS REVIEW`);
      }
    } catch (error) {
      this.results.alerts.push(`${filePath}: Error checking freshness - ${error}`);
    }
  }

  private findOwnershipRule(filePath: string) {
    return this.ownershipRules.find(rule => {
      const pattern = rule.pattern.replace(/\*/g, '.*');
      return new RegExp(pattern).test(filePath);
    });
  }
}

/**
 * Main maintenance function
 */
async function runMaintenance(options: {
  links?: boolean;
  references?: boolean;
  freshness?: boolean;
  all?: boolean;
} = {}) {
  console.log('🔧 Documentation Maintenance Tool\n');
  
  const { links = false, references = false, freshness = false, all = false } = options;
  
  let hasErrors = false;
  
  // Run link validation
  if (links || all) {
    const linkValidator = new LinkValidator();
    const linkResults = await linkValidator.validateLinks();
    
    console.log(`🔗 Link Validation Results:`);
    console.log(`  ✅ Valid links: ${linkResults.passed}`);
    console.log(`  ❌ Broken links: ${linkResults.failed}`);
    
    if (linkResults.issues.length > 0) {
      console.log(`\n  Issues found:`);
      linkResults.issues.forEach(issue => console.log(`    - ${issue}`));
      hasErrors = true;
    }
    console.log('');
  }
  
  // Run reference validation
  if (references || all) {
    const refValidator = new ReferenceValidator();
    const refResults = await refValidator.validateReferences();
    
    console.log(`📚 Reference Validation Results:`);
    console.log(`  ✅ Valid references: ${refResults.passed}`);
    console.log(`  ❌ Broken references: ${refResults.failed}`);
    
    if (refResults.issues.length > 0) {
      console.log(`\n  Issues found:`);
      refResults.issues.forEach(issue => console.log(`    - ${issue}`));
      hasErrors = true;
    }
    console.log('');
  }
  
  // Run freshness check
  if (freshness || all) {
    const freshnessChecker = new FreshnessChecker();
    const freshnessResults = await freshnessChecker.checkFreshness();
    
    console.log(`📅 Freshness Check Results:`);
    console.log(`  🟢 Fresh: ${freshnessResults.fresh}`);
    console.log(`  🟡 Stale: ${freshnessResults.stale}`);
    console.log(`  🔴 Outdated: ${freshnessResults.outdated}`);
    
    if (freshnessResults.alerts.length > 0) {
      console.log(`\n  Alerts:`);
      freshnessResults.alerts.forEach(alert => console.log(`    - ${alert}`));
    }
    console.log('');
  }
  
  // Summary
  if (hasErrors) {
    console.log('❌ Documentation maintenance found issues that need attention.');
    process.exit(1);
  } else {
    console.log('✅ Documentation maintenance completed successfully!');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const options = {
    links: args.includes('--links') || command === 'links',
    references: args.includes('--references') || command === 'references', 
    freshness: args.includes('--freshness') || command === 'freshness',
    all: args.includes('--all') || command === 'all' || args.length === 0,
  };
  
  if (command === 'help' || args.includes('--help')) {
    console.log(`
📚 Documentation Maintenance Tool

Usage:
  npm run docs:maintenance [command] [options]
  
Commands:
  links       - Validate markdown links
  references  - Validate cross-references
  freshness   - Check documentation age
  all         - Run all checks (default)
  help        - Show this help
  
Options:
  --links     - Include link validation
  --references - Include reference validation
  --freshness - Include freshness check
  --all       - Run all checks
  
Examples:
  npm run docs:maintenance
  npm run docs:maintenance links
  npm run docs:maintenance --freshness --links
`);
    process.exit(0);
  }
  
  runMaintenance(options).catch(error => {
    console.error('❌ Error running maintenance:', error);
    process.exit(1);
  });
}

export { LinkValidator, ReferenceValidator, FreshnessChecker, runMaintenance };
