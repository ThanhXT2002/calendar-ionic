export interface ICalendarDay {
  date: Date;
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  leap?:boolean;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
}


export interface ISolarTerm {
  name: string;
  date: Date;
  type: 'tiết' | 'khí';
}

export interface IGoodHour {
  gioChi: string;
  khungGio: string;
  isGoodHour: boolean;
  imagePath?: string;
  chiImage: string;
}

export interface IDayQuality {
  isGoodDay: boolean;
  quality: 'hoàng-đạo' | 'hắc-đạo';
  truc: string; // Kiến trừ thập nhị khách
  trucDescription: string;
  suitableFor: string[];
  avoidFor: string[];
  conflictAges: string[]; // Tuổi xung khắc
}
