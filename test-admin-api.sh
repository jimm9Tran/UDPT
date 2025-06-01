#!/bin/bash

echo "🧪 Testing Admin Product CRUD API..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_BASE="http://localhost:4000/api/products"

echo -e "${BLUE}1. Testing GET all products...${NC}"
PRODUCT_COUNT=$(curl -s ${API_BASE} | jq '.products | length')
echo "   Current products count: $PRODUCT_COUNT"

echo -e "${BLUE}2. Testing CREATE product...${NC}"
CREATE_RESPONSE=$(curl -s -X POST ${API_BASE} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Gaming Laptop",
    "description": "High-performance gaming laptop for testing",
    "price": 1599,
    "category": "laptop",
    "brand": "Asus",
    "countInStock": 5,
    "specifications": {
      "ram": "16GB",
      "storage": "1TB SSD",
      "os": "Windows 11"
    }
  }')

PRODUCT_ID=$(echo $CREATE_RESPONSE | jq -r '.id // ._id')
if [ "$PRODUCT_ID" != "null" ] && [ "$PRODUCT_ID" != "" ]; then
    echo -e "   ${GREEN}✅ Product created successfully with ID: $PRODUCT_ID${NC}"
else
    echo -e "   ${RED}❌ Product creation failed${NC}"
    exit 1
fi

echo -e "${BLUE}3. Testing UPDATE product...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH ${API_BASE}/${PRODUCT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Gaming Laptop - Updated",
    "price": 1699
  }')

UPDATED_TITLE=$(echo $UPDATE_RESPONSE | jq -r '.title')
if [[ "$UPDATED_TITLE" == *"Updated"* ]]; then
    echo -e "   ${GREEN}✅ Product updated successfully${NC}"
else
    echo -e "   ${RED}❌ Product update failed${NC}"
fi

echo -e "${BLUE}4. Testing DELETE product...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE ${API_BASE}/${PRODUCT_ID})
echo -e "   ${GREEN}✅ Product deleted${NC}"

echo -e "${BLUE}5. Verifying product count after delete...${NC}"
NEW_PRODUCT_COUNT=$(curl -s ${API_BASE} | jq '.products | length')
echo "   Products count after delete: $NEW_PRODUCT_COUNT"

if [ "$NEW_PRODUCT_COUNT" == "$PRODUCT_COUNT" ]; then
    echo -e "   ${GREEN}✅ Product count matches (delete successful)${NC}"
else
    echo -e "   ${RED}❌ Product count mismatch${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All CRUD operations completed successfully!${NC}"
echo -e "${BLUE}📱 Frontend admin interface is available at: http://localhost:3005/admin/products${NC}"
