/**
 * LuminaEdu Student Tools Suite — Production-Grade, Document-Driven Educational SaaS
 * High-Contrast UI, 100% User-Populated Data (Zero Mock Data), Habify 40/30/30 Balance,
 * AI Document Study Lab, Interactive 7-Day Consistency Matrix, and Web Audio API Synthesizer.
 */

(function () {
  'use strict';

  function initStudentTools() {

    /* ==========================================================================
       1. CSRF & API UTILITIES
       ========================================================================== */
    function getCsrfToken() {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : '';
    }

    /* ==========================================================================
       2. MODAL REGISTRY & CONTROLS
       ========================================================================== */
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
      if (name === 'quiz') initStudyLabModal();
      if (name === 'timer') renderZenClock();
    }

    function closeModal(name) {
      const modal = getModal(name);
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (name === 'timer') stopAmbientSound();
    }

    window.openStudentModal = openModal;
    window.closeStudentModal = closeModal;

    // Delegated click listeners for modal triggers
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

    /* ==========================================================================
       3. CONFETTI CELEBRATION ENGINE
       ========================================================================== */
    function triggerDashConfetti() {
      const canvas = document.getElementById('dashboardConfettiCanvas');
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const colors = ['#6366f1', '#4f46e5', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
      const particles = [];

      for (let i = 0; i < 65; i++) {
        particles.push({
          x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 320,
          y: window.innerHeight * 0.4,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 10 - 4,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.014 + Math.random() * 0.014
        });
      }

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.32;
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

    /* ==========================================================================
       4. ACADEMIC CALENDAR & DEADLINES (ZERO HARDCODED MOCK DATA)
       ========================================================================== */
    let currentCalDate = new Date();
    let selectedCalDateStr = `${currentCalDate.getFullYear()}-${String(currentCalDate.getMonth() + 1).padStart(2, '0')}-${String(currentCalDate.getDate()).padStart(2, '0')}`;

    function getStoredEvents() {
      try {
        const saved = localStorage.getItem('lumina_cal_events_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return []; // Pure user-driven: starts empty!
    }

    function saveStoredEvents(events) {
      try {
        localStorage.setItem('lumina_cal_events_v3', JSON.stringify(events));
      } catch (e) {}
    }

    function renderFullCalendar() {
      const fullMonthDaysGrid = document.getElementById('fullMonthDaysGrid');
      const fullCalMonthTitle = document.getElementById('fullCalMonthTitle');
      const dashCalGrid = document.getElementById('dashCalGrid');
      const dashCalMonthLabel = document.getElementById('dashCalMonthLabel');

      const year = currentCalDate.getFullYear();
      const month = currentCalDate.getMonth();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      if (fullCalMonthTitle) fullCalMonthTitle.textContent = `${monthNames[month]} ${year}`;
      if (dashCalMonthLabel) dashCalMonthLabel.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const events = getStoredEvents();

      // Render Modal Full Grid
      if (fullMonthDaysGrid) {
        fullMonthDaysGrid.innerHTML = '';
        for (let i = 0; i < firstDay; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'cal-day-cell prev-month';
          fullMonthDaysGrid.appendChild(emptyCell);
        }

        for (let d = 1; d <= totalDays; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayCell = document.createElement('div');
          dayCell.className = 'cal-day-cell';
          if (dateStr === selectedCalDateStr) dayCell.classList.add('selected');

          const now = new Date();
          if (d === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            dayCell.classList.add('today');
          }

          const dayNum = document.createElement('span');
          dayNum.className = 'cal-day-number';
          dayNum.textContent = d;
          dayCell.appendChild(dayNum);

          const dayEvents = events.filter(ev => ev.date === dateStr);
          if (dayEvents.length > 0) {
            const dotsWrap = document.createElement('div');
            dotsWrap.className = 'cal-event-dots';
            dayEvents.slice(0, 3).forEach(ev => {
              const dot = document.createElement('span');
              dot.className = `event-dot ${ev.type || 'violet'}`;
              dotsWrap.appendChild(dot);
            });
            dayCell.appendChild(dotsWrap);
          }

          dayCell.addEventListener('click', () => {
            selectedCalDateStr = dateStr;
            renderFullCalendar();
            renderSelectedDaySchedule();
          });

          fullMonthDaysGrid.appendChild(dayCell);
        }
      }

      // Render Mini Calendar Grid on Dashboard
      if (dashCalGrid) {
        dashCalGrid.innerHTML = '';
        const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayHeaders.forEach(dh => {
          const th = document.createElement('div');
          th.className = 'mini-th';
          th.textContent = dh;
          dashCalGrid.appendChild(th);
        });

        for (let i = 0; i < firstDay; i++) {
          const blank = document.createElement('div');
          blank.className = 'mini-cal-cell blank';
          dashCalGrid.appendChild(blank);
        }

        for (let d = 1; d <= totalDays; d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const cell = document.createElement('div');
          cell.className = 'mini-cal-cell';
          cell.textContent = d;

          const now = new Date();
          if (d === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
            cell.classList.add('today');
          }

          const hasEvents = events.some(ev => ev.date === dateStr);
          if (hasEvents) cell.classList.add('has-event');

          cell.addEventListener('click', () => {
            selectedCalDateStr = dateStr;
            openModal('calendar');
          });

          dashCalGrid.appendChild(cell);
        }
      }

      renderSelectedDaySchedule();
      renderDashboardDeadlines();
    }

    function renderSelectedDaySchedule() {
      const dayTimelineList = document.getElementById('dayTimelineList');
      const selectedDateTitle = document.getElementById('selectedDateTitle');
      const selectedDateSub = document.getElementById('selectedDateSub');
      const calDayEmptyNotice = document.getElementById('calDayEmptyNotice');

      if (!dayTimelineList) return;

      if (selectedDateTitle) selectedDateTitle.textContent = `Schedule for ${selectedCalDateStr}`;
      if (selectedDateSub) selectedDateSub.textContent = selectedCalDateStr;

      const events = getStoredEvents().filter(ev => ev.date === selectedCalDateStr);
      dayTimelineList.innerHTML = '';

      if (events.length === 0) {
        if (calDayEmptyNotice) calDayEmptyNotice.style.display = 'block';
        return;
      }

      if (calDayEmptyNotice) calDayEmptyNotice.style.display = 'none';

      events.sort((a, b) => (a.time || '').localeCompare(b.time || '')).forEach((ev, idx) => {
        const item = document.createElement('div');
        item.className = `timeline-item ${ev.type || 'violet'}`;
        item.innerHTML = `
          <div class="timeline-time">${ev.time || '12:00'}</div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <strong>${ev.title}</strong>
            <span class="timeline-type-tag">${(ev.type || 'study').toUpperCase()}</span>
          </div>
          <button type="button" class="mini-del-btn" data-del-event="${idx}">✕</button>
        `;
        dayTimelineList.appendChild(item);
      });

      dayTimelineList.querySelectorAll('[data-del-event]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const allEvents = getStoredEvents();
          const targetIndex = parseInt(e.target.dataset.delEvent, 10);
          const filtered = allEvents.filter(ev => ev.date === selectedCalDateStr);
          const toRemove = filtered[targetIndex];
          const newAll = allEvents.filter(ev => ev !== toRemove);
          saveStoredEvents(newAll);
          renderFullCalendar();
        });
      });
    }

    function renderDashboardDeadlines() {
      const listEl = document.getElementById('dashUpcomingList');
      const emptyEl = document.getElementById('deadlinesEmptyState');
      if (!listEl) return;

      const events = getStoredEvents();
      listEl.innerHTML = '';

      if (events.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';

      events.slice(0, 4).forEach(ev => {
        const row = document.createElement('div');
        row.className = `mini-deadline-row ${ev.type || 'violet'}`;
        row.innerHTML = `
          <span class="deadline-dot ${ev.type || 'violet'}"></span>
          <div class="deadline-info">
            <strong class="deadline-title">${ev.title}</strong>
            <span class="deadline-date">${ev.date} · ${ev.time || 'All Day'}</span>
          </div>
        `;
        listEl.appendChild(row);
      });
    }

    // Calendar navigation listeners
    const prevCalBtn = document.getElementById('fullCalPrevBtn');
    const nextCalBtn = document.getElementById('fullCalNextBtn');
    const todayCalBtn = document.getElementById('fullCalTodayBtn');
    const submitNewEventBtn = document.getElementById('submitNewEventBtn');

    if (prevCalBtn) prevCalBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() - 1);
      renderFullCalendar();
    });

    if (nextCalBtn) nextCalBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      renderFullCalendar();
    });

    if (todayCalBtn) todayCalBtn.addEventListener('click', () => {
      currentCalDate = new Date();
      selectedCalDateStr = `${currentCalDate.getFullYear()}-${String(currentCalDate.getMonth() + 1).padStart(2, '0')}-${String(currentCalDate.getDate()).padStart(2, '0')}`;
      renderFullCalendar();
    });

    if (submitNewEventBtn) {
      submitNewEventBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('newEventTitleInput');
        const typeSelect = document.getElementById('newEventTypeSelect');
        const timeInput = document.getElementById('newEventTimeInput');

        if (!titleInput || !titleInput.value.trim()) return;

        const newEv = {
          title: titleInput.value.trim(),
          type: typeSelect ? typeSelect.value : 'violet',
          time: timeInput ? timeInput.value : '14:00',
          date: selectedCalDateStr
        };

        const all = getStoredEvents();
        all.push(newEv);
        saveStoredEvents(all);

        titleInput.value = '';
        renderFullCalendar();
        triggerDashConfetti();
      });
    }

    /* ==========================================================================
       5. HABIFY WEEKLY HABIT MATRIX (ZERO HARDCODED MOCK HABITS)
       ========================================================================== */
    function getStoredHabits() {
      try {
        const saved = localStorage.getItem('lumina_habits_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return []; // Pure user-driven: starts empty!
    }

    function saveStoredHabits(habits) {
      try {
        localStorage.setItem('lumina_habits_v3', JSON.stringify(habits));
      } catch (e) {}
    }

    function renderHabitTracker() {
      const tbody = document.getElementById('habitMatrixTableBody');
      const emptyState = document.getElementById('habitEmptyState');
      const streakEl = document.getElementById('trackerCurrentStreak');
      const rateEl = document.getElementById('trackerCompletionRate');

      if (!tbody) return;

      const habits = getStoredHabits();
      tbody.innerHTML = '';

      if (habits.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (streakEl) streakEl.textContent = '0 Days';
        if (rateEl) rateEl.textContent = '0%';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      let totalChecks = 0;
      let completedChecks = 0;

      habits.forEach((h, hIdx) => {
        const tr = document.createElement('tr');
        const habitStreak = h.days ? h.days.filter(Boolean).length : 0;
        
        let daysHtml = '';
        (h.days || [false, false, false, false, false, false, false]).forEach((done, dIdx) => {
          totalChecks++;
          if (done) completedChecks++;
          daysHtml += `
            <td class="col-day">
              <button type="button" class="habit-check-pill ${done ? 'checked' : ''}" data-habit="${hIdx}" data-day="${dIdx}">
                ${done ? '✓' : ''}
              </button>
            </td>
          `;
        });

        tr.innerHTML = `
          <td class="col-habit-name">
            <div class="habit-cell-info">
              <strong>${h.name}</strong>
              <span class="habit-tag-pill ${h.category ? h.category.toLowerCase() : 'study'}">${h.category || 'Study'}</span>
            </div>
          </td>
          ${daysHtml}
          <td class="col-streak"><span class="habit-streak-badge">${habitStreak}d</span></td>
          <td class="col-action">
            <button type="button" class="habit-del-btn" data-del-habit="${hIdx}">✕</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      const rate = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
      if (rateEl) rateEl.textContent = `${rate}%`;
      if (streakEl) streakEl.textContent = `${Math.min(completedChecks, 7)} Days`;

      // Toggle habit check listeners
      tbody.querySelectorAll('.habit-check-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const hIdx = parseInt(btn.dataset.habit, 10);
          const dIdx = parseInt(btn.dataset.day, 10);
          const habitsData = getStoredHabits();
          if (habitsData[hIdx]) {
            habitsData[hIdx].days[dIdx] = !habitsData[hIdx].days[dIdx];
            saveStoredHabits(habitsData);
            renderHabitTracker();
          }
        });
      });

      // Delete habit listeners
      tbody.querySelectorAll('[data-del-habit]').forEach(btn => {
        btn.addEventListener('click', () => {
          const hIdx = parseInt(btn.dataset.delHabit, 10);
          const habitsData = getStoredHabits();
          habitsData.splice(hIdx, 1);
          saveStoredHabits(habitsData);
          renderHabitTracker();
        });
      });
    }

    const submitNewHabitBtn = document.getElementById('submitNewHabitBtn');
    if (submitNewHabitBtn) {
      submitNewHabitBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('newHabitNameInput');
        const catSelect = document.getElementById('newHabitCategorySelect');
        if (!nameInput || !nameInput.value.trim()) return;

        const habits = getStoredHabits();
        habits.push({
          id: 'h_' + Date.now(),
          name: nameInput.value.trim(),
          category: catSelect ? catSelect.value : 'Study',
          days: [false, false, false, false, false, false, false]
        });
        saveStoredHabits(habits);
        nameInput.value = '';
        renderHabitTracker();
      });
    }

    /* ==========================================================================
       6. DAILY GOALS / TASKS (ZERO HARDCODED DEMO TASKS)
       ========================================================================== */
    function getStoredGoals() {
      try {
        const saved = localStorage.getItem('lumina_goals_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return []; // Pure user-driven: starts empty!
    }

    function saveStoredGoals(goals) {
      try {
        localStorage.setItem('lumina_goals_v3', JSON.stringify(goals));
      } catch (e) {}
    }

    function renderGoals() {
      const listEl = document.getElementById('dashboardGoalsList');
      const badgeEl = document.getElementById('dashboardGoalsBadge');
      const emptyState = document.getElementById('tasksEmptyState');
      if (!listEl) return;

      const goals = getStoredGoals();
      listEl.innerHTML = '';

      if (goals.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (badgeEl) badgeEl.textContent = '0/0 Done';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      let doneCount = 0;

      goals.forEach((g, idx) => {
        if (g.completed) doneCount++;
        const li = document.createElement('li');
        li.className = `task-checklist-item ${g.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <label class="custom-chk-label">
            <input type="checkbox" ${g.completed ? 'checked' : ''} data-goal-idx="${idx}">
            <span class="chk-box-mark">✓</span>
            <span class="chk-text-content">${g.text}</span>
          </label>
          <div class="task-item-actions">
            <span class="tag-badge ${g.tag ? g.tag.toLowerCase() : 'study'}">${g.tag || 'Study'}</span>
            <button type="button" class="task-del-btn" data-del-goal="${idx}" title="Delete task">✕</button>
          </div>
        `;
        listEl.appendChild(li);
      });

      if (badgeEl) badgeEl.textContent = `${doneCount}/${goals.length} Done`;

      // Checkbox listener
      listEl.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.goalIdx, 10);
          const currentGoals = getStoredGoals();
          if (currentGoals[idx]) {
            currentGoals[idx].completed = e.target.checked;
            saveStoredGoals(currentGoals);
            renderGoals();
            if (e.target.checked) triggerDashConfetti();
          }
        });
      });

      // Delete listener
      listEl.querySelectorAll('[data-del-goal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.delGoal, 10);
          const currentGoals = getStoredGoals();
          currentGoals.splice(idx, 1);
          saveStoredGoals(currentGoals);
          renderGoals();
        });
      });
    }

    const addGoalBtn = document.getElementById('dashboardAddGoalBtn');
    const addGoalInput = document.getElementById('dashboardAddGoalInput');
    const addGoalTag = document.getElementById('dashboardGoalTagSelect');

    if (addGoalBtn && addGoalInput) {
      const handleAddGoal = () => {
        const text = addGoalInput.value.trim();
        if (!text) return;
        const goals = getStoredGoals();
        goals.push({
          id: 'g_' + Date.now(),
          text: text,
          tag: addGoalTag ? addGoalTag.value : 'Study',
          completed: false
        });
        saveStoredGoals(goals);
        addGoalInput.value = '';
        renderGoals();
      };

      addGoalBtn.addEventListener('click', handleAddGoal);
      addGoalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddGoal();
      });
    }

    /* ==========================================================================
       7. HABIFY DAILY BALANCE LOGGER (40/30/30)
       ========================================================================== */
    function getStoredBalance() {
      try {
        const saved = localStorage.getItem('lumina_balance_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return { study: 0, mind: 0, body: 0 }; // Starts at 0m (0%)!
    }

    function saveStoredBalance(b) {
      try {
        localStorage.setItem('lumina_balance_v3', JSON.stringify(b));
      } catch (e) {}
    }

    function renderBalance() {
      const b = getStoredBalance();
      const total = (b.study || 0) + (b.mind || 0) + (b.body || 0);

      const totalMinsEl = document.getElementById('dashTotalMins');
      const emptyNotice = document.getElementById('balanceEmptyNotice');

      if (totalMinsEl) totalMinsEl.textContent = `${total}m`;
      if (emptyNotice) {
        emptyNotice.style.display = total === 0 ? 'block' : 'none';
      }

      const pStudy = total > 0 ? Math.round((b.study / total) * 100) : 0;
      const pMind = total > 0 ? Math.round((b.mind / total) * 100) : 0;
      const pBody = total > 0 ? Math.round((b.body / total) * 100) : 0;

      // Update High-Contrast Pill Badges
      const pillStudy = document.getElementById('dashPillStudy');
      const pillMind = document.getElementById('dashPillMind');
      const pillBody = document.getElementById('dashPillBody');

      if (pillStudy) pillStudy.textContent = `${b.study}m (${pStudy}%)`;
      if (pillMind) pillMind.textContent = `${b.mind}m (${pMind}%)`;
      if (pillBody) pillBody.textContent = `${b.body}m (${pBody}%)`;

      // Update Stacked Bars
      const barStudy = document.getElementById('dashBarStudy');
      const barMind = document.getElementById('dashBarMind');
      const barBody = document.getElementById('dashBarBody');

      if (barStudy) barStudy.style.width = `${Math.min(pStudy * 2.5, 100)}%`;
      if (barMind) barMind.style.width = `${Math.min(pMind * 3.3, 100)}%`;
      if (barBody) barBody.style.width = `${Math.min(pBody * 3.3, 100)}%`;

      // Update Segmented SVG Donut Rings
      const ringStudy = document.getElementById('dashRingStudy');
      const ringMind = document.getElementById('dashRingMind');
      const ringBody = document.getElementById('dashRingBody');

      const circ = 390; // 2 * PI * 62
      if (ringStudy) {
        const sLen = (pStudy / 100) * circ;
        ringStudy.setAttribute('stroke-dasharray', `${sLen} ${circ}`);
      }
      if (ringMind) {
        const mLen = (pMind / 100) * circ;
        const sLen = (pStudy / 100) * circ;
        ringMind.setAttribute('stroke-dasharray', `${mLen} ${circ}`);
        ringMind.setAttribute('stroke-dashoffset', `-${sLen}`);
      }
      if (ringBody) {
        const bLen = (pBody / 100) * circ;
        const smLen = ((pStudy + pMind) / 100) * circ;
        ringBody.setAttribute('stroke-dasharray', `${bLen} ${circ}`);
        ringBody.setAttribute('stroke-dashoffset', `-${smLen}`);
      }
    }

    function logBalanceTime(category, mins) {
      const b = getStoredBalance();
      if (category === 'study') b.study = (b.study || 0) + mins;
      if (category === 'mind') b.mind = (b.mind || 0) + mins;
      if (category === 'body') b.body = (b.body || 0) + mins;
      saveStoredBalance(b);
      renderBalance();

      // If study logged, also log to Weekly Study Hours
      if (category === 'study') {
        logDayStudyHours(mins / 60);
      }
      triggerDashConfetti();
    }

    // Quick log chips listeners
    document.querySelectorAll('[data-log-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.logType;
        const mins = parseInt(btn.dataset.logMins, 10) || 15;
        logBalanceTime(type, mins);
      });
    });

    // Custom Logger Drawer
    const openCustomLogBtn = document.getElementById('openCustomLogBtn');
    const closeCustomLogBtn = document.getElementById('closeCustomLogBtn');
    const customLogDrawer = document.getElementById('customLogDrawer');
    const submitCustomLogBtn = document.getElementById('submitCustomLogBtn');

    if (openCustomLogBtn && customLogDrawer) {
      openCustomLogBtn.addEventListener('click', () => {
        customLogDrawer.style.display = customLogDrawer.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (closeCustomLogBtn && customLogDrawer) {
      closeCustomLogBtn.addEventListener('click', () => {
        customLogDrawer.style.display = 'none';
      });
    }

    if (submitCustomLogBtn) {
      submitCustomLogBtn.addEventListener('click', () => {
        const catSelect = document.getElementById('customLogCategory');
        const numInput = document.getElementById('customLogMinutes');
        if (!numInput || !numInput.value) return;
        const mins = parseInt(numInput.value, 10);
        if (mins > 0) {
          logBalanceTime(catSelect ? catSelect.value : 'study', mins);
          numInput.value = '';
          if (customLogDrawer) customLogDrawer.style.display = 'none';
        }
      });
    }

    /* ==========================================================================
       8. WEEKLY STUDY RHYTHM & 7-DAY BAR CHART
       ========================================================================== */
    function getStoredWeeklyHours() {
      try {
        const saved = localStorage.getItem('lumina_weekly_hrs_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [0, 0, 0, 0, 0, 0, 0]; // Default: starts at 0.0 hrs!
    }

    function saveStoredWeeklyHours(arr) {
      try {
        localStorage.setItem('lumina_weekly_hrs_v3', JSON.stringify(arr));
      } catch (e) {}
    }

    function logDayStudyHours(hrs) {
      const dayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
      const week = getStoredWeeklyHours();
      week[dayIdx] = Math.round((week[dayIdx] + hrs) * 10) / 10;
      saveStoredWeeklyHours(week);
      renderWeeklyBarChart();
    }

    let activeEditDayIndex = (new Date().getDay() + 6) % 7;

    function renderWeeklyBarChart() {
      const chartEl = document.getElementById('dashboardBarChart');
      const totalEl = document.getElementById('dashTotalHoursEl');
      const streakBadge = document.getElementById('dashStreakBadge');
      const consistencyBadge = document.getElementById('dashConsistencyBadge');

      if (!chartEl) return;

      const week = getStoredWeeklyHours();
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const total = week.reduce((a, b) => a + b, 0);

      if (totalEl) totalEl.innerHTML = `${total.toFixed(1)} <small>hrs</small>`;

      // Active streak calculation
      const daysActive = week.filter(h => h > 0).length;
      if (streakBadge) {
        streakBadge.textContent = daysActive > 0 ? `🔥 ${daysActive}-Day Streak` : '🔥 0-Day Streak';
      }
      if (consistencyBadge) {
        consistencyBadge.textContent = daysActive > 0 ? `${Math.round((daysActive / 7) * 100)}% Consistency` : 'Start your streak today!';
      }

      chartEl.innerHTML = '';
      const maxHr = Math.max(4, ...week);

      week.forEach((hrs, idx) => {
        const col = document.createElement('div');
        col.className = 'bar-col-item';
        const heightPct = Math.min(100, Math.round((hrs / maxHr) * 100));

        col.innerHTML = `
          <div class="bar-fill-track">
            <div class="bar-fill-segment ${hrs > 0 ? 'active' : ''}" style="height: ${Math.max(6, heightPct)}%;">
              ${hrs > 0 ? `<span class="bar-val-tip">${hrs}h</span>` : ''}
            </div>
          </div>
          <span class="bar-day-name">${dayLabels[idx]}</span>
        `;

        col.addEventListener('click', () => {
          activeEditDayIndex = idx;
          const popup = document.getElementById('dashDayLogPopup');
          const lbl = document.getElementById('dashLogDayLabel');
          if (popup) {
            popup.style.display = 'block';
            if (lbl) lbl.textContent = `Log study time for ${dayLabels[idx]}:`;
          }
        });

        chartEl.appendChild(col);
      });
    }

    // Day Hours Popup Handlers
    const closeDayLogPopup = document.getElementById('closeDayLogPopup');
    const submitDayHoursBtn = document.getElementById('submitDayHoursBtn');

    if (closeDayLogPopup) {
      closeDayLogPopup.addEventListener('click', () => {
        const popup = document.getElementById('dashDayLogPopup');
        if (popup) popup.style.display = 'none';
      });
    }

    if (submitDayHoursBtn) {
      submitDayHoursBtn.addEventListener('click', () => {
        const input = document.getElementById('dashCustomDayHours');
        const hrs = parseFloat(input ? input.value : 0);
        if (hrs > 0) {
          const week = getStoredWeeklyHours();
          week[activeEditDayIndex] = Math.round((week[activeEditDayIndex] + hrs) * 10) / 10;
          saveStoredWeeklyHours(week);
          renderWeeklyBarChart();
          if (input) input.value = '';
          const popup = document.getElementById('dashDayLogPopup');
          if (popup) popup.style.display = 'none';
          triggerDashConfetti();
        }
      });
    }

    document.querySelectorAll('.quick-hour-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const hrs = parseFloat(btn.dataset.hrs) || 1.0;
        const week = getStoredWeeklyHours();
        week[activeEditDayIndex] = Math.round((week[activeEditDayIndex] + hrs) * 10) / 10;
        saveStoredWeeklyHours(week);
        renderWeeklyBarChart();
        const popup = document.getElementById('dashDayLogPopup');
        if (popup) popup.style.display = 'none';
        triggerDashConfetti();
      });
    });

    /* ==========================================================================
       9. 1-CLICK POMODORO & ZEN FOCUS CHAMBER (WEB AUDIO API SYNTHESIZER)
       ========================================================================== */
    let timerId = null;
    let timerRemaining = 25 * 60;
    let timerRunning = false;

    function renderPomodoroDisplays() {
      const m = Math.floor(timerRemaining / 60);
      const s = timerRemaining % 60;
      const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      const miniDisp = document.getElementById('dashTimerDisplay');
      const zenDisp = document.getElementById('zenClockDisplay');

      if (miniDisp) miniDisp.textContent = str;
      if (zenDisp) zenDisp.textContent = str;
    }

    function startTimerSession() {
      if (timerRunning) {
        clearInterval(timerId);
        timerRunning = false;
        updateTimerButtons(false);
      } else {
        timerRunning = true;
        updateTimerButtons(true);
        timerId = setInterval(() => {
          timerRemaining--;
          if (timerRemaining <= 0) {
            clearInterval(timerId);
            timerRunning = false;
            timerRemaining = 25 * 60;
            updateTimerButtons(false);
            renderPomodoroDisplays();
            triggerDashConfetti();
            logBalanceTime('study', 25);
            alert('🎉 Focus Session Completed! 25 minutes logged to your Study Rhythm.');
          }
          renderPomodoroDisplays();
        }, 1000);
      }
    }

    function resetTimerSession(mins = 25) {
      clearInterval(timerId);
      timerRunning = false;
      timerRemaining = mins * 60;
      updateTimerButtons(false);
      renderPomodoroDisplays();
    }

    function updateTimerButtons(running) {
      const miniBtn = document.getElementById('dashTimerStartBtn');
      const zenBtn = document.getElementById('zenStartBtn');

      if (miniBtn) miniBtn.textContent = running ? 'Pause Focus' : 'Start Focus Session';
      if (zenBtn) zenBtn.textContent = running ? 'Pause Session' : 'Start Focus Session';
    }

    const dashTimerStartBtn = document.getElementById('dashTimerStartBtn');
    const dashTimerResetBtn = document.getElementById('dashTimerResetBtn');
    const zenStartBtn = document.getElementById('zenStartBtn');
    const zenResetBtn = document.getElementById('zenResetBtn');

    if (dashTimerStartBtn) dashTimerStartBtn.addEventListener('click', startTimerSession);
    if (dashTimerResetBtn) dashTimerResetBtn.addEventListener('click', () => resetTimerSession(25));
    if (zenStartBtn) zenStartBtn.addEventListener('click', startTimerSession);
    if (zenResetBtn) zenResetBtn.addEventListener('click', () => resetTimerSession(25));

    document.querySelectorAll('.preset-chip, .interval-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chip, .interval-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const mins = parseInt(chip.dataset.mins, 10) || 25;
        resetTimerSession(mins);
      });
    });

    function renderZenClock() {
      renderPomodoroDisplays();
    }

    // Web Audio API Ambient Synthesizer
    let audioCtx = null;
    let activeSoundSource = null;

    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function stopAmbientSound() {
      if (activeSoundSource) {
        try { activeSoundSource.stop(); } catch (e) {}
        try { activeSoundSource.disconnect(); } catch (e) {}
        activeSoundSource = null;
      }
    }

    function playAmbientSound(type) {
      stopAmbientSound();
      if (type === 'none') return;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'white') {
        // Soft Pink/Rain Noise Synthesizer
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.11;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        whiteNoise.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start(0);
        activeSoundSource = whiteNoise;
      } else if (type === 'binaural') {
        // Binaural 40 Hz Focus Tone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.value = 200;
        osc2.frequency.value = 240;
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        activeSoundSource = {
          stop: () => { osc1.stop(); osc2.stop(); },
          disconnect: () => { osc1.disconnect(); osc2.disconnect(); gain.disconnect(); }
        };
      }
    }

    document.querySelectorAll('.sound-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sound-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playAmbientSound(btn.dataset.sound);
      });
    });

    /* ==========================================================================
       10. ACTIVE STUDY LAB (DOCUMENT-BASED AI WORKFLOW ONLY)
       ========================================================================== */
    let currentQuizDeck = null;
    let activeQuestionIndex = 0;
    let userAnswers = {}; // { qIndex: choiceIndex }
    let flaggedQuestions = new Set();
    let examCountdownId = null;
    let examTimeRemaining = 10 * 60;
    let stagedQuizFile = null;

    function initStudyLabModal() {
      // Check if URL has ?generate_file_id=...
      const urlParams = new URLSearchParams(window.location.search);
      const fileId = urlParams.get('generate_file_id');
      const fileName = urlParams.get('file_name');

      if (fileId) {
        loadQuizFromFileVault(fileId, fileName);
        // Clear param from URL cleanly
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (!currentQuizDeck) {
        showStudyWorkflowStep('upload');
      }
    }

    function showStudyWorkflowStep(step) {
      const stepUpload = document.getElementById('stepUploadConfigureView');
      const stepRunner = document.getElementById('stepQuizRunnerView');
      const stepBreakdown = document.getElementById('stepQuizBreakdownView');
      const resetBtn = document.getElementById('resetLabBtn');

      if (stepUpload) stepUpload.style.display = step === 'upload' ? 'block' : 'none';
      if (stepRunner) stepRunner.style.display = step === 'runner' ? 'block' : 'none';
      if (stepBreakdown) stepBreakdown.style.display = step === 'breakdown' ? 'block' : 'none';
      if (resetBtn) resetBtn.style.display = step !== 'upload' ? 'block' : 'none';
    }

    // Step 1: Upload & Configure Handlers
    const dropzone = document.getElementById('studyDocDropzone');
    const fileInput = document.getElementById('studyDocFileInput');
    const selectedBadge = document.getElementById('selectedFileBadge');
    const selectedNameEl = document.getElementById('selectedFileName');
    const selectedSizeEl = document.getElementById('selectedFileSize');
    const removeFileBtn = document.getElementById('removeSelectedFileBtn');
    const togglePasteBtn = document.getElementById('togglePasteTextBtn');
    const pasteWrapper = document.getElementById('pasteTextWrapper');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (!e.target.closest('#removeSelectedFileBtn')) {
          fileInput.click();
        }
      });

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('drag-over');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
          handleStagedQuizFile(dt.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          handleStagedQuizFile(fileInput.files[0]);
        }
      });
    }

    function handleStagedQuizFile(file) {
      stagedQuizFile = file;
      if (selectedBadge && selectedNameEl && selectedSizeEl) {
        selectedNameEl.textContent = file.name;
        selectedSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KiB`;
        selectedBadge.style.display = 'flex';
      }
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stagedQuizFile = null;
        if (fileInput) fileInput.value = '';
        if (selectedBadge) selectedBadge.style.display = 'none';
      });
    }

    if (togglePasteBtn && pasteWrapper) {
      togglePasteBtn.addEventListener('click', () => {
        const isHidden = pasteWrapper.style.display === 'none';
        pasteWrapper.style.display = isHidden ? 'block' : 'none';
      });
    }

    // Question count and difficulty selection
    let selectedQuestionCount = 5;
    let selectedDifficulty = 'standard';

    document.querySelectorAll('.count-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.count-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedQuestionCount = parseInt(pill.dataset.count, 10) || 5;
      });
    });

    document.querySelectorAll('.diff-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.diff-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedDifficulty = pill.dataset.diff || 'standard';
      });
    });

    // Start Generation Action
    const startGenerateQuizBtn = document.getElementById('startGenerateQuizBtn');
    const asyncCard = document.getElementById('asyncProgressCard');
    const phaseText = document.getElementById('progressPhaseText');
    const phaseSub = document.getElementById('progressPhaseSub');
    const errorBanner = document.getElementById('studyErrorBanner');
    const errorText = document.getElementById('studyErrorText');

    function showStudyError(msg) {
      if (errorBanner && errorText) {
        errorText.textContent = msg;
        errorBanner.style.display = 'flex';
      }
      if (asyncCard) asyncCard.style.display = 'none';
    }

    function clearStudyError() {
      if (errorBanner) errorBanner.style.display = 'none';
    }

    if (startGenerateQuizBtn) {
      startGenerateQuizBtn.addEventListener('click', async () => {
        clearStudyError();
        const textInput = document.getElementById('studyTextInput');
        const textVal = textInput ? textInput.value.trim() : '';

        if (!stagedQuizFile && textVal.length < 10) {
          showStudyError('Please upload a lecture document (PDF, Word, or Markdown) or paste your notes.');
          return;
        }

        if (asyncCard) asyncCard.style.display = 'flex';
        if (phaseText) phaseText.textContent = 'Extracting text from document...';
        if (phaseSub) phaseSub.textContent = 'Parsing key concepts and structuring study units.';

        const formData = new FormData();
        formData.append('numQuestions', selectedQuestionCount);
        formData.append('difficulty', selectedDifficulty);

        if (stagedQuizFile) {
          formData.append('file', stagedQuizFile);
        } else {
          formData.append('text', textVal);
        }

        try {
          setTimeout(() => {
            if (phaseText) phaseText.textContent = 'Synthesizing active recall questions...';
            if (phaseSub) phaseSub.textContent = 'Generating domain-grounded options, explanations, and citations.';
          }, 900);

          const response = await fetch('/api/v1/study-set/generate', {
            method: 'POST',
            headers: {
              'X-CSRFToken': getCsrfToken()
            },
            body: formData
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to generate study quiz.');
          }

          const resJson = await response.json();
          const deck = resJson.data;

          if (!deck || !deck.quiz || deck.quiz.length === 0) {
            throw new Error('No testable questions could be derived. Please check your document text.');
          }

          if (asyncCard) asyncCard.style.display = 'none';

          // Launch Exam Runner with new quiz!
          launchExamRunner(deck);

        } catch (err) {
          showStudyError(err.message || 'An error occurred during AI processing.');
        }
      });
    }

    async function loadQuizFromFileVault(fileId, fileName) {
      openModal('quiz');
      clearStudyError();
      if (asyncCard) asyncCard.style.display = 'flex';
      if (phaseText) phaseText.textContent = `Extracting ${fileName || 'document'}...`;
      if (phaseSub) phaseSub.textContent = 'Synthesizing active recall questions directly from your vault.';

      try {
        const textRes = await fetch(`/files/${fileId}/text`);
        if (!textRes.ok) throw new Error('Could not extract text from the selected file.');
        const textData = await textRes.json();

        const formData = new FormData();
        formData.append('text', textData.text);
        formData.append('numQuestions', '10');
        formData.append('deck_title', textData.filename ? textData.filename.replace(/\.[^/.]+$/, "") : "Vault Document");

        const genRes = await fetch('/api/v1/study-set/generate', {
          method: 'POST',
          headers: { 'X-CSRFToken': getCsrfToken() },
          body: formData
        });

        if (!genRes.ok) throw new Error('Quiz generation failed.');
        const genJson = await genRes.json();

        if (asyncCard) asyncCard.style.display = 'none';
        launchExamRunner(genJson.data);
      } catch (err) {
        showStudyError(err.message || 'Failed to load file for quiz.');
      }
    }

    // Step 2: Exam Runner
    function launchExamRunner(deck) {
      currentQuizDeck = deck;
      activeQuestionIndex = 0;
      userAnswers = {};
      flaggedQuestions.clear();

      examTimeRemaining = (deck.quiz.length * 90); // 1.5 mins per question

      showStudyWorkflowStep('runner');
      startExamTimer();
      renderCurrentQuestion();
    }

    function startExamTimer() {
      clearInterval(examCountdownId);
      examCountdownId = setInterval(() => {
        examTimeRemaining--;
        const m = Math.floor(examTimeRemaining / 60);
        const s = examTimeRemaining % 60;
        const timerEl = document.getElementById('examCountdownTimer');
        if (timerEl) timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (examTimeRemaining <= 0) {
          clearInterval(examCountdownId);
          submitFinalExam();
        }
      }, 1000);
    }

    function renderCurrentQuestion() {
      if (!currentQuizDeck || !currentQuizDeck.quiz) return;
      const qList = currentQuizDeck.quiz;
      const q = qList[activeQuestionIndex];
      if (!q) return;

      const qTracker = document.getElementById('examQuestionTracker');
      const progressFill = document.getElementById('examProgressBarFill');
      const topicTag = document.getElementById('examTopicTag');
      const qText = document.getElementById('examQuestionText');
      const optionsGrid = document.getElementById('examOptionsGrid');
      const prevBtn = document.getElementById('examPrevQBtn');
      const nextBtn = document.getElementById('examNextQBtn');
      const flagBtn = document.getElementById('examFlagBtn');

      if (qTracker) qTracker.textContent = `Question ${activeQuestionIndex + 1} of ${qList.length}`;
      if (progressFill) progressFill.style.width = `${Math.round(((activeQuestionIndex + 1) / qList.length) * 100)}%`;
      if (topicTag) topicTag.textContent = `Topic: ${currentQuizDeck.deck_title || 'Document Material'}`;
      if (qText) qText.textContent = q.question;

      if (flagBtn) {
        flagBtn.classList.toggle('active', flaggedQuestions.has(activeQuestionIndex));
      }

      if (prevBtn) prevBtn.disabled = activeQuestionIndex === 0;
      if (nextBtn) {
        nextBtn.textContent = activeQuestionIndex === qList.length - 1 ? 'Submit Final Exam →' : 'Next Question →';
      }

      // Render Options A, B, C, D
      if (optionsGrid) {
        optionsGrid.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        (q.options || []).forEach((opt, optIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'exam-option-btn';
          if (userAnswers[activeQuestionIndex] === optIdx) {
            btn.classList.add('selected');
          }

          btn.innerHTML = `
            <span class="option-letter-badge">${letters[optIdx]}</span>
            <span class="option-text">${opt}</span>
          `;

          btn.addEventListener('click', () => {
            userAnswers[activeQuestionIndex] = optIdx;
            renderCurrentQuestion();
          });

          optionsGrid.appendChild(btn);
        });
      }
    }

    // Keyboard navigation (A, B, C, D)
    window.addEventListener('keydown', (e) => {
      const runnerView = document.getElementById('stepQuizRunnerView');
      if (!runnerView || runnerView.style.display === 'none') return;

      const key = e.key.toUpperCase();
      const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      if (key in map) {
        userAnswers[activeQuestionIndex] = map[key];
        renderCurrentQuestion();
      }
    });

    const prevQBtn = document.getElementById('examPrevQBtn');
    const nextQBtn = document.getElementById('examNextQBtn');
    const flagQBtn = document.getElementById('examFlagBtn');

    if (prevQBtn) {
      prevQBtn.addEventListener('click', () => {
        if (activeQuestionIndex > 0) {
          activeQuestionIndex--;
          renderCurrentQuestion();
        }
      });
    }

    if (nextQBtn) {
      nextQBtn.addEventListener('click', () => {
        const qList = currentQuizDeck.quiz;
        if (activeQuestionIndex < qList.length - 1) {
          activeQuestionIndex++;
          renderCurrentQuestion();
        } else {
          submitFinalExam();
        }
      });
    }

    if (flagQBtn) {
      flagQBtn.addEventListener('click', () => {
        if (flaggedQuestions.has(activeQuestionIndex)) {
          flaggedQuestions.delete(activeQuestionIndex);
        } else {
          flaggedQuestions.add(activeQuestionIndex);
        }
        renderCurrentQuestion();
      });
    }

    // Step 3: Final Breakdown
    function submitFinalExam() {
      clearInterval(examCountdownId);
      showStudyWorkflowStep('breakdown');
      triggerDashConfetti();

      const qList = currentQuizDeck.quiz;
      let correctCount = 0;

      qList.forEach((q, idx) => {
        const chosen = userAnswers[idx];
        const correctChoice = q.correct_answer;
        if (chosen !== undefined && q.options[chosen] === correctChoice) {
          correctCount++;
        }
      });

      const accuracy = Math.round((correctCount / qList.length) * 100);

      const scorePctEl = document.getElementById('breakdownScorePercentage');
      const topicTitleEl = document.getElementById('breakdownTopicTitle');
      const summaryEl = document.getElementById('breakdownScoreSummary');

      if (scorePctEl) scorePctEl.textContent = `${accuracy}%`;
      if (topicTitleEl) topicTitleEl.textContent = `Diagnostic Report: ${currentQuizDeck.deck_title || 'Document Quiz'}`;
      if (summaryEl) summaryEl.textContent = `You correctly answered ${correctCount} of ${qList.length} questions.`;

      // Log 15m study reward to daily balance!
      logBalanceTime('study', 15);

      renderDiagnosticCards('all');
    }

    let activeFilter = 'all';

    function renderDiagnosticCards(filter) {
      activeFilter = filter;
      const listEl = document.getElementById('diagnosticCardsList');
      const countAll = document.getElementById('countAllQ');
      const countMissed = document.getElementById('countMissedQ');
      const countFlagged = document.getElementById('countFlaggedQ');

      if (!listEl || !currentQuizDeck) return;

      const qList = currentQuizDeck.quiz;
      let missedCount = 0;

      qList.forEach((q, idx) => {
        const chosen = userAnswers[idx];
        if (chosen === undefined || q.options[chosen] !== q.correct_answer) {
          missedCount++;
        }
      });

      if (countAll) countAll.textContent = qList.length;
      if (countMissed) countMissed.textContent = missedCount;
      if (countFlagged) countFlagged.textContent = flaggedQuestions.size;

      listEl.innerHTML = '';

      qList.forEach((q, idx) => {
        const chosenIdx = userAnswers[idx];
        const isCorrect = chosenIdx !== undefined && q.options[chosenIdx] === q.correct_answer;
        const isFlagged = flaggedQuestions.has(idx);

        if (filter === 'missed' && isCorrect) return;
        if (filter === 'flagged' && !isFlagged) return;

        const card = document.createElement('div');
        card.className = `diagnostic-card ${isCorrect ? 'card-correct' : 'card-incorrect'}`;

        const userChoiceText = chosenIdx !== undefined ? q.options[chosenIdx] : 'No answer selected';

        card.innerHTML = `
          <div class="diag-header-row">
            <span class="diag-q-num">Question ${idx + 1}</span>
            <span class="diag-status-badge ${isCorrect ? 'status-correct' : 'status-incorrect'}">
              ${isCorrect ? '✓ Correct' : '✕ Missed'}
            </span>
          </div>

          <h4 class="diag-q-stem">${q.question}</h4>

          <div class="diag-answers-box">
            <div class="diag-ans-row ${isCorrect ? 'text-green' : 'text-red'}">
              <strong>Your Answer:</strong> <span>${userChoiceText}</span>
            </div>
            ${!isCorrect ? `
              <div class="diag-ans-row text-green">
                <strong>Correct Answer:</strong> <span>${q.correct_answer}</span>
              </div>
            ` : ''}
          </div>

          <div class="diag-explanation-box">
            <p><strong>Conceptual Explanation:</strong> ${q.explanation}</p>
            ${q.citation ? `<p class="diag-citation"><strong>Citation:</strong> ${q.citation}</p>` : ''}
          </div>
        `;

        listEl.appendChild(card);
      });
    }

    // Filter Buttons
    document.querySelectorAll('.review-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.review-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderDiagnosticCards(pill.dataset.filter);
      });
    });

    // Reset Lab Action (Upload New Document)
    const resetLabBtn = document.getElementById('resetLabBtn');
    const uploadNewDocBtn = document.getElementById('uploadNewDocBtn');

    function resetToUpload() {
      currentQuizDeck = null;
      stagedQuizFile = null;
      if (fileInput) fileInput.value = '';
      if (selectedBadge) selectedBadge.style.display = 'none';
      showStudyWorkflowStep('upload');
    }

    if (resetLabBtn) resetLabBtn.addEventListener('click', resetToUpload);
    if (uploadNewDocBtn) uploadNewDocBtn.addEventListener('click', resetToUpload);

    // Export Summary Action
    const exportSummaryBtn = document.getElementById('exportSummaryBtn');
    if (exportSummaryBtn) {
      exportSummaryBtn.addEventListener('click', () => {
        if (!currentQuizDeck) return;
        const qList = currentQuizDeck.quiz;
        let content = `LuminaEdu Diagnostic Assessment Report\n`;
        content += `Topic: ${currentQuizDeck.deck_title || 'Document Study Quiz'}\n`;
        content += `Date: ${new Date().toLocaleDateString()}\n\n`;

        qList.forEach((q, idx) => {
          const chosenIdx = userAnswers[idx];
          const isCorrect = chosenIdx !== undefined && q.options[chosenIdx] === q.correct_answer;
          content += `Question ${idx + 1}: ${q.question}\n`;
          content += `Status: ${isCorrect ? 'CORRECT' : 'MISSED'}\n`;
          content += `Your Answer: ${chosenIdx !== undefined ? q.options[chosenIdx] : 'None'}\n`;
          content += `Correct Answer: ${q.correct_answer}\n`;
          content += `Explanation: ${q.explanation}\n`;
          if (q.citation) content += `Citation: ${q.citation}\n`;
          content += `--------------------------------------------------\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LuminaEdu_Quiz_Summary_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    /* ==========================================================================
       11. INITIALIZATION DISPATCHER
       ========================================================================== */
    renderFullCalendar();
    renderGoals();
    renderBalance();
    renderWeeklyBarChart();
    renderPomodoroDisplays();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudentTools);
  } else {
    initStudentTools();
  }
})();
