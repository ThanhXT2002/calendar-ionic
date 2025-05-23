import { Injectable } from '@angular/core';
import { LunarCalendarService } from './lunar-calendar.service';
import { IDayQuality, IGoodHour, ISolarTerm } from 'src/app/core/interfaces/calendar-day.interface';



@Injectable({
  providedIn: 'root',
})
export class ExtendedLunarService {

  // 24 tiết khí theo thứ tự
  private readonly SOLAR_TERMS = [
    'Lập xuân', 'Vũ thủy', 'Kinh trập', 'Xuân phân',
    'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn',
    'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử',
    'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân',
    'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết',
    'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn'
  ];

  // 12 trực (Kiến trừ thập nhị khách)
  private readonly TRUC_NAMES = [
    'Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp',
    'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'
  ];

  // 12 giờ hoàng đạo theo Can Chi
  private readonly GOOD_HOURS_MAP: { [key: string]: IGoodHour[] } = {
    'Giáp': [
      { name: 'Thanh Long', description: 'Sao Thiên Ất tinh', startTime: '07:00', endTime: '09:00', isGood: true, suitableFor: ['cưới hỏi', 'khai trương', 'thi cử'] },
      { name: 'Minh Đường', description: 'Sao Quý Nhân tinh', startTime: '09:00', endTime: '11:00', isGood: true, suitableFor: ['động thổ', 'nhậm chức'] },
      // ... thêm các giờ khác
    ],
    // ... thêm các can khác
  };

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
        type: i % 2 === 0 ? 'tiết' : 'khí'
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

  /**
   * Lấy giờ hoàng đạo của ngày
   */
  getGoodHours(date: Date): IGoodHour[] {
    const canChi = this.lunarCalendarService.getDayCanChi(date);
    const can = canChi.split(' ')[0]; // Lấy Can

    // Tính giờ hoàng đạo dựa trên Can của ngày
    return this.calculateGoodHoursForCan(can);
  }

  private calculateGoodHoursForCan(can: string): IGoodHour[] {
    // Công thức tính giờ hoàng đạo dựa trên Can của ngày
    const goodHours: IGoodHour[] = [];

    // Mỗi Can có quy luật riêng về giờ hoàng đạo
    const hourMapping = this.getHourMappingForCan(can);

    hourMapping.forEach(hour => {
      goodHours.push(hour);
    });

    return goodHours;
  }

  private getHourMappingForCan(can: string): IGoodHour[] {
    // Đây là một phiên bản đơn giản, thực tế cần tra cứu bảng chính xác
    const baseHours: IGoodHour[] = [
      { name: 'Thanh Long', description: 'Sao Thiên Ất tinh', startTime: '07:00', endTime: '09:00', isGood: true, suitableFor: ['cưới hỏi', 'khai trương'] },
      { name: 'Minh Đường', description: 'Sao Quý Nhân tinh', startTime: '09:00', endTime: '11:00', isGood: true, suitableFor: ['động thổ', 'nhậm chức'] },
      { name: 'Kim Đường', description: 'Sao Địa Tài tinh', startTime: '15:00', endTime: '17:00', isGood: true, suitableFor: ['khởi công', 'khai trương'] },
      { name: 'Ngọc Đường', description: 'Sao Thiếu Vi tinh', startTime: '17:00', endTime: '19:00', isGood: true, suitableFor: ['thi cử', 'nhậm chức'] },
      { name: 'Tư Mệnh', description: 'Sao Phượng Liễn tinh', startTime: '21:00', endTime: '23:00', isGood: true, suitableFor: ['ký kết hợp đồng'] },
    ];

    return baseHours;
  }

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
      conflictAges: this.getConflictAges(canChi)
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
  private getTrucInfo(truc: string): { description: string; suitableFor: string[]; avoidFor: string[] } {
    const trucInfoMap: { [key: string]: any } = {
      'Kiến': {
        description: 'Tốt cho khởi công, xây dựng, khai trương',
        suitableFor: ['động thổ', 'khai trương', 'khởi công'],
        avoidFor: ['tang lễ', 'chôn cất']
      },
      'Trừ': {
        description: 'Tốt cho dọn dẹp, tẩy rửa, trừ bệnh',
        suitableFor: ['dọn dẹp', 'tẩy rửa'],
        avoidFor: ['cưới hỏi', 'khai trương']
      },
      'Mãn': {
        description: 'Tốt cho cưới hỏi, khai trương',
        suitableFor: ['cưới hỏi', 'lễ tế'],
        avoidFor: ['xuất hành', 'động thổ']
      },
      'Bình': {
        description: 'Ngày bình thường, tốt cho mọi việc',
        suitableFor: ['mọi việc'],
        avoidFor: []
      },
      'Định': {
        description: 'Tốt cho ký kết, nhậm chức',
        suitableFor: ['ký kết', 'nhậm chức'],
        avoidFor: ['xuất hành', 'di chuyển']
      },
      'Chấp': {
        description: 'Tốt cho học tập, sửa chữa',
        suitableFor: ['học tập', 'sửa chữa'],
        avoidFor: ['cưới hỏi']
      },
      'Phá': {
        description: 'Tốt cho phá dỡ, dọn dẹp',
        suitableFor: ['phá dỡ', 'dọn dẹp'],
        avoidFor: ['cưới hỏi', 'khai trương', 'động thổ']
      },
      'Nguy': {
        description: 'Ngày xấu, nên tránh mọi việc quan trọng',
        suitableFor: [],
        avoidFor: ['mọi việc quan trọng']
      },
      'Thành': {
        description: 'Tốt cho hoàn thành, kết thúc',
        suitableFor: ['hoàn thành công việc', 'ký kết'],
        avoidFor: ['khởi đầu']
      },
      'Thu': {
        description: 'Tốt cho thu hoạch, tích trữ',
        suitableFor: ['thu hoạch', 'tích trữ'],
        avoidFor: ['xuất hành']
      },
      'Khai': {
        description: 'Tốt cho khởi đầu, khai trương',
        suitableFor: ['khai trương', 'khởi đầu'],
        avoidFor: ['chôn cất']
      },
      'Bế': {
        description: 'Ngày xấu, chỉ tốt cho đắp đê, lấp hố',
        suitableFor: ['đắp đê', 'lấp hố'],
        avoidFor: ['mọi việc khác']
      }
    };

    return trucInfoMap[truc] || { description: '', suitableFor: [], avoidFor: [] };
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
      'Tý': ['Ngọ'],
      'Sửu': ['Mùi'],
      'Dần': ['Thân'],
      'Mão': ['Dậu'],
      'Thìn': ['Tuất'],
      'Tỵ': ['Hợi'],
      'Ngọ': ['Tý'],
      'Mùi': ['Sửu'],
      'Thân': ['Dần'],
      'Dậu': ['Mão'],
      'Tuất': ['Thìn'],
      'Hợi': ['Tỵ']
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

    return terms.find(term =>
      term.date.toDateString() === date.toDateString()
    ) || null;
  }

  /**
   * Lấy giờ tốt nhất trong ngày
   */
  getBestHourOfDay(date: Date): IGoodHour | null {
    const goodHours = this.getGoodHours(date);
    const now = new Date();

    // Nếu là ngày hiện tại, chỉ lấy giờ chưa qua
    if (date.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      return goodHours.find(hour => {
        const startHour = parseInt(hour.startTime.split(':')[0]);
        return startHour > currentHour;
      }) || null;
    }

    // Nếu là ngày khác, lấy giờ đầu tiên
    return goodHours[0] || null;
  }
}
