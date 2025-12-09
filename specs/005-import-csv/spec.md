# Feature Specification: Import CSV Data (US8)

**Feature ID**: 005-import-csv  
**Version**: 1.0  
**Date**: December 9, 2025  
**Status**: In Progress

## Overview

Implement CSV import functionality để cho phép users import bulk transactions từ CSV files. Feature này hỗ trợ data migration, backup restoration, và bulk data entry.

## User Story

**As a** user  
**I want to** import transactions từ CSV file  
**So that** tôi có thể migrate data từ hệ thống khác hoặc restore backup

## Acceptance Criteria

### AC1: File Upload Interface
- ✅ Import button hiển thị trên transactions page (next to Export button)
- ✅ Click button mở file picker dialog
- ✅ Chỉ accept CSV files (.csv, text/csv)
- ✅ File size limit: Maximum 5MB
- ✅ Loading indicator khi processing file

### AC2: CSV Format Validation
- ✅ Required columns: date, type, amount, category, description
- ✅ Column header detection (case-insensitive)
- ✅ Support both comma và semicolon delimiters
- ✅ Support UTF-8 với hoặc không BOM
- ✅ Validate format trước khi parse full file
- ✅ Error message nếu format invalid:
  - Missing required columns
  - Invalid delimiter
  - Encoding issues
  - Corrupted file

### AC3: Data Preview Modal
- ✅ Show preview modal sau khi file validated
- ✅ Display:
  - File name và size
  - Total rows detected
  - First 10 rows preview (table format)
  - Data summary: Income count, Expense count, Total amount
- ✅ Action buttons:
  - Cancel (close modal, discard import)
  - Import (proceed with import)

### AC4: Data Validation & Parsing
- ✅ Validate mỗi row:
  - date: Valid date format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
  - type: Must be 'income', 'thu', 'expense', 'chi' (case-insensitive)
  - amount: Valid positive number
  - category: Must match existing category name
  - description: Optional, any string
- ✅ Invalid rows:
  - Mark với error indicator
  - Show error message (e.g., "Invalid date format")
  - Skip invalid rows during import
  - Track count of skipped rows

### AC5: Duplicate Detection
- ✅ Detect duplicates based on:
  - Same date (exact match)
  - Same amount (exact match)
  - Same description (exact match, case-insensitive)
- ✅ Duplicate handling options:
  - Skip duplicates (default)
  - Import all (create duplicates)
- ✅ Show duplicate count in preview

### AC6: Import Execution
- ✅ Progress indicator during import:
  - Progress bar (0-100%)
  - "Importing X of Y transactions..."
- ✅ Batch insert to Supabase (chunks of 50 rows)
- ✅ Transaction IDs auto-generated (UUID)
- ✅ userId auto-set to current user
- ✅ createdAt, updatedAt auto-set to now
- ✅ Category mapping:
  - Match by category name (case-insensitive)
  - If not found, use default category based on type

### AC7: Import Results
- ✅ Success modal sau khi import xong:
  - Total rows in file: X
  - Successfully imported: Y
  - Skipped (invalid): Z
  - Skipped (duplicates): W
  - Action: "View Transactions" button → Close modal, navigate to transactions list
- ✅ Error handling:
  - Network error → Retry option
  - Supabase error → Show error message
  - Partial success → Show summary với errors

### AC8: Error Handling
- ✅ File too large → "File quá lớn (max 5MB)"
- ✅ Invalid file type → "Vui lòng chọn file CSV"
- ✅ Invalid CSV format → "File không đúng định dạng CSV. Vui lòng kiểm tra file."
- ✅ No valid rows → "Không tìm thấy dữ liệu hợp lệ trong file"
- ✅ Network error → "Lỗi kết nối. Vui lòng thử lại."
- ✅ All rows failed → Show detailed error report

## CSV Format Specification

### Expected Columns
```
date,type,amount,category,description
```

### Example CSV
```csv
date,type,amount,category,description
2025-12-01,expense,50000,Ăn uống,Cà phê sáng
2025-12-01,income,5000000,Lương,Lương tháng 12
2025-12-02,expense,150000,Di chuyển,Grab về nhà
```

### Supported Date Formats
- `YYYY-MM-DD` (2025-12-01)
- `DD/MM/YYYY` (01/12/2025)
- `DD-MM-YYYY` (01-12-2025)

### Type Values (Case-Insensitive)
- Income: `income`, `thu`
- Expense: `expense`, `chi`

### Amount Format
- Plain number: `50000`
- With thousand separator: `50,000` or `50.000`
- With decimal: `50000.50` or `50000,50`

## Technical Requirements

### Components
- `app/components/organisms/ImportButton.vue` - Main import button
- `app/components/organisms/ImportPreview.vue` - Preview modal
- `app/components/organisms/ImportResults.vue` - Results modal

### Utilities
- `app/utils/csv-import.ts` - CSV parsing and validation logic
- `app/composables/useCSVImport.ts` - Import state management

### Dependencies
- `papaparse` - Already installed for CSV export
- `date-fns` - Already installed for date parsing
- `zod` - Already installed for schema validation

### State Management
- No new Pinia store needed
- Use existing transactionsStore for insert operations
- Local component state for import flow

### API Integration
- Use `transactionsStore.createTransaction()` for individual inserts
- Batch operations for performance
- Error recovery for partial failures

## Non-Functional Requirements

### Performance
- Parse CSV file < 1 second for files < 1MB
- Import 100 rows < 2 seconds
- No UI freeze during import (use Web Worker if needed)

### Security
- Validate file type on client-side
- Sanitize CSV content to prevent XSS
- No server-side file upload (client-side parsing only)
- Respect RLS policies (userId filtering)

### Accessibility
- File picker keyboard accessible
- Screen reader announcements for progress
- Focus management in modals
- ARIA labels for all interactive elements

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing Requirements

### Manual Testing
- Test với valid CSV file (10-100 rows)
- Test với invalid formats (missing columns, wrong delimiter)
- Test với duplicate data
- Test với mixed valid/invalid rows
- Test với large file (1000+ rows)
- Test với special characters (Vietnamese, emoji)
- Test với different date formats
- Test network errors (throttle to Slow 3G)

### Edge Cases
- Empty CSV file
- Only header row
- Header row missing
- Mixed delimiters
- UTF-8 with BOM
- Latin-1 encoding
- Quoted fields with commas
- Line breaks in description

## Dependencies

### Must Exist Before Implementation
- ✅ Transaction model (`app/types/transaction.ts`)
- ✅ Category model (`app/types/category.ts`)
- ✅ transactionsStore with createTransaction method
- ✅ categoriesStore with categories list
- ✅ Supabase integration working

### Can Be Implemented in Parallel
- ExportButton (already exists)
- FilterBar (already exists)

## Success Metrics

- Import success rate > 95% for valid CSV files
- Import errors clearly communicated (100% of errors shown)
- Average import time < 5 seconds for 100 rows
- Zero data loss during import
- User satisfaction: Can import data from external sources

## Out of Scope

- Import from other formats (JSON, Excel, XML)
- Import images or attachments
- Import recurring transactions
- Import tags (column not in MVP)
- Import custom categories (use existing categories only)
- Scheduled imports
- Import from URL
- Import history tracking

## Future Enhancements (Post-MVP)

- Support Excel files (.xlsx)
- Advanced duplicate detection (fuzzy matching)
- Import mapping UI (map CSV columns to fields)
- Import templates (save column mappings)
- Import validation preview (show all errors before import)
- Undo import operation
- Import from Google Sheets API
- Import progress saved (resume on error)
