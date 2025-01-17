export const typeToBackground: Record<number, string> = {
  1: "bg-amber-200 dark:bg-amber-500",
  2: "bg-emerald-200 dark:bg-emerald-500",
  3: "bg-blue-200 dark:bg-cyan-500",
  4: "bg-gray-200 dark:bg-gray-500",
};

export const getBackgroundColorByLessonType = (type: number): string => {
  return typeToBackground[type] || "bg-gray-100 dark:bg-gray-500";
};

export const comparatorBackgroundColors: string[] = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-blue-100 dark:bg-blue-900",
  "bg-green-100 dark:bg-green-900",
  "bg-yellow-100 dark:bg-yellow-900",
  "bg-purple-100 dark:bg-purple-900",
  "bg-pink-100 dark:bg-pink-900",
  "bg-red-100 dark:bg-red-900",
  "bg-teal-100 dark:bg-teal-900",
  "bg-indigo-100 dark:bg-indigo-900",
  "bg-white dark:bg-black",
];

export const getRandomBackgroundColors = (): string[] => {
  return comparatorBackgroundColors.toSorted(() => Math.random() - 0.5);
};

export const createColorDispancer = () => {
  const keyToColor: Record<string, string> = {}
  const colors = getRandomBackgroundColors();
  return (key: number | string) => {
    if (!keyToColor[key]) {
      keyToColor[key] = colors[Object.keys(keyToColor).length % colors.length];
    }
    return keyToColor[key];
  }
}
