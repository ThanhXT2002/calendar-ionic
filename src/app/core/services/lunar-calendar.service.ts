import { Injectable } from '@angular/core';
import CalendarCalculator from 'viet-lunar-calendar';

@Injectable({
  providedIn: 'root',
})
export class LunarCalendarService {
  private readonly calendar = new CalendarCalculator();
  private readonly timeZone = 7;

  constructor() {}

  solarToLunar(date: Date): {
    day: number;
    month: number;
    year: number;
    leap: boolean;
  } {
    const lunar = this.calendar.getLunarDate(date, this.timeZone);
    return {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      leap: !!lunar.leap,
    };
  }

  getLunarYearName(year: number): string {
    try {
      const stemNames = [
        'Giáp',
        'Ất',
        'Bính',
        'Đinh',
        'Mậu',
        'Kỷ',
        'Canh',
        'Tân',
        'Nhâm',
        'Quý',
      ];
      const branchNames = [
        'Tý',
        'Sửu',
        'Dần',
        'Mão',
        'Thìn',
        'Tỵ',
        'Ngọ',
        'Mùi',
        'Thân',
        'Dậu',
        'Tuất',
        'Hợi',
      ];

      const canchi = this.calendar.getLunarYearStemBranch(year);
      const stem = stemNames[canchi.stemIndex];
      const branch = branchNames[canchi.branchIndex];

      return `${stem} ${branch}`;
    } catch (error) {
      console.error('Lỗi khi lấy tên năm âm lịch:', error);
      return '';
    }
  }

  getDayCanChi(date: Date): string {
    const dayNumber = this.calendar.getDayNumber(date);
    const canchi = this.calendar.getLunarDayStemBranch(dayNumber);
    const stemNames = [
      'Giáp',
      'Ất',
      'Bính',
      'Đinh',
      'Mậu',
      'Kỷ',
      'Canh',
      'Tân',
      'Nhâm',
      'Quý',
    ];
    const branchNames = [
      'Tý',
      'Sửu',
      'Dần',
      'Mão',
      'Thìn',
      'Tỵ',
      'Ngọ',
      'Mùi',
      'Thân',
      'Dậu',
      'Tuất',
      'Hợi',
    ];

    const stem = stemNames[canchi.stemIndex];
    const branch = branchNames[canchi.branchIndex];

    return `${stem} ${branch}`;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
}
