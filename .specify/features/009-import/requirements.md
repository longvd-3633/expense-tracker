# Feature 009: Import

## Overview
Import transactions from CSV files for data migration or backup restoration.

## Functional Requirements

### File Import
- File picker for CSV selection
- Support standard CSV format
- Validate CSV structure before processing

### Data Preview
- Show preview of imported data
- Display potential issues or duplicates
- Allow user confirmation before import

### Import Process
- Handle duplicate detection (by date + amount + description)
- Skip invalid rows with error reporting
- Batch import with progress indication

### Success Feedback
- Success message with imported count
- Error summary for failed rows

## Non-Functional Requirements

### Data Integrity
- Validate all required fields
- Prevent duplicate imports
- Rollback on critical errors

### Performance
- Efficient processing for large files
- Memory management for big datasets

## Technical Implementation

### Components
- `ImportButton.vue`: Import trigger
- `ImportPreview.vue`: Data preview modal

### Utilities
- `utils/csv-import.ts`: CSV parsing with PapaParse

### Validation
- Zod schema for transaction validation

## Testing Requirements
- CSV parsing accuracy
- Duplicate detection
- Error handling for invalid data