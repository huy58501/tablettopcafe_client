declare module 'date-fns' {
  export function format(date: Date | number, format: string): string;
  export function parseISO(dateString: string): Date;
  export function startOfWeek(date: Date | number, options?: { weekStartsOn?: number }): Date;
  export function endOfWeek(date: Date | number, options?: { weekStartsOn?: number }): Date;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export function eachDayOfInterval(interval: { start: Date | number; end: Date | number }): Date[];
  export function isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean;
}
