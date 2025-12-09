# Implementation Plan: Import CSV Data (US8)

**Feature ID**: 005-import-csv  
**Version**: 1.0  
**Date**: December 9, 2025

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 3 + Vue 3 + TypeScript
- **CSV Parsing**: PapaParse (already installed)
- **Date Parsing**: date-fns (already installed)
- **Validation**: Zod (already installed)
- **State**: Pinia (transactionsStore, categoriesStore)

### Component Structure
```
app/components/organisms/
  ├── ImportButton.vue         # Main import button & file picker
  ├── ImportPreview.vue        # Preview modal with validation results
  └── ImportResults.vue        # Import results modal

app/composables/
  └── useCSVImport.ts          # Import logic & state management

app/utils/
  └── csv-import.ts            # CSV parsing & validation utilities
```

## Data Flow

### Import Flow
```
User clicks Import Button
  ↓
File Picker Dialog
  ↓
User selects CSV file
  ↓
Parse CSV with PapaParse
  ↓
Validate CSV structure (headers, delimiter)
  ↓
Validate each row (date, type, amount, category)
  ↓
Detect duplicates (date + amount + description)
  ↓
Show Preview Modal
  - File info
  - Summary stats
  - First 10 rows
  - Invalid rows count
  - Duplicate rows count
  ↓
User confirms import
  ↓
Batch insert to Supabase (50 rows per batch)
  - Map category names to IDs
  - Set userId to current user
  - Generate UUIDs
  - Set timestamps
  ↓
Show Results Modal
  - Success count
  - Skipped count
  - Error details
```

## Implementation Details

### 1. CSV Parsing (`app/utils/csv-import.ts`)

```typescript
import Papa from 'papaparse'
import { parse, isValid, parseISO } from 'date-fns'
import type { Transaction } from '~/types/transaction'

export interface CSVRow {
  date: string
  type: string
  amount: string
  category: string
  description: string
}

export interface ParsedRow {
  row: CSVRow
  index: number
  isValid: boolean
  errors: string[]
  isDuplicate: boolean
  parsed?: {
    date: Date
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
  }
}

export interface ParseResult {
  success: boolean
  fileName: string
  fileSize: number
  totalRows: number
  validRows: ParsedRow[]
  invalidRows: ParsedRow[]
  duplicateRows: ParsedRow[]
  errors: string[]
}

export const parseCSVFile = async (file: File): Promise<ParseResult> => {
  // Validate file type
  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    return {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['Vui lòng chọn file CSV']
    }
  }

  // Validate file size (5MB max)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return {
      success: false,
      fileName: file.name,
      fileSize: file.size,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['File quá lớn (max 5MB)']
    }
  }

  // Parse CSV
  return new Promise((resolve) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const parseResult = validateCSVData(results.data, file.name, file.size)
        resolve(parseResult)
      },
      error: (error) => {
        resolve({
          success: false,
          fileName: file.name,
          fileSize: file.size,
          totalRows: 0,
          validRows: [],
          invalidRows: [],
          duplicateRows: [],
          errors: [`Lỗi parse CSV: ${error.message}`]
        })
      }
    })
  })
}

const validateCSVData = (data: CSVRow[], fileName: string, fileSize: number): ParseResult => {
  // Check required columns
  if (data.length === 0) {
    return {
      success: false,
      fileName,
      fileSize,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['File CSV rỗng']
    }
  }

  const firstRow = data[0]
  const requiredColumns = ['date', 'type', 'amount', 'category', 'description']
  const actualColumns = Object.keys(firstRow).map(k => k.toLowerCase())
  const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col))

  if (missingColumns.length > 0) {
    return {
      success: false,
      fileName,
      fileSize,
      totalRows: data.length,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: [`Thiếu cột: ${missingColumns.join(', ')}`]
    }
  }

  // Validate each row
  const parsedRows: ParsedRow[] = data.map((row, index) => validateRow(row, index))
  
  const validRows = parsedRows.filter(r => r.isValid && !r.isDuplicate)
  const invalidRows = parsedRows.filter(r => !r.isValid)
  const duplicateRows = parsedRows.filter(r => r.isValid && r.isDuplicate)

  return {
    success: validRows.length > 0,
    fileName,
    fileSize,
    totalRows: data.length,
    validRows,
    invalidRows,
    duplicateRows,
    errors: invalidRows.length > 0 ? [`${invalidRows.length} dòng không hợp lệ`] : []
  }
}

const validateRow = (row: CSVRow, index: number): ParsedRow => {
  const errors: string[] = []
  let parsed: ParsedRow['parsed'] | undefined

  try {
    // Validate date
    const dateFormats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy']
    let parsedDate: Date | null = null
    
    for (const format of dateFormats) {
      const d = parse(row.date, format, new Date())
      if (isValid(d)) {
        parsedDate = d
        break
      }
    }
    
    if (!parsedDate) {
      errors.push('Ngày không hợp lệ')
    }

    // Validate type
    const typeValue = row.type.toLowerCase().trim()
    const typeMap: Record<string, 'income' | 'expense'> = {
      'income': 'income',
      'thu': 'income',
      'expense': 'expense',
      'chi': 'expense'
    }
    const parsedType = typeMap[typeValue]
    if (!parsedType) {
      errors.push('Loại giao dịch không hợp lệ')
    }

    // Validate amount
    const amountStr = row.amount.replace(/[,\.]/g, '')
    const parsedAmount = parseFloat(amountStr)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.push('Số tiền không hợp lệ')
    }

    // Category (will validate against store in component)
    const category = row.category?.trim()
    if (!category) {
      errors.push('Danh mục không được để trống')
    }

    if (errors.length === 0 && parsedDate && parsedType && parsedAmount && category) {
      parsed = {
        date: parsedDate,
        type: parsedType,
        amount: parsedAmount,
        category,
        description: row.description || ''
      }
    }
  } catch (error) {
    errors.push('Lỗi parse dữ liệu')
  }

  return {
    row,
    index,
    isValid: errors.length === 0,
    errors,
    isDuplicate: false, // Will be set in component after checking against existing transactions
    parsed
  }
}

export const detectDuplicates = (
  parsedRows: ParsedRow[],
  existingTransactions: Transaction[]
): ParsedRow[] => {
  return parsedRows.map(row => {
    if (!row.parsed) return row

    const isDuplicate = existingTransactions.some(t => {
      const sameDate = new Date(t.date).toISOString().split('T')[0] === 
                       row.parsed!.date.toISOString().split('T')[0]
      const sameAmount = t.amount === row.parsed!.amount
      const sameDescription = t.description.toLowerCase() === row.parsed!.description.toLowerCase()
      
      return sameDate && sameAmount && sameDescription
    })

    return {
      ...row,
      isDuplicate
    }
  })
}
```

### 2. Import Composable (`app/composables/useCSVImport.ts`)

```typescript
import type { ParseResult, ParsedRow } from '~/utils/csv-import'
import { parseCSVFile, detectDuplicates } from '~/utils/csv-import'
import type { TransactionInput } from '~/types/transaction'

export const useCSVImport = () => {
  const transactionsStore = useTransactionsStore()
  const categoriesStore = useCategoriesStore()

  const isImporting = ref(false)
  const importProgress = ref(0)
  const parseResult = ref<ParseResult | null>(null)

  const parseFile = async (file: File) => {
    const result = await parseCSVFile(file)
    
    if (result.success) {
      // Detect duplicates
      const rowsWithDuplicates = detectDuplicates(
        result.validRows,
        transactionsStore.transactions
      )
      
      parseResult.value = {
        ...result,
        validRows: rowsWithDuplicates.filter(r => !r.isDuplicate),
        duplicateRows: rowsWithDuplicates.filter(r => r.isDuplicate)
      }
    } else {
      parseResult.value = result
    }

    return parseResult.value
  }

  const importTransactions = async (
    rows: ParsedRow[],
    skipDuplicates: boolean = true
  ) => {
    isImporting.value = true
    importProgress.value = 0

    const rowsToImport = skipDuplicates 
      ? rows.filter(r => !r.isDuplicate)
      : rows

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Batch insert (50 rows per batch)
    const BATCH_SIZE = 50
    const batches = []
    for (let i = 0; i < rowsToImport.length; i += BATCH_SIZE) {
      batches.push(rowsToImport.slice(i, i + BATCH_SIZE))
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      
      for (const row of batch) {
        if (!row.parsed) continue

        try {
          // Map category name to ID
          const category = categoriesStore.categories.find(
            c => c.name.toLowerCase() === row.parsed!.category.toLowerCase()
          )
          
          if (!category) {
            errorCount++
            errors.push(`Dòng ${row.index + 2}: Danh mục "${row.parsed.category}" không tồn tại`)
            continue
          }

          // Create transaction
          const input: TransactionInput = {
            date: row.parsed.date.toISOString().split('T')[0],
            type: row.parsed.type,
            amount: row.parsed.amount,
            category: category.id,
            description: row.parsed.description,
            tags: []
          }

          await transactionsStore.createTransaction(input)
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`Dòng ${row.index + 2}: ${error}`)
        }
      }

      // Update progress
      importProgress.value = Math.round(((i + 1) / batches.length) * 100)
    }

    isImporting.value = false

    return {
      total: rowsToImport.length,
      success: successCount,
      errors: errorCount,
      errorMessages: errors
    }
  }

  const reset = () => {
    parseResult.value = null
    isImporting.value = false
    importProgress.value = 0
  }

  return {
    isImporting,
    importProgress,
    parseResult,
    parseFile,
    importTransactions,
    reset
  }
}
```

### 3. ImportButton Component

```vue
<script setup lang="ts">
const { parseFile, parseResult, reset } = useCSVImport()
const fileInputRef = ref<HTMLInputElement | null>(null)
const showPreview = ref(false)

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  const result = await parseFile(file)
  
  if (result.success) {
    showPreview.value = true
  } else {
    // Show error toast
    alert(result.errors.join('\n'))
  }

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleImportComplete = () => {
  showPreview.value = false
  reset()
}
</script>

<template>
  <div>
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".csv,text/csv"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Import button -->
    <button
      @click="openFilePicker"
      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span>Nhập CSV</span>
    </button>

    <!-- Preview modal -->
    <ImportPreview
      v-if="showPreview && parseResult"
      :parse-result="parseResult"
      @close="showPreview = false"
      @complete="handleImportComplete"
    />
  </div>
</template>
```

### 4. Database Schema (Already Exists)

```sql
-- transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category uuid references categories(id) not null,
  description text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS policies already enable user isolation
```

## Implementation Phases

### Phase 1: Core Utilities (T200-T205)
- ✅ T200: Create `csv-import.ts` utility
- ✅ T201: Implement `parseCSVFile` function
- ✅ T202: Implement `validateRow` function
- ✅ T203: Implement `detectDuplicates` function
- ✅ T204: Add date format parsing (multiple formats)
- ✅ T205: Add error messages mapping

### Phase 2: Import Composable (T206-T210)
- ✅ T206: Create `useCSVImport` composable
- ✅ T207: Implement `parseFile` method
- ✅ T208: Implement `importTransactions` method with batching
- ✅ T209: Add progress tracking
- ✅ T210: Add category name to ID mapping

### Phase 3: UI Components (T211-T218)
- ✅ T211: Create `ImportButton.vue` component
- ✅ T212: Add file picker functionality
- ✅ T213: Create `ImportPreview.vue` modal
- ✅ T214: Add data preview table (first 10 rows)
- ✅ T215: Add summary stats display
- ✅ T216: Add invalid rows indicator
- ✅ T217: Create `ImportResults.vue` modal
- ✅ T218: Add results summary display

### Phase 4: Integration (T219-T222)
- ✅ T219: Add ImportButton to transactions page
- ✅ T220: Connect to transactionsStore
- ✅ T221: Connect to categoriesStore
- ✅ T222: Add error handling and user feedback

### Phase 5: Testing & Polish (T223-T230)
- ✅ T223: Test with valid CSV (100 rows)
- ✅ T224: Test with invalid format
- ✅ T225: Test with duplicates
- ✅ T226: Test with mixed valid/invalid rows
- ✅ T227: Test with large file (1000+ rows)
- ✅ T228: Test with Vietnamese characters
- ✅ T229: Test with different date formats
- ✅ T230: Performance optimization (if needed)

## File Structure

```
specs/005-import-csv/
  ├── spec.md           # This specification
  ├── plan.md           # This implementation plan
  └── tasks.md          # Task breakdown

app/
  ├── components/
  │   └── organisms/
  │       ├── ImportButton.vue       # NEW
  │       ├── ImportPreview.vue      # NEW
  │       └── ImportResults.vue      # NEW
  ├── composables/
  │   └── useCSVImport.ts            # NEW
  ├── utils/
  │   └── csv-import.ts              # NEW
  └── pages/
      └── transactions/
          └── index.vue              # MODIFIED (add ImportButton)
```

## Risk Mitigation

### Performance Risks
- **Risk**: Large CSV files (1000+ rows) freeze UI
- **Mitigation**: Batch inserts (50 rows per batch), progress indicator, consider Web Worker for parsing

### Data Integrity Risks
- **Risk**: Partial import failure leaves inconsistent state
- **Mitigation**: Show detailed error report, allow retry of failed rows

### User Experience Risks
- **Risk**: User uploads wrong file format
- **Mitigation**: Clear validation messages, example CSV download link

### Security Risks
- **Risk**: CSV injection (formulas in description field)
- **Mitigation**: Sanitize all string fields, no formula execution

## Testing Strategy

### Unit Tests (Optional)
- `parseCSVFile` with various inputs
- `validateRow` edge cases
- `detectDuplicates` logic
- Date format parsing

### Manual Testing (Required)
- End-to-end import flow
- Error scenarios
- UI/UX validation
- Cross-browser testing

## Success Criteria

- ✅ User can import CSV file via UI
- ✅ Valid rows imported successfully
- ✅ Invalid rows skipped with clear errors
- ✅ Duplicates detected and skipped (optional)
- ✅ Import progress visible to user
- ✅ No data loss or corruption
- ✅ Performance acceptable (<5s for 100 rows)
