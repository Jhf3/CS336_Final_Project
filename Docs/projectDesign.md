# Project Design
UI and Domain models in Docs on GitHub
## Pages
- Login
    - Input name
- Home
    - Show the days the DM can run a session
    - Button for to view past sessions
- Session Day
    - Page that contains all information about the given day.
    - What players are available that day, who can bring food/carpool
    - (if DM) button to view session notes
- Campaign History
    - List of all previous sessions
    - Section for DM campaign notes/timelines/routing
- Session Notes
    - List of notes left by the DM

## Components
- **Navbar** (Reusable header component)
    - Page title and subtitle
    - Login/Register button (top-right)
    - Configurable navigation buttons
    - See `TTRP_App/src/app/components/navbar/README.md` for usage guide
- **Session card**
    - date
    - Available players
    - Opens modal with detailed view on click
- **Detailed Session card**
    - date
    - Available players
    - snacks
    - carpool
    - (external availability)
    - notes (dm only)
    - Displays in modal popup (50vw width)
- **Session list**
    - Vertical scrollable list of session cards
    - Custom scrollbar styling
- **Note card**
    - session date
    - synopsis
    - Blue accent styling
- **Secret Note card**
    - DM-only secret notes
    - Dark theme with lock icon
    - Brown/gold color scheme

## No SQL Structure
- in no_sql.json

## Implementation Plan
1. Create session card component
2. Create detailed session card component
3. Create session list component
4. Create note/secret note card
5. Implement main page
6. Implement campaign history page
7. Implement notes page
8. Implement login page
9. Implement database/service
10. Styling

## Responsibilities
- Jacob
    - Set up data types
    - Start w/ firebase service
    - Implement pages using components

- Simon
    - Session card, detailed session card, session list, note/secret note card
    - Implement service into components
