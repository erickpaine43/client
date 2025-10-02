/**
 * Comprehensive Test Runner
 * 
 * Orchestrates the execution of all test suites in the correct order
 * and provides detailed reporting on test results and coverage.
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { writeFileSync } from 'fs';

interface TestSuite {
  name: string;
  description: string;
  testFile: string;
  timeout: number;
  dependencies: string[];
  critical: boolean;
}

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  tests: number;
  failures: number;
  coverage?: number;
  error?: string;
}

class ComprehensiveTestRunner {
  private testSuites: TestSuite[] = [
    {
      name: 'unit-auth',
      description: 'Authentication Service Unit Tests',
      testFile: 'lib/niledb/__tests__/auth.test.ts',
      timeout: 30000,
      dependencies: [],
      critical: true,
    },
    {
      name: 'unit-tenant',
      description: 'Tenant Service Unit Tests',
      testFile: 'lib/niledb/__tests__/tenant.test.ts',
      timeout: 30000,
      dependencies: ['unit-auth'],
      critical: true,
    },
    {
      name: 'unit-company',
      description: 'Company Service Unit Tests',
      testFile: 'lib/niledb/__tests__/company.test.ts',
      timeout: 30000,
      dependencies: ['unit-auth', 'unit-tenant'],
      critical: true,
    },
    {
      name: 'migration-validation',
      description: 'Migration Scripts and Data Validation Tests',
      testFile: 'scripts/__tests__/migration.test.ts',
      timeout: 60000,
      dependencies: ['unit-auth', 'unit-tenant', 'unit-company'],
      critical: true,
    },
    {
      name: 'api-integration',
      description: 'API Route Integration Tests',
      testFile: 'lib/niledb/__tests__/api-integration.test.ts',
      timeout: 45000,
      dependencies: ['unit-auth', 'unit-tenant', 'unit-company'],
      critical: true,
    },
    {
      name: 'enhanced-auth-ui',
      description: 'Enhanced Authentication System UI Tests',
      testFile: 'components/auth/__tests__/enhanced-auth-system.test.tsx',
      timeout: 30000,
      dependencies: ['unit-auth', 'api-integration'],
      critical: false,
    },
    {
      name: 'performance-monitoring',
      description: 'Performance and Monitoring Tests',
      testFile: 'lib/niledb/__tests__/performance-monitoring.test.ts',
      timeout: 60000,
      dependencies: ['unit-auth', 'unit-tenant', 'unit-company'],
      critical: false,
    },
    {
      name: 'comprehensive-integration',
      description: 'Comprehensive Integration Tests',
      testFile: 'lib/niledb/__tests__/comprehensive-test-suite.test.ts',
      timeout: 90000,
      dependencies: ['unit-auth', 'unit-tenant', 'unit-company', 'api-integration'],
      critical: true,
    },
    {
      name: 'end-to-end',
      description: 'End-to-End Integration Tests',
      testFile: 'lib/niledb/__tests__/end-to-end-integration.test.ts',
      timeout: 120000,
      dependencies: ['comprehensive-integration'],
      critical: true,
    },
  ];

  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(private options: {
    verbose?: boolean;
    coverage?: boolean;
    failFast?: boolean;
    parallel?: boolean;
    suites?: string[];
  } = {}) {}

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive NileDB Test Suite');
    console.log('=' .repeat(60));
    
    this.startTime = Date.now();

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run test suites
      if (this.options.parallel && !this.options.failFast) {
        await this.runTestsInParallel();
      } else {
        await this.runTestsSequentially();
      }

      // Generate reports
      await this.generateReports();

    } catch (error) {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    } finally {
      await this.cleanupTestEnvironment();
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');

    // Set test environment variables
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    process.env.TEST_NILEDB_DATABASE_ID = 'test-database-id';
    process.env.TEST_NILEDB_USER = 'test-user';
    process.env.TEST_NILEDB_PASSWORD = 'test-password';
    process.env.TEST_NILEDB_API_URL = 'http://localhost:3000/api/test';

    // Ensure test database is clean
    try {
      execSync('npm run test:setup', { stdio: this.options.verbose ? 'inherit' : 'pipe' });
    } catch {
      console.warn('⚠️  Test setup script not found, continuing...');
    }

    console.log('✅ Test environment ready');
  }

  private async runTestsSequentially(): Promise<void> {
    console.log('🔄 Running tests sequentially...');

    const suitesToRun = this.options.suites 
      ? this.testSuites.filter(suite => this.options.suites!.includes(suite.name))
      : this.testSuites;

    for (const suite of suitesToRun) {
      if (!this.areDependenciesSatisfied(suite)) {
        console.log(`⏭️  Skipping ${suite.name} - dependencies not satisfied`);
        continue;
      }

      const result = await this.runTestSuite(suite);
      this.results.push(result);

      if (!result.passed && (this.options.failFast || suite.critical)) {
        console.error(`❌ Critical test suite ${suite.name} failed, stopping execution`);
        break;
      }
    }
  }

  private async runTestsInParallel(): Promise<void> {
    console.log('⚡ Running tests in parallel...');

    const suitesToRun = this.options.suites 
      ? this.testSuites.filter(suite => this.options.suites!.includes(suite.name))
      : this.testSuites;

    // Group suites by dependency level
    const levels: TestSuite[][] = [];
    const processed = new Set<string>();

    while (processed.size < suitesToRun.length) {
      const currentLevel = suitesToRun.filter(suite => 
        !processed.has(suite.name) && 
        suite.dependencies.every(dep => processed.has(dep))
      );

      if (currentLevel.length === 0) {
        throw new Error('Circular dependency detected in test suites');
      }

      levels.push(currentLevel);
      currentLevel.forEach(suite => processed.add(suite.name));
    }

    // Run each level in parallel
    for (const level of levels) {
      const promises = level.map(suite => this.runTestSuite(suite));
      const results = await Promise.all(promises);
      this.results.push(...results);

      // Check for critical failures
      const criticalFailures = results.filter(r => !r.passed && 
        level.find(s => s.name === r.suite)?.critical
      );

      if (criticalFailures.length > 0) {
        console.error(`❌ Critical test failures detected, stopping execution`);
        break;
      }
    }
  }

  private async runTestSuite(suite: TestSuite): Promise<TestResult> {
    console.log(`\n📋 Running: ${suite.description}`);
    console.log(`   File: ${suite.testFile}`);

    const startTime = Date.now();
    let result: TestResult;

    try {
      const jestCommand = this.buildJestCommand(suite);
      const output = execSync(jestCommand, { 
        encoding: 'utf8',
        timeout: suite.timeout,
        stdio: 'pipe'
      });

      result = this.parseJestOutput(suite.name, output, Date.now() - startTime);
      
      if (result.passed) {
        console.log(`✅ ${suite.name}: ${result.tests} tests passed in ${result.duration}ms`);
      } else {
        console.log(`❌ ${suite.name}: ${result.failures}/${result.tests} tests failed`);
      }

    } catch (error) {
      result = {
        suite: suite.name,
        passed: false,
        duration: Date.now() - startTime,
        tests: 0,
        failures: 1,
        error: (error as Error).message,
      };

      console.log(`💥 ${suite.name}: Test suite crashed - ${(error as Error).message}`);
    }

    return result;
  }

  private buildJestCommand(suite: TestSuite): string {
    const baseCommand = 'npx jest';
    const options = [
      `--testPathPatterns="${suite.testFile}"`,
      '--verbose',
      '--no-cache',
      '--forceExit',
    ];

    if (this.options.coverage) {
      options.push('--coverage');
      options.push('--coverageReporters=text-lcov');
    }

    if (!this.options.verbose) {
      options.push('--silent');
    }

    return `${baseCommand} ${options.join(' ')}`;
  }

  private parseJestOutput(suiteName: string, output: string, duration: number): TestResult {
    // Parse Jest output to extract test results
    const lines = output.split('\n');
    
    let tests = 0;
    let failures = 0;
    let coverage = 0;

    // Look for test summary
    const summaryLine = lines.find(line => line.includes('Tests:'));
    if (summaryLine) {
      const passedMatch = summaryLine.match(/(\d+) passed/);
      const failedMatch = summaryLine.match(/(\d+) failed/);
      
      if (passedMatch) tests += parseInt(passedMatch[1]);
      if (failedMatch) {
        failures = parseInt(failedMatch[1]);
        tests += failures;
      }
    }

    // Look for coverage information
    if (this.options.coverage) {
      const coverageLine = lines.find(line => line.includes('All files'));
      if (coverageLine) {
        const coverageMatch = coverageLine.match(/(\d+\.?\d*)%/);
        if (coverageMatch) {
          coverage = parseFloat(coverageMatch[1]);
        }
      }
    }

    return {
      suite: suiteName,
      passed: failures === 0,
      duration,
      tests,
      failures,
      coverage: this.options.coverage ? coverage : undefined,
    };
  }

  private areDependenciesSatisfied(suite: TestSuite): boolean {
    return suite.dependencies.every(dep => 
      this.results.find(r => r.suite === dep)?.passed ?? false
    );
  }

  private async generateReports(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const totalTests = this.results.reduce((sum, r) => sum + r.tests, 0);
    const totalFailures = this.results.reduce((sum, r) => sum + r.failures, 0);
    const passedSuites = this.results.filter(r => r.passed).length;

    console.log(`Total Test Suites: ${this.results.length}`);
    console.log(`Passed Suites: ${passedSuites}`);
    console.log(`Failed Suites: ${this.results.length - passedSuites}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed Tests: ${totalTests - totalFailures}`);
    console.log(`Failed Tests: ${totalFailures}`);
    console.log(`Total Duration: ${totalDuration}ms`);

    if (this.options.coverage) {
      const avgCoverage = this.results
        .filter(r => r.coverage !== undefined)
        .reduce((sum, r) => sum + r.coverage!, 0) / 
        this.results.filter(r => r.coverage !== undefined).length;
      
      console.log(`Average Coverage: ${avgCoverage.toFixed(2)}%`);
    }

    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const coverage = result.coverage ? ` (${result.coverage.toFixed(1)}% coverage)` : '';
      console.log(`${status} ${result.suite}: ${result.tests} tests, ${result.failures} failures, ${result.duration}ms${coverage}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Generate JSON report
    const report = {
      summary: {
        totalSuites: this.results.length,
        passedSuites,
        failedSuites: this.results.length - passedSuites,
        totalTests,
        passedTests: totalTests - totalFailures,
        failedTests: totalFailures,
        totalDuration,
        timestamp: new Date().toISOString(),
      },
      results: this.results,
    };

    const reportPath = join(process.cwd(), 'test-results.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    const hasFailures = totalFailures > 0 || passedSuites < this.results.length;
    if (hasFailures) {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }

  private async cleanupTestEnvironment(): Promise<void> {
    console.log('\n🧹 Cleaning up test environment...');

    try {
      execSync('npm run test:cleanup', { stdio: this.options.verbose ? 'inherit' : 'pipe' });
    } catch {
      console.warn('⚠️  Test cleanup script not found, continuing...');
    }

    console.log('✅ Cleanup complete');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    coverage: args.includes('--coverage') || args.includes('-c'),
    failFast: args.includes('--fail-fast') || args.includes('-f'),
    parallel: args.includes('--parallel') || args.includes('-p'),
    suites: args.includes('--suites') ? 
      args[args.indexOf('--suites') + 1]?.split(',') : undefined,
  };

  const runner = new ComprehensiveTestRunner(options);
  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { ComprehensiveTestRunner };
