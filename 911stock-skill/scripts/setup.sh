#!/bin/bash
# 911Stock skill setup script
# Verifies all required environment variables and dependencies

set -e

echo "911Stock Skill Setup"
echo "===================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required. Install from https://nodejs.org"
    exit 1
fi
echo "Node.js: $(node --version)"

# Check required env vars
MISSING=0

check_env() {
    local var_name=$1
    local required=$2
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            echo "MISSING (required): $var_name"
            MISSING=1
        else
            echo "MISSING (optional): $var_name"
        fi
    else
        echo "OK: $var_name"
    fi
}

echo ""
echo "Environment Variables:"
check_env "DATABASE_URL" "true"
check_env "GEMINI_API_KEY" "true"
check_env "BLAND_API_KEY" "true"
check_env "AUTH0_DOMAIN" "true"
check_env "AUTH0_CLIENT_ID" "true"
check_env "AUTH0_CLIENT_SECRET" "true"
check_env "ALPHA_VANTAGE_KEY" "false"
check_env "MY_PHONE_NUMBER" "false"

echo ""
if [ $MISSING -eq 1 ]; then
    echo "Some required environment variables are missing."
    echo "Copy .env.example to .env.local and fill in the values."
    exit 1
fi

echo "All required environment variables are set."

# Test database connection
echo ""
echo "Testing database connection..."
if node -e "
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => { console.log('Database: OK'); process.exit(0); }).catch(e => { console.error('Database: FAILED -', e.message); process.exit(1); });
" 2>/dev/null; then
    echo "Database connection successful."
else
    echo "WARNING: Could not verify database connection."
fi

echo ""
echo "Setup complete. Run 'npm run dev' to start the development server."
