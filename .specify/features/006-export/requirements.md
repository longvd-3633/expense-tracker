# Feature 006: Export

## Overview
Export transactions data to CSV file for backup or external analysis.

## Functional Requirements

### Export Options
- Export all transactions or filtered results
- CSV format with columns: Date, Type, Amount, Category, Description
- Automatic filename: expense-tracker-export-YYYY-MM-DD.csv

### Data Formatting
- UTF-8 BOM encoding for Vietnamese text
- Plain number format for amounts (no separators)
- Configurable date format (YYYY-MM-DD or DD/MM/YYYY)

### User Interface
- Export button in transactions page
- Download starts automatically after click

## Non-Functional Requirements

### Performance
- Fast export for large datasets
- Memory efficient processing

### Compatibility
- Works across different browsers
- Proper file encoding

## Technical Implementation

### Components
- `ExportButton.vue`: Export trigger

### Utilities
- `utils/csv-export.ts`: CSV generation with PapaParse

### Browser API
- Blob and URL.createObjectURL for download

## Testing Requirements
- CSV format validation
- Encoding correctness
- Download functionality