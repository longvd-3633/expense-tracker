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
} from 'date-fns';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  start: Date;
  end: Date;
}

export const useDateRange = () => {
  const currentPeriod = ref<PeriodType>('monthly');
  const currentDate = ref<Date>(new Date());

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
    currentPeriod.value = period;
  };

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

  const goToNext = () => {
    switch (currentPeriod.value) {
      case 'daily':
        currentDate.value = addDays(currentDate.value, 1);
        break;
      case 'weekly':
        currentDate.value = addWeeks(currentDate.value, 1);
        break;
      case 'monthly':
        currentDate.value = addMonths(currentDate.value, 1);
        break;
    }
  };

  const goToToday = () => {
    currentDate.value = new Date();
  };

  const isToday = computed(() => {
    const today = new Date();
    return (
      currentDate.value.getDate() === today.getDate() &&
      currentDate.value.getMonth() === today.getMonth() &&
      currentDate.value.getFullYear() === today.getFullYear()
    );
  });

  return {
    currentPeriod,
    currentDate,
    dateRange,
    setPeriod,
    goToPrevious,
    goToNext,
    goToToday,
    isToday,
  };
};
