#!/usr/bin/env tsx

/**
 * Type Comparison Analysis Utility
 *
 * Compares type definitions between Convex and NileDB databases
 * to identify inconsistencies, gaps, and optimization opportunities.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface FieldDefinition {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

interface EntitySchema {
  name: string;
  fields: FieldDefinition[];
  relationships: string[];
}

interface ComparisonResult {
  entity: string;
  convexFields: FieldDefinition[];
  nileFields: FieldDefinition[];
  differences: {
    missingInConvex: string[];
    missingInNile: string[];
    typeMismatches: Array<{
      field: string;
      convexType: string;
      nileType: string;
    }>;
    relationshipGaps: string[];
  };
}

/**
 * Load Convex schema definitions
 */
async function loadConvexSchemas(): Promise<EntitySchema[]> {
  console.log('Loading Convex schema definitions...');

  // This would integrate with Convex schema introspection
  // For now, return placeholder
  const schemas: EntitySchema[] = [
    {
      name: 'campaignAnalytics',
      fields: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'campaignId', type: 'string', nullable: false },
        { name: 'opens', type: 'number', nullable: false },
        { name: 'clicks', type: 'number', nullable: false },
        { name: '_creationTime', type: 'number', nullable: false }
      ],
      relationships: ['campaignId']
    }
    // Add more entities as needed
  ];

  console.log(`✓ Loaded ${schemas.length} Convex entities`);
  return schemas;
}

/**
 * Load NileDB schema definitions
 */
async function loadNileSchemas(): Promise<EntitySchema[]> {
  console.log('Loading NileDB schema definitions...');

  // This would query NileDB information_schema or use migration schemas
  // For now, return placeholder
  const schemas: EntitySchema[] = [
    {
      name: 'campaigns',
      fields: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'userId', type: 'uuid', nullable: false },
        { name: 'createdAt', type: 'timestamp', nullable: false },
        { name: 'updatedAt', type: 'timestamp', nullable: false }
      ],
      relationships: ['userId']
    }
    // Add more entities as needed
  ];

  console.log(`✓ Loaded ${schemas.length} NileDB entities`);
  return schemas;
}

/**
 * Compare schemas between databases
 */
function compareSchemas(convexSchemas: EntitySchema[], nileSchemas: EntitySchema[]): ComparisonResult[] {
  console.log('Comparing schemas between databases...');

  const results: ComparisonResult[] = [];

  // Find entities that exist in both databases
  const commonEntities = convexSchemas.filter(convex =>
    nileSchemas.some(nile => nile.name.toLowerCase() === convex.name.toLowerCase())
  );

  for (const convexEntity of commonEntities) {
    const nileEntity = nileSchemas.find(n =>
      n.name.toLowerCase() === convexEntity.name.toLowerCase()
    );

    if (!nileEntity) continue;

    const convexFields = convexEntity.fields;
    const nileFields = nileEntity.fields;

    // Find missing fields
    const convexFieldNames = convexFields.map(f => f.name.toLowerCase());
    const nileFieldNames = nileFields.map(f => f.name.toLowerCase());

    const missingInConvex = nileFieldNames.filter(name => !convexFieldNames.includes(name));
    const missingInNile = convexFieldNames.filter(name => !nileFieldNames.includes(name));

    // Find type mismatches
    const typeMismatches = [];
    for (const convexField of convexFields) {
      const nileField = nileFields.find(nf => nf.name.toLowerCase() === convexField.name.toLowerCase());
      if (nileField && convexField.type !== nileField.type) {
        typeMismatches.push({
          field: convexField.name,
          convexType: convexField.type,
          nileType: nileField.type
        });
      }
    }

    // Find relationship gaps
    const relationshipGaps = convexEntity.relationships.filter(rel =>
      !nileEntity.relationships.includes(rel)
    );

    results.push({
      entity: convexEntity.name,
      convexFields,
      nileFields,
      differences: {
        missingInConvex,
        missingInNile,
        typeMismatches,
        relationshipGaps
      }
    });
  }

  console.log(`✓ Compared ${results.length} entities`);
  return results;
}

/**
 * Generate comparison report
 */
function generateReport(results: ComparisonResult[]): string {
  console.log('Generating comparison report...');

  let report = '# Type Comparison Analysis Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  report += '## Summary\n\n';
  report += `Total entities compared: ${results.length}\n\n`;

  let totalIssues = 0;

  for (const result of results) {
    const issues = result.differences.missingInConvex.length +
                  result.differences.missingInNile.length +
                  result.differences.typeMismatches.length +
                  result.differences.relationshipGaps.length;

    if (issues > 0) {
      report += `### ${result.entity}\n\n`;
      report += `Issues found: ${issues}\n\n`;

      if (result.differences.missingInConvex.length > 0) {
        report += `**Missing in Convex:** ${result.differences.missingInConvex.join(', ')}\n\n`;
      }

      if (result.differences.missingInNile.length > 0) {
        report += `**Missing in NileDB:** ${result.differences.missingInNile.join(', ')}\n\n`;
      }

      if (result.differences.typeMismatches.length > 0) {
        report += '**Type mismatches:**\n';
        for (const mismatch of result.differences.typeMismatches) {
          report += `- ${mismatch.field}: Convex(${mismatch.convexType}) vs NileDB(${mismatch.nileType})\n`;
        }
        report += '\n';
      }

      if (result.differences.relationshipGaps.length > 0) {
        report += `**Relationship gaps:** ${result.differences.relationshipGaps.join(', ')}\n\n`;
      }

      totalIssues += issues;
    }
  }

  if (totalIssues === 0) {
    report += '🎉 No issues found! Schemas are well-aligned.\n\n';
  } else {
    report += `## Total Issues: ${totalIssues}\n\n`;
    report += 'Recommendations:\n';
    report += '1. Review missing fields and consider adding them where appropriate\n';
    report += '2. Fix type inconsistencies to ensure data integrity\n';
    report += '3. Address relationship gaps to maintain referential integrity\n';
  }

  console.log(`✓ Report generated with ${totalIssues} issues identified`);
  return report;
}

/**
 * Main execution function
 */
export async function compareTypes(): Promise<void> {
  try {
    console.log('🚀 Starting Type Comparison Analysis\n');

    // Load schemas
    const [convexSchemas, nileSchemas] = await Promise.all([
      loadConvexSchemas(),
      loadNileSchemas()
    ]);

    // Compare schemas
    const results = compareSchemas(convexSchemas, nileSchemas);

    // Generate report
    const report = generateReport(results);

    // Output report
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));

    // Save report to file
    const reportPath = join(process.cwd(), 'specs/005-type-analysis-optimization/type-comparison-report.md');
    writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);

    console.log('\n✅ Type comparison analysis completed successfully');

  } catch (error) {
    console.error('❌ Type comparison analysis failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  compareTypes();
}
