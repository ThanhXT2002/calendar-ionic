import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import {
  IDayAnalysis,
  IDayQuality,
  IGoodHour,
  ISolarTerm,
} from 'src/app/core/interfaces/calendar-day.interface';
import {
  ExtendedLunarService,
} from 'src/app/core/services/extended-lunar.service';
import { CalendarService } from 'src/app/core/services/calendar.service';

@Component({
  selector: 'app-extended-day-info',
  templateUrl: './extended-day-info.component.html',
  styleUrls: ['./extended-day-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonIcon,
  ],
})
export class ExtendedDayInfoComponent implements OnInit, OnChanges {
  @Input() selectedDate: Date = new Date();

  // Existing properties
  dayQuality: IDayQuality | null = null;
  goodHours: IGoodHour[] = [];
  currentSolarTerm: ISolarTerm | null = null;
  isSolarTermDay: ISolarTerm | null = null;
  dayCanChi: string = '';
  monthCanChi: string = '';
  yearCanChi: string = '';
  lunarInfo: any = null;

  // New properties for Hoàng Đạo/Hắc Đạo
  dateGoodBadInfo: IDayAnalysis | null = null;
  godName: string = '';
  godImage: string = '';
  isAuspicious: boolean = false;
  isInauspicious: boolean = false;
  dayTypeText: string = '';
  dayTypeColor: string = '';
  errorMessage: string = '';

  constructor(
    private extendedLunarService: ExtendedLunarService,
    private calendarService: CalendarService
  ) {
    console.log('ExtendedDayInfoComponent initialized', this.selectedDate);
  }

  ngOnInit() {
    this.loadExtendedInfo();
  }

  ngOnChanges() {
    this.loadExtendedInfo();
  }

  private loadExtendedInfo() {
    if (!this.selectedDate) return;

    try {
      // Lấy thông tin cơ bản
      this.dayCanChi = this.calendarService.getDayCanChi(this.selectedDate);
      this.monthCanChi = this.calendarService.getMonthCanChi(this.selectedDate);
      this.yearCanChi = this.calendarService.getYearCanChi(this.selectedDate);
      this.lunarInfo = this.calendarService.solarToLunar(this.selectedDate);

      // Lấy thông tin hoàng đạo/hắc đạo
      this.loadDateGoodBadInfo();

      // Lấy thông tin giờ tốt
      if (this.dayCanChi) {
        this.goodHours = this.extendedLunarService.getGoodHoursFromCanChi(
          this.dayCanChi
        );
      }

      this.errorMessage = '';
    } catch (error) {
      console.error('Error loading extended info:', error);
      this.errorMessage = 'Không thể tải thông tin mở rộng';
    }
  }

  /**
   * Lấy thông tin hoàng đạo/hắc đạo cho ngày được chọn
   */
  private loadDateGoodBadInfo() {
    if (!this.dayCanChi || !this.lunarInfo?.month) {
      console.warn('Thiếu thông tin can chi hoặc tháng âm lịch');
      return;
    }

    try {
      // Lấy chi của ngày (bỏ can, chỉ lấy chi)
      const dayBranch = this.extractBranch(this.dayCanChi);
      const lunarMonth = this.lunarInfo.month;

      console.log(
        `Getting date good/bad info for: ${dayBranch}, month: ${lunarMonth}`
      );

      // Lấy thông tin chi tiết
      this.dateGoodBadInfo = this.extendedLunarService.getDetailedDayInfo(
        this.selectedDate,
        dayBranch,
        lunarMonth
      );

      if (this.dateGoodBadInfo) {
        this.godName = this.dateGoodBadInfo.godName;
        this.godImage = this.dateGoodBadInfo.dateGoodBadInfo.image;
        this.isAuspicious = this.dateGoodBadInfo.isAuspicious;
        this.isInauspicious = this.dateGoodBadInfo.isInauspicious;
        this.dayTypeText = this.isAuspicious ? 'Hoàng Đạo' : 'Hắc Đạo';
        this.dayTypeColor = this.isAuspicious
          ? 'text-green-600'
          : 'text-red-600';

        console.log('Date Good/Bad Info loaded:', {
          godName: this.godName,
          dayType: this.dayTypeText,
          isAuspicious: this.isAuspicious,
        });
      }
    } catch (error) {
      console.error('Error loading date good/bad info:', error);
      this.resetDateGoodBadInfo();
    }
  }

  /**
   * Trích xuất chi từ can chi (ví dụ: "Giáp Tý" → "Tý") - Public method cho template
   */
  extractBranch(canChi: string): string {
    const branches = [
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

    for (const branch of branches) {
      if (canChi.includes(branch)) {
        return branch;
      }
    }

    console.warn(`Cannot extract branch from: ${canChi}`);
    return '';
  }

  /**
   * Reset thông tin hoàng đạo/hắc đạo
   */
  private resetDateGoodBadInfo() {
    this.dateGoodBadInfo = null;
    this.godName = '';
    this.godImage = '';
    this.isAuspicious = false;
    this.isInauspicious = false;
    this.dayTypeText = '';
    this.dayTypeColor = '';
  }

  /**
   * Kiểm tra ngày có phải ngày tốt không (quick check)
   */
  isGoodDay(): boolean {
    if (!this.dayCanChi || !this.lunarInfo?.month) return false;

    const dayBranch = this.extractBranch(this.dayCanChi);
    return this.extendedLunarService.isAuspiciousDay(
      dayBranch,
      this.lunarInfo.month
    );
  }

  /**
   * Kiểm tra ngày có phải ngày xấu không (quick check)
   */
  isBadDay(): boolean {
    if (!this.dayCanChi || !this.lunarInfo?.month) return false;

    const dayBranch = this.extractBranch(this.dayCanChi);
    return this.extendedLunarService.isInauspiciousDay(
      dayBranch,
      this.lunarInfo.month
    );
  }

  /**
   * Lấy tên thần (quick get)
   */
  getGodName(): string {
    if (!this.dayCanChi || !this.lunarInfo?.month) return '';

    const dayBranch = this.extractBranch(this.dayCanChi);
    return (
      this.extendedLunarService.getDateGoodBadByChiAndMonth(
        dayBranch,
        this.lunarInfo.month
      ) || ''
    );
  }

  // Existing methods
  onImageError(event: any) {
    event.target.src = 'assets/images/chi/default.webp';
  }

  onGodImageError(event: any) {
    event.target.src = 'assets/images/avatar-default.webp';
  }

  getQualityColor(quality: string): string {
    return quality === 'hoàng-đạo' ? 'success' : 'danger';
  }

  getQualityIcon(quality: string): string {
    return quality === 'hoàng-đạo' ? 'checkmark-circle' : 'close-circle';
  }

  /**
   * Lấy class CSS cho loại ngày
   */
  getDayTypeClass(): string {
    if (this.isAuspicious) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (this.isInauspicious) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  /**
   * Lấy icon cho loại ngày
   */
  getDayTypeIcon(): string {
    return this.isAuspicious
      ? 'fa-solid fa-circle-check'
      : 'fa-solid fa-circle-xmark';
  }

  /**
   * Lấy danh sách việc nên làm
   */
  getFavorableActivities(): string[] {
    return this.dateGoodBadInfo?.dateGoodBadInfo.favorableFor || [];
  }

  /**
   * Lấy danh sách việc không nên làm
   */
  getUnfavorableActivities(): string[] {
    return this.dateGoodBadInfo?.dateGoodBadInfo.unfavorableFor || [];
  }

  /**
   * Lấy mô tả về thần
   */
  getGodDescription(): string {
    return this.dateGoodBadInfo?.dateGoodBadInfo.description || '';
  }
}
