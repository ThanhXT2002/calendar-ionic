import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { ICalendarDay } from '../core/interfaces/calendar-day.interface';
import { Subscription } from 'rxjs';
import { CalendarService } from '../core/services/calendar.service';
import { CommonModule } from '@angular/common';
import { isPlatform } from '@ionic/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonButton,
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class Tab2Page implements OnInit, OnDestroy {
  days: ICalendarDay[] = [];
  selectedDay: ICalendarDay | null = null;
  currentDay: number = 0;
  currentMonth: number = 0;
  currentYear: number = 0;
  currentMonthName: string = '';
  isIOS = isPlatform('ios');
  isAndroid = isPlatform('android');
  isBoxSearch: boolean = false;
  searchForm!: FormGroup;
  today = new Date();
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private calendarService: CalendarService, // Chỉ cần CalendarService
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      day: [
        "",
        [
          Validators.required,
          Validators.min(1),
          Validators.max(31),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
      month: [
        "",
        [
          Validators.required,
          Validators.min(1),
          Validators.max(12),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
      year: [
        "",
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(2500),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
    });
  }

  ngOnInit() {
    // Đăng ký lắng nghe sự thay đổi ngày hiện tại
    this.subscriptions.add(
      this.calendarService.currentDate$.subscribe((date) => {
        this.currentDay = date.getDate();
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        this.currentMonthName = this.calendarService.getMonthName(
          this.currentMonth
        );
        this.loadCalendarDays();
      })
    );

    // Đăng ký lắng nghe sự thay đổi ngày được chọn
    this.subscriptions.add(
      this.calendarService.selectedDate$.subscribe(() => {
        this.loadCalendarDays();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ==================== CALENDAR METHODS ====================

  loadCalendarDays() {
    this.days = this.calendarService.getMonthDays();
    // Tìm ngày được chọn
    const selectedDay = this.days.find((day) => day.isSelected);
    if (selectedDay) {
      this.selectedDay = selectedDay;
    }
  }

  selectDate(day: ICalendarDay) {
    this.calendarService.setSelectedDate(day.date);
    this.selectedDay = day;
  }

  previousMonth() {
    this.calendarService.previousMonth();
  }

  nextMonth() {
    this.calendarService.nextMonth();
  }

  // ==================== DISPLAY HELPERS ====================

  getLunarMonthName(month: number): string {
    return this.calendarService.getLunarMonthName(month);
  }

  getLunarYearName(year: number): string {
    return this.calendarService.getLunarYearName(year);
  }

  getMarginTopClass(): string {
    if (this.isIOS) {
      return 'mt-11';
    }
    return 'mt-14';
  }

  // ==================== SEARCH BOX METHODS ====================

  toggleBoxSearch(): void {
    this.isBoxSearch = !this.isBoxSearch;
  }

  closeSearchBox(): void {
    this.isBoxSearch = false;
    this.errorMessage = '';
    this.searchForm.reset();
  }

  onSearchSolar(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const day = +this.searchForm.get('day')?.value;
    const month = +this.searchForm.get('month')?.value;
    const year = +this.searchForm.get('year')?.value;

    // Sử dụng CalendarService để search
    const success = this.calendarService.searchSolarDate(day, month, year);

    if (success) {
      this.closeSearchBox();
    } else {
      this.errorMessage = 'Ngày dương lịch không hợp lệ';
    }
  }

  onSearchLunar(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const day = +this.searchForm.get('day')?.value;
    const month = +this.searchForm.get('month')?.value;
    const year = +this.searchForm.get('year')?.value;

    // Sử dụng CalendarService để search
    const success = this.calendarService.searchLunarDate(day, month, year);

    if (success) {
      this.closeSearchBox();
    } else {
      this.errorMessage = 'Ngày âm lịch không hợp lệ hoặc không tồn tại';
    }
  }

  // ==================== FORM HELPERS ====================

  onFocus(controlName: 'day' | 'month' | 'year') {
    this.searchForm.get(controlName)?.setValue('');
  }

  isInvalid(controlName: 'day' | 'month' | 'year'): boolean {
    const control = this.searchForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.searchForm.controls).forEach((key) => {
      this.searchForm.get(key)?.markAsTouched();
    });
  }

  // ==================== QUICK ACTIONS ====================

  fillTodayInForm(): void {
    const today = new Date();
    this.searchForm.patchValue({
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
  }

  fillTodayLunarInForm(): void {
    const today = new Date();
    const lunar = this.calendarService.solarToLunar(today);
    this.searchForm.patchValue({
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
    });
  }
}
