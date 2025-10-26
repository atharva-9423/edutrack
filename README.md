# EduTrack - College Lecture Tracker

## Overview

EduTrack is a bold, neubrutalism-styled student application designed to help college students track their lectures. The app features thick black borders, hard shadows, and vibrant colors, providing a striking visual identity. Built as a frontend-only application using vanilla HTML, CSS, and JavaScript, it features a welcome screen, home dashboard, ongoing courses section, and a learning timeline view. The project uses Vite as a development server with hot module reloading for a smooth development experience.

## Recent Changes

**October 26, 2025** - Added Master Timetable view with two-level navigation to view division schedules:
- Added calendar button in timeline page header that opens master timetable
- Created new master timetable page with two-level view system:
  - **Level 1**: Shows 17 clickable division cards (A-Q) for selected day
  - **Level 2**: Shows detailed schedule for clicked division
- Implemented day selector (Monday-Saturday) to switch between different days
- Division cards feature colorful neubrutalism design with unique emojis
- Click any division card to view its complete schedule for that day
- Back button navigation to return from schedule view to division cards
- Read-only view - users can only view schedules, not edit them
- Schedules are sorted chronologically by time
- Empty states shown for divisions without schedules
- Responsive grid layout with proper dark mode support

**October 20, 2025** - Complete redesign of admin panel with hierarchical division-based schedule management:
- Redesigned admin panel with division cards (A to Q) as main dashboard
- Implemented hierarchical structure: Division → Subjects → Schedules → Time Slots
- Added division detail page for managing subjects and teachers
- Created day selection interface with 6 day cards (Monday-Saturday)
- Built day schedule page with time slot management
- Added popup modals for adding subjects (name + teacher) and time slots (time + subject)
- Updated Firebase data structure to support nested hierarchy
- Schedules now automatically link subjects to their assigned teachers
- All admin pages follow neubrutalism design with colorful cards and bold shadows

**October 19, 2025** - Added real date and time functionality with Indian Standard Time (IST):
- Implemented IST timezone support (UTC+5:30) for accurate Indian time tracking
- Added live clock display in home page header showing current time in 12-hour format with AM/PM
- Profile icon moved to top left corner with live clock positioned next to it
- Dynamic week calendar on timeline page showing Monday to Saturday with real dates
- Week calendar automatically highlights today's date as active
- Real-time countdown for next class that updates every second
- All date/time displays use Indian locale formatting (en-IN)
- Auto-updating features refresh every second for time and every minute for calendar
- Timeline expanded to show full day schedule from 9:00 AM to 5:30 PM in 30-minute intervals
- Lunch break highlighted from 1:00 PM to 2:00 PM with distinct red styling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Vanilla JavaScript** - Core application logic and page navigation
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling with CSS variables, animations, and responsive design
- **Vite** - Development server with HMR (Hot Module Reload) for instant feedback

**Design Pattern:**
- Multi-page application (MPA) approach using page visibility toggling
- Pages are switched by adding/removing an `active` class rather than traditional routing
- All pages exist in a single HTML file with JavaScript controlling visibility

**Component Structure:**
- **Welcome Page** - Landing screen with animated floating tags and CTA
- **Home Dashboard** - Main interface showing next class, class statistics
- **Ongoing Courses** - Horizontal scrollable cards for active subjects
- **Learning Timeline** - Weekly calendar view with daily class schedule
- **Master Timetable** - Read-only view of all division schedules (A-Q) with day selector
- **Admin Panel** - Separate admin interface for schedule management
  - **Division Dashboard** - Grid of division cards (A to Q)
  - **Division Detail** - Subject and teacher management for a division
  - **Day Selection** - 6 day cards for schedule setup
  - **Day Schedule** - Time slot management for a specific day
  - **Modals** - Subject modal and time slot modal for data entry

**UI/UX Principles:**
- Mobile-first responsive design
- Neubrutalism design style with bold, high-contrast colors
- Thick black borders (4-5px) on all major elements
- Hard, opaque black shadows (no blur) with 6-8px offset
- Bold, oversized typography using Space Grotesk font family
- Simple geometric shapes and flat design (no gradients except for special elements)
- Emoji-based icons for simplicity
- Raw, unpolished aesthetic that prioritizes visual impact and functionality

**State Management:**
- Client-side only with no persistent storage
- Page state managed through DOM manipulation via class toggling
- Welcome page always shows on page load, navigation works in-session

**Styling Architecture:**
- CSS custom properties (variables) for consistent neubrutalism theming
- Color palette: Purple (#6C5CE7), Yellow (#FDCB6E), Green (#00B894), Red (#FF6B6B), Blue (#74B9FF), Black (#000000), White (#FFFFFF)
- Global reset for cross-browser consistency
- Animation system using keyframes for floating tags and hover effects
- Descriptive class naming for maintainability
- All interactive elements have bold shadow transitions on hover/active states

### External Dependencies

**Build Tools:**
- **Vite 5.4.8** - Modern frontend build tool and development server
  - Configured for host `0.0.0.0` on port 5000
  - HMR enabled by default for live reloading
  - No additional plugins currently configured

**Fonts:**
- **Google Fonts (Space Grotesk)** - Primary typeface loaded via CDN
  - Weights: 400 (regular), 500 (medium), 700 (bold)

**Planned Integrations (Not Yet Implemented):**
- Icon library (RemixIcons or Feather Icons recommended in specs)
- Potential backend API for class data storage
- Authentication system for multi-user support

**Database:**
- **Firebase Realtime Database** - Used for admin panel data persistence
  - Stores division data, subjects, teachers, and schedules
  - Hierarchical structure: divisions/{divisionId}/subjects and divisions/{divisionId}/schedules/{day}
  - Real-time updates when schedules are modified
  
**Admin Panel Data Structure:**
```
divisions/
  {A-Q}/
    subjects/
      {subjectId}/
        name: string
        teacher: string
        id: string
    schedules/
      {MON|TUE|WED|THU|FRI|SAT}/
        {slotId}/
          time: string (HH:MM format)
          subjectId: string (references subject)
          id: string
```

**Third-Party Services:**
- **Firebase** - Backend as a Service for admin data storage
  - Realtime Database for schedule and subject management
  - Simple authentication for admin access (username/password)
