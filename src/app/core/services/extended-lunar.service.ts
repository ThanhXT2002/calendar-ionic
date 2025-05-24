import { Injectable } from '@angular/core';
import { LunarCalendarService } from './lunar-calendar.service';
import { IDayQuality, IGoodHour, ISolarTerm } from 'src/app/core/interfaces/calendar-day.interface';



@Injectable({
  providedIn: 'root',
})
export class ExtendedLunarService {
  // 24 tiết khí theo thứ tự
  private readonly SOLAR_TERMS = [
    'Lập xuân',
    'Vũ thủy',
    'Kinh trập',
    'Xuân phân',
    'Thanh minh',
    'Cốc vũ',
    'Lập hạ',
    'Tiểu mãn',
    'Mang chủng',
    'Hạ chí',
    'Tiểu thử',
    'Đại thử',
    'Lập thu',
    'Xử thử',
    'Bạch lộ',
    'Thu phân',
    'Hàn lộ',
    'Sương giáng',
    'Lập đông',
    'Tiểu tuyết',
    'Đại tuyết',
    'Đông chí',
    'Tiểu hàn',
    'Đại hàn',
  ];

  // 12 trực (Kiến trừ thập nhị khách)
  private readonly TRUC_NAMES = [
    'Kiến',
    'Trừ',
    'Mãn',
    'Bình',
    'Định',
    'Chấp',
    'Phá',
    'Nguy',
    'Thành',
    'Thu',
    'Khai',
    'Bế',
  ];

  constructor(private lunarCalendarService: LunarCalendarService) {}

  // ==================== TIẾT KHÍ ====================

  /**
   * Tính tiết khí trong năm dựa vào ngày dương lịch
   */
  getSolarTermsInYear(year: number): ISolarTerm[] {
    const terms: ISolarTerm[] = [];

    // Tính toán 24 tiết khí trong năm
    for (let i = 0; i < 24; i++) {
      const termDate = this.calculateSolarTermDate(year, i);
      terms.push({
        name: this.SOLAR_TERMS[i],
        date: termDate,
        type: i % 2 === 0 ? 'tiết' : 'khí',
      });
    }

    return terms;
  }

  /**
   * Lấy tiết khí hiện tại hoặc sắp tới
   */
  getCurrentSolarTerm(date: Date): ISolarTerm | null {
    const year = date.getFullYear();
    const terms = this.getSolarTermsInYear(year);

    // Tìm tiết khí hiện tại
    for (let i = terms.length - 1; i >= 0; i--) {
      if (date >= terms[i].date) {
        return terms[i];
      }
    }

    // Nếu không tìm thấy, có thể đang ở cuối năm trước
    const prevYearTerms = this.getSolarTermsInYear(year - 1);
    return prevYearTerms[prevYearTerms.length - 1];
  }

  /**
   * Tính ngày tiết khí (công thức gần đúng)
   */
  private calculateSolarTermDate(year: number, termIndex: number): Date {
    // Công thức gần đúng để tính tiết khí
    // Tiết khí được tính dựa trên vị trí của mặt trời trên hoàng đạo
    const baseDate = new Date(year, 0, 1); // 1/1/năm

    // Mỗi tiết khí cách nhau 15 độ trên hoàng đạo
    // Lập xuân thường rơi vào 4-5/2, tính từ đó
    const springStart = new Date(year, 1, 4); // 4/2 (gần đúng)
    const dayOffset = termIndex * 15.2; // Trung bình 15.2 ngày/tiết khí

    const termDate = new Date(springStart);
    termDate.setDate(springStart.getDate() + dayOffset);

    return termDate;
  }

  // ==================== GIỜ HOÀNG ĐẠO ====================

  getGoodHoursOfDay(dayChi: string): IGoodHour[] {
    const goodHours = this.goodHoursByDayChi[dayChi] ?? [];
    return this.allHoursInDay.map((hour) => ({
      ...hour,
      isGoodHour: goodHours.includes(hour.gioChi),
    }));
  }

  getGoodHoursFromCanChi(canChi: string): IGoodHour[] {
    const parts = canChi.trim().split(' ');
    const chi = parts.length === 2 ? parts[1] : '';
    return this.getGoodHoursOfDay(chi);
  }

  private chiAnimalMapping: Record<string, { name: string; image: string }> = {
    Tý: { name: 'Chuột', image: 'assets/images/chi/chuot.webp' },
    Sửu: { name: 'Trâu', image: 'assets/images/chi/trau.webp' },
    Dần: { name: 'Hổ', image: 'assets/images/chi/ho.webp' },
    Mão: { name: 'Mèo', image: 'assets/images/chi/meo.webp' },
    Thìn: { name: 'Rồng', image: 'assets/images/chi/rong.webp' },
    Tỵ: { name: 'Rắn', image: 'assets/images/chi/ran.webp' },
    Ngọ: { name: 'Ngựa', image: 'assets/images/chi/ngua.webp' },
    Mùi: { name: 'Dê', image: 'assets/images/chi/de.webp' },
    Thân: { name: 'Khỉ', image: 'assets/images/chi/khi.webp' },
    Dậu: { name: 'Gà', image: 'assets/images/chi/ga.webp' },
    Tuất: { name: 'Chó', image: 'assets/images/chi/cho.webp' },
    Hợi: { name: 'Lợn', image: 'assets/images/chi/lon.webp' },
  };

  private goodHoursByDayChi: Record<string, string[]> = {
    Tý: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    Sửu: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    Dần: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    Mão: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    Thìn: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Thân', 'Tuất'],
    Tỵ: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    Ngọ: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    Mùi: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    Thân: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    Dậu: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Thân', 'Tuất'],
    Tuất: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    Hợi: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
  };

  private allHoursInDay: Omit<IGoodHour, 'isGoodHour'>[] = [
    {
      gioChi: 'Tý',
      khungGio: '23:00 – 01:00',
      thanHoangDao: 'Tư Mệnh',
      chiImage: this.chiAnimalMapping['Tý'].image,
      chiName: this.chiAnimalMapping['Tý'].name,
    },
    {
      gioChi: 'Sửu',
      khungGio: '01:00 – 03:00',
      thanHoangDao: 'Thanh Long',
      chiImage: this.chiAnimalMapping['Sửu'].image,
      chiName: this.chiAnimalMapping['Sửu'].name,
    },
    {
      gioChi: 'Dần',
      khungGio: '03:00 – 05:00',
      thanHoangDao: 'Minh Đường',
      chiImage: this.chiAnimalMapping['Dần'].image,
      chiName: this.chiAnimalMapping['Dần'].name,
    },
    {
      gioChi: 'Mão',
      khungGio: '05:00 – 07:00',
      thanHoangDao: 'Kim Quỹ',
      chiImage: this.chiAnimalMapping['Mão'].image,
      chiName: this.chiAnimalMapping['Mão'].name,
    },
    {
      gioChi: 'Thìn',
      khungGio: '07:00 – 09:00',
      thanHoangDao: 'Thiên Đức',
      chiImage: this.chiAnimalMapping['Thìn'].image,
      chiName: this.chiAnimalMapping['Thìn'].name,
    },
    {
      gioChi: 'Tỵ',
      khungGio: '09:00 – 11:00',
      thanHoangDao: 'Ngọc Đường',
      chiImage: this.chiAnimalMapping['Tỵ'].image,
      chiName: this.chiAnimalMapping['Tỵ'].name,
    },
    {
      gioChi: 'Ngọ',
      khungGio: '11:00 – 13:00',
      thanHoangDao: 'Tư Mệnh',
      chiImage: this.chiAnimalMapping['Ngọ'].image,
      chiName: this.chiAnimalMapping['Ngọ'].name,
    },
    {
      gioChi: 'Mùi',
      khungGio: '13:00 – 15:00',
      thanHoangDao: 'Thanh Long',
      chiImage: this.chiAnimalMapping['Mùi'].image,
      chiName: this.chiAnimalMapping['Mùi'].name,
    },
    {
      gioChi: 'Thân',
      khungGio: '15:00 – 17:00',
      thanHoangDao: 'Minh Đường',
      chiImage: this.chiAnimalMapping['Thân'].image,
      chiName: this.chiAnimalMapping['Thân'].name,
    },
    {
      gioChi: 'Dậu',
      khungGio: '17:00 – 19:00',
      thanHoangDao: 'Kim Quỹ',
      chiImage: this.chiAnimalMapping['Dậu'].image,
      chiName: this.chiAnimalMapping['Dậu'].name,
    },
    {
      gioChi: 'Tuất',
      khungGio: '19:00 – 21:00',
      thanHoangDao: 'Thiên Đức',
      chiImage: this.chiAnimalMapping['Tuất'].image,
      chiName: this.chiAnimalMapping['Tuất'].name,
    },
    {
      gioChi: 'Hợi',
      khungGio: '21:00 – 23:00',
      thanHoangDao: 'Ngọc Đường',
      chiImage: this.chiAnimalMapping['Hợi'].image,
      chiName: this.chiAnimalMapping['Hợi'].name,
    },
  ];

  // ==================== NGÀY TỐT XẤU ====================

  /**
   * Đánh giá chất lượng ngày
   */
  getDayQuality(date: Date): IDayQuality {
    const canChi = this.lunarCalendarService.getDayCanChi(date);
    const lunar = this.lunarCalendarService.solarToLunar(date);

    // Tính trực của ngày
    const truc = this.calculateTruc(lunar.day, lunar.month);
    const trucInfo = this.getTrucInfo(truc);

    // Đánh giá hoàng đạo/hắc đạo
    const isGoodDay = this.isGoodDay(canChi, truc);

    return {
      isGoodDay,
      quality: isGoodDay ? 'hoàng-đạo' : 'hắc-đạo',
      truc: truc,
      trucDescription: trucInfo.description,
      suitableFor: trucInfo.suitableFor,
      avoidFor: trucInfo.avoidFor,
      conflictAges: this.getConflictAges(canChi),
    };
  }

  /**
   * Tính trực của ngày (Kiến trừ thập nhị khách)
   */
  private calculateTruc(lunarDay: number, lunarMonth: number): string {
    // Công thức tính trực: (ngày âm + tháng âm) % 12
    const trucIndex = (lunarDay + lunarMonth - 2) % 12;
    return this.TRUC_NAMES[trucIndex];
  }

  /**
   * Lấy thông tin về trực
   */
  private getTrucInfo(truc: string): {
    description: string;
    suitableFor: string[];
    avoidFor: string[];
  } {
    const trucInfoMap: { [key: string]: any } = {
      Kiến: {
        description: 'Tốt cho khởi công, xây dựng, khai trương',
        suitableFor: ['động thổ', 'khai trương', 'khởi công'],
        avoidFor: ['tang lễ', 'chôn cất'],
      },
      Trừ: {
        description: 'Tốt cho dọn dẹp, tẩy rửa, trừ bệnh',
        suitableFor: ['dọn dẹp', 'tẩy rửa'],
        avoidFor: ['cưới hỏi', 'khai trương'],
      },
      Mãn: {
        description: 'Tốt cho cưới hỏi, khai trương',
        suitableFor: ['cưới hỏi', 'lễ tế'],
        avoidFor: ['xuất hành', 'động thổ'],
      },
      Bình: {
        description: 'Ngày bình thường, tốt cho mọi việc',
        suitableFor: ['mọi việc'],
        avoidFor: [],
      },
      Định: {
        description: 'Tốt cho ký kết, nhậm chức',
        suitableFor: ['ký kết', 'nhậm chức'],
        avoidFor: ['xuất hành', 'di chuyển'],
      },
      Chấp: {
        description: 'Tốt cho học tập, sửa chữa',
        suitableFor: ['học tập', 'sửa chữa'],
        avoidFor: ['cưới hỏi'],
      },
      Phá: {
        description: 'Tốt cho phá dỡ, dọn dẹp',
        suitableFor: ['phá dỡ', 'dọn dẹp'],
        avoidFor: ['cưới hỏi', 'khai trương', 'động thổ'],
      },
      Nguy: {
        description: 'Ngày xấu, nên tránh mọi việc quan trọng',
        suitableFor: [],
        avoidFor: ['mọi việc quan trọng'],
      },
      Thành: {
        description: 'Tốt cho hoàn thành, kết thúc',
        suitableFor: ['hoàn thành công việc', 'ký kết'],
        avoidFor: ['khởi đầu'],
      },
      Thu: {
        description: 'Tốt cho thu hoạch, tích trữ',
        suitableFor: ['thu hoạch', 'tích trữ'],
        avoidFor: ['xuất hành'],
      },
      Khai: {
        description: 'Tốt cho khởi đầu, khai trương',
        suitableFor: ['khai trương', 'khởi đầu'],
        avoidFor: ['chôn cất'],
      },
      Bế: {
        description: 'Ngày xấu, chỉ tốt cho đắp đê, lấp hố',
        suitableFor: ['đắp đê', 'lấp hố'],
        avoidFor: ['mọi việc khác'],
      },
    };

    return (
      trucInfoMap[truc] || { description: '', suitableFor: [], avoidFor: [] }
    );
  }

  /**
   * Đánh giá ngày tốt xấu
   */
  private isGoodDay(canChi: string, truc: string): boolean {
    // Ngày hoàng đạo thường là: Kiến, Trừ, Mãn, Bình, Định, Chấp, Thành, Thu, Khai
    const goodTruc = ['Kiến', 'Mãn', 'Bình', 'Định', 'Thành', 'Khai'];
    return goodTruc.includes(truc);
  }

  /**
   * Lấy tuổi xung khắc
   */
  private getConflictAges(canChi: string): string[] {
    // Đây là một phiên bản đơn giản, thực tế cần tra cứu bảng xung khắc chính xác
    const [can, chi] = canChi.split(' ');

    // Xung khắc dựa trên Chi
    const conflictMap: { [key: string]: string[] } = {
      Tý: ['Ngọ'],
      Sửu: ['Mùi'],
      Dần: ['Thân'],
      Mão: ['Dậu'],
      Thìn: ['Tuất'],
      Tỵ: ['Hợi'],
      Ngọ: ['Tý'],
      Mùi: ['Sửu'],
      Thân: ['Dần'],
      Dậu: ['Mão'],
      Tuất: ['Thìn'],
      Hợi: ['Tỵ'],
    };

    return conflictMap[chi] || [];
  }

  // ==================== HELPER METHODS ====================

  /**
   * Kiểm tra ngày có phải là tiết khí không
   */
  isSolarTermDay(date: Date): ISolarTerm | null {
    const year = date.getFullYear();
    const terms = this.getSolarTermsInYear(year);

    return (
      terms.find((term) => term.date.toDateString() === date.toDateString()) ||
      null
    );
  }
}
