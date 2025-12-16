# Analytics Database Setup Script for Windows
# ============================================================================
# This PowerShell script sets up the analytics tables in the NileDB OLAP database
# and optionally seeds them with test data.
#
# USAGE:
#   .\setup-analytics.ps1 [-Seed]
#
# OPTIONS:
#   -Seed    Also load seed data after creating schema
# ============================================================================

param(
    [switch]$Seed
)

# Database configuration
$DB_HOST = if ($env:NILEDB_HOST) { $env:NILEDB_HOST } else { "localhost" }
$DB_PORT = if ($env:NILEDB_OLAP_PORT) { $env:NILEDB_OLAP_PORT } else { "5444" }
$DB_USER = if ($env:NILEDB_USER) { $env:NILEDB_USER } else { "00000000-0000-7000-8000-000000000000" }
$DB_NAME = if ($env:NILEDB_DATABASE) { $env:NILEDB_DATABASE } else { "olap" }
$DB_PASSWORD = if ($env:NILEDB_PASSWORD) { $env:NILEDB_PASSWORD } else { "password" }

# Script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$MIGRATIONS_DIR = $SCRIPT_DIR

Write-Host "========================================" -ForegroundColor Green
Write-Host "Analytics Database Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
}
catch {
    Write-Host "Error: psql (PostgreSQL client) is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools first"
    exit 1
}

# Set password environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Check NileDB connection
Write-Host "Checking NileDB OLAP database connection..." -ForegroundColor Yellow
$testQuery = "SELECT 1"
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $testQuery 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Cannot connect to NileDB OLAP database" -ForegroundColor Red
    Write-Host "Please ensure NileDB is running:"
    Write-Host "  npm run db:start"
    Write-Host ""
    Write-Host "Connection details:"
    Write-Host "  Host: $DB_HOST"
    Write-Host "  Port: $DB_PORT"
    Write-Host "  User: $DB_USER"
    Write-Host "  Database: $DB_NAME"
    exit 1
}
Write-Host "✓ Connected to NileDB OLAP database" -ForegroundColor Green
Write-Host ""

# Create schema
Write-Host "Creating analytics schema..." -ForegroundColor Yellow
$schemaFile = Join-Path $MIGRATIONS_DIR "analytics-schema.sql"
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $schemaFile 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create analytics schema" -ForegroundColor Red
    Write-Host $result
    exit 1
}
Write-Host "✓ Analytics schema created successfully" -ForegroundColor Green
Write-Host ""

# Load seed data if requested
if ($Seed) {
    Write-Host "Loading seed data..." -ForegroundColor Yellow
    $seedFile = Join-Path $MIGRATIONS_DIR "analytics-seed.sql"
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $seedFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to load seed data" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
    Write-Host "✓ Seed data loaded successfully" -ForegroundColor Green
    Write-Host ""
}

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Yellow
$tableCountQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('domain_analytics', 'mailbox_analytics', 'cross_domain_analytics')"
$tableCount = (psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $tableCountQuery).Trim()

if ($tableCount -eq "3") {
    Write-Host "✓ All 3 analytics tables created" -ForegroundColor Green
}
else {
    Write-Host "Warning: Expected 3 tables, found $tableCount" -ForegroundColor Yellow
}

# Show summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Analytics tables created:"
Write-Host "  • domain_analytics"
Write-Host "  • mailbox_analytics"
Write-Host "  • cross_domain_analytics"
Write-Host ""

if ($Seed) {
    $domainCount = (psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM domain_analytics").Trim()
    $mailboxCount = (psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM mailbox_analytics").Trim()
    
    Write-Host "Test data loaded:"
    Write-Host "  • $domainCount domains"
    Write-Host "  • $mailboxCount mailboxes"
    Write-Host ""
}

Write-Host "Next steps:"
Write-Host "  1. Start your Next.js dev server: npm run dev"
Write-Host "  2. Navigate to the analytics dashboard"
Write-Host "  3. Verify data is loading correctly"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
