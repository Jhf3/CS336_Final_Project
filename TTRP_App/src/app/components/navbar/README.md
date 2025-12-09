# Navbar Component Documentation

## Overview
The `Navbar` component is a reusable header component that provides consistent navigation, page titles, and authentication UI across all pages in the TTRP App.

## Features
- Page title and subtitle display
- Login/Register button (positioned top-right)
- Configurable navigation buttons
- Support for disabled buttons with "Coming Soon" labels
- Consistent styling across all pages

## Usage

### Basic Import
First, import the component and types in your page component:

```typescript
import { Navbar, NavButton } from '../../components/navbar/navbar';
```

Add `Navbar` to your component's imports array:

```typescript
@Component({
  selector: 'app-your-page',
  imports: [CommonModule, Navbar, /* other imports */],
  templateUrl: './your-page.component.html',
  styleUrl: './your-page.component.css'
})
```

### Defining Navigation Buttons
Create a `navigationButtons` array in your component class:

```typescript
export class YourPageComponent {
  navigationButtons: NavButton[] = [
    { label: 'Home', route: '/', style: 'primary' },
    { label: 'Campaign History', route: '/campaign-history', style: 'secondary' },
    { label: 'Coming Soon Feature', route: '', disabled: true, style: 'primary' }
  ];
}
```

### Template Usage
Add the navbar component to your page template:

```html
<div class="your-page-container">
  <app-navbar 
    title="Your Page Title" 
    subtitle="Optional subtitle describing the page"
    [navigationButtons]="navigationButtons">
  </app-navbar>
  
  <!-- Rest of your page content -->
</div>
```

## NavButton Interface

```typescript
export interface NavButton {
  label: string;           // Button text
  route: string;           // Angular route path
  style?: 'primary' | 'secondary';  // Button style (default: 'primary')
  disabled?: boolean;      // If true, shows "Coming Soon" label
}
```

### Button Styles
- **primary**: Blue button (`#4a90e2`)
- **secondary**: Gray button (`#6c757d`)

## Input Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | Yes | Main heading displayed in the navbar |
| `subtitle` | string | No | Subheading text below the title (can be empty string) |
| `navigationButtons` | NavButton[] | Yes | Array of navigation button configurations |

## Examples

### Example 1: Home Page
```typescript
// home.component.ts
export class HomeComponent {
  navigationButtons: NavButton[] = [
    { label: 'Groups', route: '', disabled: true, style: 'primary' },
    { label: 'Campaign History', route: '/campaign-history', style: 'secondary' },
    { label: 'Debug', route: '/debug', style: 'secondary' }
  ];
}
```

```html
<!-- home.component.html -->
<div class="home-container">
  <app-navbar 
    title="Upcoming Sessions" 
    subtitle="Possible sessions for the next 1-2 weeks"
    [navigationButtons]="navigationButtons">
  </app-navbar>
  
  <main class="main-content">
    <!-- Your content here -->
  </main>
</div>
```

### Example 2: Campaign History Page
```typescript
// campaign-history.component.ts
export class CampaignHistoryComponent {
  navigationButtons: NavButton[] = [
    { label: 'Upcoming Sessions', route: '/', style: 'primary' }
  ];
}
```

```html
<!-- campaign-history.component.html -->
<div class="campaign-history-container">
  <app-navbar 
    title="Campaign History" 
    subtitle="All previous sessions and campaign progress"
    [navigationButtons]="navigationButtons">
  </app-navbar>
  
  <main class="main-content">
    <!-- Your content here -->
  </main>
</div>
```

### Example 3: Simple Page with No Subtitle
```typescript
// debug.component.ts
export class DebugComponent {
  navigationButtons: NavButton[] = [
    { label: '← Back to Home', route: '/', style: 'secondary' }
  ];
}
```

```html
<!-- debug.component.html -->
<div class="debug-container">
  <app-navbar 
    title="🛠️ Database Service Debug Console" 
    subtitle=""
    [navigationButtons]="navigationButtons">
  </app-navbar>
  
  <!-- Your content here -->
</div>
```

## Styling Guidelines

### Page Container CSS
Remove any header-related styles from your page CSS since they're now handled by the navbar component. You only need basic container styling:

```css
.your-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
```

### ❌ DO NOT Include These Styles in Page CSS
These are already defined in the navbar component:
- `.header`, `.top-nav`, `.header-actions`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-auth`
- `.coming-soon`, `.subtitle`
- Any button hover states or disabled states

## Best Practices

1. **Always provide a title**: Even if brief, every page should have a descriptive title
2. **Use subtitle for context**: Help users understand what the page shows
3. **Limit navigation buttons**: 2-4 buttons is ideal; too many clutters the interface
4. **Use disabled for future features**: Instead of removing buttons, mark them as disabled with `disabled: true`
5. **Consistent button styles**: Use `primary` for main actions, `secondary` for navigation
6. **Import path**: Use relative imports based on your page location (e.g., `../../components/navbar/navbar`)

## Login Button
The login/register button is **automatically included** in the navbar component and positioned in the top-right corner. You don't need to add it yourself - it appears on every page that uses the navbar.

## Troubleshooting

### Error: Can't bind to 'navigationButtons'
**Solution**: Make sure you've imported `Navbar` in your component's imports array.

### Navigation buttons not appearing
**Solution**: Check that your `navigationButtons` array is defined as a class property and is not empty.

### Styles not applying correctly
**Solution**: Remove any conflicting CSS from your page's stylesheet. The navbar handles all header styling internally.

### ngClass directive error
**Solution**: Make sure `CommonModule` is imported in the navbar component (this should already be done).

## Component Structure
```
navbar/
├── navbar.ts          # Component logic and NavButton interface
├── navbar.html        # Template with title, subtitle, and buttons
├── navbar.css         # All navbar styling
└── README.md          # This documentation
```

## Future Enhancements
- Make login button functional when authentication is implemented
- Add user profile dropdown when logged in
- Support for custom button icons
- Mobile responsive hamburger menu
- Breadcrumb navigation support
