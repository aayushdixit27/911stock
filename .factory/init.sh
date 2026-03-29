#!/bin/bash
set -e

cd web

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Generate NEXTAUTH_SECRET if not set in .env.local
if ! grep -q "NEXTAUTH_SECRET=" .env.local 2>/dev/null; then
  echo "" >> .env.local
  echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
  echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
fi

echo "Environment ready."
