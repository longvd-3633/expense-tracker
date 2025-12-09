import type { ParseResult, ParsedRow } from '~/utils/csv-import'
import { parseCSVFile, detectDuplicates } from '~/utils/csv-import'
import type { TransactionInput } from '~/types/transaction'

export interface ImportResult {
  total: number
  success: number
  errors: number
  duplicatesSkipped: number
  errorMessages: string[]
}

export const useCSVImport = () => {
  const transactionsStore = useTransactionsStore()
  const categoriesStore = useCategoriesStore()

  const isImporting = ref(false)
  const importProgress = ref(0)
  const parseResult = ref<ParseResult | null>(null)

  /**
   * Parse CSV file and detect duplicates
   */
  const parseFile = async (file: File): Promise<ParseResult> => {
    // Parse CSV file
    const result = await parseCSVFile(file)

    if (result.success && result.validRows.length > 0) {
      // Detect duplicates against existing transactions
      const rowsWithDuplicates = detectDuplicates(
        result.validRows,
        transactionsStore.transactions
      )

      // Separate valid rows and duplicate rows
      const validRows = rowsWithDuplicates.filter(r => !r.isDuplicate)
      const duplicateRows = rowsWithDuplicates.filter(r => r.isDuplicate)

      parseResult.value = {
        ...result,
        validRows,
        duplicateRows
      }
    } else {
      parseResult.value = result
    }

    return parseResult.value
  }

  /**
   * Import transactions to database
   * @param rows Parsed rows to import
   * @param skipDuplicates Whether to skip duplicate rows (default: true)
   */
  const importTransactions = async (
    rows: ParsedRow[],
    skipDuplicates: boolean = true
  ): Promise<ImportResult> => {
    isImporting.value = true
    importProgress.value = 0

    // Filter rows based on skip duplicates option
    const rowsToImport = skipDuplicates
      ? rows.filter(r => !r.isDuplicate)
      : rows

    let successCount = 0
    let errorCount = 0
    let duplicatesSkipped = skipDuplicates
      ? rows.filter(r => r.isDuplicate).length
      : 0
    const errorMessages: string[] = []

    // Batch insert for better performance
    const BATCH_SIZE = 50
    const batches: ParsedRow[][] = []
    for (let i = 0; i < rowsToImport.length; i += BATCH_SIZE) {
      batches.push(rowsToImport.slice(i, i + BATCH_SIZE))
    }

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      if (!batch) continue

      // Process each row in batch
      for (const row of batch) {
        if (!row.parsed) {
          errorCount++
          errorMessages.push(`Dòng ${row.index + 2}: Dữ liệu không hợp lệ`)
          continue
        }

        try {
          // Map category name to ID (case-insensitive)
          const category = categoriesStore.categories.find(
            c => c.name.toLowerCase() === row.parsed!.category.toLowerCase()
          )

          if (!category) {
            errorCount++
            errorMessages.push(
              `Dòng ${row.index + 2}: Danh mục "${row.parsed.category}" không tồn tại`
            )
            continue
          }

          // Create transaction input
          const input: TransactionInput = {
            date: row.parsed.date.toISOString().split('T')[0] as any,
            type: row.parsed.type,
            amount: row.parsed.amount,
            category: category.id,
            description: row.parsed.description,
            tags: []
          }

          // Insert to database
          await transactionsStore.addTransaction(input)
          successCount++
        } catch (error: any) {
          errorCount++
          const errorMsg = error?.message || 'Lỗi không xác định'
          errorMessages.push(`Dòng ${row.index + 2}: ${errorMsg}`)
        }
      }

      // Update progress after each batch
      importProgress.value = Math.round(((batchIndex + 1) / batches.length) * 100)

      // Small delay between batches to prevent UI freeze
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }

    isImporting.value = false
    importProgress.value = 100

    return {
      total: rowsToImport.length,
      success: successCount,
      errors: errorCount,
      duplicatesSkipped,
      errorMessages
    }
  }

  /**
   * Reset import state
   */
  const reset = () => {
    parseResult.value = null
    isImporting.value = false
    importProgress.value = 0
  }

  return {
    // State
    isImporting: readonly(isImporting),
    importProgress: readonly(importProgress),
    parseResult: readonly(parseResult),

    // Methods
    parseFile,
    importTransactions,
    reset
  }
}
