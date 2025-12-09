import Papa from 'papaparse'
import { parse, isValid } from 'date-fns'
import type { Transaction } from '~/types/transaction'

// CSV Row structure (raw from file)
export interface CSVRow {
  date: string
  type: string
  amount: string
  category: string
  description: string
}

// Parsed row with validation results
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

// Parse result containing all parse information
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

/**
 * Parse CSV file and validate structure
 */
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
      errors: ['File quá lớn (tối đa 5MB)']
    }
  }

  // Parse CSV with PapaParse
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
          errors: [`Lỗi đọc file CSV: ${error.message}`]
        })
      }
    })
  })
}

/**
 * Validate CSV data structure and required columns
 */
const validateCSVData = (data: CSVRow[], fileName: string, fileSize: number): ParseResult => {
  // Check empty file
  if (data.length === 0) {
    return {
      success: false,
      fileName,
      fileSize,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['File CSV không có dữ liệu']
    }
  }

  // Check required columns (case-insensitive)
  const firstRow = data[0]
  if (!firstRow) {
    return {
      success: false,
      fileName,
      fileSize,
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['File CSV không có dữ liệu hợp lệ']
    }
  }

  // Column mapping: support both English and Vietnamese column names
  const columnMapping: Record<string, string> = {
    // English names
    'date': 'date',
    'type': 'type',
    'amount': 'amount',
    'category': 'category',
    'description': 'description',
    // Vietnamese names (from export)
    'ngày': 'date',
    'loại': 'type',
    'số tiền': 'amount',
    'danh mục': 'category',
    'mô tả': 'description'
  }

  // Normalize column names
  const normalizedData = data.map(row => {
    const normalized: any = {}
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim()
      const mappedKey = columnMapping[normalizedKey]
      if (mappedKey) {
        normalized[mappedKey] = row[key as keyof CSVRow]
      }
    })
    return normalized as CSVRow
  })

  // Check if we have all required columns after normalization
  const firstNormalizedRow = normalizedData[0]
  if (!firstNormalizedRow) {
    return {
      success: false,
      fileName,
      fileSize,
      totalRows: data.length,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      errors: ['File CSV không có dữ liệu hợp lệ']
    }
  }

  const actualColumns = Object.keys(firstNormalizedRow)
  const requiredColumns = ['date', 'type', 'amount', 'category', 'description']
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
      errors: [`Thiếu cột bắt buộc: ${missingColumns.join(', ')}`]
    }
  }

  // Validate each row
  const parsedRows: ParsedRow[] = normalizedData.map((row, index) => validateRow(row, index))

  const validRows = parsedRows.filter(r => r.isValid && !r.isDuplicate)
  const invalidRows = parsedRows.filter(r => !r.isValid)
  const duplicateRows = parsedRows.filter(r => r.isValid && r.isDuplicate)

  return {
    success: validRows.length > 0 || (invalidRows.length === 0 && duplicateRows.length === 0),
    fileName,
    fileSize,
    totalRows: data.length,
    validRows,
    invalidRows,
    duplicateRows,
    errors: invalidRows.length > 0 ? [`${invalidRows.length} dòng dữ liệu không hợp lệ`] : []
  }
}

/**
 * Validate individual CSV row
 */
const validateRow = (row: CSVRow, index: number): ParsedRow => {
  const errors: string[] = []
  let parsed: ParsedRow['parsed'] | undefined

  try {
    // Validate date (support multiple formats)
    const dateFormats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'dd-MM-yyyy']
    let parsedDate: Date | null = null

    for (const format of dateFormats) {
      try {
        const d = parse(row.date.trim(), format, new Date())
        if (isValid(d)) {
          parsedDate = d
          break
        }
      } catch {
        // Try next format
      }
    }

    if (!parsedDate) {
      errors.push('Ngày không hợp lệ (định dạng: YYYY-MM-DD, DD/MM/YYYY hoặc DD-MM-YYYY)')
    }

    // Validate type (normalize to income/expense)
    const typeValue = row.type.toLowerCase().trim()
    const typeMap: Record<string, 'income' | 'expense'> = {
      'income': 'income',
      'thu': 'income',
      'expense': 'expense',
      'chi': 'expense'
    }
    const parsedType = typeMap[typeValue]
    if (!parsedType) {
      errors.push('Loại giao dịch không hợp lệ (chỉ chấp nhận: income, thu, expense, chi)')
    }

    // Validate amount (remove thousand separators, parse as float)
    const amountStr = row.amount.toString().trim().replace(/[,\.]/g, '')
    const parsedAmount = parseFloat(amountStr)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.push('Số tiền không hợp lệ (phải là số dương)')
    }

    // Validate category (non-empty)
    const category = row.category?.toString().trim()
    if (!category) {
      errors.push('Danh mục không được để trống')
    }

    // Description is optional
    const description = row.description?.toString().trim() || ''

    // If all validations passed, create parsed object
    if (errors.length === 0 && parsedDate && parsedType && parsedAmount && category) {
      parsed = {
        date: parsedDate,
        type: parsedType,
        amount: parsedAmount,
        category,
        description
      }
    }
  } catch (error) {
    errors.push('Lỗi xử lý dữ liệu')
  }

  return {
    row,
    index,
    isValid: errors.length === 0,
    errors,
    isDuplicate: false, // Will be set later in detectDuplicates
    parsed
  }
}

/**
 * Detect duplicate transactions
 * Duplicates are defined as: same date + same amount + same description (case-insensitive)
 */
export const detectDuplicates = (
  parsedRows: ParsedRow[],
  existingTransactions: Transaction[]
): ParsedRow[] => {
  return parsedRows.map(row => {
    if (!row.parsed) return row

    const isDuplicate = existingTransactions.some(t => {
      // Compare dates (date only, ignore time)
      const rowDate = row.parsed!.date.toISOString().split('T')[0]
      const txnDate = new Date(t.date).toISOString().split('T')[0]
      const sameDate = rowDate === txnDate

      // Compare amounts (exact match)
      const sameAmount = t.amount === row.parsed!.amount

      // Compare descriptions (case-insensitive, trimmed)
      const sameDescription = t.description.toLowerCase().trim() === 
                             row.parsed!.description.toLowerCase().trim()

      return sameDate && sameAmount && sameDescription
    })

    return {
      ...row,
      isDuplicate
    }
  })
}
