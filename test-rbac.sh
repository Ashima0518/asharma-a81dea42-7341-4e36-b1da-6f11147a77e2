#!/bin/bash

BASE="http://localhost:3000/api"

echo "================================================================="
echo "  Task Management System – RBAC & Orgs Test"
echo "================================================================="
echo ""

# We will append a random number to emails to avoid conflict if the db isn't cleared
RND=$RANDOM
OWNER_EMAIL="owner$RND@acme.com"
ADMIN_EMAIL="admin$RND@acme.com"
VIEWER_EMAIL="viewer$RND@acme.com"

# ─── 1. Register new tenant (creates root org + OWNER) ────────────────────
echo "▶ 1. Register new tenant (OWNER: $OWNER_EMAIL)"
REG_RESP=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Owner","email":"'"$OWNER_EMAIL"'","password":"Password123","organizationName":"Acme Corp '"$RND"'"}')
echo "$REG_RESP" | python3 -m json.tool
OWNER_TOKEN=$(echo "$REG_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")
echo ""

# ─── 2. Create Sub-Org as OWNER ───────────────────────────────────────────
echo "▶ 2. Create sub-organization (OWNER)"
SUB_ORG_RESP=$(curl -s -X POST "$BASE/orgs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Acme Engineering '"$RND"'"}')
echo "$SUB_ORG_RESP" | python3 -m json.tool
echo ""

# ─── 3. Get Org Tree as OWNER ─────────────────────────────────────────────
echo "▶ 3. Get organization tree (OWNER)"
curl -s "$BASE/orgs" \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool
echo ""

# ─── 4. Invite Users to Org as OWNER ──────────────────────────────────────
echo "▶ 4a. Create ADMIN in org"
ADMIN_RESP=$(curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Bob Admin","email":"'"$ADMIN_EMAIL"'","password":"Password123","role":"ADMIN"}')
echo "$ADMIN_RESP" | python3 -m json.tool

echo "▶ 4b. Create VIEWER in org"
VIEWER_RESP=$(curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Charlie Viewer","email":"'"$VIEWER_EMAIL"'","password":"Password123","role":"VIEWER"}')
echo "$VIEWER_RESP" | python3 -m json.tool
echo ""

# ─── 5. View Users list as OWNER ──────────────────────────────────────────
echo "▶ 5. Get users list (OWNER)"
curl -s "$BASE/users" \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool
echo ""

# ─── 6. Login as VIEWER ───────────────────────────────────────────────────
echo "▶ 6. Login as VIEWER"
V_LOGIN_RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$VIEWER_EMAIL"'","password":"Password123"}')
VIEWER_TOKEN=$(echo "$V_LOGIN_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))")
echo ""

# ─── 7. Try to view Users list as VIEWER (Should fail: 403 Forbidden) ─────
echo "▶ 7. Get users list (VIEWER) - EXPECTING FORBIDDEN"
curl -s "$BASE/users" \
  -H "Authorization: Bearer $VIEWER_TOKEN" | python3 -m json.tool
echo ""

echo "============== TEST COMPLETE =============="
