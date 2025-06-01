#!/bin/bash

echo "🔍 Testing Frontend Health API Integration..."
echo ""

# Test 1: Direct API call
echo "1. Testing direct API call:"
curl -s http://localhost:4000/health/services | jq -r '.services | to_entries[] | "\(.key): \(.value.status)"'
echo ""

# Test 2: Through frontend proxy
echo "2. Testing through frontend proxy:"
curl -s http://localhost:3000/health/services | jq -r '.services | to_entries[] | "\(.key): \(.value.status)"'
echo ""

# Test 3: Check frontend is running
echo "3. Checking frontend status:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend is not accessible"
fi
echo ""

# Test 4: Check React dev server logs for errors
echo "4. Checking for React errors in console..."
echo "(Open browser developer tools and check console for errors)"
echo ""

echo "🎯 To debug further:"
echo "1. Open http://localhost:3000/admin in browser"
echo "2. Open Developer Tools (F12)"
echo "3. Check Console tab for any error messages"
echo "4. Look for network requests to /health/services"
echo "5. Click the 'Debug' button in the health section"
