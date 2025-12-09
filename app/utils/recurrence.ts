/**
 * Recurrence Calculation Utilities
 * 
 * Handles complex date calculations for recurring transactions:
 * - Daily, weekly, monthly, yearly patterns
 * - Edge cases: month-end dates, leap years, DST
 * - Weekday-based monthly recurrence (e.g., "2nd Monday")
 */

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  isBefore,
  isAfter,
  isSameDay,
  getDay,
  getDaysInMonth,
  setDate,
  getDate,
  isLeapYear,
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from 'date-fns'
import type { RecurrenceFrequency, MonthlyType } from '~/types/transaction'

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate next occurrence date from a given date
 * Handles all frequency types with interval support
 */
export const calculateNextOccurrence = (
  frequency: RecurrenceFrequency,
  interval: number,
  fromDate: Date,
  options?: {
    weekdays?: number[]
    monthlyType?: MonthlyType
    monthlyDay?: number
    monthlyWeekday?: number
    monthlyWeekPosition?: number
  }
): Date => {
  const date = startOfDay(fromDate)
  
  switch (frequency) {
    case 'daily':
      return calculateNextDaily(date, interval)
    
    case 'weekly':
      return calculateNextWeekly(date, interval, options?.weekdays || [])
    
    case 'monthly':
      return calculateNextMonthly(date, interval, options)
    
    case 'yearly':
      return calculateNextYearly(date, interval)
    
    default:
      throw new Error(`Unknown frequency: ${frequency}`)
  }
}

/**
 * Calculate next daily occurrence
 */
const calculateNextDaily = (fromDate: Date, interval: number): Date => {
  return addDays(fromDate, interval)
}

/**
 * Calculate next weekly occurrence
 * Handles multiple weekdays (e.g., every Monday and Wednesday)
 */
const calculateNextWeekly = (
  fromDate: Date,
  interval: number,
  weekdays: number[]
): Date => {
  if (!weekdays || weekdays.length === 0) {
    throw new Error('Weekdays required for weekly recurrence')
  }
  
  // Sort weekdays for easier calculation
  const sortedWeekdays = [...weekdays].sort((a, b) => a - b)
  const currentWeekday = getDay(fromDate)
  
  // Find next weekday in current week
  const nextWeekdayInWeek = sortedWeekdays.find(day => day > currentWeekday)
  
  if (nextWeekdayInWeek !== undefined) {
    // Next occurrence is in the same week
    const daysUntil = nextWeekdayInWeek - currentWeekday
    return addDays(fromDate, daysUntil)
  } else {
    // Next occurrence is in next interval week
    const weeksToAdd = interval
    const nextWeekStart = addWeeks(fromDate, weeksToAdd)
    const firstWeekday = sortedWeekdays[0]
    if (firstWeekday === undefined) {
      throw new Error('Weekly recurrence must have at least one weekday selected')
    }
    const daysUntilFirstWeekday = (firstWeekday - getDay(nextWeekStart) + 7) % 7
    return addDays(nextWeekStart, daysUntilFirstWeekday)
  }
}

/**
 * Calculate next monthly occurrence
 * Handles both by-date and by-weekday patterns
 */
const calculateNextMonthly = (
  fromDate: Date,
  interval: number,
  options?: {
    monthlyType?: MonthlyType
    monthlyDay?: number
    monthlyWeekday?: number
    monthlyWeekPosition?: number
  }
): Date => {
  if (!options?.monthlyType) {
    throw new Error('Monthly type required for monthly recurrence')
  }
  
  if (options.monthlyType === 'by_date') {
    return calculateNextMonthlyByDate(fromDate, interval, options.monthlyDay || 1)
  } else {
    return calculateNextMonthlyByWeekday(
      fromDate,
      interval,
      options.monthlyWeekday || 0,
      options.monthlyWeekPosition || 1
    )
  }
}

/**
 * Calculate next monthly occurrence by date (e.g., 15th of every month)
 * Handles month-end edge cases (Jan 31 → Feb 28/29)
 */
const calculateNextMonthlyByDate = (
  fromDate: Date,
  interval: number,
  dayOfMonth: number
): Date => {
  let nextMonth = addMonths(fromDate, interval)
  const daysInNextMonth = getDaysInMonth(nextMonth)
  
  // Handle month-end edge case
  // If target day > days in month, use last day of month
  const targetDay = Math.min(dayOfMonth, daysInNextMonth)
  
  return setDate(nextMonth, targetDay)
}

/**
 * Calculate next monthly occurrence by weekday
 * E.g., "2nd Monday of every month"
 */
const calculateNextMonthlyByWeekday = (
  fromDate: Date,
  interval: number,
  weekday: number, // 0=Sunday, 1=Monday, ..., 6=Saturday
  weekPosition: number // 1=first, 2=second, 3=third, 4=fourth, 5=last
): Date => {
  let nextMonth = addMonths(fromDate, interval)
  return getWeekdayInMonth(nextMonth, weekday, weekPosition)
}

/**
 * Calculate next yearly occurrence
 * Handles leap year edge case (Feb 29)
 */
const calculateNextYearly = (fromDate: Date, interval: number): Date => {
  const nextYear = addYears(fromDate, interval)
  const month = fromDate.getMonth()
  const day = fromDate.getDate()
  
  // Handle Feb 29 in non-leap years
  if (month === 1 && day === 29 && !isLeapYear(nextYear)) {
    // Move to Feb 28 in non-leap year
    return new Date(nextYear.getFullYear(), 1, 28)
  }
  
  return nextYear
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get specific weekday in a month
 * E.g., "2nd Monday" or "last Friday"
 */
export const getWeekdayInMonth = (
  date: Date,
  weekday: number, // 0=Sunday, ..., 6=Saturday
  position: number // 1=first, 2=second, ..., 5=last
): Date => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  if (position === 5) {
    // Last occurrence: start from end of month and work backwards
    const lastDay = getDaysInMonth(date)
    let checkDate = new Date(year, month, lastDay)
    
    while (getDay(checkDate) !== weekday) {
      checkDate = addDays(checkDate, -1)
    }
    
    return checkDate
  } else {
    // First, second, third, fourth occurrence
    let checkDate = new Date(year, month, 1)
    let count = 0
    
    while (count < position) {
      if (getDay(checkDate) === weekday) {
        count++
        if (count === position) {
          return checkDate
        }
      }
      checkDate = addDays(checkDate, 1)
      
      // Safety check: don't go beyond current month
      if (checkDate.getMonth() !== month) {
        throw new Error(`${position}th ${weekday} does not exist in this month`)
      }
    }
    
    throw new Error('Failed to calculate weekday in month')
  }
}

/**
 * Handle month-end dates when adding months
 * E.g., Jan 31 + 1 month = Feb 28 (or 29 in leap year)
 */
export const handleMonthEnd = (date: Date, targetDay: number): Date => {
  const daysInMonth = getDaysInMonth(date)
  const actualDay = Math.min(targetDay, daysInMonth)
  return setDate(date, actualDay)
}

// ============================================================================
// OCCURRENCE CALCULATION
// ============================================================================

/**
 * Calculate all occurrence dates between start and end
 * Used for previewing upcoming occurrences
 */
export const calculateOccurrencesBetween = (
  pattern: {
    frequency: RecurrenceFrequency
    interval: number
    startDate: Date
    endDate: Date | null
    weekdays?: number[]
    monthlyType?: MonthlyType
    monthlyDay?: number
    monthlyWeekday?: number
    monthlyWeekPosition?: number
    maxOccurrences?: number | null
  },
  fromDate: Date,
  toDate: Date
): Date[] => {
  const occurrences: Date[] = []
  let current = startOfDay(fromDate)
  const end = startOfDay(toDate)
  const patternEnd = pattern.endDate ? startOfDay(pattern.endDate) : null
  
  // Ensure we start from pattern start date
  if (isBefore(current, pattern.startDate)) {
    current = startOfDay(pattern.startDate)
  }
  
  let count = 0
  const maxCount = pattern.maxOccurrences || Infinity
  
  while ((isBefore(current, end) || isSameDay(current, end)) && count < maxCount) {
    // Check if past pattern end date
    if (patternEnd && isAfter(current, patternEnd)) {
      break
    }
    
    occurrences.push(new Date(current))
    count++
    
    // Calculate next occurrence
    current = calculateNextOccurrence(
      pattern.frequency,
      pattern.interval,
      current,
      {
        weekdays: pattern.weekdays,
        monthlyType: pattern.monthlyType,
        monthlyDay: pattern.monthlyDay,
        monthlyWeekday: pattern.monthlyWeekday,
        monthlyWeekPosition: pattern.monthlyWeekPosition,
      }
    )
  }
  
  return occurrences
}

/**
 * Check if should generate transaction for a pattern on a given date
 */
export const shouldGenerateOccurrence = (
  pattern: {
    frequency: RecurrenceFrequency
    interval: number
    startDate: Date
    endDate: Date | null
    isActive: boolean
    autoCreate: boolean
    maxOccurrences?: number | null
    occurrencesGenerated?: number
  },
  date: Date
): boolean => {
  const checkDate = startOfDay(date)
  
  // Check if pattern is active and auto-create enabled
  if (!pattern.isActive || !pattern.autoCreate) {
    return false
  }
  
  // Check if within date range
  if (isBefore(checkDate, startOfDay(pattern.startDate))) {
    return false
  }
  
  if (pattern.endDate && isAfter(checkDate, startOfDay(pattern.endDate))) {
    return false
  }
  
  // Check if max occurrences reached
  if (
    pattern.maxOccurrences &&
    pattern.occurrencesGenerated &&
    pattern.occurrencesGenerated >= pattern.maxOccurrences
  ) {
    return false
  }
  
  return true
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format recurrence pattern as human-readable Vietnamese text
 */
export const formatRecurrencePattern = (pattern: {
  frequency: RecurrenceFrequency
  interval: number
  weekdays?: number[]
  monthlyType?: MonthlyType
  monthlyDay?: number
  monthlyWeekday?: number
  monthlyWeekPosition?: number
}): string => {
  const { frequency, interval } = pattern
  
  switch (frequency) {
    case 'daily':
      return interval === 1 ? 'Hằng ngày' : `Mỗi ${interval} ngày`
    
    case 'weekly': {
      const weekdayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
      const days = pattern.weekdays?.map(d => weekdayNames[d]).join(', ') || ''
      const intervalText = interval === 1 ? 'Hằng tuần' : `Mỗi ${interval} tuần`
      return `${intervalText} vào ${days}`
    }
    
    case 'monthly': {
      const intervalText = interval === 1 ? 'Hằng tháng' : `Mỗi ${interval} tháng`
      
      if (pattern.monthlyType === 'by_date') {
        const day = pattern.monthlyDay || 1
        return `${intervalText} ngày ${day}`
      } else {
        const weekdayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        const positionNames = ['', 'đầu tiên', 'thứ hai', 'thứ ba', 'thứ tư', 'cuối cùng']
        const weekday = weekdayNames[pattern.monthlyWeekday || 0]
        const position = positionNames[pattern.monthlyWeekPosition || 1]
        return `${intervalText} vào ${weekday} ${position}`
      }
    }
    
    case 'yearly':
      return interval === 1 ? 'Hằng năm' : `Mỗi ${interval} năm`
    
    default:
      return 'Không xác định'
  }
}

/**
 * Calculate number of periods until next occurrence
 * Useful for debugging and validation
 */
export const periodsUntilNext = (
  frequency: RecurrenceFrequency,
  fromDate: Date,
  toDate: Date
): number => {
  const from = startOfDay(fromDate)
  const to = startOfDay(toDate)
  
  switch (frequency) {
    case 'daily':
      return differenceInDays(to, from)
    case 'weekly':
      return differenceInWeeks(to, from)
    case 'monthly':
      return differenceInMonths(to, from)
    case 'yearly':
      return differenceInYears(to, from)
    default:
      return 0
  }
}
