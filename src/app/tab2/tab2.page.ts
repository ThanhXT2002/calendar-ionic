import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../components/explore-container/explore-container.component';
import { ICalendarDay } from '../core/interfaces/calendar-day.interface';
import { Subscription } from 'rxjs';
import { CalendarService } from '../core/services/calendar.service';
import { CommonModule } from '@angular/common';
import { isPlatform } from '@ionic/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LunarCalendarService } from '../core/services/lunar-calendar.service';


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
  searchTerm = '';
  searchForm!: FormGroup;
  today = new Date();
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private calendarService: CalendarService,
    private lunarCalendarService: LunarCalendarService,
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
    // Hủy đăng ký khi component bị hủy
    this.subscriptions.unsubscribe();
  }

  // Tải lại dữ liệu lịch
  loadCalendarDays() {
    this.days = this.calendarService.getMonthDays();
    // Tìm ngày được chọn
    const selectedDay = this.days.find((day) => day.isSelected);
    if (selectedDay) {
      this.selectedDay = selectedDay;
    }
  }

  // Chọn một ngày
  selectDate(day: ICalendarDay) {
    this.calendarService.setSelectedDate(day.date);
    this.selectedDay = day;
  }

  // Chuyển đến tháng trước
  previousMonth() {
    this.calendarService.previousMonth();
  }

  // Chuyển đến tháng sau
  nextMonth() {
    this.calendarService.nextMonth();
  }

  // Lấy tên tháng âm lịch
  getLunarMonthName(month: number): string {
    return this.calendarService.getLunarMonthName(month);
  }

  // Lấy tên năm âm lịch
  getLunarYearName(year: number): string {
    return this.calendarService.getLunarYearName(year);
  }

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

    // Sử dụng service để validate
    if (!this.lunarCalendarService.isValidSolarDate(day, month, year)) {
      this.errorMessage = 'Ngày dương lịch không hợp lệ';
      return;
    }

    const date = new Date(year, month - 1, day);
    this.calendarService.setCurrentDate(date);
    this.calendarService.setSelectedDate(date);
    this.closeSearchBox();
  }

  onSearchLunar(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const day = +this.searchForm.get('day')?.value;
    const month = +this.searchForm.get('month')?.value;
    const year = +this.searchForm.get('year')?.value;

    // Sử dụng service để chuyển đổi âm → dương
    const solarDate = this.lunarCalendarService.lunarToSolar(day, month, year);

    if (solarDate) {
      this.calendarService.setCurrentDate(solarDate);
      this.calendarService.setSelectedDate(solarDate);
      this.closeSearchBox();
    } else {
      this.errorMessage = 'Ngày âm lịch không hợp lệ hoặc không tồn tại';
      // Thử tháng nhuận nếu tháng thường không có
      const leapResult = this.lunarCalendarService.lunarToSolar(
        day,
        month,
        year,
        true
      );
      if (leapResult) {
        this.calendarService.setCurrentDate(leapResult);
        this.calendarService.setSelectedDate(leapResult);
        this.closeSearchBox();
      }
    }
  }

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

  // Quick actions
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
    const lunar = this.lunarCalendarService.solarToLunar(today);
    this.searchForm.patchValue({
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
    });
  }

  getMarginTopClass(): string {
    if (this.isIOS) {
      return 'mt-11';
    }

    return 'mt-14';
  }
}
