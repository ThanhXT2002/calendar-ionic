import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LunarCalendarService } from './lunar-calendar.service';
import { ICalendarDay } from '../interfaces/calendar-day.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private today = new Date();
  private currentDate = new BehaviorSubject<Date>(this.today);
  private selectedDate = new BehaviorSubject<Date>(this.today);

  currentDate$ = this.currentDate.asObservable();
  selectedDate$ = this.selectedDate.asObservable();

  constructor(private lunarCalendarService: LunarCalendarService) {}

  // ==================== DATE MANAGEMENT ====================

  getCurrentDate(): Date {
    return this.currentDate.value;
  }

  setCurrentDate(date: Date): void {
    this.currentDate.next(date);
  }

  getSelectedDate(): Date {
    return this.selectedDate.value;
  }

  setSelectedDate(date: Date): void {
    this.selectedDate.next(date);
  }

  previousMonth(): void {
    const current = this.getCurrentDate();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.setCurrentDate(previous);
  }

  nextMonth(): void {
    const current = this.getCurrentDate();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.setCurrentDate(next);
  }

  // ==================== CALENDAR DAYS ====================

  getMonthDays(): ICalendarDay[] {
    const days: ICalendarDay[] = [];
    const current = this.getCurrentDate();
    const selectedDate = this.getSelectedDate();

    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Thêm các ngày của tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const lunar = this.solarToLunar(date);
      days.push({
        date,
        solarDay: date.getDate(),
        solarMonth: date.getMonth() + 1,
        solarYear: date.getFullYear(),
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        lunarYear: lunar.year,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.isSameDay(date, selectedDate),
        isCurrentMonth: false
      });
    }

    // Thêm các ngày của tháng hiện tại
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const lunar = this.solarToLunar(date);
      days.push({
        date,
        solarDay: date.getDate(),
        solarMonth: date.getMonth() + 1,
        solarYear: date.getFullYear(),
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        lunarYear: lunar.year,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.isSameDay(date, selectedDate),
        isCurrentMonth: true
      });
    }

    // Thêm các ngày của tháng sau
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const lunar = this.solarToLunar(date);
      days.push({
        date,
        solarDay: date.getDate(),
        solarMonth: date.getMonth() + 1,
        solarYear: date.getFullYear(),
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        lunarYear: lunar.year,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.isSameDay(date, selectedDate),
        isCurrentMonth: false
      });
    }

    return days;
  }

  // ==================== LUNAR CALENDAR CONVERSIONS ====================

  solarToLunar(date: Date): { day: number; month: number; year: number; leap: boolean } {
    return this.lunarCalendarService.solarToLunar(date);
  }

  lunarToSolar(day: number, month: number, year: number, isLeapMonth: boolean = false): Date | null {
    return this.lunarCalendarService.lunarToSolar(day, month, year, isLeapMonth);
  }

  // ==================== VALIDATIONS ====================

  isValidLunarDate(day: number, month: number, year: number): boolean {
    return this.lunarCalendarService.isValidLunarDate(day, month, year);
  }

  isValidSolarDate(day: number, month: number, year: number): boolean {
    return this.lunarCalendarService.isValidSolarDate(day, month, year);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // ==================== DISPLAY NAMES ====================

  getMonthName(month: number): string {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return monthNames[month];
  }

  getLunarMonthName(month: number): string {
    const monthNames = [
      'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
      'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
      'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'
    ];
    return monthNames[month - 1];
  }

  getLunarYearName(year: number): string {
    return this.lunarCalendarService.getLunarYearName(year);
  }

  getDayCanChi(date: Date): string {
    return this.lunarCalendarService.getDayCanChi(date);
  }

  getMonthCanChi(date: Date): string {
    return this.lunarCalendarService.getMonthCanChi(date);
  }

  getYearCanChi(date: Date): string {
    return this.lunarCalendarService.getYearCanChi(date);
  }




  // ==================== CONVENIENCE METHODS ====================

  getTodayLunar(): { day: number; month: number; year: number; leap: boolean } {
    return this.solarToLunar(this.today);
  }

  getLunarDateForSolar(solarDate: Date): { day: number; month: number; year: number; leap: boolean } {
    return this.solarToLunar(solarDate);
  }

  // ==================== SEARCH HELPERS ====================

  searchSolarDate(day: number, month: number, year: number): boolean {
    if (!this.isValidSolarDate(day, month, year)) {
      return false;
    }

    const date = new Date(year, month - 1, day);
    this.setCurrentDate(date);
    this.setSelectedDate(date);
    return true;
  }

  searchLunarDate(day: number, month: number, year: number): boolean {
    const solarDate = this.lunarToSolar(day, month, year);

    if (solarDate) {
      this.setCurrentDate(solarDate);
      this.setSelectedDate(solarDate);
      return true;
    }

    // Thử tháng nhuận nếu tháng thường không có
    const leapResult = this.lunarToSolar(day, month, year, true);
    if (leapResult) {
      this.setCurrentDate(leapResult);
      this.setSelectedDate(leapResult);
      return true;
    }

    return false;
  }
}
