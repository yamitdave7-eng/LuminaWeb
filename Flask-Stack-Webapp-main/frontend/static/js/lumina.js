/**
 * Lumina Workspace Interactive Features
 * Provides dynamic local time greeting, live workspace search,
 * and mini calendar highlights.
 */

export function initLumina() {
  initGreeting();
  initCalendar();
  initSearch();
}

/**
 * 1. Time-aware Dynamic Greeting
 */
function initGreeting() {
  const greetingEl = document.getElementById('topbarGreeting');
  if (!greetingEl) return;

  const nameSpan = greetingEl.querySelector('.user-first-name');
  const name = nameSpan ? nameSpan.textContent.trim() : 'there';
  const hour = new Date().getHours();

  let salutation = 'Good Morning';
  if (hour >= 12 && hour < 17) {
    salutation = 'Good Afternoon';
  } else if (hour >= 17 || hour < 4) {
    salutation = 'Good Evening';
  }

  greetingEl.innerHTML = `${salutation}, <span class="user-first-name">${name}</span>!`;
}

/**
 * 2. Mini Calendar Widget
 */
function initCalendar() {
  const grid = document.getElementById('calDaysGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  label.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  grid.innerHTML = '';

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Filler days for previous month
  const prevDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const cell = document.createElement('div');
    cell.className = 'cal-day other-month';
    cell.textContent = (prevDaysCount - i).toString();
    grid.appendChild(cell);
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d.toString();

    // Highlight today and streak days
    if (d <= now.getDate()) {
      cell.classList.add('streak-active');
    }

    if (d === now.getDate()) {
      cell.classList.add('is-current-day');
    }

    grid.appendChild(cell);
  }

  // Next month filler days to complete grid
  const totalSlots = firstDayIndex + daysInMonth;
  const remaining = 35 - totalSlots;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day other-month';
      cell.textContent = i.toString();
      grid.appendChild(cell);
    }
  }
}

/**
 * 3. Live Workspace Search / Filter
 */
function initSearch() {
  const searchInput = document.getElementById('luminaSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const activityItems = document.querySelectorAll('.activity-item');
    const actionItems = document.querySelectorAll('.quick-action-item');

    activityItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? '' : 'none';
    });

    actionItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? '' : 'none';
    });
  });
}
