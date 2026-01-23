#!/bin/bash
# Local test runner script
# This script helps run UI tests locally with minimal setup

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Test Maturity Assessment - Local Test Runner${NC}"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Check if server should be started
START_SERVER=false
SERVER_PID=""

if [ "$1" == "--with-server" ] || [ "$1" == "-s" ]; then
    START_SERVER=true
fi

# Start server if requested
if [ "$START_SERVER" == true ]; then
    echo -e "${YELLOW}🚀 Starting local server on port 8080...${NC}"
    npm run serve > /dev/null 2>&1 &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    
    # Wait for server to be ready
    echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
    sleep 3
    
    # Check if server is running
    if curl -s http://localhost:8080 > /dev/null; then
        echo -e "${GREEN}✓ Server is ready at http://localhost:8080${NC}"
    else
        echo -e "${RED}❌ Server failed to start${NC}"
        exit 1
    fi
fi

# Get BASE_URL
BASE_URL="${BASE_URL:-http://localhost:8080}"
echo -e "${GREEN}🎯 Testing against: ${BASE_URL}${NC}"
echo ""

# Run tests
echo -e "${YELLOW}▶️  Running tests...${NC}"
echo ""

if npm run test:report; then
    echo ""
    echo -e "${GREEN}✅ Tests passed!${NC}"
    echo -e "${GREEN}📊 View report at: $(pwd)/reports/index.html${NC}"
    EXIT_CODE=0
else
    echo ""
    echo -e "${RED}❌ Tests failed!${NC}"
    echo -e "${YELLOW}📊 View report at: $(pwd)/reports/index.html${NC}"
    EXIT_CODE=1
fi

# Stop server if we started it
if [ "$START_SERVER" == true ] && [ -n "$SERVER_PID" ]; then
    echo ""
    echo -e "${YELLOW}🛑 Stopping server...${NC}"
    kill $SERVER_PID 2>/dev/null || true
fi

# Open report in browser (optional)
if [ "$2" == "--open" ] || [ "$2" == "-o" ]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open reports/index.html
    elif command -v open &> /dev/null; then
        open reports/index.html
    else
        echo -e "${YELLOW}ℹ️  Could not auto-open report. Please open reports/index.html manually.${NC}"
    fi
fi

exit $EXIT_CODE
