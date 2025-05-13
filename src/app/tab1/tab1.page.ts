import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../components/explore-container/explore-container.component';
import { CalendarService } from '../core/services/calendar.service';
import { CommonModule, DatePipe } from '@angular/common';
import { calendarOutline, giftOutline, moonOutline, starOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { LunarCalendarService } from '../core/services/lunar-calendar.service';
import { Festivals } from '../core/data/festivals.data';
import { MemorialDays } from '../core/data/memorial-days.data';
import { isPlatform } from '@ionic/angular/standalone';
import { TextToSpeechService } from '../core/services/text-to-speech.service';


export interface IUpcomingEvent {
  name: string;
  description?: string;
  daysUntil: number;
  isLunar: boolean;
  type: 'festival' | 'memorial';
  iconName: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule, DatePipe, IonContent],
})
export class Tab1Page implements OnInit {
  today: Date = new Date();
  lunarDate: { day: number; month: number; year: number } = {
    day: 1,
    month: 1,
    year: 2023,
  };

  upcomingEvents: IUpcomingEvent[] = [];

  constructor(
    private calendarService: CalendarService,
    private lunarCalendarService: LunarCalendarService,
    private tts: TextToSpeechService
  ) {
    this.lunarDate = this.calendarService.getLunarDateForSolar(this.today);
  }

  ngOnInit() {
    addIcons({ giftOutline, starOutline, calendarOutline, moonOutline });
    this.calculateUpcomingEvents();
  }

  calculateUpcomingEvents() {
    const currentDate = new Date();
    let nextFestival: IUpcomingEvent | null = null;
    let nextMemorial: IUpcomingEvent | null = null;

    // Tìm lễ hội gần nhất
    let minFestivalDays = Infinity;
    Festivals.forEach((festival) => {
      const eventDate = this.getEventDate(
        festival.date,
        festival.month,
        festival.isLunar
      );
      if (eventDate >= currentDate) {
        const daysUntil = Math.ceil(
          (eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysUntil < minFestivalDays) {
          minFestivalDays = daysUntil;
          nextFestival = {
            name: festival.name,
            description: festival.description,
            daysUntil,
            isLunar: festival.isLunar,
            type: 'festival',
            iconName: 'fa-solid fa-fire-flame-curved',
            bgColor: 'bg-green-300',
            textColor: 'text-green-600',
          };
        }
      }
    });

    // Tìm ngày kỷ niệm gần nhất
    let minMemorialDays = Infinity;
    MemorialDays.forEach((memorial) => {
      const eventDate = this.getEventDate(
        memorial.date,
        memorial.month,
        memorial.isLunar
      );
      if (eventDate >= currentDate) {
        const daysUntil = Math.ceil(
          (eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );
        if (daysUntil < minMemorialDays) {
          minMemorialDays = daysUntil;
          nextMemorial = {
            name: memorial.name,
            description: memorial.description,
            daysUntil,
            isLunar: memorial.isLunar,
            type: 'memorial',
            iconName: 'fa-regular fa-star',
            bgColor: 'bg-purple-300',
            textColor: 'text-purple-600',
          };
        }
      }
    });

    // Tạo mảng các sự kiện (chỉ có tối đa 2 sự kiện)
    this.upcomingEvents = [];
    if (nextFestival) {
      this.upcomingEvents.push(nextFestival);
    }
    if (nextMemorial) {
      this.upcomingEvents.push(nextMemorial);
    }

    // Sắp xếp theo thời gian
    this.upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  private getEventDate(day: number, month: number, isLunar: boolean): Date {
    const currentYear = new Date().getFullYear();
    let eventDate: Date;

    if (isLunar) {
      // Chuyển đổi từ ngày âm lịch sang dương lịch
      eventDate = this.convertLunarToSolar(day, month, currentYear);

      // Nếu ngày âm lịch đã qua trong năm hiện tại, sử dụng năm tiếp theo
      if (eventDate < new Date()) {
        eventDate = this.convertLunarToSolar(day, month, currentYear + 1);
      }
    } else {
      // Ngày dương lịch
      eventDate = new Date(currentYear, month - 1, day);

      // Nếu ngày dương lịch đã qua trong năm hiện tại, sử dụng năm tiếp theo
      if (eventDate < new Date()) {
        eventDate = new Date(currentYear + 1, month - 1, day);
      }
    }

    return eventDate;
  }

  private convertLunarToSolar(
    lunarDay: number,
    lunarMonth: number,
    lunarYear: number
  ): Date {
    // Sử dụng phương pháp xấp xỉ thông minh để tìm ngày dương lịch
    try {
      // Bắt đầu từ ngày gần đúng (tháng 2 trong năm dương lịch thường tương ứng với tháng 1 âm lịch)
      let estimatedMonth = Math.max(0, lunarMonth - 1);
      let estimatedYear = lunarYear;

      // Tìm kiếm trong khoảng ±60 ngày từ ngày ước tính
      let searchStartDate = new Date(
        estimatedYear,
        estimatedMonth,
        lunarDay - 30
      );
      let searchEndDate = new Date(
        estimatedYear,
        estimatedMonth,
        lunarDay + 30
      );

      // Duyệt qua các ngày trong khoảng tìm kiếm
      for (
        let d = new Date(searchStartDate);
        d <= searchEndDate;
        d.setDate(d.getDate() + 1)
      ) {
        const lunarInfo = this.lunarCalendarService.solarToLunar(new Date(d));
        if (
          lunarInfo.day === lunarDay &&
          lunarInfo.month === lunarMonth &&
          lunarInfo.year === lunarYear
        ) {
          return new Date(d);
        }
      }

      // Nếu không tìm thấy trong khoảng đầu tiên, mở rộng tìm kiếm
      searchStartDate = new Date(estimatedYear, 0, 1);
      searchEndDate = new Date(estimatedYear, 11, 31);

      for (
        let d = new Date(searchStartDate);
        d <= searchEndDate;
        d.setDate(d.getDate() + 1)
      ) {
        const lunarInfo = this.lunarCalendarService.solarToLunar(new Date(d));
        if (
          lunarInfo.day === lunarDay &&
          lunarInfo.month === lunarMonth &&
          lunarInfo.year === lunarYear
        ) {
          return new Date(d);
        }
      }

      // Fallback nếu không tìm thấy
      console.warn(
        `Không tìm thấy ngày dương lịch cho: ${lunarDay}/${lunarMonth}/${lunarYear}`
      );
      return new Date(estimatedYear, estimatedMonth, lunarDay);
    } catch (error) {
      console.error('Lỗi khi chuyển đổi âm lịch sang dương lịch:', error);
      return new Date(lunarYear, lunarMonth - 1, lunarDay);
    }
  }

  getLunarMonthName(month: number): string {
    return this.calendarService.getLunarMonthName(month);
  }

  getLunarYearName(year: number): string {
    return this.calendarService.getLunarYearName(year);
  }

  trackByFn(index: number, item: IUpcomingEvent): string {
    return item.name;
  }

  speakTodayDateSolar() {
    const datePipe = new DatePipe('vi-VN');
    // const formattedDate = datePipe.transform(this.today, 'EEEE, dd/MM/yyyy');
    const dayOfWeek = datePipe.transform(this.today, 'EEEE');
    const dayOfMonth = datePipe.transform(this.today, 'dd');
    const month = datePipe.transform(this.today, 'MM');
    const year = datePipe.transform(this.today, 'yyyy');
    const formattedDate = `Lịch dương hôm nay là ${dayOfWeek}, ngày ${dayOfMonth} tháng ${month} năm ${year}`;
    console.log('Formatted Date:', formattedDate);
    // console.log('Formatted Date:', dayOfWeek);
    this.tts.speak(formattedDate).subscribe((res) => {
      const audioContent = res.audioContent;
      const audio = new Audio('data:audio/mp3;base64,' + audioContent);
      audio.play();
    });
  }

  speakTodayDateLunar() {

    const formattedDate = `Âm lịch hôm nay là ngày ${
      this.lunarDate.day
    } ${this.getLunarMonthName(
      this.lunarDate.month
    )} năm ${this.getLunarYearName(this.lunarDate.year)}`;
    console.log('Formatted Date:', formattedDate);
    this.tts.speak(formattedDate).subscribe((res) => {
      const audioContent = res.audioContent;
      const audio = new Audio('data:audio/mp3;base64,' + audioContent);
      audio.play();
    });
  }

  getMarginTopClass(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    // Nếu là Android trình duyệt (không phải app Ionic/Capacitor)
    if (
      userAgent.includes('android') &&
      !userAgent.includes('wv') &&
      !userAgent.includes('cordova') &&
      !userAgent.includes('capacitor')
    ) {
      return 'mt-14';
    }

    // Mặc định: app (Ionic app build native hoặc webview)
    return 'mt-9';
  }
}
