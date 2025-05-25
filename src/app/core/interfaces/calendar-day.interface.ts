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


export interface IDateGoodBadInfo {
  name: string; // Tên thần (Thanh Long, Minh Đường...)
  type: 'auspicious' | 'inauspicious'; // Loại ngày
  description: string; // Mô tả ý nghĩa
  favorableFor: string[]; // Việc nên làm
  unfavorableFor: string[]; // Việc không nên làm
  color: string; // Màu hiển thị
  image: string; // Icon hiển thị
}

export interface IDayAnalysis {
  date: Date;
  lunarMonth: number;
  dayBranch: string; // Chi của ngày (Tý, Sửu, Dần...)
  godName: string; // Tên 12 thần hoàng đạo
  dayType: 'auspicious' | 'inauspicious';
  dateGoodBadInfo: IDateGoodBadInfo;
  isAuspicious: boolean;
  isInauspicious: boolean;
}
