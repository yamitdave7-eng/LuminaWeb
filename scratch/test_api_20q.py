import urllib.request
import urllib.parse
import http.cookiejar
import json

base_url = 'http://127.0.0.1:5000'

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Fetch CSRF
req_csrf = urllib.request.Request(f'{base_url}/api/v1/csrf')
with opener.open(req_csrf) as response:
    csrf_data = json.loads(response.read().decode('utf-8'))
    csrf = csrf_data.get('csrf_token', '')

print('CSRF token obtained.')

# 2. Login as gwapo@gmail.com
login_payload = urllib.parse.urlencode({
    'email': 'gwapo@gmail.com',
    'password': 'Password1234!',
    'csrf_token': csrf
}).encode('utf-8')

login_req = urllib.request.Request(
    f'{base_url}/auth/login',
    data=login_payload,
    headers={
        'Content-Type': 'application/x-www-form-urlencoded'
    }
)
with opener.open(login_req) as login_resp:
    print('Login response code:', login_resp.status)

# 3. Refresh CSRF token if needed
with opener.open(f'{base_url}/api/v1/csrf') as response:
    csrf = json.loads(response.read().decode('utf-8')).get('csrf_token', '')

# 4. Generate 20-question study set
sample_text = """
Operating Systems and Computer Architecture:
1. Kernel: The foundational software core running at high privilege.
2. Virtual Memory: Memory abstraction mapping onto physical frames.
3. Paging: Memory allocation in fixed-size blocks.
4. Deadlock: Circular resource waiting state.
5. Race Condition: Concurrent unsynchronized access anomaly.
6. Semaphore: Integer signaling synchronization primitive.
7. Context Switch: Saving and restoring CPU registers.
8. TLB: Hardware cache storing address mappings.
9. PCB: Data structure holding process state.
10. Thrashing: Memory state where excessive paging halts computation.
11. DMA: Direct Memory Access bypassing CPU for I/O.
12. Quantum: Time slice allocated in Round-Robin.
13. Belady Anomaly: More frames leading to more page faults under FIFO.
14. Microkernel: Minimal kernel core running services in user space.
15. System Call: Privilege boundary trap into kernel mode.
16. Mutual Exclusion: Ensuring single-thread critical section access.
17. Inverted Page Table: Table indexed by frame number.
18. Multilevel Queue: Dynamic process priority scheduling.
19. FAT: File allocation table storing cluster chains.
20. Interrupt Vector Table: Array linking interrupt vectors to handlers.
"""

payload = urllib.parse.urlencode({
    'text': sample_text,
    'numQuestions': 20
}).encode('utf-8')

req = urllib.request.Request(
    f'{base_url}/api/v1/study-set/generate',
    data=payload,
    headers={
        'X-CSRFToken': csrf,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
)

with opener.open(req) as resp:
    status = resp.status
    data = json.loads(resp.read().decode('utf-8')).get('data', {})

print('API Status code:', status)
print('Deck title:', data.get('deck_title'))
quiz = data.get('quiz', [])
flashcards = data.get('flashcards', [])
print('Quiz questions count:', len(quiz))
print('Flashcards count:', len(flashcards))

for i, q in enumerate(quiz[:3]):
    print(f"\nQ{i+1}: {q['question']}")
    print(f"   Options: {q['options']}")
    print(f"   Correct: {q['correct_answer']}")
    print(f"   Explanation: {q['explanation']}")
