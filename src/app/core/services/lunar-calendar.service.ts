import { Injectable } from '@angular/core';
import CalendarCalculator from 'viet-lunar-calendar';
import { LunarDate, SolarDate } from 'lunar-date-vn';

@Injectable({
  providedIn: 'root',
})
export class LunarCalendarService {
  private readonly calendar = new CalendarCalculator();
  private readonly timeZone = 7;

  constructor() {}

  // ==================== CORE CONVERSION METHODS ====================

  /**
   * Chuyển đổi từ lịch dương sang lịch âm
   */
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

  /**
   * Chuyển đổi từ lịch âm sang lịch dương
   */
  lunarToSolar(
    day: number,
    month: number,
    year: number,
    isLeapMonth: boolean = false
  ): Date | null {
    try {
      if (!this.isValidLunarDate(day, month, year)) {
        console.error('Ngày âm lịch không hợp lệ:', { day, month, year });
        return null;
      }

      const lunarDate = new LunarDate({
        day,
        month,
        year,
        yearIndex: 0,
        hour: 0,
        leap_month: isLeapMonth,
      });

      lunarDate.init();
      const solarDate = lunarDate.toSolarDate();

      if (!solarDate) {
        console.error('Không thể chuyển đổi sang dương lịch');
        return this.fallbackLunarToSolar(day, month, year);
      }

      const solarInfo = solarDate.get();
      const result = new Date(
        solarInfo.year,
        solarInfo.month - 1,
        solarInfo.day
      );

      console.log(
        `Chuyển đổi âm → dương: ${day}/${month}/${year} → ${result.toDateString()}`
      );
      return result;
    } catch (error) {
      console.error('Lỗi chuyển đổi âm → dương:', error);
      console.log('Thử fallback method...');
      return this.fallbackLunarToSolar(day, month, year);
    }
  }

  // ==================== LUNAR YEAR NAMES ====================

  /**
   * Lấy tên Can Chi của năm âm lịch
   */
  getLunarYearName(year: number): string {
    const can = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
    const chi = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi'];

    return can[year % 10] + ' ' + chi[year % 12];
  }


  /**
   * Lấy Can Chi của ngày
   */
  getDayCanChi(date: Date): string {
    const dayNumber = this.calendar.getDayNumber(date);
    const canchi = this.calendar.getLunarDayStemBranch(dayNumber);

    const stemNames = [
      'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu',
      'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý',
    ];
    const branchNames = [
      'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
      'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
    ];

    const stem = stemNames[canchi.stemIndex];
    const branch = branchNames[canchi.branchIndex];

    return `${stem} ${branch}`;
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Kiểm tra ngày âm lịch có hợp lệ không
   */
  isValidLunarDate(day: number, month: number, year: number): boolean {
    return (
      day >= 1 &&
      day <= 30 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      year <= 2100
    );
  }

  /**
   * Kiểm tra ngày dương lịch có hợp lệ không
   */
  isValidSolarDate(day: number, month: number, year: number): boolean {
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Fallback method nếu lunar-date-vn không hoạt động
   */
  private fallbackLunarToSolar(
    day: number,
    month: number,
    year: number
  ): Date | null {
    console.warn('Sử dụng fallback method cho chuyển đổi âm → dương');

    try {
      const estimatedYear = year;
      const estimatedMonth = Math.max(0, month - 1);
      const searchStart = new Date(estimatedYear, estimatedMonth, day - 45);
      const searchEnd = new Date(estimatedYear, estimatedMonth + 2, day + 45);

      for (
        let d = new Date(searchStart);
        d <= searchEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const lunarInfo = this.solarToLunar(new Date(d));

        if (
          lunarInfo.day === day &&
          lunarInfo.month === month &&
          lunarInfo.year === year
        ) {
          console.log('Fallback tìm thấy:', d.toDateString());
          return new Date(d);
        }
      }

      console.error('Fallback không tìm thấy kết quả');
      return null;
    } catch (error) {
      console.error('Fallback method thất bại:', error);
      return null;
    }
  }
}
