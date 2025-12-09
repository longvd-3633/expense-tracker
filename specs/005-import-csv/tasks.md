# Tasks: Import CSV Data (US8)

**Feature**: 005-import-csv  
**Status**: In Progress  
**Last Updated**: December 9, 2025

## Overview

Implementation tasks cho US8: Import CSV Data feature. Tasks được organize theo phases để ensure proper dependency management và testing coverage.

---

## Phase 1: Core Utilities (Setup)

### T200: Create csv-import.ts utility file
**Description**: Tạo file utility cho CSV parsing logic  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: None  
**Estimate**: 15 min  
**Status**: [X]

**Implementation**:
- Create file structure
- Import dependencies (papaparse, date-fns)
- Define TypeScript interfaces: CSVRow, ParsedRow, ParseResult
- Export placeholder functions

**Acceptance**:
- File exists with proper TypeScript types
- No compilation errors

---

### T201: Implement parseCSVFile function
**Description**: Core CSV parsing logic với PapaParse  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: T200  
**Estimate**: 30 min  
**Status**: [X]

**Implementation**:
```typescript
export const parseCSVFile = async (file: File): Promise<ParseResult> => {
  // Validate file type (.csv)
  // Validate file size (max 5MB)
  // Parse with PapaParse (header: true, encoding: UTF-8)
  // Call validateCSVData
  // Return ParseResult
}
```

**Acceptance**:
- Accepts .csv files only
- Rejects files > 5MB
- Returns ParseResult with success/errors
- Handles PapaParse errors gracefully

---

### T202: Implement validateRow function
**Description**: Validate individual CSV row data  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: T200  
**Estimate**: 45 min  
**Status**: [X]

**Implementation**:
```typescript
const validateRow = (row: CSVRow, index: number): ParsedRow => {
  // Validate date (multiple formats)
  // Validate type (income/thu/expense/chi)
  // Validate amount (positive number)
  // Validate category (non-empty)
  // Return ParsedRow with errors array
}
```

**Acceptance**:
- Date parsing supports YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
- Type normalization: thu→income, chi→expense
- Amount parses with/without thousand separators
- Returns clear error messages

---

### T203: Implement detectDuplicates function
**Description**: Detect duplicate transactions  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: T200  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
```typescript
export const detectDuplicates = (
  parsedRows: ParsedRow[],
  existingTransactions: Transaction[]
): ParsedRow[] => {
  // Compare by: date + amount + description (case-insensitive)
  // Mark isDuplicate = true for matches
  // Return updated ParsedRow array
}
```

**Acceptance**:
- Detects exact duplicates (date + amount + description)
- Case-insensitive description matching
- Preserves original row data

---

### T204: Implement validateCSVData function
**Description**: Validate CSV structure và required columns  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: T202  
**Estimate**: 25 min  
**Status**: [X]

**Implementation**:
```typescript
const validateCSVData = (
  data: CSVRow[],
  fileName: string,
  fileSize: number
): ParseResult => {
  // Check empty file
  // Check required columns: date, type, amount, category, description
  // Validate each row with validateRow
  // Separate valid/invalid rows
  // Return ParseResult
}
```

**Acceptance**:
- Checks for all required columns
- Returns error for missing columns
- Returns error for empty file
- Counts valid vs invalid rows

---

### T205: Add comprehensive error messages
**Description**: Vietnamese error messages cho validation  
**Files**: `app/utils/csv-import.ts`  
**Dependencies**: T201-T204  
**Estimate**: 15 min  
**Status**: [X]

**Implementation**:
- File validation errors
- Column validation errors
- Row validation errors
- All messages in Vietnamese
- User-friendly wording

**Acceptance**:
- All error messages in Vietnamese
- Clear and actionable
- No technical jargon

---

## Phase 2: Import Composable

### T206: Create useCSVImport composable
**Description**: Tạo composable cho import state management  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T200-T205  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Create file structure
- Define reactive state: isImporting, importProgress, parseResult
- Export placeholder methods: parseFile, importTransactions, reset

**Acceptance**:
- File exists with TypeScript types
- Reactive state defined
- No compilation errors

---

### T207: Implement parseFile method
**Description**: Parse CSV file và detect duplicates  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T206  
**Estimate**: 25 min  
**Status**: [X]

**Implementation**:
```typescript
const parseFile = async (file: File) => {
  // Call parseCSVFile from utils
  // Get existing transactions from store
  // Call detectDuplicates
  // Update parseResult ref
  // Return result
}
```

**Acceptance**:
- Calls csv-import utils correctly
- Detects duplicates against existing transactions
- Updates parseResult state
- Returns ParseResult

---

### T208: Implement importTransactions method
**Description**: Batch import transactions to Supabase  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T207  
**Estimate**: 45 min  
**Status**: [X]

**Implementation**:
```typescript
const importTransactions = async (
  rows: ParsedRow[],
  skipDuplicates: boolean = true
) => {
  // Filter duplicates if skipDuplicates = true
  // Batch rows (50 per batch)
  // For each row:
  //   - Map category name to ID
  //   - Create TransactionInput
  //   - Call transactionsStore.createTransaction
  //   - Update progress
  // Return import summary
}
```

**Acceptance**:
- Batches operations (50 rows per batch)
- Maps category names to IDs
- Calls transactionsStore.createTransaction
- Handles errors per row
- Returns success/error counts

---

### T209: Add progress tracking
**Description**: Real-time import progress updates  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T208  
**Estimate**: 15 min  
**Status**: [X]

**Implementation**:
- Update importProgress ref (0-100%)
- Calculate progress per batch
- Set isImporting flag
- Reset state after completion

**Acceptance**:
- importProgress updates in real-time
- Range: 0-100%
- isImporting flag accurate

---

### T210: Add category name mapping
**Description**: Map CSV category names to category IDs  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T208  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Access categoriesStore.categories
- Case-insensitive name matching
- Handle not found (use default category or skip)
- Track mapping errors

**Acceptance**:
- Case-insensitive matching works
- Missing categories logged as errors
- Falls back gracefully

---

## Phase 3: UI Components

### T211: Create ImportButton component
**Description**: Main import button với file picker  
**Files**: `app/components/organisms/ImportButton.vue`  
**Dependencies**: T206-T210  
**Estimate**: 30 min  
**Status**: [X]

**Implementation**:
```vue
<template>
  <div>
    <input ref="fileInputRef" type="file" accept=".csv" class="hidden" />
    <button @click="openFilePicker">
      <!-- Upload icon -->
      Nhập CSV
    </button>
    <ImportPreview v-if="showPreview" :parse-result="parseResult" />
  </div>
</template>
```

**Acceptance**:
- Button renders next to ExportButton
- Opens file picker on click
- Only accepts .csv files
- Shows loading state

---

### T212: Add file picker functionality
**Description**: Handle file selection và parsing  
**Files**: `app/components/organisms/ImportButton.vue`  
**Dependencies**: T211  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Handle file input change event
- Call useCSVImport().parseFile()
- Show error toast if parse fails
- Show preview modal if parse succeeds
- Reset file input after selection

**Acceptance**:
- File picker works
- Parse errors shown to user
- Success opens preview modal
- Can select multiple files sequentially

---

### T213: Create ImportPreview modal
**Description**: Preview modal với validation results  
**Files**: `app/components/organisms/ImportPreview.vue`  
**Dependencies**: T211  
**Estimate**: 60 min  
**Status**: [X]

**Implementation**:
```vue
<template>
  <Teleport to="body">
    <div class="modal">
      <!-- File info -->
      <!-- Summary stats -->
      <!-- Preview table (first 10 rows) -->
      <!-- Action buttons: Cancel, Import -->
    </div>
  </Teleport>
</template>
```

**Acceptance**:
- Modal overlay blocks background
- Shows file name, size
- Shows total/valid/invalid/duplicate counts
- Shows first 10 rows in table
- Cancel closes modal
- Import triggers import process

---

### T214: Add data preview table
**Description**: Table hiển thị first 10 rows  
**Files**: `app/components/organisms/ImportPreview.vue`  
**Dependencies**: T213  
**Estimate**: 30 min  
**Status**: [X]

**Implementation**:
- Table with columns: Ngày, Loại, Số tiền, Danh mục, Mô tả
- Show first 10 valid rows
- Mark invalid rows with red background
- Show error icon + tooltip for invalid rows
- Mark duplicate rows with yellow background

**Acceptance**:
- Shows max 10 rows
- Invalid rows visually distinct
- Duplicate rows visually distinct
- Tooltips show error details

---

### T215: Add summary stats display
**Description**: Display import statistics  
**Files**: `app/components/organisms/ImportPreview.vue`  
**Dependencies**: T213  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Total rows
- Valid rows (green)
- Invalid rows (red)
- Duplicate rows (yellow)
- Income count, Expense count
- Total amount summary

**Acceptance**:
- All stats calculated correctly
- Color-coded for clarity
- Formatted numbers (VND)

---

### T216: Add invalid rows indicator
**Description**: Show invalid rows với error details  
**Files**: `app/components/organisms/ImportPreview.vue`  
**Dependencies**: T214  
**Estimate**: 25 min  
**Status**: [X]

**Implementation**:
- Collapsible section: "Invalid Rows (X)"
- List invalid rows with:
  - Row number
  - Error messages
  - Raw data preview
- Option to download error report (CSV)

**Acceptance**:
- Shows all invalid rows
- Error messages clear
- Collapsible for better UX
- Can download error report

---

### T217: Create ImportResults modal
**Description**: Show import results after completion  
**Files**: `app/components/organisms/ImportResults.vue`  
**Dependencies**: T213  
**Estimate**: 30 min  
**Status**: [X]

**Implementation**:
```vue
<template>
  <Teleport to="body">
    <div class="modal">
      <!-- Success icon -->
      <!-- Summary: Total, Success, Skipped, Errors -->
      <!-- Error details (if any) -->
      <!-- Action: View Transactions button -->
    </div>
  </Teleport>
</template>
```

**Acceptance**:
- Shows after import completes
- Displays success/error counts
- Shows error details if any
- "View Transactions" navigates to list

---

### T218: Add results summary display
**Description**: Format và display import results  
**Files**: `app/components/organisms/ImportResults.vue`  
**Dependencies**: T217  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Total rows processed
- Successfully imported (green check)
- Skipped (invalid) (yellow warning)
- Skipped (duplicates) (blue info)
- Failed (red error)
- List of error messages

**Acceptance**:
- All stats accurate
- Visual icons for each stat
- Error messages actionable

---

## Phase 4: Integration

### T219: Add ImportButton to transactions page
**Description**: Integrate ImportButton into UI  
**Files**: `app/pages/transactions/index.vue`  
**Dependencies**: T211-T218  
**Estimate**: 15 min  
**Status**: [X]

**Implementation**:
- Import ImportButton component
- Add next to ExportButton in header
- Pass necessary props (if any)
- Test component renders

**Acceptance**:
- Button appears next to Export
- Styled consistently
- No layout issues

---

### T220: Connect to transactionsStore
**Description**: Use transactionsStore for import operations  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T219  
**Estimate**: 10 min  
**Status**: [X]

**Implementation**:
- Access transactionsStore in composable
- Call createTransaction for each import
- Handle store errors
- Verify transactions list updates

**Acceptance**:
- Transactions inserted to Supabase
- Store state updates automatically
- UI reflects new transactions

---

### T221: Connect to categoriesStore
**Description**: Use categoriesStore for category mapping  
**Files**: `app/composables/useCSVImport.ts`  
**Dependencies**: T219  
**Estimate**: 10 min  
**Status**: [X]

**Implementation**:
- Access categoriesStore.categories
- Map CSV category names to IDs
- Handle missing categories
- Log category mapping errors

**Acceptance**:
- Category mapping works
- Missing categories handled
- Error messages clear

---

### T222: Add error handling and user feedback
**Description**: Toast notifications cho errors và success  
**Files**: `app/components/organisms/*`  
**Dependencies**: T219-T221  
**Estimate**: 20 min  
**Status**: [X]

**Implementation**:
- Parse errors → Alert/toast
- Import errors → Show in results modal
- Success → Results modal
- Network errors → Retry option
- Generic error handler

**Acceptance**:
- All errors show user-friendly messages
- Success states visible
- No silent failures

---

## Phase 5: Testing & Polish

### T223: Test with valid CSV (100 rows)
**Description**: End-to-end test với valid data  
**Dependencies**: T219-T222  
**Estimate**: 20 min  
**Status**: [X]

**Test Steps**:
1. Create CSV với 100 valid transactions
2. Click Import button
3. Select file
4. Verify preview shows correct stats
5. Click Import
6. Verify progress updates
7. Verify results modal
8. Verify transactions in database

**Acceptance**:
- All 100 rows imported successfully
- No errors
- UI responsive
- Performance < 5 seconds

---

### T224: Test with invalid format
**Description**: Test error handling cho invalid CSV  
**Dependencies**: T223  
**Estimate**: 15 min  
**Status**: [X]

**Test Cases**:
- Missing columns (e.g., no 'date' column)
- Wrong delimiter (semicolon, tab)
- Empty file
- Corrupted file
- Non-CSV file (.txt, .xlsx)

**Acceptance**:
- Clear error messages
- No crashes
- User can retry with correct file

---

### T225: Test with duplicates
**Description**: Test duplicate detection  
**Dependencies**: T223  
**Estimate**: 15 min  
**Status**: [X]

**Test Steps**:
1. Create CSV với some duplicate transactions
2. Import file
3. Verify preview shows duplicate count
4. Verify duplicates skipped (default)
5. Test "Import All" option (if implemented)

**Acceptance**:
- Duplicates detected correctly
- Skip option works
- Import all option works (if exists)

---

### T226: Test with mixed valid/invalid rows
**Description**: Test partial success scenario  
**Dependencies**: T223  
**Estimate**: 20 min  
**Status**: [X]

**Test Steps**:
1. Create CSV với 50 valid + 50 invalid rows
2. Import file
3. Verify preview shows correct counts
4. Import
5. Verify results: 50 success, 50 skipped

**Acceptance**:
- Valid rows imported
- Invalid rows skipped
- Error details shown
- No data corruption

---

### T227: Test with large file (1000+ rows)
**Description**: Performance test với large dataset  
**Dependencies**: T223  
**Estimate**: 25 min  
**Status**: [X]

**Test Steps**:
1. Generate CSV với 1000 rows
2. Import file
3. Monitor performance
4. Verify progress updates smoothly
5. Verify all rows processed

**Acceptance**:
- Import completes in < 30 seconds
- Progress updates visible
- No UI freeze
- No memory issues

---

### T228: Test with Vietnamese characters
**Description**: Test UTF-8 encoding  
**Dependencies**: T223  
**Estimate**: 10 min  
**Status**: [X]

**Test Cases**:
- Category names: "Ăn uống", "Di chuyển"
- Descriptions: "Cà phê sáng", "Mua sắm tết"
- UTF-8 with BOM
- UTF-8 without BOM

**Acceptance**:
- Vietnamese characters display correctly
- No encoding errors
- Both BOM/no-BOM work

---

### T229: Test with different date formats
**Description**: Test date parsing flexibility  
**Dependencies**: T223  
**Estimate**: 15 min  
**Status**: [X]

**Test Cases**:
- YYYY-MM-DD (2025-12-01)
- DD/MM/YYYY (01/12/2025)
- DD-MM-YYYY (01-12-2025)
- Invalid dates (99/99/9999)

**Acceptance**:
- All valid formats parsed correctly
- Invalid dates rejected with clear error
- Date conversion accurate

---

### T230: Performance optimization (if needed)
**Description**: Optimize import performance  
**Dependencies**: T227  
**Estimate**: 30 min  
**Status**: [X]

**Optimization Areas**:
- Batch size tuning (test 25, 50, 100)
- Consider Web Worker for large files
- Debounce progress updates
- Optimize duplicate detection algorithm

**Acceptance**:
- Import 1000 rows < 20 seconds
- No UI freeze
- Memory usage reasonable

---

## Summary

**Total Tasks**: 31  
**Estimated Time**: ~10 hours  
**Completion**: 0/31 (0%)

### Phase Breakdown
- Phase 1 (Utilities): 6 tasks, ~2.5 hours
- Phase 2 (Composable): 5 tasks, ~2 hours
- Phase 3 (Components): 8 tasks, ~3.5 hours
- Phase 4 (Integration): 4 tasks, ~1 hour
- Phase 5 (Testing): 8 tasks, ~2.5 hours

### Dependencies
```
T200 → T201, T202, T203, T204 → T205
T205 → T206 → T207 → T208 → T209, T210
T210 → T211 → T212 → T213 → T214, T215, T216, T217 → T218
T218 → T219 → T220, T221 → T222
T222 → T223 → T224, T225, T226, T227, T228, T229 → T230
```

### Critical Path
T200 → T201 → T202 → T204 → T205 → T206 → T207 → T208 → T211 → T213 → T219 → T220 → T222 → T223 → T230

**Estimated Critical Path**: ~7 hours
