import urllib.request
import urllib.parse
import http.cookiejar
import json
import re

base_url = 'http://127.0.0.1:5000'

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Fetch CSRF
req_csrf = urllib.request.Request(f'{base_url}/api/v1/csrf')
with opener.open(req_csrf) as response:
    csrf = json.loads(response.read().decode('utf-8')).get('csrf_token', '')

# 2. Login
login_payload = urllib.parse.urlencode({
    'email': 'gwapo@gmail.com',
    'password': 'Password1234!',
    'csrf_token': csrf
}).encode('utf-8')

login_req = urllib.request.Request(
    f'{base_url}/auth/login',
    data=login_payload,
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
with opener.open(login_req) as login_resp:
    pass

# 3. GET /app
app_req = urllib.request.Request(f'{base_url}/app')
with opener.open(app_req) as app_resp:
    html = app_resp.read().decode('utf-8')

print("Fetched /app, length:", len(html))

# Check for our new elements
elements_to_check = [
    'id="fullQuizModal"',
    'id="quizQuestionMatrix"',
    'id="matrixMaxCount"',
    'id="modeStudyBtn"',
    'id="modeExamBtn"',
    'id="examTimerPill"',
    'id="examTimerDisplay"',
    'id="flagQuestionBtn"',
    'id="quizPrevBtn"',
    'id="submitExamEarlyBtn"',
    'id="examReviewTable"',
    'id="examReviewTableBody"',
    'id="printExamBtn"',
    'id="exportStudySetBtn"',
    'id="cardMasteryLabel"',
    'id="cardMasteryFill"',
    'id="cardMasteredBtn"',
    'id="cardReviewAgainBtn"',
    'value="20" selected>20 Questions (Comprehensive Master Exam)'
]

all_present = True
for el in elements_to_check:
    found = el in html
    print(f"[{'OK' if found else 'FAIL'}] {el}")
    if not found:
        all_present = False

if all_present:
    print("\nALL 19/19 new interactive exam UI elements are verified present on /app!")
else:
    print("\nSome elements missing on /app!")

print("\n--- Verifying index.html ---")
with open('index.html', 'r', encoding='utf-8') as f:
    idx_html = f.read()

idx_present = True
for el in elements_to_check:
    found = el in idx_html
    print(f"[{'OK' if found else 'FAIL'}] {el}")
    if not found:
        idx_present = False

if idx_present:
    print("\nALL 19/19 new interactive exam UI elements are verified present on index.html!")
else:
    print("\nSome elements missing on index.html!")
