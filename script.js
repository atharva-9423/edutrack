function goToPage(pageName, addToHistory = true) {
  const pages = document.querySelectorAll('.page');
  const targetPage = document.getElementById(pageName + '-page');
  const timelinePage = document.getElementById('timeline-page');
  
  // Handle timeline slide transitions
  if (pageName === 'timeline') {
    // Show timeline with slide-in animation
    timelinePage.classList.remove('slide-out');
    timelinePage.classList.add('active', 'slide-in');
    
    // Hide other pages without fade animation
    pages.forEach(page => {
      if (page.id !== 'timeline-page') {
        page.classList.remove('active', 'fade-in');
      }
    });
    
    loadTimelineSchedule();
  } else if (pageName === 'master-timetable') {
    // Load master timetable when navigating to it
    pages.forEach(page => {
      page.classList.remove('active', 'fade-in');
    });
    
    if (targetPage) {
      targetPage.classList.add('active', 'fade-in');
    }
    
    // Load division cards view (will add to history if needed)
    loadMasterDivisionCards('MON', addToHistory);
  } else if (document.getElementById('timeline-page').classList.contains('active')) {
    // Sliding out from timeline to another page
    timelinePage.classList.remove('slide-in');
    timelinePage.classList.add('slide-out');
    
    // Wait for animation to complete before hiding timeline
    setTimeout(() => {
      timelinePage.classList.remove('active', 'slide-out');
      
      // Show target page without fade animation
      if (targetPage) {
        targetPage.classList.add('active');
      }
    }, 400); // Match animation duration
  } else {
    // Normal navigation between non-timeline pages
    pages.forEach(page => {
      page.classList.remove('active', 'fade-in');
    });
    
    if (targetPage) {
      targetPage.classList.add('active', 'fade-in');
    }
  }

  // Add to browser history for back button support
  // Skip adding to history for master-timetable as it will be handled by loadMasterDivisionCards
  if (addToHistory && pageName !== 'master-timetable') {
    history.pushState({ page: pageName }, '', `#${pageName}`);
  }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
  // Check if notification modal is open
  const notificationDropdown = document.getElementById('notificationDropdown');
  if (notificationDropdown && notificationDropdown.classList.contains('active')) {
    closeNotifications();
    return;
  }
  
  if (event.state && event.state.page) {
    // Handle master timetable page with sub-views
    if (event.state.page === 'master-timetable') {
      goToPage('master-timetable', false);
      
      // Restore the correct view state
      if (event.state.view === 'division' && event.state.division) {
        // Show division detail view
        showDivisionSchedule(event.state.division, event.state.day || 'MON', false);
      } else {
        // Show division grid view
        loadMasterDivisionCards(event.state.day || 'MON', false);
      }
    } else {
      goToPage(event.state.page, false);
    }
  } else {
    // If no state, check the hash
    const hash = window.location.hash.substring(1);
    if (hash) {
      if (hash === 'master-timetable') {
        goToPage(hash, false);
        loadMasterDivisionCards('MON', false);
      } else {
        goToPage(hash, false);
      }
    } else {
      goToPage('welcome', false);
    }
  }
});

// Set initial history state on page load
window.addEventListener('load', function() {
  const hash = window.location.hash.substring(1);
  const currentPage = hash || 'welcome';
  history.replaceState({ page: currentPage }, '', `#${currentPage}`);
});

function showToast(message, type = 'warning') {
  const toastContainer = document.getElementById('toast-container');

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Set icon based on type
  let icon = '⚠️';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="closeToast(this)">✕</button>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    closeToast(toast.querySelector('.toast-close'));
  }, 4000);
}

function closeToast(button) {
  const toast = button.parentElement;
  toast.classList.add('hide');

  // Remove from DOM after animation
  setTimeout(() => {
    toast.remove();
  }, 300);
}

function showAlert(message) {
  showToast(message, 'info');
}

function toggleDropdown(selectName) {
  const selectElement = document.getElementById(`${selectName}-options`).parentElement;
  const optionsElement = document.getElementById(`${selectName}-options`);

  // Close all other dropdowns
  document.querySelectorAll('.custom-select').forEach(select => {
    if (select !== selectElement) {
      select.classList.remove('active');
      select.querySelector('.select-options').classList.remove('active');
    }
  });

  // Toggle current dropdown
  selectElement.classList.toggle('active');
  optionsElement.classList.toggle('active');
}

function selectOption(selectName, value) {
  const selectElement = document.getElementById(`${selectName}-options`).parentElement;
  const valueElement = selectElement.querySelector('.select-value');
  const hiddenInput = document.getElementById(selectName);

  // Update displayed value
  valueElement.textContent = value;
  valueElement.removeAttribute('data-placeholder');

  // Update hidden input
  hiddenInput.value = value;

  // Remove selected class from all options
  selectElement.querySelectorAll('.select-option').forEach(option => {
    option.classList.remove('selected');
  });

  // Add selected class to clicked option
  event.target.classList.add('selected');

  // Close dropdown
  selectElement.classList.remove('active');
  document.getElementById(`${selectName}-options`).classList.remove('active');
}

function handleLogin(event) {
  event.preventDefault();

  const studentName = document.getElementById('student-name').value;
  const branch = document.getElementById('branch').value;
  const division = document.getElementById('division').value;
  const year = document.getElementById('year').value;

  // Validate individual fields with specific messages
  if (!studentName) {
    showToast('Please enter your student name', 'warning');
    return;
  }

  if (!branch) {
    showToast('Please select your branch', 'warning');
    return;
  }

  if (!division) {
    showToast('Please select your division', 'warning');
    return;
  }

  if (!year) {
    showToast('Please select your year', 'warning');
    return;
  }

  // Store user data in localStorage
  const userData = { studentName, branch, division, year };
  localStorage.setItem('userSession', JSON.stringify(userData));
  console.log('Login Data:', userData);

  // Show loading animation
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.classList.add('active');

  // Redirect to home page after loading animation
  setTimeout(() => {
    // Play fade out sound effect first
    playFadeOutSound();

    // Navigate to home page after brief delay
    setTimeout(() => {
      goToPage('home');
      loadingOverlay.classList.add('fade-out');
    }, 100);

    // Wait for fade out animation to complete, then remove overlay and show toast
    setTimeout(() => {
      loadingOverlay.classList.remove('active', 'fade-out');
      showToast('Login successful! Welcome to EduTrack', 'success');
    }, 600); // Match the fadeOut animation duration + delay
  }, 2000);
}

// Function to play fade out sound effect
function playFadeOutSound() {
  try {
    const audio = new Audio('attached_assets/swoosh-riser-reverb-390309_1760884727578.mp3');
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  } catch (error) {
    console.log('Audio playback not supported:', error);
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select').forEach(select => {
      select.classList.remove('active');
      select.querySelector('.select-options').classList.remove('active');
    });
  }
});

function handleLogout() {
  // Wait for the button animation to finish (500ms)
  setTimeout(() => {
    // Show the custom logout modal
    const modal = document.getElementById('logoutModal');
    modal.classList.add('active');
  }, 500);
}

function confirmLogout() {
  // Hide modal
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('active');

  // Clear stored session data
  localStorage.removeItem('userSession');
  console.log('User logged out');

  // Redirect to welcome page
  setTimeout(() => {
    goToPage('welcome');
  }, 300);
}

function cancelLogout() {
  // Just hide the modal
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('active');
}

// Profile menu toggle
function toggleProfileMenu() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.classList.toggle('active');
}

// Open admin panel
function openAdminPanel() {
  // Get the base path from current URL (works for both local and GitHub Pages)
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  const adminUrl = basePath + 'admin.html';
  
  // Try opening in new tab first
  const adminWindow = window.open(adminUrl, '_blank');
  
  // If popup blocked or failed, navigate in same window
  if (!adminWindow || adminWindow.closed || typeof adminWindow.closed === 'undefined') {
    window.location.href = adminUrl;
  }
}

// Close profile menu when clicking outside
document.addEventListener('click', function(event) {
  const profileContainer = document.querySelector('.profile-container');
  const dropdown = document.getElementById('profileDropdown');

  if (dropdown && !profileContainer.contains(event.target)) {
    dropdown.classList.remove('active');
  }
});

// Session management
function checkUserSession() {
  const savedSession = localStorage.getItem('userSession');

  if (savedSession) {
    // User is logged in
    const userData = JSON.parse(savedSession);
    console.log('User session found:', userData);
    
    // Check if there's a hash in the URL (current page)
    const hash = window.location.hash.substring(1);
    
    // If there's a hash, navigate to that page (stay on current page after reload)
    // Otherwise, redirect to home page
    if (hash && hash !== 'login' && hash !== 'welcome') {
      goToPage(hash, false);
    } else if (!hash || hash === 'login' || hash === 'welcome') {
      // Only redirect to home if on login/welcome page or no page specified
      goToPage('home');
    }
  }
}

// Theme toggling functions
function toggleTheme() {
  const body = document.body;
  const checkbox = document.querySelector('.theme-switch__checkbox');
  const isDarkMode = checkbox.checked;

  if (isDarkMode) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }

  // Save preference to localStorage
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Use saved theme, or fall back to system preference
  const isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }

  // Update checkbox after a brief delay to ensure DOM is ready
  setTimeout(() => {
    const checkbox = document.querySelector('.theme-switch__checkbox');
    if (checkbox) {
      checkbox.checked = isDarkMode;
    }
  }, 100);
}

// Date and Time Utilities for Indian Standard Time (IST)
function getISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istTime = new Date(utcTime + istOffset);
  return istTime;
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatDate(date) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}

function getDayName(date, short = false) {
  const options = { weekday: short ? 'short' : 'long' };
  return date.toLocaleDateString('en-IN', options);
}

function updateLiveClock() {
  const clockElement = document.getElementById('live-clock');
  if (clockElement) {
    const istTime = getISTTime();
    const timeString = formatTime(istTime);
    const dateString = formatDate(istTime);
    const dayName = getDayName(istTime);

    clockElement.innerHTML = `
      <div class="clock-time">${timeString}</div>
      <div class="clock-date">${dayName}, ${dateString}</div>
    `;
  }
}

let selectedScheduleDay = null;

function updateWeekCalendar() {
  const weekSelector = document.querySelector('.week-selector');
  if (!weekSelector) return;

  const istTime = getISTTime();
  const currentDay = istTime.getDay();
  const currentDate = istTime.getDate();
  const currentMonth = istTime.getMonth();
  const currentYear = istTime.getFullYear();

  const monday = new Date(istTime);
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(currentDate - daysSinceMonday);

  weekSelector.innerHTML = '';

  const dayKeys = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = 0; i < 6; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);

    const isToday = day.getDate() === currentDate &&
                    day.getMonth() === currentMonth &&
                    day.getFullYear() === currentYear;
    const dayName = getDayName(day, true);
    const dayNumber = day.getDate();
    const dayKey = dayKeys[i];

    const dayItem = document.createElement('div');
    dayItem.className = `day-item ${isToday ? 'active' : ''}`;
    dayItem.setAttribute('data-day', dayKey);
    dayItem.setAttribute('data-date', day.toISOString().split('T')[0]); // Store actual date
    dayItem.innerHTML = `
      <span class="day-label">${dayName}</span>
      <span class="day-number">${dayNumber}</span>
    `;

    dayItem.addEventListener('click', function() {
      document.querySelectorAll('.day-item').forEach(item => {
        item.classList.remove('selected');
      });
      this.classList.add('selected');
      selectedScheduleDay = dayKey;
      const actualDate = this.getAttribute('data-date');
      loadTimelineSchedule(dayKey, actualDate);
    });

    weekSelector.appendChild(dayItem);
  }
}

function calculateTimeUntilClass(classHour, classMinute) {
  const istTime = getISTTime();
  const classTime = new Date(istTime);
  classTime.setHours(classHour, classMinute, 0, 0);

  if (classTime < istTime) {
    classTime.setDate(classTime.getDate() + 1);
  }

  const timeDiff = classTime - istTime;
  const minutes = Math.floor(timeDiff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes} Minutes`;
}

function updateNextClassCountdown() {
  const nextClassCard = document.querySelector('.next-class-card h2');
  const classTimeElement = document.querySelector('.class-time');

  if (nextClassCard && classTimeElement) {
    const classTime = '18:00';
    const [hours, minutes] = classTime.split(':').map(Number);
    const countdown = calculateTimeUntilClass(hours, minutes);

    nextClassCard.innerHTML = `Science Class In<br />${countdown}`;
    classTimeElement.textContent = classTime;
  }
}

function initDateTime() {
  updateLiveClock();
  updateWeekCalendar();
  updateNextClassCountdown();

  setInterval(() => {
    updateLiveClock();
    updateNextClassCountdown();
  }, 1000);

  setInterval(updateWeekCalendar, 60000);
}

async function checkIfHoliday(dayKey, dateOverride = null) {
  try {
    // Use provided date or calculate from week selector
    let targetDate;
    
    if (dateOverride) {
      targetDate = new Date(dateOverride);
    } else {
      const istTime = getISTTime();
      const currentDay = istTime.getDay();
      const currentDate = istTime.getDate();
      const currentMonth = istTime.getMonth();
      const currentYear = istTime.getFullYear();
      
      // Map day keys to day numbers (0 = Sunday, 1 = Monday, etc.)
      const dayKeyToNumber = {
        'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
      };
      
      const targetDayNumber = dayKeyToNumber[dayKey];
      
      // Calculate Monday of current week
      const monday = new Date(istTime);
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
      monday.setDate(currentDate - daysSinceMonday);
      
      // Calculate target date based on Monday
      const daysFromMonday = targetDayNumber - 1; // MON=1, so MON is 0 days from Monday
      targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + daysFromMonday);
    }
    
    // Normalize to midnight for proper comparison
    targetDate.setHours(0, 0, 0, 0);
    
    // Check Firebase for holidays
    const holidaysRef = database.ref('holidays');
    const snapshot = await holidaysRef.once('value');
    
    if (snapshot.exists()) {
      const holidays = snapshot.val();
      for (const holidayId in holidays) {
        const holiday = holidays[holidayId];
        const startDate = new Date(holiday.startDate);
        const endDate = new Date(holiday.endDate);
        
        // Normalize dates to midnight for accurate comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        // Check if target date falls within holiday range (inclusive)
        if (targetDate >= startDate && targetDate <= endDate) {
          return holiday;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking holidays:', error);
    return null;
  }
}

function checkCollegeEndedShownToday() {
  const today = new Date().toDateString();
  const lastShown = localStorage.getItem('collegeEndedModalDate');
  return lastShown === today;
}

function markCollegeEndedShownToday() {
  const today = new Date().toDateString();
  localStorage.setItem('collegeEndedModalDate', today);
}

function updateActiveLecture() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Helper function to parse time string to minutes
  const parseTimeToMinutes = (timeStr) => {
    const [timePart, period] = timeStr.trim().split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };
  
  // Remove active-now class from all cards
  document.querySelectorAll('.timeline-card').forEach(card => {
    card.classList.remove('active-now');
  });
  
  // Find and highlight the active lecture
  let activeCard = null;
  let lastLectureEndTime = 0;
  let lastLectureEndTimeStr = '';
  
  document.querySelectorAll('.timeline-card[data-time-range]').forEach(card => {
    const timeRange = card.getAttribute('data-time-range');
    if (!timeRange) return;
    
    const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    // Track the last lecture end time
    if (endMinutes > lastLectureEndTime) {
      lastLectureEndTime = endMinutes;
      lastLectureEndTimeStr = endTime;
    }
    
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      card.classList.add('active-now');
      activeCard = card;
    }
  });
  
  // Check if college day has ended and modal hasn't been shown today
  if (lastLectureEndTime > 0 && currentMinutes >= lastLectureEndTime && !checkCollegeEndedShownToday()) {
    showCollegeEndedModal(lastLectureEndTimeStr);
    markCollegeEndedShownToday();
  }
  
  // Scroll to active card if it exists and is not in viewport
  if (activeCard) {
    const cardRect = activeCard.getBoundingClientRect();
    const isInViewport = (
      cardRect.top >= 0 &&
      cardRect.bottom <= window.innerHeight
    );
    
    if (!isInViewport) {
      activeCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
  }
}

function showCollegeEndedModal(endTime) {
  const modal = document.getElementById('collegeEndedModal');
  const timeElement = document.getElementById('collegeEndedTime');
  
  if (modal && timeElement) {
    timeElement.textContent = `Ended at ${endTime}`;
    modal.classList.add('active');
  }
}

function closeCollegeEndedModal() {
  const modal = document.getElementById('collegeEndedModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

async function loadTimelineSchedule(dayKey, actualDate = null) {
  const userData = JSON.parse(localStorage.getItem('userSession'));
  if (!userData || !userData.division) return;

  const division = userData.division;

  // Initialize week calendar first
  updateWeekCalendar();

  // If no day specified, use current day
  if (!dayKey) {
    const today = new Date().getDay();
    dayKey = today === 1 ? 'MON' : today === 2 ? 'TUE' : today === 3 ? 'WED' :
             today === 4 ? 'THU' : today === 5 ? 'FRI' : today === 6 ? 'SAT' : 'MON';
  }

  selectedScheduleDay = dayKey;

  // Check if selected day is a holiday using actual date
  const isHoliday = await checkIfHoliday(dayKey, actualDate);
  if (isHoliday) {
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 80px; margin-bottom: 20px;">🎉</div>
          <h3 style="font-size: 28px; font-weight: 700; margin-bottom: 10px; color: var(--primary-green);">Holiday - ${isHoliday.name}</h3>
          <p style="font-size: 16px; color: var(--text-secondary);">No classes scheduled for this day. Enjoy your holiday!</p>
        </div>
        <button class="btn-timeline" onclick="goToPage('home')">← Back to Home</button>
      `;
      
      // Update selected day indicator
      document.querySelectorAll('.day-item').forEach(item => {
        if (item.getAttribute('data-day') === dayKey) {
          item.classList.add('selected');
        }
      });
    }
    return;
  }

  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  // Listen for real-time updates from Firebase - use admin panel's data structure
  const schedulesRef = database.ref(`divisions/${division}/schedules/${dayKey}`);
  const subjectsRef = database.ref(`divisions/${division}/subjects`);
  
  schedulesRef.on('value', async (scheduleSnapshot) => {
    if (!scheduleSnapshot.exists()) {
      timeline.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-primary);">
          <h3>No schedule available</h3>
          <p>Your schedule for ${dayKey} - Division ${division} will appear here once configured by admin.</p>
        </div>
        <button class="btn-timeline" onclick="goToPage('home')">← Back to Home</button>
      `;
      
      // Update selected day indicator
      document.querySelectorAll('.day-item').forEach(item => {
        if (item.getAttribute('data-day') === dayKey) {
          item.classList.add('selected');
        }
      });
      return;
    }

    // Get subjects data
    const subjectsSnapshot = await subjectsRef.once('value');
    const subjects = subjectsSnapshot.exists() ? subjectsSnapshot.val() : {};

    const schedules = scheduleSnapshot.val();
    
    // Function to convert 12-hour time to minutes for proper sorting
    const timeToMinutes = (timeStr) => {
      const time = timeStr.split('-')[0].trim(); // Get start time
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    };
    
    const schedulesArray = Object.values(schedules).sort((a, b) => 
      timeToMinutes(a.time) - timeToMinutes(b.time)
    );
    
    timeline.innerHTML = '';

    schedulesArray.forEach((classItem, index) => {
      const startTime = classItem.time.split('-')[0];
      const subject = subjects[classItem.subjectId] || { name: 'Unknown', teacher: 'Unknown' };

      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';

      const cardClass = classItem.type === 'green' ? 'green' : 
                        classItem.type === 'red' ? 'lunch-break' : '';

      timelineItem.innerHTML = `
        <div class="time-label">${startTime}</div>
        <div class="timeline-card ${cardClass}" data-time-range="${classItem.time}">
          <div class="timeline-time">${classItem.time}</div>
          <h4>${subject.name}</h4>
          <p>${subject.teacher}</p>
          <div class="timeline-check">✓</div>
        </div>
      `;

      timeline.appendChild(timelineItem);

      if (index < schedulesArray.length - 1) {
        const spacer = document.createElement('div');
        spacer.className = 'timeline-item';
        spacer.innerHTML = '<div class="time-label"></div><div class="timeline-spacer"></div>';
        timeline.appendChild(spacer);
      }
    });
    
    // Start tracking active lecture
    updateActiveLecture();
    if (window.activeLectureInterval) {
      clearInterval(window.activeLectureInterval);
    }
    window.activeLectureInterval = setInterval(updateActiveLecture, 30000); // Update every 30 seconds

    const backButton = document.createElement('button');
    backButton.className = 'btn-timeline';
    backButton.onclick = () => goToPage('home');
    backButton.textContent = '← Back to Home';
    timeline.appendChild(backButton);

    // Update selected day indicator
    document.querySelectorAll('.day-item').forEach(item => {
      if (item.getAttribute('data-day') === dayKey) {
        item.classList.add('selected');
      }
    });
  });
}

let currentMasterDay = 'MON';
let currentMasterDivision = null;

function handleMasterDayChange(dayKey) {
  const divisionScheduleView = document.getElementById('divisionScheduleView');
  
  if (divisionScheduleView && divisionScheduleView.style.display !== 'none' && currentMasterDivision) {
    // Don't add to history when just switching days in division view
    showDivisionSchedule(currentMasterDivision, dayKey, false);
  } else {
    // Don't add to history when just switching days in grid view
    loadMasterDivisionCards(dayKey, false);
  }
}

function loadMasterDivisionCards(dayKey = 'MON', addToHistory = true) {
  currentMasterDivision = null;
  const DIVISIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  const divisionsGrid = document.getElementById('divisionsGrid');
  const divisionScheduleView = document.getElementById('divisionScheduleView');
  const masterBackBtn = document.getElementById('masterBackBtn');
  const masterMainTitle = document.getElementById('masterMainTitle');
  const masterSubtitle = document.getElementById('masterSubtitle');
  
  if (!divisionsGrid) return;

  currentMasterDay = dayKey;

  document.querySelectorAll('.master-day-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-day') === dayKey) {
      btn.classList.add('active');
    }
  });

  divisionsGrid.style.display = 'grid';
  divisionScheduleView.style.display = 'none';

  masterBackBtn.onclick = () => goToPage('timeline');
  masterMainTitle.textContent = 'All Division Schedules';
  masterSubtitle.textContent = `Click a division to view ${getDayFullName(dayKey)} schedule`;

  let cardsHTML = '';
  DIVISIONS.forEach((division, index) => {
    cardsHTML += `
      <div class="division-card-item" onclick="showDivisionSchedule('${division}', '${dayKey}')">
        <div class="division-card-letter">${division}</div>
        <div class="division-card-label">Division ${division}</div>
        <div class="division-card-day">${getDayFullName(dayKey)}</div>
      </div>
    `;
  });

  divisionsGrid.innerHTML = cardsHTML;

  // Add to browser history for back button support
  if (addToHistory) {
    history.pushState({ 
      page: 'master-timetable',
      view: 'grid',
      day: dayKey
    }, '', `#master-timetable`);
  }
}

function getDayFullName(dayKey) {
  const dayNames = {
    'MON': 'Monday',
    'TUE': 'Tuesday',
    'WED': 'Wednesday',
    'THU': 'Thursday',
    'FRI': 'Friday',
    'SAT': 'Saturday'
  };
  return dayNames[dayKey] || dayKey;
}

async function showDivisionSchedule(division, dayKey, addToHistory = true) {
  const divisionsGrid = document.getElementById('divisionsGrid');
  const divisionScheduleView = document.getElementById('divisionScheduleView');
  const masterBackBtn = document.getElementById('masterBackBtn');
  const masterMainTitle = document.getElementById('masterMainTitle');
  const masterSubtitle = document.getElementById('masterSubtitle');
  
  if (!divisionScheduleView) return;

  currentMasterDivision = division;
  currentMasterDay = dayKey;

  document.querySelectorAll('.master-day-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-day') === dayKey) {
      btn.classList.add('active');
    }
  });

  divisionsGrid.style.display = 'none';
  divisionScheduleView.style.display = 'block';

  masterBackBtn.onclick = () => {
    // Use browser back to properly handle history
    history.back();
  };
  masterMainTitle.textContent = `Division ${division}`;
  masterSubtitle.textContent = `${getDayFullName(dayKey)} Schedule - View Only`;

  divisionScheduleView.innerHTML = '<div style="text-align: center; padding: 40px;"><h3>Loading schedule...</h3></div>';

  // Add to browser history for back button support
  if (addToHistory) {
    history.pushState({ 
      page: 'master-timetable',
      view: 'division',
      division: division,
      day: dayKey
    }, '', `#master-timetable`);
  }

  const timeToMinutes = (timeStr) => {
    const time = timeStr.split('-')[0].trim();
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  try {
    const schedulesRef = database.ref(`divisions/${division}/schedules/${dayKey}`);
    const subjectsRef = database.ref(`divisions/${division}/subjects`);
    
    const [scheduleSnapshot, subjectsSnapshot] = await Promise.all([
      schedulesRef.once('value'),
      subjectsRef.once('value')
    ]);

    const subjects = subjectsSnapshot.exists() ? subjectsSnapshot.val() : {};
    
    let scheduleHTML = '';

    if (scheduleSnapshot.exists()) {
      const schedules = scheduleSnapshot.val();
      const schedulesArray = Object.values(schedules).sort((a, b) => 
        timeToMinutes(a.time) - timeToMinutes(b.time)
      );

      for (const schedule of schedulesArray) {
        const subject = subjects[schedule.subjectId] || { name: 'Unknown', teacher: 'Unknown' };
        
        let colorClass = '';
        if (schedule.type === 'green') {
          colorClass = 'green';
        } else if (schedule.type === 'red') {
          colorClass = 'red';
        } else if (schedule.type === 'yellow') {
          colorClass = 'yellow';
        }

        scheduleHTML += `
          <div class="master-schedule-slot ${colorClass}">
            <div class="master-slot-time">${schedule.time}</div>
            <div class="master-slot-subject">${subject.name}</div>
            <div class="master-slot-teacher">👨‍🏫 ${subject.teacher}</div>
          </div>
        `;
      }
    } else {
      scheduleHTML = `
        <div class="division-empty-state">
          <p>No schedule available for Division ${division} on ${getDayFullName(dayKey)}</p>
        </div>
      `;
    }

    divisionScheduleView.innerHTML = scheduleHTML;
  } catch (error) {
    console.error(`Error loading schedule for division ${division}:`, error);
    divisionScheduleView.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--primary-red);"><h3>Error loading schedule</h3></div>';
  }
}

// Make functions globally accessible for onclick handlers
window.goToPage = goToPage;
window.showToast = showToast;
window.closeToast = closeToast;
window.showAlert = showAlert;
window.toggleDropdown = toggleDropdown;
window.selectOption = selectOption;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.confirmLogout = confirmLogout;
window.cancelLogout = cancelLogout;
window.toggleProfileMenu = toggleProfileMenu;
window.openAdminPanel = openAdminPanel;
window.toggleTheme = toggleTheme;
window.updateActiveLecture = updateActiveLecture;
window.loadMasterDivisionCards = loadMasterDivisionCards;
window.showDivisionSchedule = showDivisionSchedule;
window.getDayFullName = getDayFullName;
window.handleMasterDayChange = handleMasterDayChange;
window.showCollegeEndedModal = showCollegeEndedModal;
window.closeCollegeEndedModal = closeCollegeEndedModal;

// Notification functions
let noticesCache = [];
let shownNotices = new Set(JSON.parse(localStorage.getItem('shownNotices') || '[]'));

function toggleNotifications() {
  const dropdown = document.getElementById('notificationDropdown');
  const backdrop = document.getElementById('notificationBackdrop');
  const isOpen = dropdown.classList.contains('active');
  
  if (isOpen) {
    closeNotifications();
  } else {
    dropdown.classList.add('active');
    if (backdrop) {
      backdrop.classList.add('active');
    }
    
    // Add to history for Android back button support
    history.pushState({ notificationOpen: true }, '');
  }
  
  // Close profile dropdown if open
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown) {
    profileDropdown.classList.remove('active');
  }
}

function closeNotifications() {
  const dropdown = document.getElementById('notificationDropdown');
  const backdrop = document.getElementById('notificationBackdrop');
  
  if (dropdown) {
    dropdown.classList.remove('active');
  }
  if (backdrop) {
    backdrop.classList.remove('active');
  }
}

async function checkAndDisplayNotices() {
  try {
    const noticesRef = database.ref('notices');
    
    // Use on for real-time updates
    noticesRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const notices = snapshot.val();
        noticesCache = Object.values(notices).sort((a, b) => b.timestamp - a.timestamp);
        
        // Update notification badge
        const unreadCount = noticesCache.filter(n => n.priority === 'normal').length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
          if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
          } else {
            badge.style.display = 'none';
          }
        }
        
        // Show urgent/holiday popups for notices not yet shown
        noticesCache.forEach(notice => {
          if (!shownNotices.has(notice.id)) {
            if (notice.priority === 'urgent') {
              showUrgentNoticePopup(notice);
              shownNotices.add(notice.id);
            } else if (notice.priority === 'holiday') {
              showHolidayNoticePopup(notice);
              shownNotices.add(notice.id);
            }
          }
        });
        
        // Save shown notices to localStorage
        localStorage.setItem('shownNotices', JSON.stringify(Array.from(shownNotices)));
        
        // Update notification list
        updateNotificationsList();
      }
    });
  } catch (error) {
    console.error('Error checking notices:', error);
  }
}

function updateNotificationsList() {
  const notificationsList = document.getElementById('notificationsList');
  if (!notificationsList) return;
  
  const normalNotices = noticesCache.filter(n => n.priority === 'normal');
  
  if (normalNotices.length === 0) {
    notificationsList.innerHTML = `
      <div class="notification-empty">
        <p>No notifications</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  normalNotices.forEach(notice => {
    const date = new Date(notice.timestamp);
    const dateStr = date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    html += `
      <div class="notification-item" onclick="openNoticeDetail('${notice.id}')">
        <div class="notification-icon">📢</div>
        <div class="notification-content">
          <h5>${notice.title}</h5>
          <p>${notice.content.substring(0, 60)}${notice.content.length > 60 ? '...' : ''}</p>
          <span class="notification-time">${dateStr}</span>
        </div>
      </div>
    `;
  });
  
  notificationsList.innerHTML = html;
}

function showUrgentNoticePopup(notice) {
  const popup = document.getElementById('urgentNoticePopup');
  document.getElementById('urgentNoticeTitle').textContent = notice.title;
  document.getElementById('urgentNoticeContent').textContent = notice.content;
  
  const attachmentDiv = document.getElementById('urgentNoticeAttachment');
  if (notice.attachment) {
    attachmentDiv.innerHTML = `
      <a href="${notice.attachment.data}" download="${notice.attachment.name}" class="attachment-link">
        📎 ${notice.attachment.name}
      </a>
    `;
    attachmentDiv.style.display = 'block';
  } else {
    attachmentDiv.style.display = 'none';
  }
  
  popup.classList.add('active');
}

function showHolidayNoticePopup(notice) {
  const popup = document.getElementById('holidayNoticePopup');
  document.getElementById('holidayNoticeTitle').textContent = notice.title;
  document.getElementById('holidayNoticeContent').textContent = notice.content;
  
  const attachmentDiv = document.getElementById('holidayNoticeAttachment');
  if (notice.attachment) {
    attachmentDiv.innerHTML = `
      <a href="${notice.attachment.data}" download="${notice.attachment.name}" class="attachment-link">
        📎 ${notice.attachment.name}
      </a>
    `;
    attachmentDiv.style.display = 'block';
  } else {
    attachmentDiv.style.display = 'none';
  }
  
  popup.classList.add('active');
}

function closeUrgentNotice() {
  const popup = document.getElementById('urgentNoticePopup');
  popup.classList.remove('active');
}

function closeHolidayNotice() {
  const popup = document.getElementById('holidayNoticePopup');
  popup.classList.remove('active');
}

function openNoticeDetail(noticeId) {
  const notice = noticesCache.find(n => n.id === noticeId);
  if (!notice) return;
  
  if (notice.priority === 'normal') {
    showUrgentNoticePopup(notice); // Reuse urgent popup for detail view
  }
  
  toggleNotifications(); // Close dropdown
}

function markAllNoticesAsRead() {
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    badge.style.display = 'none';
  }
  showToast('All notifications marked as read', 'success');
}

window.toggleNotifications = toggleNotifications;
window.closeNotifications = closeNotifications;
window.closeUrgentNotice = closeUrgentNotice;
window.closeHolidayNotice = closeHolidayNotice;
window.markAllNoticesAsRead = markAllNoticesAsRead;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  checkUserSession();
  initDateTime();
  loadTimelineSchedule();
  checkAndDisplayNotices();
});

// Initialize immediately (in case DOMContentLoaded already fired)
if (document.readyState !== 'loading') {
  initTheme();
  checkUserSession();
  initDateTime();
  loadTimelineSchedule();
  checkAndDisplayNotices();
}

// Close notification dropdown when clicking outside
document.addEventListener('click', function(event) {
  const notificationBtn = document.querySelector('.notification-btn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  
  if (notificationDropdown && !notificationBtn?.contains(event.target) && !notificationDropdown.contains(event.target)) {
    closeNotifications();
  }
});
