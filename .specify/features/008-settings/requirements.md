# Feature 008: Settings

## Overview
User preferences and application settings customization.

## Functional Requirements

### Display Settings
- Currency: VND or USD (display only)
- Date format: DD/MM/YYYY or YYYY-MM-DD
- Number format: 1.000.000 or 1,000,000

### App Preferences
- Default view: Dashboard or Transactions
- Theme: Light/Dark mode

### Persistence
- Settings saved to localStorage
- Apply immediately on change

## Non-Functional Requirements

### Usability
- Clear setting categories
- Immediate preview of changes

### Performance
- Fast setting updates
- Minimal storage usage

## Technical Implementation

### Pages
- `app/pages/settings.vue`: Settings page

### Store
- `app/stores/settings.ts`: Settings state

### Composables
- `useFormatters.ts`: Formatting utilities using settings

## Testing Requirements
- Setting persistence
- Format application
- Theme switching