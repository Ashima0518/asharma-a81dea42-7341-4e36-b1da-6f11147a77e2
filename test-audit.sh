#!/usr/bin/env bash
set -e

BASE="http://localhost:3000"

echo "╔══════════════════════════════════════════════════╗"
echo "║          AUDIT TRAIL DEMO SCRIPT                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── 1. Login as OWNER ───────────────────────────────────────────────────
echo "▶ 1. Login as OWNER (admin@acme.com)"
ADMIN_RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Admin123"}')
TOKEN=$(echo "$ADMIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   accessToken: ${TOKEN:0:40}..."
echo ""

# ─── 2. Login as VIEWER ────────────────────────────────────────────────────────
echo "▶ 2. Login as VIEWER (member@acme.com)"
MEMBER_RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"member@acme.com","password":"Member123"}')
MEMBER_TOKEN=$(echo "$MEMBER_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   accessToken: ${MEMBER_TOKEN:0:40}..."
echo ""

# ─── 3. Create a task as VIEWER ────────────────────────────────────────────────
echo "▶ 3. CREATE task (VIEWER)"
CREATE_RESP=$(curl -s -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"title":"Fix login bug","description":"Safari Safari Safari","status":"TODO","category":"Bug"}')
echo "$CREATE_RESP" | python3 -m json.tool
TASK_ID=$(echo "$CREATE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "   ▸ Task ID: $TASK_ID"
echo ""

# ─── 4. Update the task as VIEWER ──────────────────────────────────────────────
echo "▶ 4. UPDATE task status → IN_PROGRESS (VIEWER)"
UPDATE_RESP=$(curl -s -X PATCH "$BASE/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"status":"IN_PROGRESS","title":"Fix login bug [in progress]"}')
echo "$UPDATE_RESP" | python3 -m json.tool
echo ""

# ─── 4. View Audit Logs (OWNER) ───────────────────────────────────────────────
echo "▶ 4. GET /audit-log (OWNER expected 200)"
curl -s -X GET "$BASE/audit-log" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# ─── 5. View Audit Logs (VIEWER) ──────────────────────────────────────────────
echo "▶ 5. GET /audit-log (VIEWER expected 403 Forbidden)"
curl -s -X GET "$BASE/audit-log" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | python3 -m json.tool
echo ""

# ─── 6. View Own Audit Logs (VIEWER) ──────────────────────────────────────────
echo "▶ 6. GET /audit-log/me (VIEWER expected 200, only own events)"
curl -s -X GET "$BASE/audit-log/me" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | python3 -m json.tool
echo ""

echo "✅ Done!"
