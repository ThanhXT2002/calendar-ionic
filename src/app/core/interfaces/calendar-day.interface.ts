export interface ICalendarDay {
  date: Date;
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
}
