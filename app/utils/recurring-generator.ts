/**
 * Recurring Transaction Generator
 * 
 * Automatically generates pending transactions from recurring templates
 * Runs on app load and checks for missed occurrences
 */

import { startOfDay, isBefore, isSameDay, isAfter, format } from 'date-fns'
import type { RecurringTransaction, TransactionInput } from '~/types/transaction'
import { calculateNextOccurrence, shouldGenerateOccurrence } from './recurrence'

interface GenerationResult {
  success: number
  failed: number
  skipped: number
  errors: Array<{ templateId: string; error: string }>
}

/**
 * Generate all pending transactions from active recurring templates
 * Called on app load or manually triggered
 */
export const generatePendingTransactions = async (
  recurringTransactions: RecurringTransaction[],
  transactionsStore: any,
  supabase: any,
  userId: string
): Promise<GenerationResult> => {
  const result: GenerationResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  const today = startOfDay(new Date())
  const activeTemplates = recurringTransactions.filter(
    t => t.isActive && t.autoCreate && !t.deletedAt
  )

  console.log(`[Generator] Processing ${activeTemplates.length} active recurring templates`)

  for (const template of activeTemplates) {
    try {
      const generated = await generateTransactionsForTemplate(
        template,
        today,
        transactionsStore,
        supabase,
        userId
      )
      
      result.success += generated.success
      result.skipped += generated.skipped
      result.failed += generated.failed
      
      if (generated.errors.length > 0) {
        result.errors.push(...generated.errors)
      }
    } catch (error: any) {
      console.error(`[Generator] Error processing template ${template.id}:`, error)
      result.failed++
      result.errors.push({
        templateId: template.id,
        error: error.message,
      })
    }
  }

  console.log('[Generator] Complete:', result)
  return result
}

/**
 * Generate transactions for a single recurring template
 * Limits to max 30 transactions per run to prevent excessive generation
 */
const generateTransactionsForTemplate = async (
  template: RecurringTransaction,
  toDate: Date,
  transactionsStore: any,
  supabase: any,
  userId: string
): Promise<GenerationResult> => {
  const result: GenerationResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  // Safety check: don't generate if next occurrence is in the future
  if (isAfter(template.nextOccurrenceDate, toDate)) {
    console.log(`[Generator] Template ${template.id}: Next occurrence is in future, skipping`)
    return result
  }

  // Check if should generate
  if (!shouldGenerateOccurrence(template, toDate)) {
    console.log(`[Generator] Template ${template.id}: Should not generate (inactive or limit reached)`)
    result.skipped++
    return result
  }

  const MAX_TRANSACTIONS_PER_RUN = 30
  let currentOccurrence = startOfDay(template.nextOccurrenceDate)
  let count = 0
  let lastGeneratedDate = template.lastGeneratedDate
    ? startOfDay(template.lastGeneratedDate)
    : null

  // Generate all missed occurrences up to today
  while (
    (isBefore(currentOccurrence, toDate) || isSameDay(currentOccurrence, toDate)) &&
    count < MAX_TRANSACTIONS_PER_RUN
  ) {
    // Check if already generated for this date
    const alreadyGenerated = await checkIfAlreadyGenerated(
      supabase,
      template.id,
      currentOccurrence
    )

    if (alreadyGenerated) {
      console.log(`[Generator] Template ${template.id}: Already generated for ${format(currentOccurrence, 'yyyy-MM-dd')}`)
      result.skipped++
    } else {
      // Generate transaction
      const success = await createTransactionFromTemplate(
        template,
        currentOccurrence,
        transactionsStore,
        supabase,
        userId
      )

      if (success) {
        result.success++
        lastGeneratedDate = currentOccurrence
      } else {
        result.failed++
        result.errors.push({
          templateId: template.id,
          error: `Failed to create transaction for ${format(currentOccurrence, 'yyyy-MM-dd')}`,
        })
      }
    }

    count++

    // Calculate next occurrence
    currentOccurrence = calculateNextOccurrence(
      template.frequency,
      template.interval,
      currentOccurrence,
      {
        weekdays: template.weekdays,
        monthlyType: template.monthlyType,
        monthlyDay: template.monthlyDay,
        monthlyWeekday: template.monthlyWeekday,
        monthlyWeekPosition: template.monthlyWeekPosition,
      }
    )

    // Check if reached end date
    if (template.endDate && isAfter(currentOccurrence, template.endDate)) {
      break
    }

    // Check if reached max occurrences
    if (
      template.maxOccurrences &&
      template.occurrencesGenerated + result.success >= template.maxOccurrences
    ) {
      break
    }
  }

  // Update template with new next_occurrence_date and occurrences_generated
  if (result.success > 0 || result.skipped > 0) {
    await updateTemplateAfterGeneration(
      supabase,
      template.id,
      currentOccurrence,
      lastGeneratedDate,
      template.occurrencesGenerated + result.success
    )
  }

  console.log(`[Generator] Template ${template.id}:`, result)
  return result
}

/**
 * Check if transaction already generated for specific occurrence date
 */
const checkIfAlreadyGenerated = async (
  supabase: any,
  recurringTransactionId: string,
  occurrenceDate: Date
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('generated_transactions')
    .select('id')
    .eq('recurring_transaction_id', recurringTransactionId)
    .eq('occurrence_date', format(occurrenceDate, 'yyyy-MM-dd'))
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is expected
    console.error('[Generator] Error checking for existing generation:', error)
  }

  return !!data
}

/**
 * Create transaction from recurring template
 */
const createTransactionFromTemplate = async (
  template: RecurringTransaction,
  occurrenceDate: Date,
  transactionsStore: any,
  supabase: any,
  userId: string
): Promise<boolean> => {
  try {
    // Skip if template has no valid category (shouldn't happen, but safety check)
    if (!template.categoryId) {
      console.warn(`[Generator] Template ${template.id} has no category, skipping`)
      return false
    }

    // Create transaction input
    const transactionInput: TransactionInput = {
      date: occurrenceDate,
      type: template.type,
      amount: template.amount,
      category: template.categoryId,
      description: template.description,
      tags: [],
      recurringTransactionId: template.id,
    }

    // Insert transaction using store
    const transaction = await transactionsStore.addTransaction(transactionInput)
    
    if (!transaction) {
      throw new Error('Failed to create transaction via store')
    }

    // Insert into generated_transactions junction table
    const { error: junctionError } = await supabase
      .from('generated_transactions')
      .insert({
        recurring_transaction_id: template.id,
        transaction_id: transaction.id,
        occurrence_date: format(occurrenceDate, 'yyyy-MM-dd'),
      })

    if (junctionError) {
      // If junction insert fails, we should delete the transaction
      console.error('[Generator] Failed to create junction record:', junctionError)
      await transactionsStore.deleteTransaction(transaction.id)
      throw junctionError
    }

    console.log(`[Generator] Created transaction ${transaction.id} from template ${template.id}`)
    return true
  } catch (error: any) {
    console.error('[Generator] Error creating transaction:', error)
    return false
  }
}

/**
 * Update recurring template after generation
 */
const updateTemplateAfterGeneration = async (
  supabase: any,
  templateId: string,
  nextOccurrence: Date,
  lastGeneratedDate: Date | null,
  occurrencesGenerated: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        next_occurrence_date: format(nextOccurrence, 'yyyy-MM-dd'),
        last_generated_date: lastGeneratedDate ? format(lastGeneratedDate, 'yyyy-MM-dd') : null,
        occurrences_generated: occurrencesGenerated,
      })
      .eq('id', templateId)

    if (error) {
      console.error('[Generator] Failed to update template:', error)
    } else {
      console.log(`[Generator] Updated template ${templateId}`)
    }
  } catch (error: any) {
    console.error('[Generator] Error updating template:', error)
  }
}

/**
 * Generate transactions for a specific date range (useful for backfilling)
 */
export const generateForDateRange = async (
  recurringTransactions: RecurringTransaction[],
  fromDate: Date,
  toDate: Date,
  transactionsStore: any,
  supabase: any,
  userId: string
): Promise<GenerationResult> => {
  const result: GenerationResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  // Similar to generatePendingTransactions but with custom date range
  // Implementation would be similar but with fromDate as start point
  console.log(`[Generator] Generating for date range: ${format(fromDate, 'yyyy-MM-dd')} to ${format(toDate, 'yyyy-MM-dd')}`)
  
  // For now, just call the main generation function
  return generatePendingTransactions(recurringTransactions, transactionsStore, supabase, userId)
}
