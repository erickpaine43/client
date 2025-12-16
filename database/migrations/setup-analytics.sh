#!/bin/bash

# ============================================================================
# Analytics Database Setup Script
# ============================================================================
# This script sets up the analytics tables in the NileDB OLAP database
# and optionally seeds them with test data.
#
# USAGE:
#   chmod +x setup-analytics.sh
#   ./setup-analytics.sh [--seed]
#
# OPTIONS:
#   --seed    Also load seed data after creating schema
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${NILEDB_HOST:-localhost}"
DB_PORT="${NILEDB_OLAP_PORT:-5444}"
DB_USER="${NILEDB_USER:-nile}"
DB_NAME="${NILEDB_DATABASE:-nile}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Analytics Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql (PostgreSQL client) is not installed${NC}"
    echo "Please install PostgreSQL client tools first"
    exit 1
fi

# Check if NileDB is running
echo -e "${YELLOW}Checking NileDB OLAP database connection...${NC}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to NileDB OLAP database${NC}"
    echo "Please ensure NileDB is running:"
    echo "  npm run db:start"
    exit 1
fi
echo -e "${GREEN}✓ Connected to NileDB OLAP database${NC}"
echo ""

# Create schema
echo -e "${YELLOW}Creating analytics schema...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/analytics-schema.sql"; then
    echo -e "${GREEN}✓ Analytics schema created successfully${NC}"
else
    echo -e "${RED}Error: Failed to create analytics schema${NC}"
    exit 1
fi
echo ""

# Load seed data if requested
if [[ "$1" == "--seed" ]]; then
    echo -e "${YELLOW}Loading seed data...${NC}"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/analytics-seed.sql"; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}"
    else
        echo -e "${RED}Error: Failed to load seed data${NC}"
        exit 1
    fi
    echo ""
fi

# Verify installation
echo -e "${YELLOW}Verifying installation...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('domain_analytics', 'mailbox_analytics', 'cross_domain_analytics')")

if [[ "$TABLE_COUNT" -eq 3 ]]; then
    echo -e "${GREEN}✓ All 3 analytics tables created${NC}"
else
    echo -e "${RED}Warning: Expected 3 tables, found $TABLE_COUNT${NC}"
fi

# Show summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Analytics tables created:"
echo "  • domain_analytics"
echo "  • mailbox_analytics"
echo "  • cross_domain_analytics"
echo ""

if [[ "$1" == "--seed" ]]; then
    DOMAIN_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM domain_analytics")
    MAILBOX_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM mailbox_analytics")
    
    echo "Test data loaded:"
    echo "  • $DOMAIN_COUNT domains"
    echo "  • $MAILBOX_COUNT mailboxes"
    echo ""
fi

echo "Next steps:"
echo "  1. Start your Next.js dev server: npm run dev"
echo "  2. Navigate to the analytics dashboard"
echo "  3. Verify data is loading correctly"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
