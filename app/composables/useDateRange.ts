import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  addDays,
  addWeeks,
  addMonths,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from 'date-fns'

const DASHBOARD_STORAGE_KEY = 'expense-tracker:dashboard-period'

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  start: Date;
  end: Date;
}

export const useDateRange = () => {
  const savedPeriod = process.client
    ? (window.localStorage.getItem(DASHBOARD_STORAGE_KEY) as PeriodType | null)
    : null

  const currentPeriod = ref<PeriodType>(savedPeriod || 'monthly')
  const currentDate = ref<Date>(new Date())

  const dateRange = computed<DateRange>(() => {
    const date = currentDate.value;
    
    switch (currentPeriod.value) {
      case 'daily':
        return {
          start: startOfDay(date),
          end: endOfDay(date),
        };
      case 'weekly':
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
          end: endOfWeek(date, { weekStartsOn: 1 }),
        };
      case 'monthly':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
        };
      default:
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
        };
    }
  });

  const setPeriod = (period: PeriodType) => {
    currentPeriod.value = period
    if (process.client) {
      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, period)
    }
  }

  const isCurrentPeriod = (period: PeriodType, referenceDate: Date) => {
    const today = new Date()
    switch (period) {
      case 'daily':
        return isSameDay(referenceDate, today)
      case 'weekly':
        return isSameWeek(referenceDate, today, { weekStartsOn: 1 })
      case 'monthly':
        return isSameMonth(referenceDate, today)
      default:
        return false
    }
  }

  const viewingCurrentPeriod = computed(() =>
    isCurrentPeriod(currentPeriod.value, currentDate.value)
  )

  const goToPrevious = () => {
    switch (currentPeriod.value) {
      case 'daily':
        currentDate.value = subDays(currentDate.value, 1);
        break;
      case 'weekly':
        currentDate.value = subWeeks(currentDate.value, 1);
        break;
      case 'monthly':
        currentDate.value = subMonths(currentDate.value, 1);
        break;
    }
  };

  const getNextDate = () => {
    switch (currentPeriod.value) {
      case 'daily':
        return addDays(currentDate.value, 1)
      case 'weekly':
        return addWeeks(currentDate.value, 1)
      case 'monthly':
        return addMonths(currentDate.value, 1)
      default:
        return currentDate.value
    }
  }

  const canGoToNext = computed(() => {
    const today = new Date()
    return getNextDate().getTime() <= endOfDay(today).getTime()
  })

  const goToNext = () => {
    if (!canGoToNext.value) return
    currentDate.value = getNextDate()
  }

  const goToToday = () => {
    currentDate.value = new Date()
  }

  const periodLabel = computed(() => {
    switch (currentPeriod.value) {
      case 'daily':
        return format(currentDate.value, 'dd MMM yyyy')
      case 'weekly':
        return `Tuần ${format(currentDate.value, "II 'năm' yyyy")}`
      case 'monthly':
        return format(currentDate.value, "MMM yyyy")
      default:
        return format(currentDate.value, "MMM yyyy")
    }
  })

  return {
    currentPeriod,
    currentDate,
    dateRange,
    setPeriod,
    goToPrevious,
    goToNext,
    goToToday,
    viewingCurrentPeriod,
    canGoToNext,
    periodLabel,
    isCurrentPeriod,
  };
};
