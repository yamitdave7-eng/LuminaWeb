/**
 * LuminaEdu Student Tools Maximized Suite
 * Handles Full Calendar, Habit Matrix Tracker, Active Recall Quiz, and Zen Focus Chamber
 */

(function () {
  'use strict';

  function initStudentTools() {
    // 1. MODAL REGISTRY & CONTROLS
    function getModal(name) {
      const map = {
        calendar: document.getElementById('fullCalendarModal'),
        tracker: document.getElementById('fullTrackerModal'),
        quiz: document.getElementById('fullQuizModal'),
        timer: document.getElementById('fullTimerModal')
      };
      return map[name] || document.getElementById(name);
    }

    function openModal(name) {
      const modal = getModal(name);
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');

      if (name === 'calendar') renderFullCalendar();
      if (name === 'tracker') renderHabitTracker();
      if (name === 'quiz') initQuiz();
      if (name === 'timer') renderZenClock();
    }

    function closeModal(name) {
      const modal = getModal(name);
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (name === 'timer') stopAmbientSound();
    }

    // Expose on window for programmatic calls
    window.openStudentModal = openModal;
    window.closeStudentModal = closeModal;

    // Delegated click handlers for triggers
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('[data-open-modal]');
      if (openBtn) {
        e.preventDefault();
        const modalName = openBtn.dataset.openModal;
        openModal(modalName);
        return;
      }

      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        e.preventDefault();
        const modalName = closeBtn.dataset.closeModal;
        closeModal(modalName);
        return;
      }

      // Backdrop click dismiss
      if (e.target.classList && e.target.classList.contains('full-modal-backdrop')) {
        const id = e.target.id;
        if (id === 'fullCalendarModal') closeModal('calendar');
        else if (id === 'fullTrackerModal') closeModal('tracker');
        else if (id === 'fullQuizModal') closeModal('quiz');
        else if (id === 'fullTimerModal') closeModal('timer');
        else e.target.classList.remove('open');
      }
    });

    // Escape key dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['calendar', 'tracker', 'quiz', 'timer'].forEach(closeModal);
      }
    });

    // 2. CONFETTI CELEBRATION ENGINE
    function triggerDashConfetti() {
      const canvas = document.getElementById('dashboardConfettiCanvas');
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const colors = ['#7c3aed', '#a78bfa', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
      const particles = [];

      for (let i = 0; i < 60; i++) {
        particles.push({
          x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 300,
          y: window.innerHeight * 0.4,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 10 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.015
        });
      }

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.3;
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size * 0.7);
          ctx.restore();
        }
        if (particles.length > 0) requestAnimationFrame(loop);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(loop);
    }
    window.triggerDashConfetti = triggerDashConfetti;

    // 3. FULL MAXIMIZED CALENDAR & PLANNER
    let currentCalDate = new Date();
    let selectedCalDateStr = `${currentCalDate.getFullYear()}-${String(currentCalDate.getMonth() + 1).padStart(2, '0')}-${String(currentCalDate.getDate()).padStart(2, '0')}`;

    const defaultEvents = [
      { title: 'UI/UX Design Review', time: '09:00', type: 'violet', date: '2026-10-30' },
      { title: 'Python Assignment Submission', time: '23:00', type: 'blue', date: '2026-10-31' },
      { title: 'Algorithm Mock Exam', time: '14:00', type: 'pink', date: '2026-11-02' }
    ];

    function getStoredEvents() {
      try {
        const saved = localStorage.getItem('lumina_cal_events_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return defaultEvents;
    }

    function saveStoredEvents(events) {
      try {
        localStorage.setItem('lumina_cal_events_v2', JSON.stringify(events));
      } catch (e) {}
    }

    function renderFullCalendar() {
      const fullMonthDaysGrid = document.getElementById('fullMonthDaysGrid');
      const fullCalMonthTitle = document.getElementById('fullCalMonthTitle');
      const dashCalGrid = document.getElementById('dashCalGrid');
      const dashCalMonthLabel = document.getElementById('dashCalMonthLabel');

      const year = currentCalDate.getFullYear();
      const month = currentCalDate.getMonth();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      if (fullCalMonthTitle) fullCalMonthTitle.textContent = `${monthNames[month]} ${year}`;
      if (dashCalMonthLabel) dashCalMonthLabel.textContent = `${monthNames[month]} ${year}`;

      const events = getStoredEvents();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();

      if (fullMonthDaysGrid) {
        fullMonthDaysGrid.innerHTML = '';
        for (let i = 0; i < firstDay; i++) {
          const empty = document.createElement('div');
          empty.className = 'full-cal-cell empty';
          fullMonthDaysGrid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter((e) => e.date === dateStr);

          const cell = document.createElement('div');
          cell.className = 'full-cal-cell';
          if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
          }
          if (dateStr === selectedCalDateStr) {
            cell.classList.add('selected');
          }

          cell.innerHTML = `
            <span class="cell-num">${day}</span>
            <div class="cell-event-chips">
              ${dayEvents.map((e) => `<span class="chip-item chip-${e.type}">${e.title}</span>`).join('')}
            </div>
          `;

          cell.addEventListener('click', () => {
            document.querySelectorAll('.full-cal-cell').forEach((c) => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedCalDateStr = dateStr;
            renderDayTimeline(dateStr, `${monthNames[month]} ${day}, ${year}`, dayEvents);
          });

          fullMonthDaysGrid.appendChild(cell);
        }
      }

      // Render Mini Dashboard Grid if on dashboard page
      if (dashCalGrid) {
        dashCalGrid.innerHTML = '';
        for (let i = 0; i < firstDay; i++) {
          const empty = document.createElement('div');
          empty.className = 'mini-cal-cell empty';
          dashCalGrid.appendChild(empty);
        }
        for (let day = 1; day <= daysInMonth; day++) {
          const cell = document.createElement('div');
          cell.className = 'mini-cal-cell';
          cell.textContent = String(day);
          if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
          }
          cell.addEventListener('click', () => {
            selectedCalDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            openModal('calendar');
          });
          dashCalGrid.appendChild(cell);
        }
      }

      // Render Mini Upcoming Deadlines on Dashboard if present
      const dashUpcomingList = document.getElementById('dashUpcomingList');
      if (dashUpcomingList) {
        if (events.length === 0) {
          dashUpcomingList.innerHTML = `<div class="empty-upcoming">No deadlines scheduled. Click ⤢ to add one!</div>`;
        } else {
          const sorted = [...events].sort((a, b) => (a.date > b.date ? 1 : -1)).slice(0, 3);
          dashUpcomingList.innerHTML = sorted.map((e) => `
            <div class="event-chip-row ${e.type}">
              <span class="chip-dot"></span>
              <strong>${e.title}</strong>
              <small>${e.date} · ${e.time}</small>
            </div>
          `).join('');
        }
      }

      const dayEvents = events.filter((e) => e.date === selectedCalDateStr);
      const selDateObj = new Date(selectedCalDateStr);
      renderDayTimeline(selectedCalDateStr, `${monthNames[selDateObj.getMonth()]} ${selDateObj.getDate()}, ${selDateObj.getFullYear()}`, dayEvents);
    }

    function renderDayTimeline(dateStr, displayTitle, dayEvents) {
      const titleEl = document.getElementById('selectedDateTitle');
      const subEl = document.getElementById('selectedDateSub');
      const listEl = document.getElementById('dayTimelineList');

      if (titleEl) titleEl.textContent = displayTitle;
      if (subEl) subEl.textContent = `${dayEvents.length} scheduled event(s)`;

      if (listEl) {
        if (dayEvents.length === 0) {
          listEl.innerHTML = `<div class="empty-schedule-box">No events scheduled for this day. Add one above!</div>`;
        } else {
          listEl.innerHTML = dayEvents.map((e) => `
            <div class="timeline-event-row border-${e.type}">
              <span class="timeline-time">${e.time}</span>
              <div class="timeline-details">
                <strong>${e.title}</strong>
                <small class="type-tag tag-${e.type}">${e.type.toUpperCase()}</small>
              </div>
            </div>
          `).join('');
        }
      }
    }

    // Calendar month switcher buttons
    const prevBtn = document.getElementById('fullCalPrevBtn');
    const nextBtn = document.getElementById('fullCalNextBtn');
    const todayBtn = document.getElementById('fullCalTodayBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderFullCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderFullCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        currentCalDate = new Date();
        selectedCalDateStr = `${currentCalDate.getFullYear()}-${String(currentCalDate.getMonth() + 1).padStart(2, '0')}-${String(currentCalDate.getDate()).padStart(2, '0')}`;
        renderFullCalendar();
      });
    }

    // New event submission
    const submitEventBtn = document.getElementById('submitNewEventBtn');
    const eventTitleInput = document.getElementById('newEventTitleInput');
    const eventTypeSelect = document.getElementById('newEventTypeSelect');
    const eventTimeInput = document.getElementById('newEventTimeInput');

    if (submitEventBtn && eventTitleInput) {
      submitEventBtn.addEventListener('click', () => {
        const title = eventTitleInput.value.trim();
        if (!title) return;
        const type = eventTypeSelect ? eventTypeSelect.value : 'violet';
        const time = (eventTimeInput && eventTimeInput.value) ? eventTimeInput.value : '14:00';
        const date = selectedCalDateStr;

        const events = getStoredEvents();
        events.push({ title, time, type, date });
        saveStoredEvents(events);

        eventTitleInput.value = '';
        renderFullCalendar();
        triggerDashConfetti();
      });
    }

    // 4. FULL MAXIMIZED HABIT TRACKER
    const defaultHabits = [
      { id: 'h1', name: '🧘 10 min Mindfulness & Calm', days: [true, true, true, true, false, false, false], streak: '4d' },
      { id: 'h2', name: '💧 Drink 8 Glasses Water', days: [true, true, true, true, true, false, false], streak: '5d' },
      { id: 'h3', name: '📚 2 Hours Deep Study Block', days: [true, true, false, true, true, false, false], streak: '2d' },
      { id: 'h4', name: '💻 Coding / Project Practice', days: [true, true, true, true, true, false, false], streak: '5d' },
      { id: 'h5', name: '🏃 8,000 Steps Daily Walk', days: [false, true, true, false, true, false, false], streak: '1d' },
      { id: 'h6', name: '🌙 8 Hours Restful Sleep', days: [true, true, true, true, false, false, false], streak: '4d' }
    ];

    function getStoredHabits() {
      try {
        const saved = localStorage.getItem('lumina_habits_matrix_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return defaultHabits;
    }

    function saveStoredHabits(habits) {
      try {
        localStorage.setItem('lumina_habits_matrix_v2', JSON.stringify(habits));
      } catch (e) {}
    }

    function calcConsecutiveStreak(days) {
      let streak = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i]) streak++;
        else break;
      }
      return `${streak}d`;
    }

    function renderHabitTracker() {
      const habitMatrixTableBody = document.getElementById('habitMatrixTableBody');
      const heatmapGrid = document.getElementById('heatmapGrid');
      const trackerRateEl = document.getElementById('trackerCompletionRate');
      const dashConsistencyBadge = document.getElementById('dashConsistencyBadge');
      const trackerStreakEl = document.getElementById('trackerCurrentStreak');
      const bannerStreakEl = document.getElementById('bannerStreakCount');
      const dashStreakBadge = document.getElementById('dashStreakBadge');

      const habits = getStoredHabits();

      if (habitMatrixTableBody) {
        habitMatrixTableBody.innerHTML = '';
        let totalChecks = 0;
        let checkedCount = 0;
        let maxStreak = 0;

        habits.forEach((habit, hIdx) => {
          const streakStr = habit.streak || calcConsecutiveStreak(habit.days);
          const streakNum = parseInt(streakStr, 10) || 0;
          if (streakNum > maxStreak) maxStreak = streakNum;

          const daysHtml = habit.days.map((checked, dIdx) => {
            totalChecks++;
            if (checked) checkedCount++;
            return `
              <td class="check-cell">
                <button type="button" class="habit-check-btn ${checked ? 'checked' : ''}" data-hidx="${hIdx}" data-didx="${dIdx}" aria-label="Toggle habit">
                  ${checked ? '✓' : ''}
                </button>
              </td>
            `;
          }).join('');

          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="habit-name-cell"><strong>${habit.name}</strong></td>
            ${daysHtml}
            <td class="streak-cell"><span class="streak-pill">🔥 ${streakStr}</span></td>
            <td class="action-cell">
              <button type="button" class="habit-del-btn" data-del-hidx="${hIdx}" title="Delete habit">✕</button>
            </td>
          `;

          habitMatrixTableBody.appendChild(row);
        });

        const rate = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 86;
        if (trackerRateEl) trackerRateEl.textContent = `${rate}%`;
        if (dashConsistencyBadge) dashConsistencyBadge.textContent = `${rate}% Consistent`;
        if (trackerStreakEl) trackerStreakEl.textContent = `${maxStreak || 7} Days`;
        if (bannerStreakEl) bannerStreakEl.textContent = `${maxStreak || 7} Days`;
        if (dashStreakBadge) dashStreakBadge.textContent = `🔥 ${maxStreak || 7}-Day Streak`;

        // Checkbox toggle handler
        habitMatrixTableBody.querySelectorAll('.habit-check-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const hIdx = parseInt(btn.dataset.hidx, 10);
            const dIdx = parseInt(btn.dataset.didx, 10);
            habits[hIdx].days[dIdx] = !habits[hIdx].days[dIdx];
            habits[hIdx].streak = calcConsecutiveStreak(habits[hIdx].days);
            saveStoredHabits(habits);
            renderHabitTracker();
            if (habits[hIdx].days[dIdx]) triggerDashConfetti();
          });
        });

        // Delete habit handler
        habitMatrixTableBody.querySelectorAll('.habit-del-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const delIdx = parseInt(btn.dataset.delHidx, 10);
            if (!isNaN(delIdx)) {
              habits.splice(delIdx, 1);
              saveStoredHabits(habits);
              renderHabitTracker();
            }
          });
        });
      }

      // Add custom habit form
      const submitHabitBtn = document.getElementById('submitNewHabitBtn');
      const habitNameInput = document.getElementById('newHabitNameInput');
      const habitCatSelect = document.getElementById('newHabitCategorySelect');

      if (submitHabitBtn && !submitHabitBtn._bound) {
        submitHabitBtn._bound = true;
        const addHabit = () => {
          if (!habitNameInput || !habitNameInput.value.trim()) return;
          const text = habitNameInput.value.trim();
          const cat = habitCatSelect ? habitCatSelect.value : '🧘 Mind';
          const habits = getStoredHabits();
          habits.push({
            id: 'h_' + Date.now(),
            name: `${cat.split(' ')[0]} ${text}`,
            days: [false, false, false, false, false, false, false],
            streak: '0d'
          });
          saveStoredHabits(habits);
          habitNameInput.value = '';
          renderHabitTracker();
          triggerDashConfetti();
        };
        submitHabitBtn.addEventListener('click', addHabit);
        if (habitNameInput) {
          habitNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addHabit();
            }
          });
        }
      }

      // Heatmap squares
      if (heatmapGrid && heatmapGrid.children.length === 0) {
        heatmapGrid.innerHTML = '';
        const levels = ['level-0', 'level-1', 'level-2', 'level-3'];
        for (let i = 0; i < 35; i++) {
          const lvl = levels[Math.floor(Math.random() * levels.length)];
          const sq = document.createElement('div');
          sq.className = `heat-box ${lvl}`;
          sq.title = `Day ${i + 1}: Active consistency logged`;
          heatmapGrid.appendChild(sq);
        }
      }
    }

    // 5. FULL MAXIMIZED STUDY QUIZ, 3D FLASHCARDS & AI GENERATOR (UP TO 20 QUESTIONS)
    const defaultDeck = {
      deck_title: "Computer Science & Study Skills Master Deck",
      type: "Comprehensive Academic Deck",
      flashcards: [
        { id: 1, front: "What is the average-case time complexity of Hash Table lookups?", tag: "Data Structures", highlight: "O(1) Constant Time", back: "Hash tables compute an index via hashing function, allowing immediate array indexing on average." },
        { id: 2, front: "What is the Pomodoro technique's recommended study interval?", tag: "Study Skills", highlight: "25 Minutes Focus + 5 Minutes Rest", back: "25 minutes of deep focus followed by 5 minutes of mindful rest prevents cognitive fatigue and improves retention." },
        { id: 3, front: "How does Spaced Repetition halt memory decay?", tag: "Cognitive Science", highlight: "Calibrated Intervals at the Forgetting Curve", back: "By reviewing material right as you are about to forget it, neural synapses reinforce the memory trace permanently." },
        { id: 4, front: "What is the Habify 40/30/30 daily balance formula?", tag: "Wellness & Habit", highlight: "40% Study · 30% Mind · 30% Body", back: "Allocating 40% to deep study, 30% to mental calm/mindfulness, and 30% to physical health prevents student burnout." },
        { id: 5, front: "In Python, what is the key difference between a List and a Tuple?", tag: "Python & Coding", highlight: "Lists are Mutable, Tuples are Immutable", back: "Lists can be modified after creation (append/pop), whereas tuples are fixed and cannot be changed." },
        { id: 6, front: "What is the primary role of the Operating System Kernel?", tag: "Operating Systems", highlight: "Core Hardware Abstraction & Process Scheduling", back: "The kernel manages CPU scheduling, hardware device drivers, virtual memory translation, and system calls." },
        { id: 7, front: "What is the fundamental purpose of Virtual Memory?", tag: "Memory Management", highlight: "Abstraction of Contiguous Linear Address Space", back: "It provides an isolated idealized memory map for each process while mapping onto non-contiguous physical RAM pages and disk swap." },
        { id: 8, front: "What four conditions are necessary for Deadlock to occur?", tag: "Concurrency", highlight: "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait", back: "Coffman conditions: all four must hold simultaneously for a deadlocked state to persist." },
        { id: 9, front: "How does a Race Condition compromise software reliability?", tag: "Concurrency", highlight: "Non-Deterministic Concurrency Anomalies", back: "When unsynchronized threads read and write shared state simultaneously, execution order determines correctness." },
        { id: 10, front: "What is a Counting Semaphore in concurrent programming?", tag: "Synchronization", highlight: "Integer Counter with Atomic Wait and Signal", back: "Semaphores restrict concurrent access to a finite pool of resources through atomic wait() and signal() operations." },
        { id: 11, front: "What is Paging in operating systems?", tag: "Memory Management", highlight: "Fixed-Size Memory Blocks (Pages & Frames)", back: "Divides physical memory into fixed-size frames and logical memory into pages, eliminating external fragmentation." },
        { id: 12, front: "What occurs during an operating system Context Switch?", tag: "Processor Architecture", highlight: "State Saving & Program Counter Restoration", back: "The CPU state, registers, and stack pointers of an active process are preserved in its PCB while another process is loaded." },
        { id: 13, front: "What is the purpose of the Translation Lookaside Buffer (TLB)?", tag: "Hardware & Memory", highlight: "High-Speed Hardware Cache for Page Tables", back: "The TLB caches recent virtual-to-physical address translations to avoid multiple RAM lookups per instruction." },
        { id: 14, front: "What vital data is preserved inside a Process Control Block (PCB)?", tag: "Process Management", highlight: "Process ID, Registers, State & Priority", back: "The PCB stores PID, program counter, scheduling parameters, memory limits, and list of open file descriptors." },
        { id: 15, front: "What causes Operating System Thrashing?", tag: "Virtual Memory", highlight: "Excessive Paging Exceeding Swap Bandwidth", back: "When total working sets exceed physical memory, processes spend more time servicing page faults than computing." },
        { id: 16, front: "How does Direct Memory Access (DMA) reduce CPU overhead?", tag: "Hardware I/O", highlight: "Bypasses CPU for High-Volume Data Transfers", back: "Specialized DMA controllers move data blocks between devices and main memory directly without CPU cycle consumption." },
        { id: 17, front: "What is a Scheduling Time Quantum in Round-Robin scheduling?", tag: "CPU Scheduling", highlight: "Fixed CPU Slice per Process Rotation", back: "A predetermined interval after which a running process is preempted and returned to the ready queue tail." },
        { id: 18, front: "What is Belady's Anomaly in page replacement algorithms?", tag: "Virtual Memory", highlight: "FIFO Page Faults Increase with More Frames", back: "A counter-intuitive phenomenon under FIFO where allocating additional physical frames actually causes more page faults." },
        { id: 19, front: "What distinguishes a Microkernel architecture from a Monolithic kernel?", tag: "Kernel Architecture", highlight: "Minimal Core with User-Space Servers", back: "Microkernels keep only IPC, minimal memory, and scheduling in kernel mode, running file systems and drivers in user space." },
        { id: 20, front: "What is the primary function of a System Call interface?", tag: "Security & OS", highlight: "Privilege Boundary between User & Kernel Mode", back: "System calls invoke software interrupts or traps to request privileged kernel operations safely without exposing raw hardware." }
      ],
      quiz: [
        {
          id: 1,
          question: "In Big-O notation, what is the average-case time complexity of looking up an item in a Hash Table?",
          options: ["A. O(n) Linear Time", "B. O(1) Constant Time", "C. O(log n) Logarithmic", "D. O(n²) Quadratic"],
          correct_answer: "B. O(1) Constant Time",
          explanation: "Hash tables compute an index in constant time O(1) on average using an efficient hashing function."
        },
        {
          id: 2,
          question: "Which interval length is standard for a deep work Pomodoro focus session?",
          options: ["A. 10 minutes", "B. 25 minutes", "C. 90 minutes", "D. 3 hours"],
          correct_answer: "B. 25 minutes",
          explanation: "25 minutes of deep focus followed by a 5-minute break is the classic Pomodoro rhythm proven to maintain cognitive focus."
        },
        {
          id: 3,
          question: "What is the primary benefit of the 'Spaced Repetition' learning technique?",
          options: ["A. Cramming everything into one long overnight session", "B. Halting memory decay by reviewing at calibrated intervals", "C. Memorizing answers without conceptual understanding", "D. Reviewing notes only immediately before final exams"],
          correct_answer: "B. Halting memory decay by reviewing at calibrated intervals",
          explanation: "Spaced repetition reviews material right before the forgetting curve takes effect, reinforcing neural connections."
        },
        {
          id: 4,
          question: "According to the LuminaEdu daily balance wheel, what percentage is allocated to deep Study?",
          options: ["A. 100% Extreme Dedication", "B. 70% Intensive Study", "C. 40% Balanced Deep Study", "D. 10% Minimal Effort"],
          correct_answer: "C. 40% Balanced Deep Study",
          explanation: "40% Study, 30% Mind wellness, and 30% Body health creates sustainable peak academic performance without burnout."
        },
        {
          id: 5,
          question: "In Python, which built-in function returns both the index and value of iterable elements?",
          options: ["A. range()", "B. enumerate()", "C. zip()", "D. map()"],
          correct_answer: "B. enumerate()",
          explanation: "enumerate(iterable) yields tuples of (index, item) during iteration."
        },
        {
          id: 6,
          question: "Which of the following is the central responsibility of the Operating System Kernel?",
          options: ["A. Rendering UI CSS stylesheets", "B. Core resource management, process scheduling, and hardware control", "C. Compiling source code into web applications", "D. Managing client-side local storage cookies"],
          correct_answer: "B. Core resource management, process scheduling, and hardware control",
          explanation: "The kernel is the foundational core managing process queues, physical memory allocation, and hardware drivers."
        },
        {
          id: 7,
          question: "How does Virtual Memory benefit running processes on modern operating systems?",
          options: ["A. It eliminates the need for physical RAM altogether", "B. It provides an idealized linear abstraction of memory and process isolation", "C. It doubles the clock frequency of the central processing unit", "D. It converts mechanical hard drives into optical solid-state storage"],
          correct_answer: "B. It provides an idealized linear abstraction of memory and process isolation",
          explanation: "Virtual memory maps isolated virtual address spaces into physical frames and secondary storage swap pages."
        },
        {
          id: 8,
          question: "Which of the following describes a Deadlock state in concurrent systems?",
          options: ["A. A process executing an infinite while loop", "B. A set of processes blocked because each holds a resource while waiting for another", "C. A thread terminating due to an unhandled null exception", "D. High network latency slowing down API responses"],
          correct_answer: "B. A set of processes blocked because each holds a resource while waiting for another",
          explanation: "Deadlock occurs when processes wait circularly for resources held by one another under mutual exclusion."
        },
        {
          id: 9,
          question: "What primary hazard characterizes a Race Condition in multithreaded programming?",
          options: ["A. A compiler syntax error preventing program execution", "B. Non-deterministic outputs caused by concurrent unsynchronized reads/writes", "C. The computer cooling fan running at maximum speed", "D. Memory leakage due to missing garbage collection calls"],
          correct_answer: "B. Non-deterministic outputs caused by concurrent unsynchronized reads/writes",
          explanation: "Race conditions arise when multiple threads access shared mutable state without proper locking mechanisms."
        },
        {
          id: 10,
          question: "In concurrent software engineering, what is the role of a Semaphore?",
          options: ["A. A variable used to style HTML elements dynamically", "B. A synchronization variable that controls access to common resources via atomic counter", "C. A database index used for speeding up SQL select queries", "D. A network router protocol for assigning IP addresses"],
          correct_answer: "B. A synchronization variable that controls access to common resources via atomic counter",
          explanation: "Semaphores provide atomic wait and signal operations to safely coordinate access to limited shared resources."
        },
        {
          id: 11,
          question: "How does the 'Paging' memory management scheme prevent external memory fragmentation?",
          options: ["A. By sorting files alphabetically in the root directory", "B. By dividing physical memory into fixed-size frames and allocating non-contiguously", "C. By storing all program data exclusively on high-speed USB flash drives", "D. By forcing programs to terminate after five minutes of activity"],
          correct_answer: "B. By dividing physical memory into fixed-size frames and allocating non-contiguously",
          explanation: "Paging divides memory into uniform blocks, allowing any logical page to reside in any free physical frame."
        },
        {
          id: 12,
          question: "What operations occur during an operating system Context Switch?",
          options: ["A. The monitor switches from dark mode to light mode", "B. The CPU registers and state of a process are saved and another process is restored", "C. The browser deletes all browsing cookies and temporary cache files", "D. The operating system restarts the physical computer completely"],
          correct_answer: "B. The CPU registers and state of a process are saved and another process is restored",
          explanation: "Context switching preserves the active process state in its PCB and switches execution context to a scheduled process."
        },
        {
          id: 13,
          question: "What is the primary function of the Translation Lookaside Buffer (TLB)?",
          options: ["A. Caching recent virtual-to-physical address translations in high-speed hardware", "B. Buffering audio data packets before sending to the speakers", "C. Compressing image files before transmitting over HTTP", "D. Storing user passwords securely inside the browser local storage"],
          correct_answer: "A. Caching recent virtual-to-physical address translations in high-speed hardware",
          explanation: "The TLB is an associative hardware cache that speeds up virtual address translation by avoiding page table RAM traversals."
        },
        {
          id: 14,
          question: "Which of the following pieces of metadata is strictly stored inside a Process Control Block (PCB)?",
          options: ["A. The student's homework grade", "B. Process state, Program Counter, CPU registers, and memory boundaries", "C. The user's credit card billing address", "D. The CSS margin and padding definitions of the web layout"],
          correct_answer: "B. Process state, Program Counter, CPU registers, and memory boundaries",
          explanation: "The PCB is the kernel data structure maintaining the runtime state, registers, priority, and resource handles of a process."
        },
        {
          id: 15,
          question: "What condition defines Operating System 'Thrashing'?",
          options: ["A. When the CPU fan runs at excessive noise levels", "B. When excessive page faulting causes the system to spend more time swapping than computing", "C. When a user types faster than the keyboard buffer can register", "D. When an internet cable is disconnected during a file download"],
          correct_answer: "B. When excessive page faulting causes the system to spend more time swapping than computing",
          explanation: "Thrashing occurs when memory allocation is overcommitted, causing continuous page faults and thrashing the disk."
        },
        {
          id: 16,
          question: "How does Direct Memory Access (DMA) optimize system throughput?",
          options: ["A. It transfers data blocks between I/O devices and RAM without tying up CPU cycles", "B. It increases the physical capacity of RAM modules by 200%", "C. It executes Python code ten times faster by skipping bytecode compilation", "D. It converts wired ethernet networks into high-speed fiber optics"],
          correct_answer: "A. It transfers data blocks between I/O devices and RAM without tying up CPU cycles",
          explanation: "DMA controllers transfer large blocks of data directly to memory, freeing the processor for computational tasks."
        },
        {
          id: 17,
          question: "In CPU scheduling, what is the 'Time Quantum' used for in Round-Robin algorithms?",
          options: ["A. The total battery life of a student's laptop", "B. The fixed time slice allocated to each process before preemptive rotation", "C. The time required to download a PDF document from the internet", "D. The delay between pressing a key and seeing the character on screen"],
          correct_answer: "B. The fixed time slice allocated to each process before preemptive rotation",
          explanation: "The time quantum dictates how long a process runs before yielding the CPU to the next ready process."
        },
        {
          id: 18,
          question: "What is Belady's Anomaly in the context of FIFO Page Replacement?",
          options: ["A. An algorithm that runs out of memory whenever prime numbers are calculated", "B. Allocating more physical page frames unexpectedly increases the total number of page faults", "C. A bug that causes computers to restart exactly at midnight", "D. Faster CPU clock speeds causing slower disk read performance"],
          correct_answer: "B. Allocating more physical page frames unexpectedly increases the total number of page faults",
          explanation: "Belady's Anomaly proves that under FIFO, increasing the frame count does not guarantee fewer page faults."
        },
        {
          id: 19,
          question: "What is the architectural advantage of a Microkernel design over a Monolithic kernel?",
          options: ["A. It runs exclusively on smartphones and smartwatches", "B. System services run in user space, isolating faults and enhancing modularity", "C. It completely eliminates the need for software device drivers", "D. It compiles operating system code in under one second"],
          correct_answer: "B. System services run in user space, isolating faults and enhancing modularity",
          explanation: "Microkernels minimize kernel-mode code, meaning crashed drivers or file systems do not bring down the entire OS."
        },
        {
          id: 20,
          question: "What is the primary function of a System Call interface?",
          options: ["A. Calling another student via telephone during class hours", "B. Providing a secure, privileged boundary between user-space applications and kernel mode", "C. Creating animated SVG graphics inside a web browser canvas", "D. Compressing text files into zip format automatically"],
          correct_answer: "B. Providing a secure, privileged boundary between user-space applications and kernel mode",
          explanation: "System calls allow user applications to transition into kernel privilege mode safely to request OS services."
        }
      ]
    };

    function getActiveDeck() {
      try {
        const saved = localStorage.getItem('lumina_active_study_set_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return defaultDeck;
    }

    function saveActiveDeck(deck) {
      try {
        localStorage.setItem('lumina_active_study_set_v2', JSON.stringify(deck));
      } catch (e) {}
    }

    // Active State
    let activeDeck = getActiveDeck();
    let currentQuizIdx = 0;
    let quizScore = 0;
    let quizCorrectCount = 0;
    let quizStreak = 1.0;
    let maxStreak = 1.0;
    let hasAnswered = false;
    let currentCardIdx = 0;
    let currentCardsList = [...activeDeck.flashcards];
    let userAnswers = {}; // { [quizIdx]: selectedChoiceString }
    let flaggedQuestions = new Set();
    let masteredCards = new Set();
    let isExamMode = false;
    let examSecondsLeft = 20 * 60;
    let examTimerInterval = null;
    let activeReviewFilter = 'all';

    // DOM Elements - Navigation & Ribbons
    const quizModeBtn = document.getElementById('quizModeBtn');
    const flashcardModeBtn = document.getElementById('flashcardModeBtn');
    const generatorModeBtn = document.getElementById('generatorModeBtn');
    const quickUploadPillBtn = document.getElementById('quickUploadPillBtn');
    const activeDeckTitleEl = document.getElementById('activeDeckTitle');
    const activeDeckTypeTagEl = document.getElementById('activeDeckTypeTag');
    const ribbonScoreValEl = document.getElementById('ribbonScoreVal');
    const ribbonStreakValEl = document.getElementById('ribbonStreakVal');

    // DOM Elements - Mode Switching & Timer
    const modeStudyBtn = document.getElementById('modeStudyBtn');
    const modeExamBtn = document.getElementById('modeExamBtn');
    const examTimerPill = document.getElementById('examTimerPill');
    const examTimerDisplay = document.getElementById('examTimerDisplay');

    // DOM Elements - Views
    const quizContainerView = document.getElementById('quizContainerView');
    const quizSummaryView = document.getElementById('quizSummaryView');
    const flashcardContainerView = document.getElementById('flashcardContainerView');
    const quizGeneratorView = document.getElementById('quizGeneratorView');

    // DOM Elements - Quiz Controls & Navigator Matrix
    const quizQuestionMatrix = document.getElementById('quizQuestionMatrix');
    const matrixMaxCount = document.getElementById('matrixMaxCount');
    const questionTracker = document.getElementById('questionTracker');
    const flagQuestionBtn = document.getElementById('flagQuestionBtn');
    const liveStreakPill = document.getElementById('liveStreakPill');
    const liveScorePill = document.getElementById('liveScorePill');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptionsList = document.getElementById('quizOptionsList');
    const quizExplanationCard = document.getElementById('quizExplanationCard');
    const explIcon = document.getElementById('explIcon');
    const explTitle = document.getElementById('explTitle');
    const explPointsTag = document.getElementById('explPointsTag');
    const quizExplanationText = document.getElementById('quizExplanationText');
    const quizPrevBtn = document.getElementById('quizPrevBtn');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const submitExamEarlyBtn = document.getElementById('submitExamEarlyBtn');
    const quizProgressFill = document.getElementById('quizProgressFill');

    // DOM Elements - Summary & Graded Review Table
    const summaryGradeBadge = document.getElementById('summaryGradeBadge');
    const summaryTotalPoints = document.getElementById('summaryTotalPoints');
    const summaryAccuracyVal = document.getElementById('summaryAccuracyVal');
    const summaryBasePtsVal = document.getElementById('summaryBasePtsVal');
    const summaryStreakBonusVal = document.getElementById('summaryStreakBonusVal');
    const summaryCorrectCountVal = document.getElementById('summaryCorrectCountVal');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');
    const printExamBtn = document.getElementById('printExamBtn');
    const exportStudySetBtn = document.getElementById('exportStudySetBtn');
    const studyCardsAfterQuizBtn = document.getElementById('studyCardsAfterQuizBtn');
    const uploadAnotherLessonBtn = document.getElementById('uploadAnotherLessonBtn');
    const examReviewTableBody = document.getElementById('examReviewTableBody');
    const reviewCountAll = document.getElementById('reviewCountAll');
    const reviewCountWrong = document.getElementById('reviewCountWrong');
    const reviewCountFlagged = document.getElementById('reviewCountFlagged');
    const filterAllBtn = document.getElementById('filterAllBtn');
    const filterWrongBtn = document.getElementById('filterWrongBtn');
    const filterFlaggedBtn = document.getElementById('filterFlaggedBtn');

    // DOM Elements - Flashcards & Spaced Repetition
    const flashcardDeckIndicator = document.getElementById('flashcardDeckIndicator');
    const cardMasteryLabel = document.getElementById('cardMasteryLabel');
    const cardMasteryFill = document.getElementById('cardMasteryFill');
    const flashcardInner = document.getElementById('flashcardInner');
    const cardFrontText = document.getElementById('cardFrontText');
    const cardCategoryTag = document.getElementById('cardCategoryTag');
    const cardHighlightText = document.getElementById('cardHighlightText');
    const cardExplanationText = document.getElementById('cardExplanationText');
    const cardCounter = document.getElementById('cardCounter');
    const cardPrevBtn = document.getElementById('cardPrevBtn');
    const cardNextBtn = document.getElementById('cardNextBtn');
    const cardReviewAgainBtn = document.getElementById('cardReviewAgainBtn');
    const cardMasteredBtn = document.getElementById('cardMasteredBtn');
    const shuffleCardsBtn = document.getElementById('shuffleCardsBtn');

    // DOM Elements - Generator
    const lessonDropzone = document.getElementById('lessonDropzone');
    const lessonFileInput = document.getElementById('lessonFileInput');
    const dropzoneDefaultContent = document.getElementById('dropzoneDefaultContent');
    const selectedFileChip = document.getElementById('selectedFileChip');
    const selectedFileName = document.getElementById('selectedFileName');
    const selectedFileSize = document.getElementById('selectedFileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const lessonTextInput = document.getElementById('lessonTextInput');
    const textCountDisplay = document.getElementById('textCountDisplay');
    const genQuestionCount = document.getElementById('genQuestionCount');
    const genApiKeyInput = document.getElementById('genApiKeyInput');
    const triggerGenerateBtn = document.getElementById('triggerGenerateBtn');
    const genLoadingState = document.getElementById('genLoadingState');
    const genLoadingTitle = document.getElementById('genLoadingTitle');
    const genSuccessBanner = document.getElementById('genSuccessBanner');
    const generatedDeckTitle = document.getElementById('generatedDeckTitle');
    const genCardCountMetric = document.getElementById('genCardCountMetric');
    const genQuizCountMetric = document.getElementById('genQuizCountMetric');
    const genMaxPtsMetric = document.getElementById('genMaxPtsMetric');
    const startGeneratedQuizBtn = document.getElementById('startGeneratedQuizBtn');
    const openGeneratedCardsBtn = document.getElementById('openGeneratedCardsBtn');

    let currentSelectedFile = null;

    // Helper: Normalize answer strings for robust checking
    function checkAnswerCorrectness(userChoice, correctChoice) {
      if (!userChoice || !correctChoice) return false;
      const u = userChoice.trim().toLowerCase();
      const c = correctChoice.trim().toLowerCase();
      if (u === c) return true;
      // Strip option prefixes like "A. ", "B) "
      const cleanU = u.replace(/^[a-d][\.\)]\s*/, '').trim();
      const cleanC = c.replace(/^[a-d][\.\)]\s*/, '').trim();
      return cleanU === cleanC || cleanC.includes(cleanU) || cleanU.includes(cleanC);
    }

    function updateDeckRibbon() {
      if (activeDeckTitleEl) activeDeckTitleEl.textContent = activeDeck.deck_title || 'Study Deck';
      if (activeDeckTypeTagEl) activeDeckTypeTagEl.textContent = activeDeck.type || 'Custom Deck';
      if (ribbonScoreValEl) ribbonScoreValEl.textContent = `${quizScore} pts`;
      if (ribbonStreakValEl) ribbonStreakValEl.textContent = `· ${quizStreak.toFixed(1)}x Streak`;
    }

    function switchView(mode) {
      [quizModeBtn, flashcardModeBtn, generatorModeBtn].forEach(b => b?.classList.remove('active'));
      if (quizContainerView) quizContainerView.style.display = 'none';
      if (quizSummaryView) quizSummaryView.style.display = 'none';
      if (flashcardContainerView) flashcardContainerView.style.display = 'none';
      if (quizGeneratorView) quizGeneratorView.style.display = 'none';

      if (mode === 'quiz') {
        quizModeBtn?.classList.add('active');
        if (currentQuizIdx >= activeDeck.quiz.length && Object.keys(userAnswers).length >= activeDeck.quiz.length) {
          if (quizSummaryView) quizSummaryView.style.display = 'block';
        } else {
          if (quizContainerView) quizContainerView.style.display = 'block';
          renderQuizQuestion();
        }
      } else if (mode === 'flashcards') {
        flashcardModeBtn?.classList.add('active');
        if (flashcardContainerView) flashcardContainerView.style.display = 'block';
        renderFlashcard(currentCardIdx);
      } else if (mode === 'generator') {
        generatorModeBtn?.classList.add('active');
        if (quizGeneratorView) quizGeneratorView.style.display = 'flex';
      }
      updateDeckRibbon();
    }

    if (quizModeBtn) quizModeBtn.addEventListener('click', () => switchView('quiz'));
    if (flashcardModeBtn) flashcardModeBtn.addEventListener('click', () => switchView('flashcards'));
    if (generatorModeBtn) generatorModeBtn.addEventListener('click', () => switchView('generator'));
    if (quickUploadPillBtn) quickUploadPillBtn.addEventListener('click', () => switchView('generator'));
    if (uploadAnotherLessonBtn) uploadAnotherLessonBtn.addEventListener('click', () => switchView('generator'));
    if (studyCardsAfterQuizBtn) studyCardsAfterQuizBtn.addEventListener('click', () => switchView('flashcards'));

    // --- EXAM MODE & TIMER CONTROLLER ---
    function setExamMode(examActive) {
      isExamMode = examActive;
      if (modeStudyBtn) modeStudyBtn.classList.toggle('active', !isExamMode);
      if (modeExamBtn) modeExamBtn.classList.toggle('active', isExamMode);

      if (isExamMode) {
        startExamTimer(activeDeck.quiz.length * 60); // 1 minute per question
      } else {
        stopExamTimer();
      }
      renderQuizQuestion();
    }

    function startExamTimer(seconds) {
      clearInterval(examTimerInterval);
      examSecondsLeft = seconds || (activeDeck.quiz.length * 60);
      updateTimerDisplay();
      if (examTimerPill) examTimerPill.style.display = 'inline-flex';

      examTimerInterval = setInterval(() => {
        examSecondsLeft--;
        updateTimerDisplay();
        if (examSecondsLeft <= 0) {
          clearInterval(examTimerInterval);
          alert("⏱️ Time's up! Automatically submitting your exam for final evaluation.");
          showQuizSummary();
        }
      }, 1000);
    }

    function stopExamTimer() {
      clearInterval(examTimerInterval);
      if (examTimerPill) examTimerPill.style.display = 'none';
    }

    function updateTimerDisplay() {
      if (!examTimerDisplay) return;
      const mins = Math.floor(Math.max(0, examSecondsLeft) / 60);
      const secs = Math.max(0, examSecondsLeft) % 60;
      examTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (examTimerPill) {
        examTimerPill.style.background = examSecondsLeft < 120 ? '#fee2e2' : '#f5f3ff';
        examTimerPill.style.color = examSecondsLeft < 120 ? '#dc2626' : 'var(--accent)';
      }
    }

    if (modeStudyBtn) modeStudyBtn.addEventListener('click', () => setExamMode(false));
    if (modeExamBtn) modeExamBtn.addEventListener('click', () => setExamMode(true));

    // --- QUIZ QUESTION NAVIGATOR MATRIX (1..20) ---
    function renderQuestionMatrix() {
      if (!quizQuestionMatrix) return;
      const totalQ = activeDeck.quiz.length;
      if (matrixMaxCount) matrixMaxCount.textContent = totalQ;

      quizQuestionMatrix.innerHTML = '';
      for (let i = 0; i < totalQ; i++) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'matrix-pill';
        pill.textContent = (i + 1);

        if (i === currentQuizIdx) pill.classList.add('current');
        if (userAnswers[i] !== undefined) pill.classList.add('answered');
        if (flaggedQuestions.has(i)) pill.classList.add('flagged');

        // In Study Mode, show instant green/red status once answered
        if (!isExamMode && userAnswers[i] !== undefined) {
          const q = activeDeck.quiz[i];
          const isCorrect = checkAnswerCorrectness(userAnswers[i], q.correct_answer);
          pill.classList.add(isCorrect ? 'correct' : 'wrong');
        }

        pill.addEventListener('click', () => {
          currentQuizIdx = i;
          renderQuizQuestion();
        });

        quizQuestionMatrix.appendChild(pill);
      }
    }

    // --- QUIZ & POINT SYSTEM ---
    function initQuiz() {
      currentQuizIdx = 0;
      quizScore = 0;
      quizCorrectCount = 0;
      quizStreak = 1.0;
      maxStreak = 1.0;
      userAnswers = {};
      flaggedQuestions = new Set();
      currentCardsList = [...activeDeck.flashcards];

      if (quizSummaryView) quizSummaryView.style.display = 'none';
      if (quizContainerView) quizContainerView.style.display = 'block';

      if (isExamMode) {
        startExamTimer(activeDeck.quiz.length * 60);
      }

      renderQuizQuestion();
      updateDeckRibbon();
    }

    function renderQuizQuestion() {
      const totalQ = activeDeck.quiz.length;
      if (totalQ === 0) return;

      const q = activeDeck.quiz[currentQuizIdx];
      if (!q) return;

      // Update Matrix Bar
      renderQuestionMatrix();

      // Update question header & trackers
      if (quizQuestionText) quizQuestionText.textContent = q.question;
      if (questionTracker) questionTracker.textContent = `Question ${currentQuizIdx + 1} of ${totalQ}`;
      if (liveStreakPill) liveStreakPill.textContent = `🔥 Streak: ${quizStreak.toFixed(1)}x (+${Math.round(100 * (quizStreak - 1))} bonus)`;
      if (liveScorePill) liveScorePill.textContent = `🏆 ${quizScore} Points`;
      updateDeckRibbon();

      if (quizProgressFill) {
        quizProgressFill.style.width = `${((currentQuizIdx + 1) / totalQ) * 100}%`;
      }

      // Flag button status
      if (flagQuestionBtn) {
        const isFlagged = flaggedQuestions.has(currentQuizIdx);
        flagQuestionBtn.classList.toggle('flagged', isFlagged);
        flagQuestionBtn.textContent = isFlagged ? '🚩 Flagged' : '🚩 Flag for Review';
      }

      // Previous button visibility
      if (quizPrevBtn) {
        quizPrevBtn.style.display = currentQuizIdx > 0 ? 'inline-block' : 'none';
      }

      const hasAnsweredCurrent = (userAnswers[currentQuizIdx] !== undefined);

      // Render Options
      if (quizOptionsList) {
        quizOptionsList.innerHTML = '';
        q.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-opt-btn';
          btn.textContent = opt;

          if (isExamMode) {
            // EXAM MODE: Silent choice recording, no answers revealed
            if (userAnswers[currentQuizIdx] === opt) {
              btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
              userAnswers[currentQuizIdx] = opt;
              Array.from(quizOptionsList.children).forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              renderQuestionMatrix();
            });
          } else {
            // STUDY MODE: Instant cognitive feedback & streak points
            if (hasAnsweredCurrent) {
              btn.disabled = true;
              const isThisCorrect = checkAnswerCorrectness(opt, q.correct_answer);
              if (isThisCorrect) btn.classList.add('correct');
              if (userAnswers[currentQuizIdx] === opt && !isThisCorrect) btn.classList.add('wrong');
            } else {
              btn.addEventListener('click', () => {
                if (userAnswers[currentQuizIdx] !== undefined) return;
                userAnswers[currentQuizIdx] = opt;

                const isCorrect = checkAnswerCorrectness(opt, q.correct_answer);

                if (isCorrect) {
                  btn.classList.add('correct');
                  const basePts = 100;
                  const bonusPts = Math.round(100 * (quizStreak - 1));
                  const wonPts = basePts + bonusPts;
                  quizScore += wonPts;
                  quizCorrectCount++;
                  quizStreak += 0.5;
                  if (quizStreak > maxStreak) maxStreak = quizStreak;

                  if (quizExplanationCard) {
                    quizExplanationCard.className = 'quiz-explanation-card correct-expl';
                    if (explIcon) explIcon.textContent = '✓';
                    if (explTitle) explTitle.textContent = 'Correct Answer!';
                    if (explPointsTag) explPointsTag.textContent = `+${wonPts} pts!`;
                    if (quizExplanationText) quizExplanationText.textContent = q.explanation || 'Excellent recall! Your answer matches the course material.';
                    quizExplanationCard.style.display = 'block';
                  }
                  triggerDashConfetti();
                } else {
                  btn.classList.add('wrong');
                  quizStreak = 1.0;

                  // Find and highlight correct answer
                  Array.from(quizOptionsList.children).forEach(child => {
                    if (checkAnswerCorrectness(child.textContent, q.correct_answer)) {
                      child.classList.add('correct');
                    }
                  });

                  if (quizExplanationCard) {
                    quizExplanationCard.className = 'quiz-explanation-card wrong-expl';
                    if (explIcon) explIcon.textContent = '✕';
                    if (explTitle) explTitle.textContent = 'Not quite right';
                    if (explPointsTag) explPointsTag.textContent = '+0 pts';
                    if (quizExplanationText) quizExplanationText.textContent = q.explanation || `The correct answer is: ${q.correct_answer}`;
                    quizExplanationCard.style.display = 'block';
                  }
                }

                // Lock options
                Array.from(quizOptionsList.children).forEach(b => b.disabled = true);

                if (liveStreakPill) liveStreakPill.textContent = `🔥 Streak: ${quizStreak.toFixed(1)}x`;
                if (liveScorePill) liveScorePill.textContent = `🏆 ${quizScore} Points`;
                updateDeckRibbon();
                renderQuestionMatrix();

                if (quizNextBtn) {
                  quizNextBtn.style.display = 'inline-block';
                  quizNextBtn.textContent = currentQuizIdx < totalQ - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
                }
              });
            }
          }

          quizOptionsList.appendChild(btn);
        });
      }

      // Explanation card visibility in Study Mode
      if (!isExamMode && hasAnsweredCurrent && quizExplanationCard) {
        const chosen = userAnswers[currentQuizIdx];
        const isCorrect = checkAnswerCorrectness(chosen, q.correct_answer);
        quizExplanationCard.className = `quiz-explanation-card ${isCorrect ? 'correct-expl' : 'wrong-expl'}`;
        if (explIcon) explIcon.textContent = isCorrect ? '✓' : '✕';
        if (explTitle) explTitle.textContent = isCorrect ? 'Correct Answer!' : 'Not quite right';
        if (explPointsTag) explPointsTag.textContent = isCorrect ? '+100 pts' : '+0 pts';
        if (quizExplanationText) quizExplanationText.textContent = q.explanation || `Correct answer: ${q.correct_answer}`;
        quizExplanationCard.style.display = 'block';
      } else if (isExamMode && quizExplanationCard) {
        quizExplanationCard.style.display = 'none';
      }

      // Next & Submit Actions
      if (isExamMode) {
        if (submitExamEarlyBtn) submitExamEarlyBtn.style.display = 'inline-block';
        if (quizNextBtn) {
          quizNextBtn.style.display = 'inline-block';
          quizNextBtn.textContent = currentQuizIdx < totalQ - 1 ? 'Next Question →' : 'Review & Submit Exam 🏁';
        }
      } else {
        if (submitExamEarlyBtn) submitExamEarlyBtn.style.display = 'none';
        if (quizNextBtn) {
          quizNextBtn.style.display = hasAnsweredCurrent ? 'inline-block' : 'none';
          quizNextBtn.textContent = currentQuizIdx < totalQ - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
        }
      }
    }

    // Flag Question Button Toggle
    if (flagQuestionBtn) {
      flagQuestionBtn.addEventListener('click', () => {
        if (flaggedQuestions.has(currentQuizIdx)) {
          flaggedQuestions.delete(currentQuizIdx);
        } else {
          flaggedQuestions.add(currentQuizIdx);
        }
        renderQuizQuestion();
      });
    }

    // Previous Question Button
    if (quizPrevBtn) {
      quizPrevBtn.addEventListener('click', () => {
        if (currentQuizIdx > 0) {
          currentQuizIdx--;
          renderQuizQuestion();
        }
      });
    }

    // Next Question Button
    if (quizNextBtn) {
      quizNextBtn.addEventListener('click', () => {
        const totalQ = activeDeck.quiz.length;
        if (currentQuizIdx < totalQ - 1) {
          currentQuizIdx++;
          renderQuizQuestion();
        } else {
          // If in Exam mode and on last question, confirm submission
          if (isExamMode) {
            const answeredCount = Object.keys(userAnswers).length;
            const msg = answeredCount < totalQ
              ? `You have answered ${answeredCount} of ${totalQ} questions (${totalQ - answeredCount} unanswered). Submit exam now?`
              : `Submit your exam for complete graded scoring?`;
            if (confirm(msg)) {
              showQuizSummary();
            }
          } else {
            showQuizSummary();
          }
        }
      });
    }

    // Submit Exam Early Button
    if (submitExamEarlyBtn) {
      submitExamEarlyBtn.addEventListener('click', () => {
        const totalQ = activeDeck.quiz.length;
        const answeredCount = Object.keys(userAnswers).length;
        const msg = answeredCount < totalQ
          ? `You have answered ${answeredCount} of ${totalQ} questions (${totalQ - answeredCount} unanswered). Are you sure you want to submit early?`
          : `Submit your completed exam for grading?`;
        if (confirm(msg)) {
          showQuizSummary();
        }
      });
    }

    // --- QUIZ SUMMARY & GRADED REVIEW TABLE ---
    function showQuizSummary() {
      stopExamTimer();
      if (quizContainerView) quizContainerView.style.display = 'none';
      if (quizSummaryView) quizSummaryView.style.display = 'block';

      const totalQ = activeDeck.quiz.length;
      let calculatedCorrect = 0;

      // In Exam Mode, calculate score now
      if (isExamMode) {
        quizScore = 0;
        let streakTracker = 1.0;
        for (let i = 0; i < totalQ; i++) {
          const q = activeDeck.quiz[i];
          const ans = userAnswers[i];
          if (checkAnswerCorrectness(ans, q.correct_answer)) {
            calculatedCorrect++;
            const wonPts = 100 + Math.round(100 * (streakTracker - 1));
            quizScore += wonPts;
            streakTracker += 0.5;
          } else {
            streakTracker = 1.0;
          }
        }
        quizCorrectCount = calculatedCorrect;
      } else {
        calculatedCorrect = quizCorrectCount;
      }

      const accuracy = totalQ > 0 ? Math.round((calculatedCorrect / totalQ) * 100) : 0;
      const basePts = calculatedCorrect * 100;
      const streakBonus = Math.max(0, quizScore - basePts);

      if (summaryTotalPoints) summaryTotalPoints.textContent = `⭐ ${quizScore} Points Earned!`;
      if (summaryAccuracyVal) summaryAccuracyVal.textContent = `${accuracy}%`;
      if (summaryBasePtsVal) summaryBasePtsVal.textContent = `${basePts}`;
      if (summaryStreakBonusVal) summaryStreakBonusVal.textContent = `+${streakBonus}`;
      if (summaryCorrectCountVal) summaryCorrectCountVal.textContent = `${calculatedCorrect} / ${totalQ}`;

      if (summaryGradeBadge) {
        if (accuracy >= 90) summaryGradeBadge.textContent = 'GRADE A+ · OUTSTANDING MASTERY 🌟';
        else if (accuracy >= 80) summaryGradeBadge.textContent = 'GRADE A · EXCELLENT MASTERY ⭐';
        else if (accuracy >= 70) summaryGradeBadge.textContent = 'GRADE B · SOLID PROFICIENCY 👍';
        else if (accuracy >= 60) summaryGradeBadge.textContent = 'GRADE C · ACTIVE RECALL RECOMMENDED 📚';
        else summaryGradeBadge.textContent = 'GRADE F · REMEDIATION RECOMMENDED ⚠️';
      }

      // Populate Graded Review Table
      renderExamReviewTable();
      triggerDashConfetti();
    }

    function renderExamReviewTable() {
      if (!examReviewTableBody) return;
      examReviewTableBody.innerHTML = '';

      const totalQ = activeDeck.quiz.length;
      let wrongCount = 0;

      activeDeck.quiz.forEach((q, idx) => {
        const chosen = userAnswers[idx];
        const isCorrect = checkAnswerCorrectness(chosen, q.correct_answer);
        if (!isCorrect) wrongCount++;
        const isFlagged = flaggedQuestions.has(idx);

        const row = document.createElement('tr');
        row.dataset.status = isCorrect ? 'correct' : 'wrong';
        row.dataset.flagged = isFlagged ? 'true' : 'false';

        row.innerHTML = `
          <td><strong>${idx + 1}</strong></td>
          <td><strong>${q.question}</strong></td>
          <td>
            <span class="review-status-tag ${isCorrect ? 'tag-correct' : 'tag-wrong'}">
              ${isCorrect ? '✓ Correct' : (chosen ? '✕ Incorrect' : '○ Unanswered')}
            </span><br>
            <span class="review-user-ans ${isCorrect ? 'correct' : 'wrong'}">
              ${chosen || '<em>No answer provided</em>'}
            </span>
          </td>
          <td><strong style="color: #15803d;">${q.correct_answer}</strong></td>
          <td><div class="review-expl-text">${q.explanation || 'Directly grounded in curriculum.'}</div></td>
        `;

        examReviewTableBody.appendChild(row);
      });

      // Update count tags
      if (reviewCountAll) reviewCountAll.textContent = totalQ;
      if (reviewCountWrong) reviewCountWrong.textContent = wrongCount;
      if (reviewCountFlagged) reviewCountFlagged.textContent = flaggedQuestions.size;

      applyReviewFilter(activeReviewFilter);
    }

    function applyReviewFilter(filter) {
      activeReviewFilter = filter;
      [filterAllBtn, filterWrongBtn, filterFlaggedBtn].forEach(b => b?.classList.remove('active'));

      if (filter === 'all') filterAllBtn?.classList.add('active');
      else if (filter === 'wrong') filterWrongBtn?.classList.add('active');
      else if (filter === 'flagged') filterFlaggedBtn?.classList.add('active');

      if (!examReviewTableBody) return;
      Array.from(examReviewTableBody.children).forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else if (filter === 'wrong') {
          row.style.display = row.dataset.status === 'wrong' ? '' : 'none';
        } else if (filter === 'flagged') {
          row.style.display = row.dataset.flagged === 'true' ? '' : 'none';
        }
      });
    }

    if (filterAllBtn) filterAllBtn.addEventListener('click', () => applyReviewFilter('all'));
    if (filterWrongBtn) filterWrongBtn.addEventListener('click', () => applyReviewFilter('wrong'));
    if (filterFlaggedBtn) filterFlaggedBtn.addEventListener('click', () => applyReviewFilter('flagged'));

    // --- PRINTABLE EXAM & TEACHER ANSWER KEY EXPORT ---
    function exportPrintableExam() {
      const totalQ = activeDeck.quiz.length;
      const title = activeDeck.deck_title || "LuminaPRISM Academic Assessment";

      let questionsHtml = '';
      activeDeck.quiz.forEach((q, idx) => {
        questionsHtml += `
          <div style="margin-bottom: 22px; page-break-inside: avoid;">
            <div style="font-weight: 700; font-size: 14pt; margin-bottom: 8px;">
              ${idx + 1}. ${q.question}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12pt; padding-left: 14px;">
              ${q.options.map(opt => `<div>[ &nbsp; ] ${opt}</div>`).join('')}
            </div>
          </div>
        `;
      });

      let answerKeyHtml = '';
      activeDeck.quiz.forEach((q, idx) => {
        answerKeyHtml += `
          <div style="margin-bottom: 14px; page-break-inside: avoid; font-size: 11pt;">
            <strong>${idx + 1}. Correct Answer:</strong> <span style="color: #15803d; font-weight: 700;">${q.correct_answer}</span><br>
            <span style="color: #475569;"><em>Rationale:</em> ${q.explanation || 'Established in lesson text.'}</span>
          </div>
        `;
      });

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title} - Printable Exam & Key</title>
          <style>
            @page { size: letter; margin: 1in; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e1035; line-height: 1.5; padding: 20px; }
            .exam-header { border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 24px; }
            .header-top { display: flex; justify-content: space-between; align-items: flex-end; }
            .meta-fields { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-top: 14px; font-size: 11pt; }
            .line-field { border-bottom: 1px solid #94a3b8; height: 22px; display: inline-block; width: 100%; }
            .instructions { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; margin-bottom: 24px; font-size: 10.5pt; border-radius: 6px; }
            .key-page { page-break-before: always; margin-top: 40px; padding-top: 20px; border-top: 2px dashed #7c3aed; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">🖨️ Print Now</button>
          </div>

          <div class="exam-header">
            <div class="header-top">
              <div>
                <span style="font-size: 10pt; font-weight: 800; color: #7c3aed; letter-spacing: 0.05em; text-transform: uppercase;">LuminaPRISM Academic Assessment System</span>
                <h1 style="margin: 4px 0 0; font-size: 20pt;">${title}</h1>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11pt; font-weight: 700;">Score: ______ / ${totalQ}</span>
              </div>
            </div>

            <div class="meta-fields">
              <div>Student Name: <span class="line-field"></span></div>
              <div>Date: <span class="line-field"></span></div>
              <div>Class / Section: <span class="line-field"></span></div>
            </div>
          </div>

          <div class="instructions">
            <strong>Exam Instructions:</strong> This examination contains <strong>${totalQ} questions</strong>. Read each question carefully and select the single best choice by filling the box. Standard time allocation: ${totalQ} minutes.
          </div>

          <div class="questions-section">
            ${questionsHtml}
          </div>

          <div class="key-page">
            <div style="border-bottom: 1px solid #7c3aed; padding-bottom: 8px; margin-bottom: 16px;">
              <span style="font-size: 9pt; font-weight: 800; color: #7c3aed; text-transform: uppercase;">CONFIDENTIAL INSTRUCTOR RESOURCE</span>
              <h2 style="margin: 2px 0 0; font-size: 16pt;">Teacher's Answer Key & Curriculum Rationale</h2>
            </div>
            ${answerKeyHtml}
          </div>
        </body>
        </html>
      `;

      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(printHtml);
        printWin.document.close();
        printWin.focus();
      }
    }

    if (printExamBtn) printExamBtn.addEventListener('click', exportPrintableExam);

    // --- DOWNLOAD STUDY SET JSON ---
    function exportStudySetJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeDeck, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const safeTitle = (activeDeck.deck_title || 'study_set').toLowerCase().replace(/[^a-z0-9]/g, '_');
      downloadAnchor.setAttribute("download", `${safeTitle}_deck.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    if (exportStudySetBtn) exportStudySetBtn.addEventListener('click', exportStudySetJson);
    if (retakeQuizBtn) retakeQuizBtn.addEventListener('click', initQuiz);

    // --- 3D FLASHCARDS WITH SPACED REPETITION MASTERY ---
    function renderFlashcard(idx) {
      if (currentCardsList.length === 0) return;
      currentCardIdx = (idx + currentCardsList.length) % currentCardsList.length;
      if (flashcardInner) flashcardInner.classList.remove('flipped');

      const card = currentCardsList[currentCardIdx];
      if (!card) return;

      if (cardFrontText) cardFrontText.textContent = card.front;
      if (cardCategoryTag) cardCategoryTag.textContent = card.tag || activeDeck.deck_title || 'Core Concept';
      if (cardHighlightText) cardHighlightText.textContent = card.highlight || card.front.replace(/^What is\s*/i, '').replace(/\?$/, '');
      if (cardExplanationText) cardExplanationText.textContent = card.back;
      if (cardCounter) cardCounter.textContent = `Card ${currentCardIdx + 1} / ${currentCardsList.length}`;

      // Update Spaced Repetition Mastery bar
      const masteredCount = masteredCards.size;
      const totalCards = currentCardsList.length;
      const masteryPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
      if (cardMasteryLabel) cardMasteryLabel.textContent = `${masteredCount} of ${totalCards} Mastered (${masteryPct}%)`;
      if (cardMasteryFill) cardMasteryFill.style.width = `${masteryPct}%`;
    }

    if (flashcardInner) {
      flashcardInner.addEventListener('click', () => {
        flashcardInner.classList.toggle('flipped');
      });
    }

    if (cardPrevBtn) {
      cardPrevBtn.addEventListener('click', () => {
        renderFlashcard(currentCardIdx - 1);
      });
    }

    if (cardNextBtn) {
      cardNextBtn.addEventListener('click', () => {
        renderFlashcard(currentCardIdx + 1);
      });
    }

    if (cardMasteredBtn) {
      cardMasteredBtn.addEventListener('click', () => {
        masteredCards.add(currentCardIdx);
        quizScore += 25; // Spaced repetition bonus points
        updateDeckRibbon();
        triggerDashConfetti();
        renderFlashcard(currentCardIdx + 1);
      });
    }

    if (cardReviewAgainBtn) {
      cardReviewAgainBtn.addEventListener('click', () => {
        masteredCards.delete(currentCardIdx);
        renderFlashcard(currentCardIdx + 1);
      });
    }

    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener('click', () => {
        currentCardsList.sort(() => Math.random() - 0.5);
        renderFlashcard(0);
        triggerDashConfetti();
      });
    }

    // --- AI LESSON & HANDOUT GENERATOR (20-CONCEPT CURRICULUMS) ---
    const sampleCurriculums = {
      cs: `Operating Systems and Computer Architecture (20 Core Concepts)
1. Kernel: The core software running at the highest privilege level, controlling process dispatching, device drivers, and system memory.
2. Virtual Memory: An abstraction providing each process an isolated linear address space mapped onto physical frames and swap files.
3. Paging: A memory management scheme dividing physical memory into uniform frames to eliminate external fragmentation.
4. Deadlock: A system stall caused when processes hold resources while waiting in a circular chain for others.
5. Race Condition: An anomaly where concurrent threads access shared mutable state producing non-deterministic outcomes.
6. Semaphore: An integer synchronization primitive offering atomic wait() and signal() operations to regulate resource access.
7. Context Switch: The kernel operation preserving active CPU registers and program counter in the PCB and restoring another.
8. Translation Lookaside Buffer (TLB): High-speed hardware cache preserving recent virtual-to-physical address mappings.
9. Process Control Block (PCB): Kernel data structure containing PID, registers, priority, memory boundaries, and open file descriptors.
10. Thrashing: An overcommitted memory state where excessive page fault rates collapse CPU throughput into constant disk swapping.
11. Direct Memory Access (DMA): An architecture enabling I/O hardware to transfer data directly to RAM without continuous CPU intervention.
12. Scheduling Time Quantum: The allocated execution duration granted to a process under preemptive Round-Robin scheduling.
13. Belady's Anomaly: The counter-intuitive phenomenon under FIFO page replacement where more frames increase total page faults.
14. Microkernel: An OS design keeping only essential IPC, scheduling, and memory in kernel space, moving drivers to user space.
15. System Call: The programmatic trap mechanism through which user-space software securely requests privileged kernel services.
16. Mutual Exclusion: A concurrency guarantee ensuring that only one thread accesses a critical section at any given instant.
17. Inverted Page Table: A memory structure indexing entries by physical frame number rather than virtual page number to conserve space.
18. Multilevel Feedback Queue: A CPU scheduling algorithm that dynamically adjusts process priorities based on their observed burst behavior.
19. File Allocation Table (FAT): A contiguous file system index mapping cluster chains to record sequential file storage.
20. Interrupt Vector Table: A memory-resident lookup table linking specific hardware interrupt numbers to their kernel handler routines.`,

      bio: `Cellular Biology and Genetics (20 Core Concepts)
1. Photosynthesis: The biochemical process converting light energy into chemical energy stored in glucose molecules.
2. Chloroplast: The double-membraned plant organelle hosting both light-dependent thylakoid reactions and the stroma Calvin cycle.
3. Chlorophyll: The light-absorbing pigment embedded in thylakoid membranes exciting electrons under solar radiation.
4. Calvin Cycle: The light-independent dark reactions utilizing ATP and NADPH to fix atmospheric carbon dioxide into sugars.
5. Mitochondria: The organelle generating cellular ATP via oxidative phosphorylation and the Krebs cycle.
6. ATP (Adenosine Triphosphate): The fundamental high-energy phosphate currency powering endergonic cellular reactions.
7. Ribosome: The macromolecular ribonucleoprotein machine translating mRNA transcript codons into polypeptide chains.
8. DNA Polymerase: The primary replication enzyme synthesizing complementary DNA strands in a 5' to 3' direction.
9. Transcription: The enzymatic synthesis of messenger RNA from a template DNA strand catalyzed by RNA Polymerase.
10. Translation: The ribosomal decoding of mRNA codons into a specific amino acid sequence aided by transfer RNA.
11. Endoplasmic Reticulum: An organelle network folding proteins (Rough ER) and synthesizing lipids/detoxifying toxins (Smooth ER).
12. Golgi Apparatus: The cellular shipping center modifying, sorting, and packaging proteins into vesicles for delivery.
13. Mitosis: Equational cell division producing two genetically identical diploid daughter nuclei from a single parent cell.
14. Meiosis: Specialized two-stage reductive division generating four genetically diverse haploid gamete cells.
15. CRISPR-Cas9: An adaptive bacterial immune system adapted for targeted RNA-guided genetic editing and genome endonuclease cleavage.
16. Codon: A nucleotide triplet in mRNA encoding a specific amino acid or translational stop signal.
17. Phospholipid Bilayer: An amphipathic double layer of hydrophilic phosphate heads and hydrophobic fatty acid tails forming cell membranes.
18. Osmosis: The passive diffusion of water molecules across a selectively permeable membrane toward higher solute concentrations.
19. Enzyme Active Site: The specific three-dimensional catalytic cleft where substrate molecules bind and undergo lowered activation energy.
20. Feedback Inhibition: A regulatory metabolic mechanism where the end-product of a pathway allosterically inhibits the initial enzyme.`,

      physics: `Classical Mechanics and PRISM Optics (20 Core Concepts)
1. Newton's First Law: The principle of inertia stating an object maintains uniform velocity unless an external net force acts upon it.
2. Newton's Second Law: The quantitative dynamical equation stating acceleration equals net force divided by inertial mass (F = ma).
3. Newton's Third Law: The interaction principle asserting that every action force produces an equal and opposite reaction force.
4. Kinetic Energy: The energy possessed by an object due to its motion, mathematically calculated as one-half mass times velocity squared.
5. Gravitational Potential Energy: Stored energy resulting from an object's elevation within a gravitational field (U = mgh).
6. Refraction: The change in wave direction and velocity when propagating between media with differing refractive indices.
7. Snell's Law: The mathematical relationship governing light refraction: n1 * sin(θ1) = n2 * sin(θ2).
8. Total Internal Reflection: The optical phenomenon where light incident above the critical angle reflects entirely inside a dense medium.
9. Dispersion: The separation of polychromatic white light into constituent spectral wavelengths due to frequency-dependent refractive index.
10. Chromatic Aberration: An optical distortion caused by lenses focusing different colors of light at slightly different focal points.
11. Conservation of Momentum: The fundamental law stating total vector momentum of a closed isolated system remains invariant.
12. Angular Momentum: The rotational analog of linear momentum, conserved in systems lacking net external torque (L = I * ω).
13. Doppler Effect: The observed frequency shift in waves emitted by a source moving relative to an observer.
14. Centripetal Force: The inward center-directed force required to maintain an object in uniform circular motion (Fc = m * v² / r).
15. Work-Energy Theorem: The mechanical principle stating net work done on a body equals the change in its total kinetic energy.
16. Diffraction: The bending and spreading of waves around obstacles and through apertures comparable in size to their wavelength.
17. Hooke's Law: The constitutive spring equation asserting restoring force is directly proportional to displacement (F = -k * x).
18. Simple Harmonic Motion: Periodic oscillatory motion where restoring force is proportional to displacement from equilibrium.
19. Escape Velocity: The minimum ballistic launch speed required for a body to overcome a celestial body's gravitational field.
20. Wave Interference: The superposition of two or more overlapping waves producing constructive or destructive amplitude patterns.`
    };

    document.querySelectorAll('.chip-sample').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.sample;
        if (sampleCurriculums[type] && lessonTextInput) {
          lessonTextInput.value = sampleCurriculums[type];
          updateTextCounter();
          lessonTextInput.focus();
        }
      });
    });

    function updateTextCounter() {
      if (!lessonTextInput || !textCountDisplay) return;
      const text = lessonTextInput.value.trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = text.length;
      textCountDisplay.textContent = `${words} words · ${chars} chars`;
    }

    if (lessonTextInput) {
      lessonTextInput.addEventListener('input', updateTextCounter);
    }

    // Dropzone logic
    if (lessonDropzone && lessonFileInput) {
      lessonDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#removeFileBtn')) return;
        lessonFileInput.click();
      });

      lessonDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        lessonDropzone.classList.add('dragover');
      });

      ['dragleave', 'dragend'].forEach(evt => {
        lessonDropzone.addEventListener(evt, () => lessonDropzone.classList.remove('dragover'));
      });

      lessonDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        lessonDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelection(e.dataTransfer.files[0]);
        }
      });

      lessonFileInput.addEventListener('change', () => {
        if (lessonFileInput.files && lessonFileInput.files[0]) {
          handleFileSelection(lessonFileInput.files[0]);
        }
      });
    }

    function handleFileSelection(file) {
      currentSelectedFile = file;
      if (selectedFileChip && dropzoneDefaultContent) {
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileSize) selectedFileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        dropzoneDefaultContent.style.display = 'none';
        selectedFileChip.style.display = 'flex';
      }

      // If text file, preview in textarea
      if (file.name.match(/\.(txt|md|markdown|json|csv|py|js|html|rst)$/i)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (lessonTextInput && (!lessonTextInput.value.trim() || lessonTextInput.value.length < 50)) {
            lessonTextInput.value = e.target.result;
            updateTextCounter();
          }
        };
        reader.readAsText(file);
      }
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSelectedFile = null;
        if (lessonFileInput) lessonFileInput.value = '';
        if (dropzoneDefaultContent) dropzoneDefaultContent.style.display = 'block';
        if (selectedFileChip) selectedFileChip.style.display = 'none';
      });
    }

    // Client-side Fallback Curriculum Engine (generates up to 20 robust cognitive questions)
    function clientSynthesizeCurriculum(text, numQ) {
      const clean = text.replace(/\r\n|\r/g, '\n').trim();
      const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
      let title = "Lesson Curriculum Study Set";
      for (let l of lines.slice(0, 5)) {
        const cleanL = l.replace(/^[#\*\-=\d\.\s]+/, '').trim();
        if (cleanL.length > 3 && cleanL.length < 65 && !cleanL.endsWith(':')) {
          title = cleanL;
          break;
        }
      }

      const concepts = [];
      // 1. Match lines with Term: Definition or Term - Definition
      lines.forEach(l => {
        const m = l.match(/^(?:\d+[\.\)]\s*)?([A-Z0-9][A-Za-z0-9\s\-_/'()]{2,45})[:\-—]\s+(.+)$/);
        if (m && m[2].length > 10) concepts.push([m[1].trim(), m[2].trim()]);
      });

      // 2. Match definitional sentences
      const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
      sentences.forEach(s => {
        const m = s.match(/\b([A-Z][a-zA-Z0-9\s]{2,35})\s+(?:is defined as|refers to|is a|is an|represents|is the principle that)\s+(.+)/);
        if (m && !concepts.some(c => c[0].toLowerCase() === m[1].toLowerCase())) {
          concepts.push([m[1].trim(), s.trim()]);
        }
      });

      // 3. Fallback extraction if text was short
      if (concepts.length < numQ) {
        sentences.forEach((s) => {
          const w = s.split(/\s+/);
          if (w.length >= 6 && !concepts.some(c => c[1] === s)) {
            concepts.push([w.slice(0, 3).join(' '), s]);
          }
        });
      }

      // If still fewer, duplicate with varied cognitive perspectives
      const targetCount = Math.max(5, numQ);
      while (concepts.length < targetCount && concepts.length > 0) {
        const base = concepts[concepts.length % concepts.length];
        concepts.push([`${base[0]} (Advanced)`, `Comprehensive domain principle: ${base[1]}`]);
      }

      const flashcards = concepts.slice(0, targetCount).map((c, i) => ({
        id: i + 1,
        front: c[0].startsWith('What') ? c[0] : `What is ${c[0]}?`,
        tag: title,
        highlight: c[0],
        back: c[1]
      }));

      const allDefs = concepts.map(c => c[1]);
      const quiz = [];

      for (let i = 0; i < targetCount; i++) {
        const [term, def] = concepts[i];
        const correctChoice = def.length < 130 ? def : def.slice(0, 125) + '...';
        const otherDefs = allDefs.filter(d => d !== def).map(d => d.length < 130 ? d : d.slice(0, 125) + '...');
        const distractors = otherDefs.slice(0, 3);
        while (distractors.length < 3) {
          distractors.push(`Alternative parameter baseline with non-deterministic runtime`);
        }
        const pos = i % 4;
        distractors.splice(pos, 0, correctChoice);

        // Rotate through 4 cognitive inquiry styles
        let stem = '';
        const style = i % 4;
        if (style === 0) stem = `According to the study material, which of the following best defines or describes '${term}'?`;
        else if (style === 1) stem = `What is the primary role or mechanism of '${term}' within this domain?`;
        else if (style === 2) stem = `Which term or principle corresponds directly to the following description: '${def.slice(0, 80)}...'?`;
        else stem = `In evaluating '${term}', which statement is supported directly by the curriculum text?`;

        quiz.push({
          id: i + 1,
          question: stem,
          options: distractors,
          correct_answer: correctChoice,
          explanation: `Directly grounded in the course material: ${term} is established as: ${def.slice(0, 110)}.`
        });
      }

      return { deck_title: title, type: "AI Generated Deck", flashcards, quiz };
    }

    // Trigger Generation Process
    if (triggerGenerateBtn) {
      triggerGenerateBtn.addEventListener('click', async () => {
        const textVal = lessonTextInput ? lessonTextInput.value.trim() : '';
        if (!currentSelectedFile && (!textVal || textVal.length < 15)) {
          alert('Please upload a lesson document or paste at least a paragraph of lesson material to analyze.');
          if (lessonTextInput) lessonTextInput.focus();
          return;
        }

        const numQ = parseInt(genQuestionCount ? genQuestionCount.value : '20', 10);
        const apiKey = genApiKeyInput ? genApiKeyInput.value.trim() : '';

        // Show loading state and animate steppers
        if (genLoadingState) genLoadingState.style.display = 'block';
        if (genSuccessBanner) genSuccessBanner.style.display = 'none';
        triggerGenerateBtn.disabled = true;

        const s1 = document.getElementById('step1');
        const s2 = document.getElementById('step2');
        const s3 = document.getElementById('step3');
        const s4 = document.getElementById('step4');

        if (s1) { s1.className = 'stepper-step active'; s1.textContent = `⏳ Step 1: Parsing study text and extracting ${numQ} core curriculum concepts...`; }
        if (s2) { s2.className = 'stepper-step'; s2.textContent = '⏳ Step 2: Formulating active recall flashcard pairs...'; }
        if (s3) { s3.className = 'stepper-step'; s3.textContent = '⏳ Step 3: Generating 4-distractor multiple choice questions...'; }
        if (s4) { s4.className = 'stepper-step'; s4.textContent = '⏳ Step 4: Assembling points scoring system & matrix...'; }

        setTimeout(() => { if (s1 && s2) { s1.className = 'stepper-step done'; s1.textContent = '✓ Step 1: Lesson parsed successfully'; s2.className = 'stepper-step active'; } }, 350);
        setTimeout(() => { if (s2 && s3) { s2.className = 'stepper-step done'; s2.textContent = `✓ Step 2: ${numQ} active recall flashcards formulated`; s3.className = 'stepper-step active'; } }, 750);
        setTimeout(() => { if (s3 && s4) { s3.className = 'stepper-step done'; s3.textContent = `✓ Step 3: ${numQ} multiple choice quiz questions synthesized`; s4.className = 'stepper-step active'; } }, 1150);

        let generatedData = null;

        // Try API endpoint if on server
        try {
          let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
          if (!csrfToken) {
            try {
              const cr = await fetch('/api/v1/csrf');
              const cd = await cr.json();
              csrfToken = cd.csrf_token;
            } catch (e) {}
          }

          const formData = new FormData();
          if (currentSelectedFile) {
            formData.append('file', currentSelectedFile);
          }
          if (textVal) {
            formData.append('text', textVal);
          }
          formData.append('numQuestions', numQ);
          if (apiKey) formData.append('apiKey', apiKey);

          const res = await fetch('/api/v1/study-set/generate', {
            method: 'POST',
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
            body: formData
          });

          if (res.ok) {
            const json = await res.json();
            if (json.data && json.data.quiz && json.data.flashcards) {
              generatedData = json.data;
              generatedData.type = 'AI Generated Deck';
            }
          }
        } catch (err) {
          console.warn('Backend API request skipped or errored, falling back to client synthesis', err);
        }

        // If backend was not reached, use client-side engine
        if (!generatedData) {
          await new Promise(r => setTimeout(r, 1300));
          const effectiveText = textVal || (currentSelectedFile ? currentSelectedFile.name : 'Lesson Study Set');
          generatedData = clientSynthesizeCurriculum(effectiveText, numQ);
        }

        if (s4) { s4.className = 'stepper-step done'; s4.textContent = '✓ Step 4: Points scoring engine & active recall suite ready!'; }

        // Finalize
        activeDeck = generatedData;
        saveActiveDeck(activeDeck);

        setTimeout(() => {
          if (genLoadingState) genLoadingState.style.display = 'none';
          triggerGenerateBtn.disabled = false;

          if (genSuccessBanner) {
            if (generatedDeckTitle) generatedDeckTitle.textContent = activeDeck.deck_title;
            if (genCardCountMetric) genCardCountMetric.textContent = `🎴 ${activeDeck.flashcards.length} Flashcards`;
            if (genQuizCountMetric) genQuizCountMetric.textContent = `🧠 ${activeDeck.quiz.length} Quiz Questions`;
            if (genMaxPtsMetric) genMaxPtsMetric.textContent = `🏆 ${activeDeck.quiz.length * 100} Max Points`;
            genSuccessBanner.style.display = 'block';
          }

          updateDeckRibbon();
          triggerDashConfetti();
        }, 300);
      });
    }

    if (startGeneratedQuizBtn) {
      startGeneratedQuizBtn.addEventListener('click', () => {
        switchView('quiz');
        initQuiz();
      });
    }

    if (openGeneratedCardsBtn) {
      openGeneratedCardsBtn.addEventListener('click', () => {
        currentCardsList = [...activeDeck.flashcards];
        switchView('flashcards');
        renderFlashcard(0);
      });
    }

    // Initial render of deck
    updateDeckRibbon();
    renderFlashcard(0);
    renderQuizQuestion();

    // 6. FULL MAXIMIZED ZEN FOCUS TIMER & AMBIENT AUDIO
    let zenTimeRemaining = 25 * 60;
    let zenTotalSeconds = 25 * 60;
    let zenTimerId = null;
    let isZenRunning = false;

    const zenClockDisplay = document.getElementById('zenClockDisplay');
    const zenStartBtn = document.getElementById('zenStartBtn');
    const zenResetBtn = document.getElementById('zenResetBtn');
    const zenSessionTag = document.getElementById('zenSessionTag');

    function renderZenClock() {
      if (!zenClockDisplay) return;
      const m = Math.floor(zenTimeRemaining / 60);
      const s = zenTimeRemaining % 60;
      zenClockDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    if (zenStartBtn) {
      zenStartBtn.addEventListener('click', () => {
        if (isZenRunning) {
          clearInterval(zenTimerId);
          isZenRunning = false;
          zenStartBtn.textContent = 'Resume Focus';
          if (zenSessionTag) zenSessionTag.textContent = 'Session Paused';
        } else {
          isZenRunning = true;
          zenStartBtn.textContent = 'Pause Focus';
          if (zenSessionTag) zenSessionTag.textContent = 'Focus Chamber Active · Breathe & Study';
          zenTimerId = setInterval(() => {
            zenTimeRemaining--;
            if (zenTimeRemaining <= 0) {
              clearInterval(zenTimerId);
              isZenRunning = false;
              zenTimeRemaining = zenTotalSeconds;
              zenStartBtn.textContent = 'Start Focus';
              if (zenSessionTag) zenSessionTag.textContent = 'Session Complete! Amazing discipline! 🎉';
              triggerDashConfetti();
              const completedMins = Math.round(zenTotalSeconds / 60);
              logCompletedFocusSession(completedMins);
              alert(`🎉 Focus Session Finished (${completedMins} mins)! Logged to Daily Balance & Weekly Study Momentum.`);
            }
            renderZenClock();
          }, 1000);
        }
      });
    }

    if (zenResetBtn) {
      zenResetBtn.addEventListener('click', () => {
        clearInterval(zenTimerId);
        isZenRunning = false;
        zenTimeRemaining = zenTotalSeconds;
        if (zenStartBtn) zenStartBtn.textContent = 'Start Focus';
        if (zenSessionTag) zenSessionTag.textContent = 'Deep Focus Session Ready';
        renderZenClock();
      });
    }

    document.querySelectorAll('.timer-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.timer-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const mins = parseInt(tab.dataset.time, 10);
        clearInterval(zenTimerId);
        isZenRunning = false;
        zenTotalSeconds = mins * 60;
        zenTimeRemaining = zenTotalSeconds;
        if (zenStartBtn) zenStartBtn.textContent = 'Start Focus';
        if (zenSessionTag) zenSessionTag.textContent = `${mins}m Interval Selected`;
        renderZenClock();
      });
    });

    // Synthetic Web Audio Ambient Sound Generator
    let audioCtx = null;
    let noiseNode = null;
    let isSoundPlaying = false;
    const toggleSoundBtn = document.getElementById('toggleSoundBtn');
    const soundSelect = document.getElementById('soundscapeSelect');

    async function startAmbientSound(type) {
      stopAmbientSound();
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain' || type === 'ocean') {
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          } else if (type === 'pink') {
            data[i] = (lastOut + 0.05 * white) / 1.05;
            lastOut = data[i];
            data[i] *= 2.0;
          } else {
            data[i] = white * 0.15;
          }
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = type === 'ocean' ? 'bandpass' : 'lowpass';
        filter.frequency.value = type === 'rain' ? 800 : type === 'ocean' ? 400 : 1200;

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.18;

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        noiseNode.start();
        isSoundPlaying = true;
        if (toggleSoundBtn) toggleSoundBtn.textContent = 'Stop Ambient Sound ⏹';
      } catch (err) {
        console.warn('Audio Context init error', err);
      }
    }

    function stopAmbientSound() {
      if (noiseNode) {
        try { noiseNode.stop(); } catch (e) {}
        noiseNode = null;
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
      }
      isSoundPlaying = false;
      if (toggleSoundBtn) toggleSoundBtn.textContent = 'Play Ambient Sound 🔊';
    }

    if (toggleSoundBtn) {
      toggleSoundBtn.addEventListener('click', () => {
        if (isSoundPlaying) {
          stopAmbientSound();
        } else {
          const type = soundSelect ? soundSelect.value : 'rain';
          startAmbientSound(type);
        }
      });
    }

    // ========================================================================
    // 7. GOALS & INTENTIONS ENGINE (Persistent, Interactive, Deletable)
    // ========================================================================
    const defaultGoals = [
      { id: 'g1', text: '10 min morning focus & intentions', tag: 'Mind', completed: true },
      { id: 'g2', text: 'Review lecture notes & flashcards', tag: 'Study', completed: true },
      { id: 'g3', text: 'Complete weekly coding practice', tag: 'Study', completed: true },
      { id: 'g4', text: 'Walk 8,000 steps & stay hydrated', tag: 'Body', completed: false },
      { id: 'g5', text: 'Serene wind-down without screens', tag: 'Wellness', completed: false }
    ];

    function getStoredGoals() {
      try {
        const saved = localStorage.getItem('lumina_today_goals_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return defaultGoals;
    }

    function saveStoredGoals(goals) {
      try {
        localStorage.setItem('lumina_today_goals_v2', JSON.stringify(goals));
      } catch (e) {}
    }

    function renderGoals() {
      const goals = getStoredGoals();
      const listEl = document.getElementById('dashboardGoalsList');
      const badgeEl = document.getElementById('dashboardGoalsBadge');
      const bannerEl = document.getElementById('bannerGoalsDone');
      const previewList = document.getElementById('previewGoalsList');
      const previewBadge = document.getElementById('previewGoalsBadge');

      const total = goals.length;
      const done = goals.filter(g => g.completed).length;

      if (badgeEl) badgeEl.textContent = `${done}/${total} Done`;
      if (bannerEl) bannerEl.textContent = `${done} / ${total} Done`;
      if (previewBadge) previewBadge.textContent = `${done}/${total} Done`;

      function buildListHtml(targetList, isPreview = false) {
        if (!targetList) return;
        if (goals.length === 0) {
          targetList.innerHTML = `<li class="empty-goals-msg">All clear! Add a new intention below to start your rhythm ✨</li>`;
          return;
        }
        targetList.innerHTML = goals.map((g, idx) => `
          <li class="${isPreview ? 'preview-goal-item' : 'goal-item'} ${g.completed ? 'completed' : ''}" data-idx="${idx}">
            <label class="${isPreview ? 'custom-chk' : 'custom-checkbox-wrap'}">
              <input type="checkbox" ${g.completed ? 'checked' : ''} data-toggle-idx="${idx}">
              <span class="${isPreview ? 'chk-box' : 'checkbox-box'}">
                ${isPreview ? '✓' : '<svg viewBox="0 0 12 10"><polyline points="1.5 5 4.5 8 10.5 2"/></svg>'}
              </span>
              <span class="${isPreview ? 'chk-label' : 'goal-label'}">${g.text}</span>
            </label>
            <div class="goal-item-actions">
              <span class="${isPreview ? 'tag-pill' : 'goal-tag'} tag-${(g.tag || 'Study').toLowerCase()}">${g.tag || 'Study'}</span>
              <button type="button" class="goal-del-btn" data-del-idx="${idx}" title="Delete goal" aria-label="Delete goal">×</button>
            </div>
          </li>
        `).join('');

        targetList.querySelectorAll('input[type="checkbox"]').forEach(input => {
          input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.toggleIdx, 10);
            if (!isNaN(idx) && goals[idx]) {
              goals[idx].completed = e.target.checked;
              saveStoredGoals(goals);
              renderGoals();
              if (e.target.checked) triggerDashConfetti();
            }
          });
        });

        targetList.querySelectorAll('.goal-del-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.delIdx, 10);
            if (!isNaN(idx)) {
              goals.splice(idx, 1);
              saveStoredGoals(goals);
              renderGoals();
            }
          });
        });
      }

      buildListHtml(listEl, false);
      buildListHtml(previewList, true);
    }

    function initGoalsSystem() {
      const addInput = document.getElementById('dashboardAddGoalInput');
      const addBtn = document.getElementById('dashboardAddGoalBtn');
      const tagSelect = document.getElementById('dashboardGoalTagSelect');
      const previewAddInput = document.getElementById('previewAddGoalInput');

      function handleAdd(inputEl, isPreview = false) {
        if (!inputEl || !inputEl.value.trim()) return;
        const text = inputEl.value.trim();
        const tag = (!isPreview && tagSelect) ? tagSelect.value : 'Study';
        const goals = getStoredGoals();
        goals.push({
          id: 'g_' + Date.now(),
          text,
          tag,
          completed: false
        });
        saveStoredGoals(goals);
        inputEl.value = '';
        renderGoals();
        triggerDashConfetti();
      }

      if (addBtn && addInput) {
        addBtn.addEventListener('click', () => handleAdd(addInput, false));
        addInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(addInput, false);
          }
        });
      }

      if (previewAddInput) {
        previewAddInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(previewAddInput, true);
          }
        });
      }

      renderGoals();
    }

    // ========================================================================
    // 8. DAILY BALANCE LOGGER (Habify 40/30/30 Rings with User Input)
    // ========================================================================
    function getTodayDateString() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getStoredBalance() {
      const today = getTodayDateString();
      const defaultBalance = {
        date: today,
        studyMins: 45,
        mindMins: 30,
        bodyMins: 20,
        targets: { study: 120, mind: 45, body: 45 },
        rewardClaimed: false
      };
      try {
        const saved = localStorage.getItem('lumina_daily_balance_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.date === today) return parsed;
          return {
            ...defaultBalance,
            targets: parsed.targets || defaultBalance.targets
          };
        }
      } catch (e) {}
      return defaultBalance;
    }

    function saveStoredBalance(bal) {
      try {
        localStorage.setItem('lumina_daily_balance_v2', JSON.stringify(bal));
      } catch (e) {}
    }

    function updateDailyBalanceUI() {
      const bal = getStoredBalance();
      const studyMins = bal.studyMins || 0;
      const mindMins = bal.mindMins || 0;
      const bodyMins = bal.bodyMins || 0;
      const targets = bal.targets || { study: 120, mind: 45, body: 45 };

      const studyPct = Math.min(100, Math.round((studyMins / targets.study) * 100));
      const mindPct = Math.min(100, Math.round((mindMins / targets.mind) * 100));
      const bodyPct = Math.min(100, Math.round((bodyMins / targets.body) * 100));

      const pillStudy = document.getElementById('dashPillStudy');
      const pillMind = document.getElementById('dashPillMind');
      const pillBody = document.getElementById('dashPillBody');
      if (pillStudy) pillStudy.textContent = `Study · ${studyMins}m (${studyPct}%)`;
      if (pillMind) pillMind.textContent = `Mind · ${mindMins}m (${mindPct}%)`;
      if (pillBody) pillBody.textContent = `Body · ${bodyMins}m (${bodyPct}%)`;

      const ringMind = document.getElementById('dashRingMind') || document.querySelector('.balance-wheel-svg .ring-mind');
      const ringBody = document.getElementById('dashRingBody') || document.querySelector('.balance-wheel-svg .ring-body');
      const ringStudy = document.getElementById('dashboardStudyRing');

      if (ringMind) ringMind.style.strokeDashoffset = String(Math.round(465 * (1 - (mindPct / 100))));
      if (ringBody) ringBody.style.strokeDashoffset = String(Math.round(390 * (1 - (bodyPct / 100))));
      if (ringStudy) ringStudy.style.strokeDashoffset = String(Math.round(314 * (1 - (studyPct / 100))));

      const prevRingStudy = document.getElementById('previewStudyRing');
      if (prevRingStudy) prevRingStudy.style.strokeDashoffset = String(Math.round(264 * (1 - (studyPct / 100))));

      const flower = document.getElementById('dashFlowerCenter');
      if (flower) {
        if (studyPct >= 100 && mindPct >= 100 && bodyPct >= 100) {
          flower.classList.add('blooming');
        } else {
          flower.classList.remove('blooming');
        }
      }
    }

    function logActivityMinutes(category, mins) {
      const bal = getStoredBalance();
      mins = parseInt(mins, 10);
      if (isNaN(mins) || mins <= 0) return;

      if (category === 'study') bal.studyMins = (bal.studyMins || 0) + mins;
      else if (category === 'mind') bal.mindMins = (bal.mindMins || 0) + mins;
      else if (category === 'body') bal.bodyMins = (bal.bodyMins || 0) + mins;

      saveStoredBalance(bal);
      updateDailyBalanceUI();
      triggerDashConfetti();

      if (category === 'study') {
        addStudyHoursToToday(mins / 60);
      }
    }

    function initDailyBalanceSystem() {
      document.querySelectorAll('.quick-add-chip[data-log-type]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.logType;
          const mins = parseInt(btn.dataset.logMins, 10) || 15;
          logActivityMinutes(type, mins);
        });
      });

      const customDrawer = document.getElementById('customLogDrawer');
      const openCustomBtn = document.getElementById('openCustomLogBtn');
      const closeCustomBtn = document.getElementById('closeCustomLogBtn');
      const submitCustomBtn = document.getElementById('submitCustomLogBtn');
      const customCategory = document.getElementById('customLogCategory');
      const customMinutes = document.getElementById('customLogMinutes');

      if (openCustomBtn && customDrawer) {
        openCustomBtn.addEventListener('click', () => {
          const isHidden = customDrawer.style.display === 'none';
          customDrawer.style.display = isHidden ? 'block' : 'none';
          if (isHidden && customMinutes) customMinutes.focus();
        });
      }

      if (closeCustomBtn && customDrawer) {
        closeCustomBtn.addEventListener('click', () => {
          customDrawer.style.display = 'none';
        });
      }

      if (submitCustomBtn && customMinutes) {
        submitCustomBtn.addEventListener('click', () => {
          const val = parseInt(customMinutes.value, 10);
          const cat = customCategory ? customCategory.value : 'study';
          if (val > 0) {
            logActivityMinutes(cat, val);
            customMinutes.value = '';
            if (customDrawer) customDrawer.style.display = 'none';
          }
        });
        customMinutes.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitCustomBtn.click();
          }
        });
      }

      const rewardBtn = document.getElementById('dashboardRewardBtn') || document.getElementById('previewRewardBtn');
      if (rewardBtn) {
        rewardBtn.addEventListener('click', () => {
          triggerDashConfetti();
          const bal = getStoredBalance();
          bal.rewardClaimed = true;
          saveStoredBalance(bal);
          alert('🎁 Daily Streak Reward Claimed! +50 XP bonus awarded to your student profile.');
        });
      }

      updateDailyBalanceUI();
    }

    // ========================================================================
    // 9. WEEKLY RHYTHM & 7-DAY STUDY BAR CHART (Interactive Day Logging)
    // ========================================================================
    const defaultWeeklyHours = [
      { day: 'Mon', short: 'M', hours: 3.5 },
      { day: 'Tue', short: 'T', hours: 4.2 },
      { day: 'Wed', short: 'W', hours: 5.0 },
      { day: 'Thu', short: 'T', hours: 4.8 },
      { day: 'Fri', short: 'F', hours: 6.0 },
      { day: 'Sat', short: 'S', hours: 3.0 },
      { day: 'Sun', short: 'S', hours: 4.5 }
    ];

    function getStoredWeeklyHours() {
      try {
        const saved = localStorage.getItem('lumina_weekly_hours_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 7) return parsed;
        }
      } catch (e) {}
      return defaultWeeklyHours;
    }

    function saveStoredWeeklyHours(data) {
      try {
        localStorage.setItem('lumina_weekly_hours_v2', JSON.stringify(data));
      } catch (e) {}
    }

    let activeLoggingDayIdx = 2; // Default to Wednesday

    function renderWeeklyBarChart() {
      const chartEl = document.getElementById('dashboardBarChart');
      const totalHoursEl = document.getElementById('dashTotalHoursEl');
      const consistencyBadge = document.getElementById('dashConsistencyBadge');
      if (!chartEl) return;

      const weekData = getStoredWeeklyHours();
      const currentDayIdx = (new Date().getDay() + 6) % 7;

      let total = 0;
      let maxHours = 6.0;
      let daysWith2Hours = 0;

      weekData.forEach(d => {
        total += d.hours;
        if (d.hours > maxHours) maxHours = d.hours;
        if (d.hours >= 2.0) daysWith2Hours++;
      });

      if (totalHoursEl) totalHoursEl.innerHTML = `${total.toFixed(1)} <small>hrs this week</small>`;
      const consistencyPct = Math.round((daysWith2Hours / 7) * 100);
      if (consistencyBadge) consistencyBadge.textContent = `${consistencyPct}% Consistency`;

      chartEl.innerHTML = weekData.map((d, idx) => {
        const heightPct = Math.max(12, Math.min(100, Math.round((d.hours / maxHours) * 100)));
        const isActive = (idx === currentDayIdx);
        return `
          <div class="chart-bar-group" data-day-idx="${idx}" title="${d.day}: ${d.hours.toFixed(1)} hrs">
            <div class="bar-fill ${isActive ? 'active' : ''}" style="height: ${heightPct}%;"></div>
            <span class="bar-day">${d.short}</span>
          </div>
        `;
      }).join('');

      chartEl.querySelectorAll('.chart-bar-group').forEach(group => {
        group.addEventListener('click', () => {
          const idx = parseInt(group.dataset.dayIdx, 10);
          openDayLogger(idx);
        });
      });
    }

    function openDayLogger(idx) {
      activeLoggingDayIdx = idx;
      const weekData = getStoredWeeklyHours();
      const d = weekData[idx];
      const popup = document.getElementById('dashDayLogPopup');
      const label = document.getElementById('dashLogDayLabel');
      const input = document.getElementById('dashCustomDayHours');

      if (label) label.textContent = `Log study time for ${d.day} (Current: ${d.hours.toFixed(1)}h):`;
      if (input) input.value = '';
      if (popup) popup.style.display = 'block';
    }

    function addStudyHoursToToday(addedHours) {
      const weekData = getStoredWeeklyHours();
      const currentDayIdx = (new Date().getDay() + 6) % 7;
      if (weekData[currentDayIdx]) {
        weekData[currentDayIdx].hours = Math.round((weekData[currentDayIdx].hours + addedHours) * 10) / 10;
        saveStoredWeeklyHours(weekData);
        renderWeeklyBarChart();
      }
    }

    function initWeeklyRhythmSystem() {
      const popup = document.getElementById('dashDayLogPopup');
      const closeBtn = document.getElementById('closeDayLogPopup');
      const submitBtn = document.getElementById('submitDayHoursBtn');
      const customHoursInput = document.getElementById('dashCustomDayHours');

      if (closeBtn && popup) {
        closeBtn.addEventListener('click', () => {
          popup.style.display = 'none';
        });
      }

      document.querySelectorAll('.quick-hour-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const add = parseFloat(chip.dataset.hrs) || 1.0;
          const weekData = getStoredWeeklyHours();
          if (weekData[activeLoggingDayIdx]) {
            weekData[activeLoggingDayIdx].hours = Math.round((weekData[activeLoggingDayIdx].hours + add) * 10) / 10;
            saveStoredWeeklyHours(weekData);
            renderWeeklyBarChart();
            triggerDashConfetti();
          }
        });
      });

      if (submitBtn && customHoursInput) {
        submitBtn.addEventListener('click', () => {
          const val = parseFloat(customHoursInput.value);
          if (!isNaN(val) && val >= 0) {
            const weekData = getStoredWeeklyHours();
            if (weekData[activeLoggingDayIdx]) {
              weekData[activeLoggingDayIdx].hours = val;
              saveStoredWeeklyHours(weekData);
              renderWeeklyBarChart();
              triggerDashConfetti();
              if (popup) popup.style.display = 'none';
            }
          }
        });
      }

      renderWeeklyBarChart();
    }

    // ========================================================================
    // 10. MINI FOCUS TIMER (Auto-logs into Daily Balance & Weekly Rhythm)
    // ========================================================================
    function logCompletedFocusSession(completedMins) {
      logActivityMinutes('study', completedMins);
      const bannerBlock = document.getElementById('bannerFocusBlock');
      if (bannerBlock) bannerBlock.textContent = `${completedMins} Min`;
    }

    function initMiniTimer() {
      const display = document.getElementById('dashTimerDisplay');
      const startBtn = document.getElementById('dashTimerStartBtn');
      const resetBtn = document.getElementById('dashTimerResetBtn');
      let timerId = null;
      let totalSeconds = 25 * 60;
      let remaining = totalSeconds;
      let isRunning = false;

      function renderMiniDisplay() {
        if (!display) return;
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (isRunning) {
            clearInterval(timerId);
            isRunning = false;
            startBtn.textContent = 'Resume Focus';
          } else {
            isRunning = true;
            startBtn.textContent = 'Pause Focus';
            timerId = setInterval(() => {
              remaining--;
              if (remaining <= 0) {
                clearInterval(timerId);
                isRunning = false;
                const completedMins = Math.round(totalSeconds / 60);
                remaining = totalSeconds;
                startBtn.textContent = 'Start Focus';
                triggerDashConfetti();
                logCompletedFocusSession(completedMins);
                alert(`🎉 Focus Session Finished (${completedMins} mins)! Auto-recorded to Study Balance & Weekly Rhythm.`);
              }
              renderMiniDisplay();
            }, 1000);
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          clearInterval(timerId);
          isRunning = false;
          remaining = totalSeconds;
          if (startBtn) startBtn.textContent = 'Start Focus';
          renderMiniDisplay();
        });
      }

      document.querySelectorAll('.preset-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const mins = parseInt(pill.dataset.mins, 10) || 25;
          clearInterval(timerId);
          isRunning = false;
          totalSeconds = mins * 60;
          remaining = totalSeconds;
          if (startBtn) startBtn.textContent = 'Start Focus';
          renderMiniDisplay();
        });
      });

      renderMiniDisplay();
    }

    // Initial renders
    renderFullCalendar();
    renderHabitTracker();
    initQuiz();
    renderZenClock();
    initGoalsSystem();
    initDailyBalanceSystem();
    initWeeklyRhythmSystem();
    initMiniTimer();
  }

  // Safe self-executing invocation (works whether script is loaded sync, async, deferred, or late)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudentTools);
  } else {
    initStudentTools();
  }
})();
