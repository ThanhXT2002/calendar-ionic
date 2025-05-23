import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { CalendarService } from '../core/services/calendar.service';
import { CommonModule, DatePipe } from '@angular/common';
import { calendarOutline, giftOutline, moonOutline, starOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Festivals } from '../core/data/festivals.data';
import { MemorialDays } from '../core/data/memorial-days.data';
import { isPlatform } from '@ionic/angular/standalone';
import { TextToSpeechService } from '../core/services/text-to-speech.service';

export interface IUpcomingEvent {
  name: string;
  description?: string;
  daysUntil: number;
  date: Date;
  isLunar: boolean;
  type: 'festival' | 'memorial';
  iconName: string;
  bgColor: string;
  textColor: string;
  displayText: string;
}

type SpeakType = 'solar' | 'lunar';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule, DatePipe, IonContent],
})
export class Tab1Page implements OnInit {
  today: Date = new Date();
  lunarDate: { day: number; month: number; year: number; leap: boolean } = {
    day: 15,
    month: 5,
    year: 2025,
    leap: false,
  };

  upcomingEvents: IUpcomingEvent[] = [];
  loadingSolar: boolean = false;
  loadingLunar: boolean = false;
  isSpeakingSolar = false;
  isSpeakingLunar = false;
  isIOS = isPlatform('ios');

  constructor(
    private calendarService: CalendarService, // Chỉ inject CalendarService
    private tts: TextToSpeechService
  ) {
    // Sử dụng CalendarService để lấy ngày âm lịch
    this.lunarDate = this.calendarService.solarToLunar(this.today);
  }

  ngOnInit() {
    addIcons({ giftOutline, starOutline, calendarOutline, moonOutline });
    this.calculateUpcomingEvents();
  }

  calculateUpcomingEvents() {
    const currentDate = new Date();
    const events: IUpcomingEvent[] = [];
    const maxDays = 30;

    // Tìm tất cả sự kiện lễ hội trong 30 ngày
    Festivals.forEach((festival) => {
      const eventDate = this.getEventDate(
        festival.date,
        festival.month,
        festival.isLunar
      );

      if (eventDate) {
        const daysUntil = Math.ceil(
          (eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= maxDays) {
          events.push({
            name: festival.name,
            description: festival.description,
            daysUntil,
            date: eventDate,
            isLunar: festival.isLunar,
            type: 'festival',
            iconName: 'fa-solid fa-fire-flame-curved',
            bgColor: 'bg-green-300',
            textColor: 'text-green-600',
            displayText: this.getDisplayText(daysUntil),
          });
        }
      }
    });

    // Tìm tất cả ngày kỷ niệm trong 30 ngày
    MemorialDays.forEach((memorial) => {
      const eventDate = this.getEventDate(
        memorial.date,
        memorial.month,
        memorial.isLunar
      );

      if (eventDate) {
        const daysUntil = Math.ceil(
          (eventDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= maxDays) {
          events.push({
            name: memorial.name,
            description: memorial.description,
            daysUntil,
            date: eventDate,
            isLunar: memorial.isLunar,
            type: 'memorial',
            iconName: 'fa-regular fa-star',
            bgColor: 'bg-purple-300',
            textColor: 'text-purple-600',
            displayText: this.getDisplayText(daysUntil),
          });
        }
      }
    });

    // Sắp xếp theo thời gian và chỉ lấy 10 sự kiện gần nhất
    this.upcomingEvents = events
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 10);
  }

  private getDisplayText(daysUntil: number): string {
    if (daysUntil === 0) {
      return 'Hôm nay';
    } else if (daysUntil === 1) {
      return 'Ngày mai';
    } else {
      return `Còn ${daysUntil} ngày`;
    }
  }

  private getEventDate(day: number, month: number, isLunar: boolean): Date | null {
    const currentYear = new Date().getFullYear();
    let eventDate: Date | null = null;

    if (isLunar) {
      // Sử dụng CalendarService để chuyển đổi từ ngày âm lịch sang dương lịch
      eventDate = this.calendarService.lunarToSolar(day, month, currentYear);

      // Nếu ngày âm lịch đã qua trong năm hiện tại, thử năm tiếp theo
      if (!eventDate || eventDate < new Date()) {
        eventDate = this.calendarService.lunarToSolar(day, month, currentYear + 1);
      }

      // Nếu vẫn không có, thử tháng nhuận
      if (!eventDate) {
        eventDate = this.calendarService.lunarToSolar(day, month, currentYear, true);
        if (!eventDate || eventDate < new Date()) {
          eventDate = this.calendarService.lunarToSolar(day, month, currentYear + 1, true);
        }
      }
    } else {
      // Ngày dương lịch - sử dụng Date constructor thông thường
      eventDate = new Date(currentYear, month - 1, day);

      // Nếu ngày dương lịch đã qua trong năm hiện tại, sử dụng năm tiếp theo
      if (eventDate < new Date()) {
        eventDate = new Date(currentYear + 1, month - 1, day);
      }
    }

    return eventDate;
  }

  // Sử dụng CalendarService thay vì trực tiếp gọi các service khác
  getLunarMonthName(month: number): string {
    return this.calendarService.getLunarMonthName(month);
  }

  getLunarYearName(year: number): string {
    return this.calendarService.getLunarYearName(year);
  }

  trackByFn(index: number, item: IUpcomingEvent): string {
    return `${item.name}_${item.date.getTime()}`;
  }

  // ==================== TEXT TO SPEECH METHODS ====================

  private speakWithLocalStorage(text: string, type: SpeakType): void {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `voice_${type}_${today}`;

    // Kiểm tra cache trong localStorage
    const cachedVoice = localStorage.getItem(storageKey);
    const cachedDate = localStorage.getItem(`${storageKey}_date`);

    // Nếu có cache và là của ngày hôm nay
    if (cachedVoice && cachedDate === today) {
      console.log(`Sử dụng voice ${type} từ cache`);

      if (type === 'solar') {
        this.isSpeakingSolar = true;
      } else {
        this.isSpeakingLunar = true;
      }

      this.playAudio(cachedVoice, type);
      return;
    }

    // Nếu không có cache, gọi API
    if (type === 'solar') {
      this.loadingSolar = true;
      this.isSpeakingSolar = true;
    } else {
      this.loadingLunar = true;
      this.isSpeakingLunar = true;
    }

    this.tts.speak(text).subscribe({
      next: (res) => {
        if (type === 'solar') {
          this.loadingSolar = false;
        } else {
          this.loadingLunar = false;
        }

        const audioContent = res.audioContent;
        if (audioContent) {
          // Lưu vào localStorage
          localStorage.setItem(storageKey, audioContent);
          localStorage.setItem(`${storageKey}_date`, today);

          this.playAudio(audioContent, type);
        } else {
          console.error('Không có dữ liệu âm thanh trả về');
          if (type === 'solar') {
            this.isSpeakingSolar = false;
          } else {
            this.isSpeakingLunar = false;
          }
        }
      },
      error: (err) => {
        if (type === 'solar') {
          this.loadingSolar = false;
          this.isSpeakingSolar = false;
        } else {
          this.loadingLunar = false;
          this.isSpeakingLunar = false;
        }
        console.error(`Lỗi khi gọi Google TTS cho ${type}:`, err);
      },
    });
  }

  private playAudio(audioContent: string, type: SpeakType): void {
    const audio = new Audio('data:audio/mp3;base64,' + audioContent);
    audio.play();

    audio.onended = () => {
      if (type === 'solar') {
        this.isSpeakingSolar = false;
      } else {
        this.isSpeakingLunar = false;
      }
    };

    audio.onerror = () => {
      console.error('Lỗi khi phát audio');
      if (type === 'solar') {
        this.isSpeakingSolar = false;
      } else {
        this.isSpeakingLunar = false;
      }
    };
  }

  speakTodayDateSolar(): void {
    const datePipe = new DatePipe('vi-VN');
    const dayOfWeek = datePipe.transform(this.today, 'EEEE');
    const dayOfMonth = datePipe.transform(this.today, 'dd');
    const month = datePipe.transform(this.today, 'MM');
    const year = datePipe.transform(this.today, 'yyyy');

    const formattedDate = `Lịch dương hôm nay là ${dayOfWeek}, ngày ${dayOfMonth} tháng ${month} năm ${year}`;
    console.log('Formatted Date Solar:', formattedDate);

    this.speakWithLocalStorage(formattedDate, 'solar');
  }

  speakTodayDateLunar(): void {
    const lunarMonthName = this.getLunarMonthName(this.lunarDate.month);
    const lunarYearName = this.getLunarYearName(this.lunarDate.year);

    const formattedDate = `Âm lịch hôm nay là ngày ${this.lunarDate.day} ${lunarMonthName} năm ${lunarYearName}`;

    console.log('Formatted Date Lunar:', formattedDate);

    this.speakWithLocalStorage(formattedDate, 'lunar');
  }

  getMarginTopClass(): string {
    if (this.isIOS) {
      return 'mt-11';
    }
    return 'mt-14';
  }
}
