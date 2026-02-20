#!/usr/bin/env bash
set -e

BASE="http://localhost:3000/api"

echo "╔══════════════════════════════════════════════════╗"
echo "║       TASKS CATEGORY & FILTERING TESTS           ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

RND=$RANDOM
OWNER_EMAIL="test$RND@acme.com"

# ─── 0. Setup Tenant ───────────────────────────────────────────────────
echo "▶ 0. Setup: Register new tenant ($OWNER_EMAIL)"
REG_RESP=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"'"$OWNER_EMAIL"'","password":"Password123","organizationName":"Test Org '"$RND"'"}')
TOKEN=$(echo "$REG_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))")
echo ""

# ─── 1. Create Tasks ───────────────────────────────────────────────────
echo "▶ 1a. Create WORK task"
curl -s -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Finish report","status":"TODO","category":"WORK"}' > /dev/null

echo "▶ 1b. Create PERSONAL task"
curl -s -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Buy groceries","status":"TODO","category":"PERSONAL"}' > /dev/null

echo "▶ 1c. Create URGENT task"
TASK_C_RESP=$(curl -s -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Fix prod bug","status":"TODO","category":"URGENT"}')
TASK_C_ID=$(echo "$TASK_C_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")

echo "Tasks created."
echo ""

# ─── 2. Test PUT Request (Full Update) ─────────────────────────────────
echo "▶ 2. Test PUT /tasks/:id (Full Update to URGENT task)"
curl -s -X PUT "$BASE/tasks/$TASK_C_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Fix prod bug immediately","status":"IN_PROGRESS","category":"URGENT"}' | python3 -m json.tool
echo ""

# ─── 3. Filtering and Sorting tests ────────────────────────────────────
echo "▶ 3a. GET /tasks?category=WORK"
curl -s "$BASE/tasks?category=WORK" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep '"category"' || echo "No WORK tasks found"
echo ""

echo "▶ 3b. GET /tasks?sortBy=title&order=desc"
curl -s "$BASE/tasks?sortBy=title&order=desc" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json;
tasks = json.load(sys.stdin)
for t in tasks:
    print('- ' + t['title'])
"
echo ""

echo "✅ Done!"
