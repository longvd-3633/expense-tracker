# Feature 007: Categories

## Overview
Management of transaction categories including default and custom categories.

## Functional Requirements

### Category List
- Display all categories (default + custom)
- Separate sections for income and expense categories

### Category Management
- Add new custom categories with name, type, color
- Edit existing custom categories
- Delete custom categories (prevent if in use)
- Color picker for category colors

### Validation
- Unique category names
- Required fields: name, type, color
- Prevent deletion of categories with transactions

## Non-Functional Requirements

### Usability
- Intuitive category creation/editing
- Clear visual distinction between default and custom

### Data Integrity
- Prevent orphaned transactions
- Consistent category references

## Technical Implementation

### Pages
- `pages/categories/index.vue`: Category management page

### Components
- `CategoryForm.vue`: Add/edit form
- `ColorPicker.vue`: Color selection

### Store
- `stores/categories.ts`: Category state management

## Testing Requirements
- CRUD operations for categories
- Validation rules
- Data integrity constraints