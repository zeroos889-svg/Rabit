#!/bin/bash

# 🧪 Comprehensive Testing Script for Rabit HR Platform
# This script tests all APIs, endpoints, and services

echo "🚀 بدء الاختبار الشامل لمنصة رابِط HR"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "📊 1. اختبار Health Endpoints"
echo "--------------------------------"
test_endpoint "Health Check" "GET" "http://localhost:3000/health" "" "200"
test_endpoint "Health Live" "GET" "http://localhost:3000/health/live" "" "200"
test_endpoint "Health Ready" "GET" "http://localhost:3000/health/ready" "" "200"
echo ""

echo "🔐 2. اختبار Authentication Endpoints"
echo "---------------------------------------"
# Note: These will return errors because we don't have valid data, but we're testing if endpoints exist
test_endpoint "Auth Register (No Data)" "POST" "http://localhost:3000/api/trpc/auth.register" '{"json":{}}' "400"
test_endpoint "Auth Login (No Data)" "POST" "http://localhost:3000/api/trpc/auth.login" '{"json":{}}' "400"
echo ""

echo "💬 3. اختبار Chat Endpoints"
echo "-----------------------------"
test_endpoint "Chat Create Conversation" "POST" "http://localhost:3000/api/trpc/chat.createConversation" '{"json":{}}' "400"
echo ""

echo "📊 4. اختبار Dashboard Endpoints"
echo "----------------------------------"
test_endpoint "Dashboard Stats (Unauthorized)" "POST" "http://localhost:3000/api/trpc/dashboard.getStats" '{"json":{}}' "401"
echo ""

echo "🔔 5. اختبار Notifications Endpoints"
echo "--------------------------------------"
test_endpoint "Get Notifications (Unauthorized)" "POST" "http://localhost:3000/api/trpc/notifications.getAll" '{"json":{}}' "401"
echo ""

echo "💳 6. اختبار Payment Endpoints"
echo "--------------------------------"
test_endpoint "Create Payment (No Data)" "POST" "http://localhost:3000/api/trpc/payment.create" '{"json":{}}' "400"
echo ""

echo "📄 7. اختبار PDF Endpoints"
echo "----------------------------"
test_endpoint "Generate PDF (No Data)" "POST" "http://localhost:3000/api/trpc/pdf.generate" '{"json":{}}' "400"
echo ""

echo "👥 8. اختبار Admin Endpoints"
echo "------------------------------"
test_endpoint "Get Users (Unauthorized)" "POST" "http://localhost:3000/api/trpc/admin.getUsers" '{"json":{}}' "401"
echo ""

echo "📈 9. اختبار Reports Endpoints"
echo "--------------------------------"
test_endpoint "Generate Report (Unauthorized)" "POST" "http://localhost:3000/api/trpc/reports.generate" '{"json":{}}' "401"
echo ""

echo "🤖 10. اختبار AI Endpoints"
echo "----------------------------"
test_endpoint "AI Chat (No Data)" "POST" "http://localhost:3000/api/trpc/ai.chat" '{"json":{}}' "400"
echo ""

echo ""
echo "================================================"
echo "📊 ملخص نتائج الاختبار"
echo "================================================"
echo -e "إجمالي الاختبارات: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "الاختبارات الناجحة: ${GREEN}$PASSED_TESTS${NC}"
echo -e "الاختبارات الفاشلة: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 جميع الاختبارات ناجحة!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  بعض الاختبارات فشلت${NC}"
    exit 1
fi
