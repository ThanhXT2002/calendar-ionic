import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { IDayQuality, IGoodHour, ISolarTerm  } from 'src/app/core/interfaces/calendar-day.interface';
import { ExtendedLunarService } from 'src/app/core/services/extended-lunar.service';
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

  dayQuality: IDayQuality | null = null;
  goodHours: IGoodHour[] = [];
  currentSolarTerm: ISolarTerm | null = null;
  isSolarTermDay: ISolarTerm | null = null;
  dayCanChi: string = '';
  monthCanChi: string = '';
  yearCanChi: string = '';
  lunarInfo: any = null;

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

    // Lấy thông tin cơ bản
    this.dayCanChi = this.calendarService.getDayCanChi(this.selectedDate);
    this.monthCanChi = this.calendarService.getMonthCanChi(this.selectedDate);
    this.yearCanChi = this.calendarService.getYearCanChi(this.selectedDate);
    this.lunarInfo = this.calendarService.solarToLunar(this.selectedDate);

    // Lấy thông tin mở rộng
    this.dayQuality = this.extendedLunarService.getDayQuality(
      this.selectedDate
    );
    this.goodHours = this.extendedLunarService.getGoodHours(this.selectedDate);


  }

  getQualityColor(quality: string): string {
    return quality === 'hoàng-đạo' ? 'success' : 'danger';
  }

  getQualityIcon(quality: string): string {
    return quality === 'hoàng-đạo' ? 'checkmark-circle' : 'close-circle';
  }

}
