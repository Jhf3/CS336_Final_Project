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
- Session card
    - date
    - Avaialable players
- Detailed Session card
    - date
    - Avaialable players
    - snacks
    - carpool
    - (external availability)
    - notes (dm only)
- Session list
    - List select session cards/detailed cards
- Note card
    - session date
    - synopsis
    - (maybe other things)
- Secret Note card
    - descriptive notes

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
