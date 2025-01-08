export const typeToBackground: Record<number, string> = {
    1: 'bg-amber-200 dark:bg-amber-500',
    2: 'bg-emerald-200 dark:bg-emerald-500',
    3: 'bg-blue-200 dark:bg-cyan-500',
    4: 'bg-gray-200 dark:bg-gray-500',
  }
  
  export const getBackgroundColorByLessonType = (type: number): string => {
    return typeToBackground[type] || 'bg-gray-100 dark:bg-gray-500'
  }
  