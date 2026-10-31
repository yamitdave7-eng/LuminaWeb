/**
 * LuminaEdu · Interactive Dashboard & Learning Workspace Engine
 * Modules:
 *   1. ToastService: Floating feedback alerts
 *   2. ConfettiService: Celebratory canvas particle physics
 *   3. LiveClock & TimeGreeting: Time-aware live clock and salutations
 *   4. GoalsManager: Interactive habit and goal checklist with local storage
 *   5. BalanceWheel: Animated SVG multi-ring focus wheel
 *   6. CalendarWidget: Interactive mini month schedule and date picker
 *   7. NotesManager: Study notes CRUD with persistent browser storage
 *   8. PomodoroTimer: 25-minute deep focus timer with controls
 *   9. CommandPalette: Raycast-style ⌘K quick action launcher
 */

'use strict';

/* ==========================================================================
   1. Toast Notification Service
   ========================================================================== */
class ToastService {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(title, message = '', icon = '✨') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="font-size: 1.15rem;">${icon}</span>
      <div style="display: flex; flex-direction: column;">
        <strong style="font-size: 0.84rem; font-weight: 700;">${title}</strong>
        ${message ? `<span style="font-size: 0.76rem; color: var(--text-secondary);">${message}</span>` : ''}
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
  }
}

const toast = new ToastService();

/* ==========================================================================
   2. Confetti Service (Celebration Physics)
   ========================================================================== */
class ConfettiService {
  constructor() {
    this.canvas = document.getElementById('confettiCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 60) {
    if (!this.canvas) return;
    const colors = ['#7c3aed', '#a78bfa', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.015
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      requestAnimationFrame(() => this.loop());
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.isRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiService();
window.luminaConfetti = confetti;

/* ==========================================================================
   3. Live Clock & Dynamic Greeting
   ========================================================================== */
class ClockAndGreeting {
  constructor() {
    this.timeEl = document.getElementById('liveClockDisplay');
    this.dateEl = document.getElementById('liveDateDisplay');
    this.greetingEl = document.getElementById('timeGreetingText');
    this.init();
  }

  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  }

  update() {
    const now = new Date();

    // Format Time: 08:48 AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    // Format Date: WED | 29 OCT
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();
    const dateStr = `${dayName} | ${dateNum} ${monthName}`;

    if (this.timeEl) this.timeEl.textContent = timeStr;
    if (this.dateEl) this.dateEl.textContent = dateStr;

    // Time-aware greeting
    if (this.greetingEl) {
      const currentHour = now.getHours();
      let salutation = 'Good Morning';
      if (currentHour >= 12 && currentHour < 17) {
        salutation = 'Good Afternoon';
      } else if (currentHour >= 17 || currentHour < 4) {
        salutation = 'Good Evening';
      }
      this.greetingEl.textContent = `${salutation}, Gwapo! ✨`;
    }
  }
}

/* ==========================================================================
   4. Goals & Tasks Checklist Manager
   ========================================================================== */
class GoalsManager {
  constructor() {
    this.list = document.getElementById('goalsChecklist');
    this.badge = document.getElementById('goalsCounterBadge');
    this.sidebarBadge = document.getElementById('sidebarTaskBadge');
    this.input = document.getElementById('newGoalInput');
    this.submitBtn = document.getElementById('submitNewGoalBtn');
    this.quickAddBtn = document.getElementById('quickAddTaskBtn');

    // Banner counts
    this.planCountEl = document.getElementById('tasksPlanCount');
    this.inProgressCountEl = document.getElementById('tasksInProgressCount');
    this.completedCountEl = document.getElementById('tasksCompletedCount');

    this.storageKey = 'lumina_goals_store_v1';
    this.init();
  }

  init() {
    if (!this.list) return;

    this.bindEvents();
    this.load();
    this.updateStats();
  }

  bindEvents() {
    this.list.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const item = e.target.closest('.goal-item');
        if (item) {
          const checked = e.target.checked;
          item.classList.toggle('completed', checked);
          this.updateStats();
          this.save();

          if (checked) {
            confetti.fire(35);
            toast.show('Goal Achieved!', item.querySelector('.goal-label').textContent, '🎯');
          }
        }
      }
    });

    if (this.submitBtn && this.input) {
      this.submitBtn.addEventListener('click', () => this.addGoalFromInput());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addGoalFromInput();
        }
      });
    }

    if (this.quickAddBtn && this.input) {
      this.quickAddBtn.addEventListener('click', () => {
        this.input.focus();
        this.input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  addGoalFromInput() {
    const text = this.input.value.trim();
    if (!text) return;

    const id = `goal-${Date.now()}`;
    const li = document.createElement('li');
    li.className = 'goal-item';
    li.dataset.id = id;
    li.innerHTML = `
      <label class="custom-checkbox-wrap">
        <input type="checkbox">
        <span class="checkbox-box">
          <svg viewBox="0 0 12 10"><polyline points="1.5 5 4.5 8 10.5 2"/></svg>
        </span>
        <span class="goal-label">${escapeHtml(text)}</span>
      </label>
      <span class="goal-tag">Custom</span>
    `;

    this.list.appendChild(li);
    this.input.value = '';
    this.updateStats();
    this.save();
    toast.show('Goal Added', text, '✓');
  }

  updateStats() {
    const total = this.list.querySelectorAll('.goal-item').length;
    const done = this.list.querySelectorAll('.goal-item.completed').length;
    const remaining = total - done;

    if (this.badge) this.badge.textContent = `${done}/${total} Done`;
    if (this.sidebarBadge) this.sidebarBadge.textContent = String(remaining);

    if (this.planCountEl) this.planCountEl.textContent = String(total);
    if (this.inProgressCountEl) this.inProgressCountEl.textContent = String(remaining);
    if (this.completedCountEl) this.completedCountEl.textContent = String(done);

    // Trigger ring updates if BalanceWheel is initialized
    if (window.luminaWheel) {
      window.luminaWheel.updateFromStats(done, total);
    }
  }

  save() {
    const items = [];
    this.list.querySelectorAll('.goal-item').forEach((item) => {
      items.push({
        id: item.dataset.id,
        text: item.querySelector('.goal-label').textContent,
        tag: item.querySelector('.goal-tag') ? item.querySelector('.goal-tag').textContent : 'Goal',
        completed: item.classList.contains('completed')
      });
    });
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          this.list.innerHTML = '';
          items.forEach((it) => {
            const li = document.createElement('li');
            li.className = `goal-item ${it.completed ? 'completed' : ''}`;
            li.dataset.id = it.id;
            li.innerHTML = `
              <label class="custom-checkbox-wrap">
                <input type="checkbox" ${it.completed ? 'checked' : ''}>
                <span class="checkbox-box">
                  <svg viewBox="0 0 12 10"><polyline points="1.5 5 4.5 8 10.5 2"/></svg>
                </span>
                <span class="goal-label">${escapeHtml(it.text)}</span>
              </label>
              <span class="goal-tag">${escapeHtml(it.tag)}</span>
            `;
            this.list.appendChild(li);
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load goals:', e);
    }
  }
}

/* ==========================================================================
   5. Balance Focus Wheel
   ========================================================================== */
class BalanceWheel {
  constructor() {
    this.rewardBtn = document.getElementById('unlockRewardBtn');
    this.mindRing = document.querySelector('.ring-mind');
    this.bodyRing = document.querySelector('.ring-body');
    this.studyRing = document.querySelector('.ring-study');

    this.init();
  }

  init() {
    if (this.rewardBtn) {
      this.rewardBtn.addEventListener('click', () => {
        confetti.fire(80);
        toast.show('Reward Unlocked! 🌟', 'Daily streak bonus: +50 XP and focus flower badge awarded!', '🎁');
      });
    }
  }

  updateFromStats(done, total) {
    if (!this.studyRing || total === 0) return;
    const ratio = done / total;
    // Study circle circumference = 2 * PI * 58 ≈ 364
    const studyOffset = Math.round(364 * (1 - ratio * 0.85));
    this.studyRing.style.strokeDashoffset = String(studyOffset);
  }
}

/* ==========================================================================
   6. Calendar Widget
   ========================================================================== */
class CalendarWidget {
  constructor() {
    this.grid = document.getElementById('calendarDaysGrid');
    this.label = document.getElementById('calendarMonthLabel');
    this.prevBtn = document.getElementById('prevMonthBtn');
    this.nextBtn = document.getElementById('nextMonthBtn');

    this.currentDate = new Date();
    this.init();
  }

  init() {
    if (!this.grid) return;

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    this.render();
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (this.label) {
      this.label.textContent = `${monthNames[month]} ${year}`;
    }

    this.grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Empty lead cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      this.grid.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const el = document.createElement('div');
      el.className = 'cal-day';
      el.textContent = String(day);

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      if (isToday) el.classList.add('today');

      el.addEventListener('click', () => {
        document.querySelectorAll('.cal-day').forEach((d) => d.classList.remove('today'));
        el.classList.add('today');
        toast.show('Date Selected', `${monthNames[month]} ${day}, ${year}`, '📅');
      });

      this.grid.appendChild(el);
    }
  }
}

/* ==========================================================================
   7. Study Notes Manager
   ========================================================================== */
class NotesManager {
  constructor() {
    this.container = document.getElementById('notesList');
    this.modal = document.getElementById('noteModal');
    this.newNoteBtn = document.getElementById('newNoteBtn');
    this.closeBtn = document.getElementById('closeNoteModalBtn');
    this.cancelBtn = document.getElementById('cancelNoteBtn');
    this.saveBtn = document.getElementById('saveNoteBtn');
    this.titleInput = document.getElementById('noteTitleInput');
    this.contentInput = document.getElementById('noteContentInput');

    this.storageKey = 'lumina_notes_store_v1';
    this.init();
  }

  init() {
    if (!this.container) return;

    if (this.newNoteBtn) this.newNoteBtn.addEventListener('click', () => this.openModal());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());
    if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.closeModal());
    if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.saveNote());

    this.render();
  }

  openModal() {
    if (!this.modal) return;
    this.titleInput.value = '';
    this.contentInput.value = '';
    this.modal.classList.add('open');
    setTimeout(() => this.titleInput.focus(), 60);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('open');
  }

  getNotes() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading notes:', e);
    }

    // Default starter notes
    return [
      {
        id: 'note-1',
        title: 'Computer Science: Data Structures',
        snippet: 'Big-O complexity cheatsheet: Binary Search O(log n), Hash Table lookup O(1) average case.'
      },
      {
        id: 'note-2',
        title: 'Weekly Revision Roadmap',
        snippet: 'Focus on recursion trees, tree traversal algorithms, and mock interview questions.'
      }
    ];
  }

  saveNote() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    if (!title) {
      toast.show('Note Title Required', 'Please enter a title for your note.', '⚠️');
      return;
    }

    const notes = this.getNotes();
    notes.unshift({
      id: `note-${Date.now()}`,
      title,
      snippet: content || 'No additional content.'
    });

    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    this.closeModal();
    this.render();
    toast.show('Study Note Saved', title, '📝');
  }

  deleteNote(id) {
    let notes = this.getNotes();
    notes = notes.filter((n) => n.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    this.render();
    toast.show('Note Deleted', '', '🗑️');
  }

  render() {
    const notes = this.getNotes();
    this.container.innerHTML = '';

    if (notes.length === 0) {
      this.container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          No notes yet. Click "+ New Note" to write one!
        </div>
      `;
      return;
    }

    notes.forEach((note) => {
      const item = document.createElement('div');
      item.className = 'note-item';
      item.innerHTML = `
        <div class="note-header-row">
          <span class="note-title">${escapeHtml(note.title)}</span>
          <button type="button" class="note-delete-btn" title="Delete Note">×</button>
        </div>
        <p class="note-snippet">${escapeHtml(note.snippet)}</p>
      `;

      item.querySelector('.note-delete-btn').addEventListener('click', () => {
        this.deleteNote(note.id);
      });

      this.container.appendChild(item);
    });
  }
}

/* ==========================================================================
   8. Pomodoro Focus Timer
   ========================================================================== */
class PomodoroTimer {
  constructor() {
    this.display = document.getElementById('timerDisplay');
    this.startBtn = document.getElementById('startTimerBtn');
    this.resetBtn = document.getElementById('resetTimerBtn');
    this.modeLabel = document.getElementById('timerModeLabel');

    this.totalSeconds = 25 * 60;
    this.remaining = this.totalSeconds;
    this.timerId = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    if (!this.display || !this.startBtn) return;

    this.startBtn.addEventListener('click', () => this.toggle());
    if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.reset());

    this.render();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.startBtn.textContent = 'Pause Focus';
    this.modeLabel.textContent = 'Study Session in Progress... ⏳';

    this.timerId = setInterval(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.remaining = this.totalSeconds;
        this.startBtn.textContent = 'Start Focus';
        this.modeLabel.textContent = 'Session Complete! Great Job! 🎉';
        confetti.fire(70);
        toast.show('Focus Session Complete!', '25 minutes deep work achieved. Take a 5-minute break!', '🎉');
      }
      this.render();
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.startBtn.textContent = 'Resume Focus';
    this.modeLabel.textContent = 'Session Paused';
  }

  reset() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.remaining = this.totalSeconds;
    this.startBtn.textContent = 'Start Focus';
    this.modeLabel.textContent = 'Deep Study Session (25 min)';
    this.render();
  }

  render() {
    const mins = Math.floor(this.remaining / 60);
    const secs = this.remaining % 60;
    this.display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

/* ==========================================================================
   9. Raycast Command Palette (⌘K / Ctrl+K)
   ========================================================================== */
class CommandPalette {
  constructor(goalsManager, notesManager, timer) {
    this.goals = goalsManager;
    this.notes = notesManager;
    this.timer = timer;

    this.backdrop = document.getElementById('commandPalette');
    this.input = document.getElementById('cmdInput');
    this.resultsList = document.getElementById('cmdResultsList');
    this.closeEscBtn = document.getElementById('cmdCloseEsc');
    this.openBtn = document.getElementById('openCommandPaletteBtn');

    this.isOpen = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];

    this.commands = [
      {
        id: 'new-goal',
        title: 'Add New Goal / Task',
        desc: 'Focus input to create a custom study milestone',
        icon: '🎯',
        badge: 'Action',
        action: () => {
          document.getElementById('newGoalInput').focus();
          document.getElementById('newGoalInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      {
        id: 'new-note',
        title: 'Create Study Note',
        desc: 'Open editor dialog to draft new lecture insights',
        icon: '📝',
        badge: 'Modal',
        action: () => this.notes.openModal()
      },
      {
        id: 'timer-start',
        title: 'Toggle Pomodoro Timer',
        desc: 'Start or pause 25-minute deep focus session',
        icon: '⏳',
        badge: 'Timer',
        action: () => this.timer.toggle()
      },
      {
        id: 'unlock-reward',
        title: 'Claim Daily Balance Reward',
        desc: 'Redeem XP bonus for consistent study rhythms',
        icon: '🎁',
        badge: 'Bonus',
        action: () => document.getElementById('unlockRewardBtn').click()
      },
      {
        id: 'view-calendar',
        title: 'Jump to Calendar & Deadlines',
        desc: 'Review upcoming reviews and course deadlines',
        icon: '📅',
        badge: 'View',
        action: () => {
          document.querySelector('.calendar-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      {
        id: 'mark-all-done',
        title: 'Complete All Today\'s Goals',
        desc: 'Mark all active checklist items as finished',
        icon: '✓',
        badge: 'Workflow',
        action: () => {
          document.querySelectorAll('#goalsChecklist input[type="checkbox"]').forEach((cb) => {
            cb.checked = true;
            cb.closest('.goal-item').classList.add('completed');
          });
          this.goals.updateStats();
          this.goals.save();
          confetti.fire(60);
          toast.show('All Goals Completed!', 'Outstanding discipline today!', '🏆');
        }
      }
    ];

    this.init();
  }

  init() {
    if (!this.backdrop || !this.input) return;

    if (this.openBtn) this.openBtn.addEventListener('click', () => this.open());
    if (this.closeEscBtn) this.closeEscBtn.addEventListener('click', () => this.close());

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });

    this.input.addEventListener('input', () => this.filter(this.input.value));
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.backdrop.classList.add('open');
    this.backdrop.setAttribute('aria-hidden', 'false');
    this.input.value = '';
    this.filter('');
    setTimeout(() => this.input.focus(), 60);
  }

  close() {
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    this.backdrop.setAttribute('aria-hidden', 'true');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  filter(query) {
    const q = query.trim().toLowerCase();
    this.filteredCommands = !q
      ? [...this.commands]
      : this.commands.filter((c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
    this.selectedIndex = 0;
    this.render();
  }

  render() {
    this.resultsList.innerHTML = '';
    if (this.filteredCommands.length === 0) {
      this.resultsList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No matching commands found. Try "goal", "timer", or "note".
        </div>
      `;
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `raycast-item ${idx === this.selectedIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="raycast-item-left">
          <span class="raycast-item-icon">${cmd.icon}</span>
          <div style="display: flex; flex-direction: column;">
            <span class="raycast-item-title">${cmd.title}</span>
            <span style="font-size: 0.74rem; color: var(--text-muted);">${cmd.desc}</span>
          </div>
        </div>
        <span class="raycast-item-badge">${cmd.badge}</span>
      `;

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = idx;
        Array.from(this.resultsList.children).forEach((el, i) => {
          el.classList.toggle('selected', i === idx);
        });
      });

      item.addEventListener('click', () => {
        this.selectedIndex = idx;
        this.executeSelected();
      });

      this.resultsList.appendChild(item);
    });
  }

  executeSelected() {
    const cmd = this.filteredCommands[this.selectedIndex];
    if (cmd && cmd.action) {
      this.close();
      cmd.action();
    }
  }
}

/* ==========================================================================
   Helper Functions
   ========================================================================== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   Application Bootstrapper
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  new ClockAndGreeting();
  const goalsManager = new GoalsManager();
  window.luminaWheel = new BalanceWheel();
  new CalendarWidget();
  const notesManager = new NotesManager();
  const timer = new PomodoroTimer();
  new CommandPalette(goalsManager, notesManager, timer);

  // Sidebar navigation switching
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.openModal) {
        if (window.luminaMaximizedSuite) {
          window.luminaMaximizedSuite.openModal(btn.dataset.openModal);
        }
        return;
      }

      navItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      if (view === 'learning') {
        document.querySelector('.goals-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (view === 'notes') {
        document.querySelector('.notes-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (view === 'schedule') {
        document.querySelector('.calendar-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (view === 'timer') {
        document.querySelector('.timer-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        document.querySelector('.welcome-banner').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Notification bell click feedback
  const notifBtn = document.getElementById('notificationBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      toast.show('3 Notifications', '• Design Review tomorrow at 9 AM\n• 7-day streak milestone reached\n• New study notes saved', '🔔');
    });
  }

  // Interactive chart bar tooltip
  document.querySelectorAll('.bar-fill').forEach((bar) => {
    bar.addEventListener('click', () => {
      const day = bar.dataset.day;
      const hrs = bar.dataset.hours;
      toast.show(`${day} Activity`, `${hrs} deep study logged`, '📊');
    });
  });

  // Welcome greeting toast
  setTimeout(() => {
    toast.show('Welcome to LuminaEdu', 'Your personal student workspace is ready. Press ⌘K for quick actions.');
  }, 500);
});


/* ==========================================================================
   10. LuminaEdu Full Maximized Suite (Calendar, Tracker, Quiz, Zen Timer)
   ========================================================================== */

class MaximizedSuiteManager {
  constructor(confetti) {
    this.confetti = confetti;
    this.modalMap = {
      calendar: document.getElementById('fullCalendarModal'),
      tracker: document.getElementById('fullTrackerModal'),
      quiz: document.getElementById('fullQuizModal'),
      timer: document.getElementById('fullTimerModal')
    };

    this.currentCalDate = new Date();
    this.quizQuestions = [
      {
        q: "In Big-O notation, what is the average-case time complexity of looking up an item in a Hash Table?",
        sub: "Select the foundational data structure metric:",
        options: ["A. O(n)", "B. O(1) Constant Time", "C. O(log n)", "D. O(n²)"],
        correct: 1,
        expl: "Correct! Hash tables compute an index in constant time O(1) on average."
      },
      {
        q: "Which interval length is standard for a deep work Pomodoro focus session?",
        sub: "Select the research-backed duration:",
        options: ["A. 10 minutes", "B. 25 minutes", "C. 90 minutes", "D. 3 hours"],
        correct: 1,
        expl: "Correct! 25 minutes of deep focus followed by a 5-minute break is the classic Pomodoro rhythm."
      },
      {
        q: "What is the primary benefit of the 'Spaced Repetition' learning technique?",
        sub: "Active recall principles:",
        options: ["A. Cramming everything in one night", "B. Halting memory decay by reviewing at calibrated intervals", "C. Memorizing words without understanding", "D. Studying only once per semester"],
        correct: 1,
        expl: "Correct! Spaced repetition reviews material right before the forgetting curve takes effect."
      },
      {
        q: "According to the LuminaEdu daily balance wheel, what percentage is allocated to deep Study?",
        sub: "Habify-inspired balance formula:",
        options: ["A. 100%", "B. 70%", "C. 40%", "D. 10%"],
        correct: 2,
        expl: "Correct! 40% Study, 30% Mind wellness, and 30% Body health creates sustainable peak performance."
      },
      {
        q: "In Python, which built-in function returns both the index and value of iterable elements?",
        sub: "Programming essentials:",
        options: ["A. range()", "B. enumerate()", "C. zip()", "D. map()"],
        correct: 1,
        expl: "Correct! enumerate(iterable) produces tuples of (index, item)."
      }
    ];
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.hasAnswered = false;
    this.currentCardIdx = 0;

    this.flashcards = [
      {
        front: "What is the average-case time complexity of Hash Table lookups?",
        tag: "Computer Science",
        highlight: "O(1) Constant Time",
        back: "Hash tables compute an index via hashing function, allowing immediate array indexing on average."
      },
      {
        front: "What is the Pomodoro technique's recommended study interval?",
        tag: "Study Skills",
        highlight: "25 Minutes Focus + 5 Minutes Rest",
        back: "25 minutes of deep focus followed by 5 minutes of mindful rest prevents cognitive fatigue and improves retention."
      },
      {
        front: "How does Spaced Repetition halt memory decay?",
        tag: "Cognitive Science",
        highlight: "Calibrated Intervals at the Forgetting Curve",
        back: "By reviewing material right as you are about to forget it, neural synapses reinforce the memory trace permanently."
      },
      {
        front: "What is the Habify 40/30/30 daily balance formula?",
        tag: "Wellness & Habit",
        highlight: "40% Study · 30% Mind · 30% Body",
        back: "Allocating 40% to deep study, 30% to mental calm/mindfulness, and 30% to physical health prevents student burnout."
      },
      {
        front: "In Python, what is the key difference between a List and a Tuple?",
        tag: "Python & Coding",
        highlight: "Lists are Mutable, Tuples are Immutable",
        back: "Lists can be modified after creation (append/pop), whereas tuples are fixed and cannot be changed."
      }
    ];

    this.selectedCalDateStr = `${this.currentCalDate.getFullYear()}-${String(this.currentCalDate.getMonth() + 1).padStart(2, '0')}-${String(this.currentCalDate.getDate()).padStart(2, '0')}`;

    // Zen Timer state
    this.zenTimeRemaining = 25 * 60;
    this.zenTotalSeconds = 25 * 60;
    this.zenTimerId = null;
    this.isZenRunning = false;

    // Ambient Audio state
    this.audioCtx = null;
    this.noiseNode = null;
    this.isSoundPlaying = false;

    this.initTriggers();
    this.initCalendar();
    this.initTracker();
    this.initQuiz();
    this.initZenTimer();
  }

  openModal(name) {
    const modal = this.modalMap[name];
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (name === 'calendar') this.renderFullCalendar();
      if (name === 'tracker') this.renderHabitTracker();
      if (name === 'quiz') this.resetQuiz();
    }
  }

  closeModal(name) {
    const modal = this.modalMap[name];
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      if (name === 'timer') this.stopAmbientSound();
    }
  }

  initTriggers() {
    document.querySelectorAll('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalName = btn.dataset.openModal;
        this.openModal(modalName);
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalName = btn.dataset.closeModal;
        this.closeModal(modalName);
      });
    });

    Object.entries(this.modalMap).forEach(([name, modal]) => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal(name);
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Object.keys(this.modalMap).forEach((name) => this.closeModal(name));
      }
    });
  }

  /* Full Calendar Logic */
  initCalendar() {
    const prevBtn = document.getElementById('fullCalPrevBtn');
    const nextBtn = document.getElementById('fullCalNextBtn');
    const todayBtn = document.getElementById('fullCalTodayBtn');
    const submitBtn = document.getElementById('submitNewEventBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() - 1);
        this.renderFullCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() + 1);
        this.renderFullCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentCalDate = new Date();
        this.renderFullCalendar();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.addCalendarEvent());
    }
  }

  getStoredEvents() {
    try {
      const saved = localStorage.getItem('lumina_cal_events_standalone_v2');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { title: 'UI/UX Design Review', time: '09:00', type: 'violet', date: '2026-10-30' },
      { title: 'Python Assignment Submission', time: '23:00', type: 'blue', date: '2026-10-31' },
      { title: 'Algorithm Mock Exam', time: '14:00', type: 'pink', date: '2026-11-02' }
    ];
  }

  saveStoredEvents(events) {
    localStorage.setItem('lumina_cal_events_standalone_v2', JSON.stringify(events));
  }

  addCalendarEvent() {
    const titleInput = document.getElementById('newEventTitleInput');
    const typeSelect = document.getElementById('newEventTypeSelect');
    const timeInput = document.getElementById('newEventTimeInput');
    if (!titleInput || !titleInput.value.trim()) return;

    const title = titleInput.value.trim();
    const type = typeSelect ? typeSelect.value : 'violet';
    const time = (timeInput && timeInput.value) ? timeInput.value : '14:00';
    const date = this.selectedCalDateStr;

    const events = this.getStoredEvents();
    events.push({ title, time, type, date });
    this.saveStoredEvents(events);

    titleInput.value = '';
    this.renderFullCalendar();
    if (this.confetti) this.confetti.fire();
  }

  renderFullCalendar() {
    const grid = document.getElementById('fullMonthDaysGrid');
    const title = document.getElementById('fullCalMonthTitle');
    if (!grid) return;

    const year = this.currentCalDate.getFullYear();
    const month = this.currentCalDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (title) title.textContent = `${monthNames[month]} ${year}`;

    const events = this.getStoredEvents();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'full-cal-cell empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);

      const cell = document.createElement('div');
      cell.className = 'full-cal-cell';
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        cell.classList.add('today');
      }
      if (dateStr === this.selectedCalDateStr) {
        cell.classList.add('selected');
      }

      cell.innerHTML = `
        <span class="cell-num">${day}</span>
        <div class="cell-event-chips">
          ${dayEvents.map(e => `<span class="chip-item chip-${e.type}">${e.title}</span>`).join('')}
        </div>
      `;

      cell.addEventListener('click', () => {
        document.querySelectorAll('.full-cal-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        this.selectedCalDateStr = dateStr;
        this.renderDayTimeline(dateStr, `${monthNames[month]} ${day}, ${year}`, dayEvents);
      });

      grid.appendChild(cell);
    }

    // Default timeline view
    const dayEvents = events.filter(e => e.date === this.selectedCalDateStr);
    const selDateObj = new Date(this.selectedCalDateStr);
    this.renderDayTimeline(this.selectedCalDateStr, `${monthNames[selDateObj.getMonth()]} ${selDateObj.getDate()}, ${selDateObj.getFullYear()}`, dayEvents);
  }

  renderDayTimeline(dateStr, displayTitle, dayEvents) {
    const titleEl = document.getElementById('selectedDateTitle');
    const subEl = document.getElementById('selectedDateSub');
    const listEl = document.getElementById('dayTimelineList');

    if (titleEl) titleEl.textContent = displayTitle;
    if (subEl) subEl.textContent = `${dayEvents.length} scheduled event(s)`;

    if (listEl) {
      if (dayEvents.length === 0) {
        listEl.innerHTML = `<div class="empty-schedule-box">No events scheduled yet. Add one above!</div>`;
      } else {
        listEl.innerHTML = dayEvents.map(e => `
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

  /* Full Habit Matrix Logic */
  initTracker() {
    this.renderHabitTracker();
  }

  getStoredHabits() {
    try {
      const saved = localStorage.getItem('lumina_habits_standalone_matrix_v2');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'h1', name: '🧘 10 min Mindfulness & Calm', days: [true, true, true, true, false, false, false], streak: '4d' },
      { id: 'h2', name: '💧 Drink 8 Glasses Water', days: [true, true, true, true, true, false, false], streak: '5d' },
      { id: 'h3', name: '📚 2 Hours Deep Study Block', days: [true, true, false, true, true, false, false], streak: '2d' },
      { id: 'h4', name: '💻 Coding / Project Practice', days: [true, true, true, true, true, false, false], streak: '5d' },
      { id: 'h5', name: '🏃 8,000 Steps Daily Walk', days: [false, true, true, false, true, false, false], streak: '1d' },
      { id: 'h6', name: '🌙 8 Hours Restful Sleep', days: [true, true, true, true, false, false, false], streak: '4d' }
    ];
  }

  saveStoredHabits(habits) {
    localStorage.setItem('lumina_habits_standalone_matrix_v2', JSON.stringify(habits));
  }

  renderHabitTracker() {
    const tbody = document.getElementById('habitMatrixTableBody');
    const heatmap = document.getElementById('heatmapGrid');
    const rateEl = document.getElementById('trackerCompletionRate');
    if (!tbody) return;

    const habits = this.getStoredHabits();
    tbody.innerHTML = '';

    let totalChecks = 0;
    let checkedCount = 0;

    habits.forEach((habit, hIdx) => {
      const tr = document.createElement('tr');
      let daysHtml = '';
      let habitDoneCount = 0;

      habit.days.forEach((done, dIdx) => {
        totalChecks++;
        if (done) {
          checkedCount++;
          habitDoneCount++;
        }
        daysHtml += `
          <td class="habit-day-td">
            <button type="button" class="habit-check-btn ${done ? 'checked' : ''}" data-hidx="${hIdx}" data-didx="${dIdx}">
              ${done ? '✓' : ''}
            </button>
          </td>
        `;
      });

      habit.streak = `${habitDoneCount}d`;

      tr.innerHTML = `
        <td class="habit-name-cell">${habit.name}</td>
        ${daysHtml}
        <td class="habit-streak-cell"><span class="badge-streak">${habit.streak}</span></td>
      `;
      tbody.appendChild(tr);
    });

    if (rateEl && totalChecks > 0) {
      rateEl.textContent = `${Math.round((checkedCount / totalChecks) * 100)}%`;
    }

    tbody.querySelectorAll('.habit-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hIdx = parseInt(btn.dataset.hidx, 10);
        const dIdx = parseInt(btn.dataset.didx, 10);
        habits[hIdx].days[dIdx] = !habits[hIdx].days[dIdx];
        this.saveStoredHabits(habits);
        this.renderHabitTracker();
        if (habits[hIdx].days[dIdx] && this.confetti) this.confetti.fire();
      });
    });

    if (heatmap) {
      heatmap.innerHTML = '';
      const levels = ['level-0', 'level-1', 'level-2', 'level-3'];
      for (let i = 0; i < 35; i++) {
        const lvl = levels[Math.floor(Math.random() * levels.length)];
        const sq = document.createElement('div');
        sq.className = `heat-box ${lvl}`;
        sq.title = `Day ${i + 1}: Study consistency logged`;
        heatmap.appendChild(sq);
      }
    }
  }

  /* Active Recall Quiz Logic (Up to 20 Questions, Exam Simulation & Graded Review) */
  initQuiz() {
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

    function getSavedDeck() {
      try {
        const saved = localStorage.getItem('lumina_active_study_set_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return defaultDeck;
    }

    this.activeDeck = getSavedDeck();
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizCorrectCount = 0;
    this.quizStreak = 1.0;
    this.maxStreak = 1.0;
    this.hasAnswered = false;
    this.currentCardIdx = 0;
    this.currentCardsList = [...this.activeDeck.flashcards];
    this.userAnswers = {};
    this.flaggedQuestions = new Set();
    this.masteredCards = new Set();
    this.isExamMode = false;
    this.examSecondsLeft = 20 * 60;
    this.examTimerInterval = null;
    this.activeReviewFilter = 'all';

    const quizModeBtn = document.getElementById('quizModeBtn');
    const flashcardModeBtn = document.getElementById('flashcardModeBtn');
    const generatorModeBtn = document.getElementById('generatorModeBtn');
    const quickUploadPillBtn = document.getElementById('quickUploadPillBtn');
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    const flashcardView = document.getElementById('flashcardContainerView');
    const generatorView = document.getElementById('quizGeneratorView');

    const modeStudyBtn = document.getElementById('modeStudyBtn');
    const modeExamBtn = document.getElementById('modeExamBtn');
    const flagQuestionBtn = document.getElementById('flagQuestionBtn');
    const prevBtn = document.getElementById('quizPrevBtn');
    const nextBtn = document.getElementById('quizNextBtn');
    const submitEarlyBtn = document.getElementById('submitExamEarlyBtn');
    const printExamBtn = document.getElementById('printExamBtn');
    const exportStudySetBtn = document.getElementById('exportStudySetBtn');

    const switchView = (mode) => {
      [quizModeBtn, flashcardModeBtn, generatorModeBtn].forEach(b => b?.classList.remove('active'));
      if (quizView) quizView.style.display = 'none';
      if (summaryView) summaryView.style.display = 'none';
      if (flashcardView) flashcardView.style.display = 'none';
      if (generatorView) generatorView.style.display = 'none';

      if (mode === 'quiz') {
        quizModeBtn?.classList.add('active');
        if (this.currentQuizIdx >= this.activeDeck.quiz.length && Object.keys(this.userAnswers).length >= this.activeDeck.quiz.length) {
          if (summaryView) summaryView.style.display = 'block';
        } else {
          if (quizView) quizView.style.display = 'block';
          this.renderQuizQuestion();
        }
      } else if (mode === 'flashcards') {
        flashcardModeBtn?.classList.add('active');
        if (flashcardView) flashcardView.style.display = 'block';
        this.renderFlashcard(this.currentCardIdx);
      } else if (mode === 'generator') {
        generatorModeBtn?.classList.add('active');
        if (generatorView) generatorView.style.display = 'flex';
      }
      this.updateDeckRibbon();
    };

    if (quizModeBtn) quizModeBtn.addEventListener('click', () => switchView('quiz'));
    if (flashcardModeBtn) flashcardModeBtn.addEventListener('click', () => switchView('flashcards'));
    if (generatorModeBtn) generatorModeBtn.addEventListener('click', () => switchView('generator'));
    if (quickUploadPillBtn) quickUploadPillBtn.addEventListener('click', () => switchView('generator'));

    // Mode Toggle listeners
    if (modeStudyBtn) modeStudyBtn.addEventListener('click', () => this.setExamMode(false));
    if (modeExamBtn) modeExamBtn.addEventListener('click', () => this.setExamMode(true));

    // Flag Question Listener
    if (flagQuestionBtn) {
      flagQuestionBtn.addEventListener('click', () => {
        if (this.flaggedQuestions.has(this.currentQuizIdx)) {
          this.flaggedQuestions.delete(this.currentQuizIdx);
        } else {
          this.flaggedQuestions.add(this.currentQuizIdx);
        }
        this.renderQuizQuestion();
      });
    }

    // Previous button listener
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentQuizIdx > 0) {
          this.currentQuizIdx--;
          this.renderQuizQuestion();
        }
      });
    }

    // Next button listener
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const total = this.activeDeck.quiz.length;
        if (this.currentQuizIdx < total - 1) {
          this.currentQuizIdx++;
          this.renderQuizQuestion();
        } else {
          if (this.isExamMode) {
            const answeredCount = Object.keys(this.userAnswers).length;
            const msg = answeredCount < total
              ? `You have answered ${answeredCount} of ${total} questions. Submit exam now?`
              : `Submit your exam for complete graded scoring?`;
            if (confirm(msg)) this.showQuizSummary();
          } else {
            this.showQuizSummary();
          }
        }
      });
    }

    // Submit early button
    if (submitEarlyBtn) {
      submitEarlyBtn.addEventListener('click', () => {
        const total = this.activeDeck.quiz.length;
        const answeredCount = Object.keys(this.userAnswers).length;
        const msg = `Submit exam early? (${answeredCount} of ${total} questions answered)`;
        if (confirm(msg)) this.showQuizSummary();
      });
    }

    // Print & Export buttons
    if (printExamBtn) printExamBtn.addEventListener('click', () => this.exportPrintableExam());
    if (exportStudySetBtn) exportStudySetBtn.addEventListener('click', () => this.exportStudySetJson());

    // Review Table Filters
    document.getElementById('filterAllBtn')?.addEventListener('click', () => this.applyReviewFilter('all'));
    document.getElementById('filterWrongBtn')?.addEventListener('click', () => this.applyReviewFilter('wrong'));
    document.getElementById('filterFlaggedBtn')?.addEventListener('click', () => this.applyReviewFilter('flagged'));

    // Flashcard listeners
    const flashcardInner = document.getElementById('flashcardInner');
    const cardPrevBtn = document.getElementById('cardPrevBtn');
    const cardNextBtn = document.getElementById('cardNextBtn');
    const cardReviewAgainBtn = document.getElementById('cardReviewAgainBtn');
    const cardMasteredBtn = document.getElementById('cardMasteredBtn');
    const shuffleCardsBtn = document.getElementById('shuffleCardsBtn');

    if (flashcardInner) {
      flashcardInner.addEventListener('click', () => flashcardInner.classList.toggle('flipped'));
    }
    if (cardPrevBtn) {
      cardPrevBtn.addEventListener('click', () => {
        if (!this.currentCardsList.length) return;
        this.renderFlashcard(this.currentCardIdx - 1);
      });
    }
    if (cardNextBtn) {
      cardNextBtn.addEventListener('click', () => {
        if (!this.currentCardsList.length) return;
        this.renderFlashcard(this.currentCardIdx + 1);
      });
    }
    if (cardMasteredBtn) {
      cardMasteredBtn.addEventListener('click', () => {
        this.masteredCards.add(this.currentCardIdx);
        this.quizScore += 25;
        this.updateDeckRibbon();
        if (this.confetti) this.confetti.fire();
        this.renderFlashcard(this.currentCardIdx + 1);
      });
    }
    if (cardReviewAgainBtn) {
      cardReviewAgainBtn.addEventListener('click', () => {
        this.masteredCards.delete(this.currentCardIdx);
        this.renderFlashcard(this.currentCardIdx + 1);
      });
    }
    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener('click', () => {
        this.currentCardsList.sort(() => Math.random() - 0.5);
        this.renderFlashcard(0);
        if (this.confetti) this.confetti.fire();
      });
    }

    document.getElementById('retakeQuizBtn')?.addEventListener('click', () => this.resetQuiz());
    document.getElementById('studyCardsAfterQuizBtn')?.addEventListener('click', () => switchView('flashcards'));
    document.getElementById('uploadAnotherLessonBtn')?.addEventListener('click', () => switchView('generator'));

    // Generator elements
    this.initGenerator();

    this.resetQuiz();
    this.renderFlashcard(0);
    this.updateDeckRibbon();
  }

  setExamMode(active) {
    this.isExamMode = active;
    document.getElementById('modeStudyBtn')?.classList.toggle('active', !this.isExamMode);
    document.getElementById('modeExamBtn')?.classList.toggle('active', this.isExamMode);

    if (this.isExamMode) {
      this.startExamTimer(this.activeDeck.quiz.length * 60);
    } else {
      this.stopExamTimer();
    }
    this.renderQuizQuestion();
  }

  startExamTimer(seconds) {
    clearInterval(this.examTimerInterval);
    this.examSecondsLeft = seconds || (this.activeDeck.quiz.length * 60);
    this.updateTimerDisplay();
    const pill = document.getElementById('examTimerPill');
    if (pill) pill.style.display = 'inline-flex';

    this.examTimerInterval = setInterval(() => {
      this.examSecondsLeft--;
      this.updateTimerDisplay();
      if (this.examSecondsLeft <= 0) {
        clearInterval(this.examTimerInterval);
        alert("⏱️ Time's up for this exam! Compiling your score report now.");
        this.showQuizSummary();
      }
    }, 1000);
  }

  stopExamTimer() {
    clearInterval(this.examTimerInterval);
    const pill = document.getElementById('examTimerPill');
    if (pill) pill.style.display = 'none';
  }

  updateTimerDisplay() {
    const display = document.getElementById('examTimerDisplay');
    const pill = document.getElementById('examTimerPill');
    if (!display) return;
    const mins = Math.floor(Math.max(0, this.examSecondsLeft) / 60);
    const secs = Math.max(0, this.examSecondsLeft) % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (pill) {
      pill.style.background = this.examSecondsLeft < 120 ? '#fee2e2' : '#f5f3ff';
      pill.style.color = this.examSecondsLeft < 120 ? '#dc2626' : 'var(--accent, #7c3aed)';
    }
  }

  renderQuestionMatrix() {
    const matrix = document.getElementById('quizQuestionMatrix');
    const maxCountEl = document.getElementById('matrixMaxCount');
    if (!matrix) return;
    const total = this.activeDeck.quiz.length;
    if (maxCountEl) maxCountEl.textContent = total;

    matrix.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'matrix-pill';
      pill.textContent = (i + 1);

      if (i === this.currentQuizIdx) pill.classList.add('current');
      if (this.userAnswers[i] !== undefined) pill.classList.add('answered');
      if (this.flaggedQuestions.has(i)) pill.classList.add('flagged');

      if (!this.isExamMode && this.userAnswers[i] !== undefined) {
        const q = this.activeDeck.quiz[i];
        const isCorr = this.checkAnswerCorrectness(this.userAnswers[i], q.correct_answer);
        pill.classList.add(isCorr ? 'correct' : 'wrong');
      }

      pill.addEventListener('click', () => {
        this.currentQuizIdx = i;
        this.renderQuizQuestion();
      });

      matrix.appendChild(pill);
    }
  }

  checkAnswerCorrectness(userChoice, correctChoice) {
    if (!userChoice || !correctChoice) return false;
    const u = userChoice.trim().toLowerCase();
    const c = correctChoice.trim().toLowerCase();
    if (u === c) return true;
    const cleanU = u.replace(/^[a-d][\.\)]\s*/, '').trim();
    const cleanC = c.replace(/^[a-d][\.\)]\s*/, '').trim();
    return cleanU === cleanC || cleanC.includes(cleanU) || cleanU.includes(cleanC);
  }

  updateDeckRibbon() {
    const titleEl = document.getElementById('activeDeckTitle');
    const tagEl = document.getElementById('activeDeckTypeTag');
    const scoreValEl = document.getElementById('ribbonScoreVal');
    const streakValEl = document.getElementById('ribbonStreakVal');

    if (titleEl && this.activeDeck) titleEl.textContent = this.activeDeck.deck_title || 'Study Deck';
    if (tagEl && this.activeDeck) tagEl.textContent = this.activeDeck.type || 'Custom Deck';
    if (scoreValEl) scoreValEl.textContent = `${this.quizScore} pts`;
    if (streakValEl) streakValEl.textContent = `· ${this.quizStreak.toFixed(1)}x Streak`;
  }

  renderFlashcard(idx) {
    if (!this.currentCardsList.length) return;
    this.currentCardIdx = (idx + this.currentCardsList.length) % this.currentCardsList.length;
    const inner = document.getElementById('flashcardInner');
    if (inner) inner.classList.remove('flipped');
    const card = this.currentCardsList[this.currentCardIdx];
    const frontEl = document.getElementById('cardFrontText');
    const tagEl = document.getElementById('cardCategoryTag');
    const highlightEl = document.getElementById('cardHighlightText');
    const explEl = document.getElementById('cardExplanationText');
    const counterEl = document.getElementById('cardCounter');

    if (frontEl && card) frontEl.textContent = card.front;
    if (tagEl && card) tagEl.textContent = card.tag || this.activeDeck?.deck_title || 'Core Concept';
    if (highlightEl && card) highlightEl.textContent = card.highlight || card.front.replace(/^What is\s*/i, '').replace(/\?$/, '');
    if (explEl && card) explEl.textContent = card.back;
    if (counterEl && this.currentCardsList) counterEl.textContent = `Card ${this.currentCardIdx + 1} / ${this.currentCardsList.length}`;

    // Update Spaced Repetition Mastery Bar
    const label = document.getElementById('cardMasteryLabel');
    const fill = document.getElementById('cardMasteryFill');
    const count = this.masteredCards.size;
    const total = this.currentCardsList.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    if (label) label.textContent = `${count} of ${total} Mastered (${pct}%)`;
    if (fill) fill.style.width = `${pct}%`;
  }

  resetQuiz() {
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizCorrectCount = 0;
    this.quizStreak = 1.0;
    this.maxStreak = 1.0;
    this.userAnswers = {};
    this.flaggedQuestions = new Set();
    this.currentCardsList = [...(this.activeDeck?.flashcards || [])];
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    if (summaryView) summaryView.style.display = 'none';
    if (quizView) quizView.style.display = 'block';

    if (this.isExamMode) {
      this.startExamTimer(this.activeDeck.quiz.length * 60);
    }
    this.renderQuizQuestion();
    this.updateDeckRibbon();
  }

  renderQuizQuestion() {
    const qEl = document.getElementById('quizQuestionText');
    const optsEl = document.getElementById('quizOptionsList');
    const explCard = document.getElementById('quizExplanationCard');
    const prevBtn = document.getElementById('quizPrevBtn');
    const nextBtn = document.getElementById('quizNextBtn');
    const submitEarlyBtn = document.getElementById('submitExamEarlyBtn');
    const progEl = document.getElementById('quizProgressFill');
    const trackerEl = document.getElementById('questionTracker');
    const flagBtn = document.getElementById('flagQuestionBtn');
    const liveStreak = document.getElementById('liveStreakPill');
    const liveScore = document.getElementById('liveScorePill');

    const total = this.activeDeck?.quiz?.length || 0;
    if (total === 0) return;

    const q = this.activeDeck.quiz[this.currentQuizIdx];
    if (!q) return;

    this.renderQuestionMatrix();

    if (qEl) qEl.textContent = q.question;
    if (trackerEl) trackerEl.textContent = `Question ${this.currentQuizIdx + 1} of ${total}`;
    if (liveStreak) liveStreak.textContent = `🔥 Streak: ${this.quizStreak.toFixed(1)}x (+${Math.round(100 * (this.quizStreak - 1))} bonus)`;
    if (liveScore) liveScore.textContent = `🏆 ${this.quizScore} Points`;
    this.updateDeckRibbon();

    if (progEl) {
      progEl.style.width = `${((this.currentQuizIdx + 1) / total) * 100}%`;
    }

    if (flagBtn) {
      const isFlagged = this.flaggedQuestions.has(this.currentQuizIdx);
      flagBtn.classList.toggle('flagged', isFlagged);
      flagBtn.textContent = isFlagged ? '🚩 Flagged' : '🚩 Flag for Review';
    }

    if (prevBtn) {
      prevBtn.style.display = this.currentQuizIdx > 0 ? 'inline-block' : 'none';
    }

    const hasAnsweredCurrent = (this.userAnswers[this.currentQuizIdx] !== undefined);

    if (optsEl) {
      optsEl.innerHTML = '';
      q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt;

        if (this.isExamMode) {
          if (this.userAnswers[this.currentQuizIdx] === opt) {
            btn.classList.add('selected');
          }
          btn.addEventListener('click', () => {
            this.userAnswers[this.currentQuizIdx] = opt;
            Array.from(optsEl.children).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.renderQuestionMatrix();
          });
        } else {
          if (hasAnsweredCurrent) {
            btn.disabled = true;
            const isCorr = this.checkAnswerCorrectness(opt, q.correct_answer);
            if (isCorr) btn.classList.add('correct');
            if (this.userAnswers[this.currentQuizIdx] === opt && !isCorr) btn.classList.add('wrong');
          } else {
            btn.addEventListener('click', () => {
              if (this.userAnswers[this.currentQuizIdx] !== undefined) return;
              this.userAnswers[this.currentQuizIdx] = opt;

              const isCorrect = this.checkAnswerCorrectness(opt, q.correct_answer);

              if (isCorrect) {
                btn.classList.add('correct');
                const wonPts = Math.round(100 * this.quizStreak);
                this.quizScore += wonPts;
                this.quizCorrectCount++;
                this.quizStreak += 0.5;
                if (this.quizStreak > this.maxStreak) this.maxStreak = this.quizStreak;

                if (explCard) {
                  explCard.className = 'quiz-explanation-card correct-expl';
                  document.getElementById('explIcon').textContent = '✓';
                  document.getElementById('explTitle').textContent = 'Correct Answer!';
                  document.getElementById('explPointsTag').textContent = `+${wonPts} pts!`;
                  document.getElementById('quizExplanationText').textContent = q.explanation || 'Grounded conceptual recall confirmed.';
                  explCard.style.display = 'block';
                }
                if (this.confetti) this.confetti.fire();
              } else {
                btn.classList.add('wrong');
                this.quizStreak = 1.0;

                Array.from(optsEl.children).forEach(child => {
                  if (this.checkAnswerCorrectness(child.textContent, q.correct_answer)) {
                    child.classList.add('correct');
                  }
                });

                if (explCard) {
                  explCard.className = 'quiz-explanation-card wrong-expl';
                  document.getElementById('explIcon').textContent = '✕';
                  document.getElementById('explTitle').textContent = 'Not quite right';
                  document.getElementById('explPointsTag').textContent = '+0 pts';
                  document.getElementById('quizExplanationText').textContent = q.explanation || `The correct answer was: ${q.correct_answer}`;
                  explCard.style.display = 'block';
                }
              }

              Array.from(optsEl.children).forEach(b => b.disabled = true);

              if (liveStreak) liveStreak.textContent = `🔥 Streak: ${this.quizStreak.toFixed(1)}x`;
              if (liveScore) liveScore.textContent = `🏆 ${this.quizScore} Points`;
              this.updateDeckRibbon();
              this.renderQuestionMatrix();

              if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                nextBtn.textContent = this.currentQuizIdx < total - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
              }
            });
          }
        }

        optsEl.appendChild(btn);
      });
    }

    if (!this.isExamMode && hasAnsweredCurrent && explCard) {
      const chosen = this.userAnswers[this.currentQuizIdx];
      const isCorrect = this.checkAnswerCorrectness(chosen, q.correct_answer);
      explCard.className = `quiz-explanation-card ${isCorrect ? 'correct-expl' : 'wrong-expl'}`;
      document.getElementById('explIcon').textContent = isCorrect ? '✓' : '✕';
      document.getElementById('explTitle').textContent = isCorrect ? 'Correct Answer!' : 'Not quite right';
      document.getElementById('explPointsTag').textContent = isCorrect ? '+100 pts' : '+0 pts';
      document.getElementById('quizExplanationText').textContent = q.explanation || `Correct answer: ${q.correct_answer}`;
      explCard.style.display = 'block';
    } else if (this.isExamMode && explCard) {
      explCard.style.display = 'none';
    }

    if (this.isExamMode) {
      if (submitEarlyBtn) submitEarlyBtn.style.display = 'inline-block';
      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.textContent = this.currentQuizIdx < total - 1 ? 'Next Question →' : 'Review & Submit Exam 🏁';
      }
    } else {
      if (submitEarlyBtn) submitEarlyBtn.style.display = 'none';
      if (nextBtn) {
        nextBtn.style.display = hasAnsweredCurrent ? 'inline-block' : 'none';
        nextBtn.textContent = this.currentQuizIdx < total - 1 ? 'Next Question →' : 'Finish Quiz & View Points Report 🏆';
      }
    }
  }

  showQuizSummary() {
    this.stopExamTimer();
    const quizView = document.getElementById('quizContainerView');
    const summaryView = document.getElementById('quizSummaryView');
    if (quizView) quizView.style.display = 'none';
    if (summaryView) summaryView.style.display = 'block';

    const total = this.activeDeck.quiz.length;
    let calculatedCorrect = 0;

    if (this.isExamMode) {
      this.quizScore = 0;
      let streakTracker = 1.0;
      for (let i = 0; i < total; i++) {
        const q = this.activeDeck.quiz[i];
        const ans = this.userAnswers[i];
        if (this.checkAnswerCorrectness(ans, q.correct_answer)) {
          calculatedCorrect++;
          this.quizScore += 100 + Math.round(100 * (streakTracker - 1));
          streakTracker += 0.5;
        } else {
          streakTracker = 1.0;
        }
      }
      this.quizCorrectCount = calculatedCorrect;
    } else {
      calculatedCorrect = this.quizCorrectCount;
    }

    const accuracy = total > 0 ? Math.round((calculatedCorrect / total) * 100) : 0;
    const basePts = calculatedCorrect * 100;
    const streakBonus = Math.max(0, this.quizScore - basePts);

    document.getElementById('summaryTotalPoints').textContent = `⭐ ${this.quizScore} Points Earned!`;
    document.getElementById('summaryAccuracyVal').textContent = `${accuracy}%`;
    document.getElementById('summaryBasePtsVal').textContent = `${basePts}`;
    document.getElementById('summaryStreakBonusVal').textContent = `+${streakBonus}`;
    document.getElementById('summaryCorrectCountVal').textContent = `${calculatedCorrect} / ${total}`;

    const badge = document.getElementById('summaryGradeBadge');
    if (badge) {
      if (accuracy >= 90) badge.textContent = 'GRADE A+ · OUTSTANDING MASTERY 🌟';
      else if (accuracy >= 80) badge.textContent = 'GRADE A · EXCELLENT MASTERY ⭐';
      else if (accuracy >= 70) badge.textContent = 'GRADE B · SOLID PROFICIENCY 👍';
      else if (accuracy >= 60) badge.textContent = 'GRADE C · ACTIVE RECALL RECOMMENDED 📚';
      else badge.textContent = 'GRADE F · REMEDIATION RECOMMENDED ⚠️';
    }

    this.renderExamReviewTable();
    if (this.confetti) this.confetti.fire();
  }

  renderExamReviewTable() {
    const tableBody = document.getElementById('examReviewTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const total = this.activeDeck.quiz.length;
    let wrongCount = 0;

    this.activeDeck.quiz.forEach((q, idx) => {
      const chosen = this.userAnswers[idx];
      const isCorrect = this.checkAnswerCorrectness(chosen, q.correct_answer);
      if (!isCorrect) wrongCount++;
      const isFlagged = this.flaggedQuestions.has(idx);

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

      tableBody.appendChild(row);
    });

    const cAll = document.getElementById('reviewCountAll');
    const cWrong = document.getElementById('reviewCountWrong');
    const cFlag = document.getElementById('reviewCountFlagged');
    if (cAll) cAll.textContent = total;
    if (cWrong) cWrong.textContent = wrongCount;
    if (cFlag) cFlag.textContent = this.flaggedQuestions.size;

    this.applyReviewFilter(this.activeReviewFilter);
  }

  applyReviewFilter(filter) {
    this.activeReviewFilter = filter;
    ['filterAllBtn', 'filterWrongBtn', 'filterFlaggedBtn'].forEach(id => {
      document.getElementById(id)?.classList.remove('active');
    });

    if (filter === 'all') document.getElementById('filterAllBtn')?.classList.add('active');
    else if (filter === 'wrong') document.getElementById('filterWrongBtn')?.classList.add('active');
    else if (filter === 'flagged') document.getElementById('filterFlaggedBtn')?.classList.add('active');

    const tableBody = document.getElementById('examReviewTableBody');
    if (!tableBody) return;
    Array.from(tableBody.children).forEach(row => {
      if (filter === 'all') row.style.display = '';
      else if (filter === 'wrong') row.style.display = row.dataset.status === 'wrong' ? '' : 'none';
      else if (filter === 'flagged') row.style.display = row.dataset.flagged === 'true' ? '' : 'none';
    });
  }

  exportPrintableExam() {
    const total = this.activeDeck.quiz.length;
    const title = this.activeDeck.deck_title || "LuminaPRISM Academic Assessment";

    let questionsHtml = '';
    this.activeDeck.quiz.forEach((q, idx) => {
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
    this.activeDeck.quiz.forEach((q, idx) => {
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
          @media print { .no-print { display: none; } }
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
              <span style="font-size: 11pt; font-weight: 700;">Score: ______ / ${total}</span>
            </div>
          </div>
          <div class="meta-fields">
            <div>Student Name: <span class="line-field"></span></div>
            <div>Date: <span class="line-field"></span></div>
            <div>Class / Section: <span class="line-field"></span></div>
          </div>
        </div>
        <div class="instructions">
          <strong>Exam Instructions:</strong> This examination contains <strong>${total} questions</strong>. Read each question carefully and select the single best choice by filling the box. Standard time allocation: ${total} minutes.
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

  exportStudySetJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.activeDeck, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    const safeTitle = (this.activeDeck.deck_title || 'study_set').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.setAttribute("download", `${safeTitle}_deck.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  initGenerator() {
    const samples = {
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

    const textInput = document.getElementById('lessonTextInput');
    const textCounter = document.getElementById('textCountDisplay');

    document.querySelectorAll('.chip-sample').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = samples[btn.dataset.sample];
        if (s && textInput) {
          textInput.value = s;
          if (textCounter) textCounter.textContent = `${s.split(/\s+/).length} words · ${s.length} chars`;
          textInput.focus();
        }
      });
    });

    if (textInput && textCounter) {
      textInput.addEventListener('input', () => {
        const t = textInput.value.trim();
        textCounter.textContent = `${t ? t.split(/\s+/).length : 0} words · ${t.length} chars`;
      });
    }

    const dropzone = document.getElementById('lessonDropzone');
    const fileInput = document.getElementById('lessonFileInput');
    let chosenFile = null;

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (!e.target.closest('#removeFileBtn')) fileInput.click();
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      ['dragleave', 'dragend'].forEach(ev => {
        dropzone.addEventListener(ev, () => dropzone.classList.remove('dragover'));
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
      });
    }

    const handleFile = (file) => {
      chosenFile = file;
      const chip = document.getElementById('selectedFileChip');
      const defContent = document.getElementById('dropzoneDefaultContent');
      if (chip && defContent) {
        document.getElementById('selectedFileName').textContent = file.name;
        document.getElementById('selectedFileSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        defContent.style.display = 'none';
        chip.style.display = 'flex';
      }
      if (file.name.match(/\.(txt|md|markdown|json|csv|py|js|html|rst)$/i)) {
        const r = new FileReader();
        r.onload = (e) => {
          if (textInput && (!textInput.value.trim() || textInput.value.length < 50)) {
            textInput.value = e.target.result;
            if (textCounter) textCounter.textContent = `${textInput.value.split(/\s+/).length} words · ${textInput.value.length} chars`;
          }
        };
        r.readAsText(file);
      }
    };

    document.getElementById('removeFileBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      chosenFile = null;
      if (fileInput) fileInput.value = '';
      document.getElementById('dropzoneDefaultContent').style.display = 'block';
      document.getElementById('selectedFileChip').style.display = 'none';
    });

    // Trigger synthesis
    const trigBtn = document.getElementById('triggerGenerateBtn');
    if (trigBtn) {
      trigBtn.addEventListener('click', async () => {
        const textVal = textInput ? textInput.value.trim() : '';
        if (!chosenFile && (!textVal || textVal.length < 15)) {
          alert('Please upload a lesson document or paste curriculum text to analyze.');
          textInput?.focus();
          return;
        }

        const numQ = parseInt(document.getElementById('genQuestionCount')?.value || '20', 10);
        const apiKey = document.getElementById('genApiKeyInput')?.value.trim() || '';

        const loader = document.getElementById('genLoadingState');
        const successB = document.getElementById('genSuccessBanner');
        if (loader) loader.style.display = 'block';
        if (successB) successB.style.display = 'none';
        trigBtn.disabled = true;

        const s1 = document.getElementById('step1');
        const s2 = document.getElementById('step2');
        const s3 = document.getElementById('step3');
        const s4 = document.getElementById('step4');

        if (s1) { s1.className = 'stepper-step active'; s1.textContent = `⏳ Step 1: Parsing study text and extracting ${numQ} curriculum concepts...`; }
        if (s2) { s2.className = 'stepper-step'; s2.textContent = '⏳ Step 2: Formulating active recall flashcard pairs...'; }
        if (s3) { s3.className = 'stepper-step'; s3.textContent = '⏳ Step 3: Generating 4-distractor multiple choice questions...'; }
        if (s4) { s4.className = 'stepper-step'; s4.textContent = '⏳ Step 4: Assembling points scoring system & matrix...'; }

        setTimeout(() => { if (s1 && s2) { s1.className = 'stepper-step done'; s2.className = 'stepper-step active'; } }, 350);
        setTimeout(() => { if (s2 && s3) { s2.className = 'stepper-step done'; s3.className = 'stepper-step active'; } }, 750);
        setTimeout(() => { if (s3 && s4) { s3.className = 'stepper-step done'; s4.className = 'stepper-step active'; } }, 1150);

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

          const fd = new FormData();
          if (chosenFile) fd.append('file', chosenFile);
          if (textVal) fd.append('text', textVal);
          fd.append('numQuestions', numQ);
          if (apiKey) fd.append('apiKey', apiKey);

          const res = await fetch('/api/v1/study-set/generate', {
            method: 'POST',
            headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
            body: fd
          });

          if (res.ok) {
            const j = await res.json();
            if (j.data?.quiz && j.data?.flashcards) {
              generatedData = j.data;
              generatedData.type = 'AI Generated Deck';
            }
          }
        } catch (err) {
          console.warn('Backend API request skipped, falling back to neural client synthesis', err);
        }

        if (!generatedData) {
          await new Promise(r => setTimeout(r, 1300));
          const effectiveText = textVal || (chosenFile ? chosenFile.name : 'Lesson Study Set');
          generatedData = this.clientSynthesizeCurriculum(effectiveText, numQ);
        }

        if (s4) s4.className = 'stepper-step done';

        this.activeDeck = generatedData;
        localStorage.setItem('lumina_active_study_set_v2', JSON.stringify(this.activeDeck));

        setTimeout(() => {
          if (loader) loader.style.display = 'none';
          trigBtn.disabled = false;
          if (successB) {
            document.getElementById('generatedDeckTitle').textContent = this.activeDeck.deck_title;
            document.getElementById('genCardCountMetric').textContent = `🎴 ${this.activeDeck.flashcards.length} Flashcards`;
            document.getElementById('genQuizCountMetric').textContent = `🧠 ${this.activeDeck.quiz.length} Quiz Questions`;
            document.getElementById('genMaxPtsMetric').textContent = `🏆 ${this.activeDeck.quiz.length * 100} Max Points`;
            successB.style.display = 'block';
          }
          this.updateDeckRibbon();
          if (this.confetti) this.confetti.fire();
        }, 300);
      });
    }

    document.getElementById('startGeneratedQuizBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      document.getElementById('quizModeBtn')?.classList.add('active');
      document.getElementById('quizGeneratorView').style.display = 'none';
      document.getElementById('quizContainerView').style.display = 'block';
      this.resetQuiz();
    });

    document.getElementById('openGeneratedCardsBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
      document.getElementById('flashcardModeBtn')?.classList.add('active');
      document.getElementById('quizGeneratorView').style.display = 'none';
      document.getElementById('flashcardContainerView').style.display = 'block';
      this.currentCardsList = [...this.activeDeck.flashcards];
      this.renderFlashcard(0);
    });
  }

  clientSynthesizeCurriculum(text, numQ) {
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
    lines.forEach(l => {
      const m = l.match(/^(?:\d+[\.\)]\s*)?([A-Z0-9][A-Za-z0-9\s\-_/'()]{2,45})[:\-—]\s+(.+)$/);
      if (m && m[2].length > 10) concepts.push([m[1].trim(), m[2].trim()]);
    });

    const sentences = clean.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
    sentences.forEach(s => {
      const m = s.match(/\b([A-Z][a-zA-Z0-9\s]{2,35})\s+(?:is defined as|refers to|is a|is an|represents|is the principle that)\s+(.+)/);
      if (m && !concepts.some(c => c[0].toLowerCase() === m[1].toLowerCase())) {
        concepts.push([m[1].trim(), s.trim()]);
      }
    });

    if (concepts.length < numQ) {
      sentences.forEach((s) => {
        const w = s.split(/\s+/);
        if (w.length >= 6 && !concepts.some(c => c[1] === s)) {
          concepts.push([w.slice(0, 3).join(' '), s]);
        }
      });
    }

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
        distractors.push(`Alternative baseline parameter with non-deterministic runtime`);
      }
      const pos = i % 4;
      distractors.splice(pos, 0, correctChoice);

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

  /* Full Zen Focus Chamber & Ambient Sound */
  initZenTimer() {
    const startBtn = document.getElementById('zenStartBtn');
    const resetBtn = document.getElementById('zenResetBtn');
    const toggleSoundBtn = document.getElementById('toggleSoundBtn');
    const soundSelect = document.getElementById('soundscapeSelect');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.toggleZenTimer());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetZenTimer());
    }

    document.querySelectorAll('.timer-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.timer-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mins = parseInt(tab.dataset.time, 10);
        this.setZenInterval(mins);
      });
    });

    if (toggleSoundBtn) {
      toggleSoundBtn.addEventListener('click', () => {
        if (this.isSoundPlaying) {
          this.stopAmbientSound();
        } else {
          const type = soundSelect ? soundSelect.value : 'rain';
          this.startAmbientSound(type);
        }
      });
    }

    this.renderZenClock();
  }

  setZenInterval(mins) {
    clearInterval(this.zenTimerId);
    this.isZenRunning = false;
    this.zenTotalSeconds = mins * 60;
    this.zenTimeRemaining = this.zenTotalSeconds;
    const startBtn = document.getElementById('zenStartBtn');
    const tag = document.getElementById('zenSessionTag');
    if (startBtn) startBtn.textContent = 'Start Focus';
    if (tag) tag.textContent = `${mins}m Interval Selected`;
    this.renderZenClock();
  }

  toggleZenTimer() {
    const startBtn = document.getElementById('zenStartBtn');
    const tag = document.getElementById('zenSessionTag');

    if (this.isZenRunning) {
      clearInterval(this.zenTimerId);
      this.isZenRunning = false;
      if (startBtn) startBtn.textContent = 'Resume Focus';
      if (tag) tag.textContent = 'Session Paused';
    } else {
      this.isZenRunning = true;
      if (startBtn) startBtn.textContent = 'Pause Focus';
      if (tag) tag.textContent = 'Focus Chamber Active · Breathe & Study';

      this.zenTimerId = setInterval(() => {
        this.zenTimeRemaining--;
        if (this.zenTimeRemaining <= 0) {
          clearInterval(this.zenTimerId);
          this.isZenRunning = false;
          this.zenTimeRemaining = this.zenTotalSeconds;
          if (startBtn) startBtn.textContent = 'Start Focus';
          if (tag) tag.textContent = 'Session Complete! Great discipline! 🎉';
          if (this.confetti) this.confetti.fire();
        }
        this.renderZenClock();
      }, 1000);
    }
  }

  resetZenTimer() {
    clearInterval(this.zenTimerId);
    this.isZenRunning = false;
    this.zenTimeRemaining = this.zenTotalSeconds;
    const startBtn = document.getElementById('zenStartBtn');
    const tag = document.getElementById('zenSessionTag');
    if (startBtn) startBtn.textContent = 'Start Focus';
    if (tag) tag.textContent = 'Deep Focus Session Ready';
    this.renderZenClock();
  }

  renderZenClock() {
    const clock = document.getElementById('zenClockDisplay');
    if (!clock) return;
    const m = Math.floor(this.zenTimeRemaining / 60);
    const s = this.zenTimeRemaining % 60;
    clock.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  startAmbientSound(type) {
    this.stopAmbientSound();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
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

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = type === 'ocean' ? 'bandpass' : 'lowpass';
      filter.frequency.value = type === 'rain' ? 800 : type === 'ocean' ? 400 : 1200;

      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.18;

      this.noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      this.noiseNode.start();
      this.isSoundPlaying = true;
      const btn = document.getElementById('toggleSoundBtn');
      if (btn) btn.textContent = 'Stop Ambient Sound ⏹';
    } catch(err) {
      console.warn('AudioContext error:', err);
    }
  }

  stopAmbientSound() {
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch(e) {}
      this.noiseNode = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch(e) {}
      this.audioCtx = null;
    }
    this.isSoundPlaying = false;
    const btn = document.getElementById('toggleSoundBtn');
    if (btn) btn.textContent = 'Play Ambient Sound 🔊';
  }
}

// Instantiate Maximized Suite
function initMaxSuite() {
  if (window.luminaConfetti) {
    window.luminaMaximizedSuite = new MaximizedSuiteManager(window.luminaConfetti);
  } else {
    window.luminaMaximizedSuite = new MaximizedSuiteManager(null);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMaxSuite);
} else {
  initMaxSuite();
}
