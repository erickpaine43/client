#!/usr/bin/env tsx

/**
 * Schema Diffing Utility
 *
 * Provides detailed schema comparison and diffing capabilities
 * for identifying structural differences between database schemas.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  default?: unknown;
  constraints?: string[];
}

interface SchemaEntity {
  name: string;
  fields: SchemaField[];
  indexes: Array<{
    name: string;
    fields: string[];
    unique?: boolean;
  }>;
  constraints: Array<{
    type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
    name: string;
    fields: string[];
    references?: {
      table: string;
      fields: string[];
    };
  }>;
}

interface SchemaDiff {
  entity: string;
  changes: Array<{
    type: 'field_added' | 'field_removed' | 'field_modified' | 'index_added' | 'index_removed' | 'constraint_added' | 'constraint_removed';
    details: Record<string, unknown>;
  }>;
}

interface DiffReport {
  summary: {
    entitiesCompared: number;
    totalChanges: number;
    entitiesWithChanges: number;
  };
  changes: SchemaDiff[];
  recommendations: string[];
}

/**
 * Load detailed schema information from NileDB
 */
async function loadNileDetailedSchema(): Promise<SchemaEntity[]> {
  console.log('Loading detailed NileDB schema information...');

  // This would query information_schema for detailed metadata
  // For now, return enhanced placeholder data
  const entities: SchemaEntity[] = [
    {
      name: 'campaigns',
      fields: [
        { name: 'id', type: 'uuid', nullable: false, constraints: ['primary_key'] },
        { name: 'name', type: 'varchar(255)', nullable: false },
        { name: 'userId', type: 'uuid', nullable: false },
        { name: 'createdAt', type: 'timestamp', nullable: false, default: 'NOW()' },
        { name: 'updatedAt', type: 'timestamp', nullable: false, default: 'NOW()' }
      ],
      indexes: [
        { name: 'idx_campaigns_user_id', fields: ['userId'] },
        { name: 'idx_campaigns_created_at', fields: ['createdAt'] }
      ],
      constraints: [
        {
          type: 'foreign_key',
          name: 'fk_campaigns_user_id',
          fields: ['userId'],
          references: { table: 'users', fields: ['id'] }
        }
      ]
    }
  ];

  console.log(`✓ Loaded detailed schema for ${entities.length} NileDB entities`);
  return entities;
}

/**
 * Load detailed schema information from Convex
 */
async function loadConvexDetailedSchema(): Promise<SchemaEntity[]> {
  console.log('Loading detailed Convex schema information...');

  // This would use Convex schema introspection or metadata
  // For now, return enhanced placeholder data
  const entities: SchemaEntity[] = [
    {
      name: 'campaignAnalytics',
      fields: [
        { name: '_id', type: 'string', nullable: false, constraints: ['primary_key'] },
        { name: '_creationTime', type: 'number', nullable: false },
        { name: 'campaignId', type: 'string', nullable: false },
        { name: 'opens', type: 'number', nullable: false, default: 0 },
        { name: 'clicks', type: 'number', nullable: false, default: 0 }
      ],
      indexes: [
        { name: 'campaignId', fields: ['campaignId'] },
        { name: 'by_creation_time', fields: ['_creationTime'] }
      ],
      constraints: []
    }
  ];

  console.log(`✓ Loaded detailed schema for ${entities.length} Convex entities`);
  return entities;
}

/**
 * Generate detailed diff between two schema entities
 */
function generateEntityDiff(entityName: string, source: SchemaEntity, target: SchemaEntity): SchemaDiff {
  const changes: SchemaDiff['changes'] = [];

  // Compare fields
  const sourceFields = new Map(source.fields.map(f => [f.name, f]));
  const targetFields = new Map(target.fields.map(f => [f.name, f]));

  // Fields in source but not in target
  for (const [fieldName, field] of sourceFields) {
    if (!targetFields.has(fieldName)) {
      changes.push({
        type: 'field_removed',
        details: { field: fieldName, sourceType: field.type }
      });
    }
  }

  // Fields in target but not in source
  for (const [fieldName, field] of targetFields) {
    if (!sourceFields.has(fieldName)) {
      changes.push({
        type: 'field_added',
        details: { field: fieldName, targetType: field.type }
      });
    } else {
      // Check for modifications
      const sourceField = sourceFields.get(fieldName)!;
      if (sourceField.type !== field.type ||
          sourceField.nullable !== field.nullable) {
        changes.push({
          type: 'field_modified',
          details: {
            field: fieldName,
            sourceType: sourceField.type,
            targetType: field.type,
            sourceNullable: sourceField.nullable,
            targetNullable: field.nullable
          }
        });
      }
    }
  }

  // Compare indexes
  const sourceIndexes = new Map(source.indexes.map(i => [i.name, i]));
  const targetIndexes = new Map(target.indexes.map(i => [i.name, i]));

  for (const [indexName] of sourceIndexes) {
    if (!targetIndexes.has(indexName)) {
      changes.push({
        type: 'index_removed',
        details: { index: indexName }
      });
    }
  }

  for (const [indexName] of targetIndexes) {
    if (!sourceIndexes.has(indexName)) {
      changes.push({
        type: 'index_added',
        details: { index: indexName }
      });
    }
  }

  // Compare constraints
  const sourceConstraints = new Map(source.constraints.map(c => [c.name, c]));
  const targetConstraints = new Map(target.constraints.map(c => [c.name, c]));

  for (const [constraintName] of sourceConstraints) {
    if (!targetConstraints.has(constraintName)) {
      changes.push({
        type: 'constraint_removed',
        details: { constraint: constraintName }
      });
    }
  }

  for (const [constraintName] of targetConstraints) {
    if (!sourceConstraints.has(constraintName)) {
      changes.push({
        type: 'constraint_added',
        details: { constraint: constraintName }
      });
    }
  }

  return { entity: entityName, changes };
}

/**
 * Generate comprehensive diff report
 */
function generateDiffReport(sourceEntities: SchemaEntity[], targetEntities: SchemaEntity[]): DiffReport {
  const changes: SchemaDiff[] = [];
  let totalChanges = 0;

  // Create lookup maps
  const sourceMap = new Map(sourceEntities.map(e => [e.name.toLowerCase(), e]));
  const targetMap = new Map(targetEntities.map(e => [e.name.toLowerCase(), e]));

  // Find common entities and diff them
  for (const [entityName, sourceEntity] of sourceMap) {
    const targetEntity = targetMap.get(entityName);
    if (targetEntity) {
      const diff = generateEntityDiff(entityName, sourceEntity, targetEntity);
      if (diff.changes.length > 0) {
        changes.push(diff);
        totalChanges += diff.changes.length;
      }
    }
  }

  const recommendations = generateRecommendations(changes);

  return {
    summary: {
      entitiesCompared: Math.max(sourceEntities.length, targetEntities.length),
      totalChanges,
      entitiesWithChanges: changes.length
    },
    changes,
    recommendations
  };
}

/**
 * Generate actionable recommendations based on diff
 */
function generateRecommendations(changes: SchemaDiff[]): string[] {
  const recommendations: string[] = [];

  for (const diff of changes) {
    const entity = diff.entity;

    for (const change of diff.changes) {
      switch (change.type) {
        case 'field_added':
          recommendations.push(`Add field '${change.details.field}' to ${entity} schema`);
          break;
        case 'field_removed':
          recommendations.push(`⚠️  CRITICAL: Field '${change.details.field}' missing from ${entity} - verify data integrity`);
          break;
        case 'field_modified':
          recommendations.push(`Update field '${change.details.field}' type from ${change.details.sourceType} to ${change.details.targetType} in ${entity}`);
          break;
        case 'index_added':
          recommendations.push(`Add index '${change.details.index}' to ${entity} for performance`);
          break;
        case 'constraint_added':
          recommendations.push(`Add constraint '${change.details.constraint}' to ${entity} for data integrity`);
          break;
      }
    }
  }

  return recommendations;
}

/**
 * Format diff report as readable text
 */
function formatDiffReport(report: DiffReport): string {
  let output = '# Schema Diff Report\n\n';
  output += `Generated: ${new Date().toISOString()}\n\n`;

  output += '## Summary\n\n';
  output += `- Entities compared: ${report.summary.entitiesCompared}\n`;
  output += `- Total changes: ${report.summary.totalChanges}\n`;
  output += `- Entities with changes: ${report.summary.entitiesWithChanges}\n\n`;

  for (const diff of report.changes) {
    output += `### ${diff.entity}\n\n`;
    output += `Changes: ${diff.changes.length}\n\n`;

    for (const change of diff.changes) {
      output += `- **${change.type}**: ${JSON.stringify(change.details)}\n`;
    }
    output += '\n';
  }

  if (report.recommendations.length > 0) {
    output += '## Recommendations\n\n';
    for (const rec of report.recommendations) {
      output += `- ${rec}\n`;
    }
    output += '\n';
  }

  return output;
}

/**
 * Main execution function
 */
export async function diffSchemas(): Promise<void> {
  try {
    console.log('🔍 Starting Schema Diff Analysis\n');

    // Load detailed schemas
    const [nileSchemas, convexSchemas] = await Promise.all([
      loadNileDetailedSchema(),
      loadConvexDetailedSchema()
    ]);

    // Generate diff report
    const report = generateDiffReport(nileSchemas, convexSchemas);

    // Format and display report
    const formattedReport = formatDiffReport(report);

    console.log('\n' + '='.repeat(50));
    console.log(formattedReport);
    console.log('='.repeat(50));

    // Save detailed report
    const reportPath = join(process.cwd(), 'specs/005-type-analysis-optimization/schema-diff-report.md');
    writeFileSync(reportPath, formattedReport);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    console.log('\n✅ Schema diff analysis completed successfully');

  } catch (error) {
    console.error('❌ Schema diff analysis failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  diffSchemas();
}
