import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../components/explore-container/explore-container.component';
import { ICalendarDay } from '../core/interfaces/calendar-day.interface';
import { Subscription } from 'rxjs';
import { CalendarService } from '../core/services/calendar.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { caretBack, caretForward } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonIcon, IonButton, IonContent, CommonModule],
})
export class Tab2Page implements OnInit, OnDestroy {
  days: ICalendarDay[] = [];
  selectedDay: ICalendarDay | null = null;
  currentDay: number = 0;
  currentMonth: number = 0;
  currentYear: number = 0;
  currentMonthName: string = '';

  private subscriptions: Subscription = new Subscription();

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    addIcons({ caretBack, caretForward });

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
}
