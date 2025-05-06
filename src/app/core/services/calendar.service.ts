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

  // Lấy ngày hiện tại
  getCurrentDate(): Date {
    return this.currentDate.value;
  }

  // Cập nhật ngày hiện tại
  setCurrentDate(date: Date): void {
    this.currentDate.next(date);
  }

  // Lấy ngày được chọn
  getSelectedDate(): Date {
    return this.selectedDate.value;
  }

  // Cập nhật ngày được chọn
  setSelectedDate(date: Date): void {
    this.selectedDate.next(date);
  }

  // Chuyển đến tháng trước
  previousMonth(): void {
    const current = this.getCurrentDate();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.setCurrentDate(previous);
  }

  // Chuyển đến tháng sau
  nextMonth(): void {
    const current = this.getCurrentDate();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.setCurrentDate(next);
  }

  // Lấy danh sách ngày trong tháng hiện tại (lịch dương)
  getMonthDays(): ICalendarDay[] {
    const days: ICalendarDay[] = [];
    const current = this.getCurrentDate();
    const selectedDate = this.getSelectedDate();

    const year = current.getFullYear();
    const month = current.getMonth();

    // Ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month, 1);
    // Ngày cuối cùng của tháng
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Lấy ngày trong tuần của ngày đầu tiên (0 = Chủ nhật, 1 = Thứ hai,...)
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
    const remainingDays = 42 - days.length; // 6 hàng x 7 cột = 42 ô
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

  // Chuyển đổi từ lịch dương sang lịch âm
  solarToLunar(date: Date): { day: number, month: number, year: number } {
    return this.lunarCalendarService.solarToLunar(date);
  }



  // So sánh hai ngày
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Lấy tên tháng
  getMonthName(month: number): string {
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return monthNames[month];
  }

  // Lấy tên tháng âm lịch
  getLunarMonthName(month: number): string {
    const monthNames = ['Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
                        'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'];
    return monthNames[month - 1];
  }

  // Lấy tên Can Chi cho năm
  getLunarYearName(year: number): string {
    const can = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
    const chi = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi'];

    return can[year % 10] + ' ' + chi[year % 12];
  }

  // Lấy ngày âm lịch tương ứng với ngày dương lịch
  getLunarDateForSolar(solarDate: Date): { day: number, month: number, year: number } {
    return this.solarToLunar(solarDate);
  }
}
