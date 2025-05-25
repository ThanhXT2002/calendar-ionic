import { Injectable } from '@angular/core';
import { LunarCalendarService } from './lunar-calendar.service';
import { IDateGoodBadInfo, IDayAnalysis, IDayQuality, IGoodHour, ISolarTerm } from 'src/app/core/interfaces/calendar-day.interface';



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

  private goodHoursByDayChi: Record<string, string[]> = {
    Tý: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    Sửu: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    Dần: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    Mão: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    Thìn: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    Tỵ: ['Sửu', 'thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
    Ngọ: ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    Mùi: ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    Thân: ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    Dậu: ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    Tuất: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    Hợi: ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
  };

  private allHoursInDay: Omit<IGoodHour, 'isGoodHour'>[] = [
    {
      gioChi: 'Tý',
      khungGio: '23–1',
      chiImage: 'assets/images/chi/chuot.webp',
    },
    {
      gioChi: 'Sửu',
      khungGio: '1–3',
      chiImage: 'assets/images/chi/trau.webp',
    },
    {
      gioChi: 'Dần',
      khungGio: '3–5',
      chiImage: 'assets/images/chi/ho.webp',
    },
    {
      gioChi: 'Mão',
      khungGio: '5–7',
      chiImage: 'assets/images/chi/meo.webp',
    },
    {
      gioChi: 'Thìn',
      khungGio: '7–9',
      chiImage: 'assets/images/chi/rong.webp',
    },
    {
      gioChi: 'Tỵ',
      khungGio: '9–11',
      chiImage: 'assets/images/chi/ran.webp',
    },
    {
      gioChi: 'Ngọ',
      khungGio: '11–13',
      chiImage: 'assets/images/chi/ngua.webp',
    },
    {
      gioChi: 'Mùi',
      khungGio: '13–15',
      chiImage: 'assets/images/chi/de.webp',
    },
    {
      gioChi: 'Thân',
      khungGio: '15–17',
      chiImage: 'assets/images/chi/khi.webp',
    },
    {
      gioChi: 'Dậu',
      khungGio: '17–19',
      chiImage: 'assets/images/chi/ga.webp',
    },
    {
      gioChi: 'Tuất',
      khungGio: '19–21',
      chiImage: 'assets/images/chi/cho.webp',
    },
    {
      gioChi: 'Hợi',
      khungGio: '21–23',
      chiImage: 'assets/images/chi/lon.webp',
    },
  ];

  // ==================== NGÀY TỐT XẤU ====================

  // Cấu trúc: [Tháng][Chi] = Tên Thần
  private readonly DATE_GOOD_BAD_LOOKUP_TABLE: {
    [key: string]: { [key: string]: string };
  } = {
    // Tháng 1 & 7
    '1,7': {
      Tý: 'Thanh Long',
      Sửu: 'Minh Đường',
      Dần: 'Thiên Hình',
      Mão: 'Chu Tước',
      Thìn: 'Kim Quý',
      Tỵ: 'Kim Đường',
      Ngọ: 'Bạch Hổ',
      Mùi: 'Ngọc Đường',
      Thân: 'Thiên Lao',
      Dậu: 'Nguyên Vũ',
      Tuất: 'Tư Mệnh',
      Hợi: 'Câu Trần',
    },
    // Tháng 2 & 8
    '2,8': {
      Tý: 'Tư Mệnh',
      Sửu: 'Câu Trần',
      Dần: 'Thanh Long',
      Mão: 'Minh Đường',
      Thìn: 'Thiên Hình',
      Tỵ: 'Chu Tước',
      Ngọ: 'Kim Quý',
      Mùi: 'Kim Đường',
      Thân: 'Bạch Hổ',
      Dậu: 'Ngọc Đường',
      Tuất: 'Thiên Lao',
      Hợi: 'Nguyên Vũ',
    },
    // Tháng 3 & 9
    '3,9': {
      Tý: 'Thiên Lao',
      Sửu: 'Nguyên Vũ',
      Dần: 'Tư Mệnh',
      Mão: 'Câu Trần',
      Thìn: 'Thanh Long',
      Tỵ: 'Minh Đường',
      Ngọ: 'Thiên Hình',
      Mùi: 'Chu Tước',
      Thân: 'Kim Quý',
      Dậu: 'Kim Đường',
      Tuất: 'Bạch Hổ',
      Hợi: 'Ngọc Đường',
    },
    // Tháng 4 & 10
    '4,10': {
      Tý: 'Bạch Hổ',
      Sửu: 'Ngọc Đường',
      Dần: 'Thiên Lao',
      Mão: 'Nguyên Vũ',
      Thìn: 'Tư Mệnh',
      Tỵ: 'Câu Trần',
      Ngọ: 'Thanh Long',
      Mùi: 'Minh Đường',
      Thân: 'Thiên Hình',
      Dậu: 'Chu Tước',
      Tuất: 'Kim Quý',
      Hợi: 'Kim Đường',
    },
    // Tháng 5 & 11
    '5,11': {
      Tý: 'Kim Quý',
      Sửu: 'Kim Đường',
      Dần: 'Bạch Hổ',
      Mão: 'Ngọc Đường',
      Thìn: 'Thiên Lao',
      Tỵ: 'Nguyên Vũ',
      Ngọ: 'Tư Mệnh',
      Mùi: 'Câu Trần',
      Thân: 'Thanh Long',
      Dậu: 'Minh Đường',
      Tuất: 'Thiên Hình',
      Hợi: 'Chu Tước',
    },
    // Tháng 6 & 12
    '6,12': {
      Tý: 'Thiên Hình',
      Sửu: 'Chu Tước',
      Dần: 'Kim Quý',
      Mão: 'Kim Đường',
      Thìn: 'Bạch Hổ',
      Tỵ: 'Ngọc Đường',
      Ngọ: 'Thiên Lao',
      Mùi: 'Nguyên Vũ',
      Thân: 'Tư Mệnh',
      Dậu: 'Câu Trần',
      Tuất: 'Thanh Long',
      Hợi: 'Minh Đường',
    },
  };

  // Thông tin chi tiết cho 12 thần hoàng đạo
  private readonly DATE_GOOD_BAD_DETAILS: { [key: string]: IDateGoodBadInfo } =
    {
      'Thanh Long': {
        name: 'Thanh Long',
        type: 'auspicious',
        description:
          'Thanh Long - Thần rồng xanh phương Đông, mang lại may mắn và thịnh vượng',
        favorableFor: [
          'Khởi công',
          'Khai trương',
          'Cưới hỏi',
          'Di chuyển',
          'Giao dịch',
          'Ký kết',
        ],
        unfavorableFor: ['Chôn cất'],
        color: 'text-green-600',
        image: 'assets/images/god/thanh-long.webp',
      },
      'Minh Đường': {
        name: 'Minh Đường',
        type: 'auspicious',
        description:
          'Minh Đường - Cung điện sáng sủa, tốt cho việc học hành và làm quan',
        favorableFor: [
          'Học hành',
          'Thi cử',
          'Nhậm chức',
          'Khai giảng',
          'Cầu công danh',
        ],
        unfavorableFor: ['Tang lễ'],
        color: 'text-green-600',
        image: 'assets/images/god/minh-duong.webp',
      },
      'Kim Quý': {
        name: 'Kim Quý',
        type: 'auspicious',
        description: 'Kim Quý - Thần kim quý, tốt cho tài lộc và thương mại',
        favorableFor: [
          'Giao dịch',
          'Buôn bán',
          'Mở cửa hàng',
          'Cầu tài',
          'Đầu tư',
        ],
        unfavorableFor: ['Cho vay tiền'],
        color: 'text-green-600',
        image: 'assets/images/god/kim-quy.webp',
      },
      'Kim Đường': {
        name: 'Kim Đường',
        type: 'auspicious',
        description: 'Kim Đường - Cung điện vàng, rất tốt cho mọi việc',
        favorableFor: [
          'Mọi việc đều tốt',
          'Cưới hỏi',
          'Xây dựng',
          'Khai trương',
        ],
        unfavorableFor: [],
        color: 'text-green-600',
        image: 'assets/images/god/kim-duong.webp',
      },
      'Ngọc Đường': {
        name: 'Ngọc Đường',
        type: 'auspicious',
        description: 'Ngọc Đường - Cung điện ngọc, tốt cho các việc cao quý',
        favorableFor: ['Cưới hỏi', 'Lễ hội', 'Khánh thành', 'Cầu phúc'],
        unfavorableFor: ['Kiện tụng'],
        color: 'text-green-600',
        image: 'assets/images/god/ngoc-duong.webp',
      },
      'Tư Mệnh': {
        name: 'Tư Mệnh',
        type: 'auspicious',
        description:
          'Tư Mệnh - Thần quản lý số mệnh, tốt cho việc cầu an và sức khỏe',
        favorableFor: ['Cầu an', 'Khám bệnh', 'Uống thuốc', 'Dưỡng sinh'],
        unfavorableFor: ['Khởi công lớn'],
        color: 'text-green-600',
        image: 'assets/images/god/tu-menh.webp',
      },
      'Thiên Hình': {
        name: 'Thiên Hình',
        type: 'inauspicious',
        description:
          'Thiên Hình - Thần hình phạt, xấu cho việc ký kết và pháp lý',
        favorableFor: ['Trừ tà', 'Diệt trừ'],
        unfavorableFor: ['Ký kết', 'Kiện tụng', 'Giao dịch', 'Cưới hỏi'],
        color: 'text-red-600',
        image: 'assets/images/god/thien-hinh.webp',
      },
      'Chu Tước': {
        name: 'Chu Tước',
        type: 'inauspicious',
        description:
          'Chu Tước - Chim đỏ hung dữ, xấu cho giao tiếp và tranh tụng',
        favorableFor: ['Câm lặng', 'Tu tâm'],
        unfavorableFor: ['Tranh tụng', 'Đàm phán', 'Ký kết', 'Giao tiếp'],
        color: 'text-red-600',
        image: 'assets/images/god/chu-tuoc.webp',
      },
      'Bạch Hổ': {
        name: 'Bạch Hổ',
        type: 'inauspicious',
        description:
          'Bạch Hổ - Hổ trắng hung ác, mang lại bất hạnh và xung đột',
        favorableFor: ['Việc quân sự', 'Phá dỡ'],
        unfavorableFor: [
          'Cưới hỏi',
          'Khai trương',
          'Đi xa',
          'Quyết định quan trọng',
        ],
        color: 'text-red-600',
        image: 'assets/images/god/bach-ho.webp',
      },
      'Thiên Lao': {
        name: 'Thiên Lao',
        type: 'inauspicious',
        description: 'Thiên Lao - Ngục trời, hạn chế tự do và di chuyển',
        favorableFor: ['Nghỉ ngơi', 'Suy tư'],
        unfavorableFor: [
          'Đi xa',
          'Khởi nghiệp',
          'Cưới hỏi',
          'Họp hành quan trọng',
        ],
        color: 'text-red-600',
        image: 'assets/images/god/thien-lao.webp',
      },
      'Nguyên Vũ': {
        name: 'Nguyên Vũ',
        type: 'inauspicious',
        description:
          'Nguyên Vũ - Thần tướng tối, mang lại chướng ngại và khó khăn',
        favorableFor: ['Phòng thủ', 'Nghi lễ bảo vệ'],
        unfavorableFor: ['Khởi sự mới', 'Cưới hỏi', 'Khai trương', 'Đi xa'],
        color: 'text-red-600',
        image: 'assets/images/god/nguyen-vu.webp',
      },
      'Câu Trần': {
        name: 'Câu Trần',
        type: 'inauspicious',
        description: 'Câu Trần - Sao chó, gây rối loạn và xui xẻo',
        favorableFor: ['Dọn dẹp', 'Tẩy uế'],
        unfavorableFor: [
          'Mọi việc quan trọng',
          'Cưới hỏi',
          'Giao dịch',
          'Đi xa',
        ],
        color: 'text-red-600',
        image: 'assets/images/god/cau-tran.webp',
      },
    };

  /**
   * Lấy tên thần hoàng đạo dựa trên chi của ngày và tháng âm lịch
   * @param dayBranch - Chi của ngày (Tý, Sửu, Dần, etc.)
   * @param lunarMonth - Tháng âm lịch (1-12)
   * @returns Tên thần hoặc null nếu không tìm thấy
   */
  getDateGoodBadByChiAndMonth(
    dayBranch: string,
    lunarMonth: number
  ): string | null {
    // Tìm nhóm tháng phù hợp
    const monthKey = this.getMonthKey(lunarMonth);

    if (!monthKey || !this.DATE_GOOD_BAD_LOOKUP_TABLE[monthKey]) {
      return null;
    }

    return this.DATE_GOOD_BAD_LOOKUP_TABLE[monthKey][dayBranch] || null;
  }

  /**
   * Lấy thông tin chi tiết về ngày bao gồm hoàng đạo hắc đạo
   * @param date - Ngày cần phân tích
   * @param dayBranch - Chi của ngày
   * @param lunarMonth - Tháng âm lịch
   * @returns Phân tích chi tiết về ngày
   */
  getDetailedDayInfo(
    date: Date,
    dayBranch: string,
    lunarMonth: number
  ): IDayAnalysis {
    const godName = this.getDateGoodBadByChiAndMonth(dayBranch, lunarMonth);

    if (!godName) {
      throw new Error(
        `Không thể xác định hoàng đạo hắc đạo cho chi: ${dayBranch}, tháng: ${lunarMonth}`
      );
    }

    const dateGoodBadInfo = this.DATE_GOOD_BAD_DETAILS[godName];

    if (!dateGoodBadInfo) {
      throw new Error(`Không tìm thấy thông tin chi tiết cho thần: ${godName}`);
    }

    return {
      date,
      lunarMonth,
      dayBranch,
      godName,
      dayType: dateGoodBadInfo.type,
      dateGoodBadInfo,
      isAuspicious: dateGoodBadInfo.type === 'auspicious',
      isInauspicious: dateGoodBadInfo.type === 'inauspicious',
    };
  }

  /**
   * Kiểm tra ngày có phải ngày hoàng đạo không
   * @param dayBranch - Chi của ngày
   * @param lunarMonth - Tháng âm lịch
   */
  isAuspiciousDay(dayBranch: string, lunarMonth: number): boolean {
    const godName = this.getDateGoodBadByChiAndMonth(dayBranch, lunarMonth);
    if (!godName) return false;

    const info = this.DATE_GOOD_BAD_DETAILS[godName];
    return info ? info.type === 'auspicious' : false;
  }

  /**
   * Kiểm tra ngày có phải ngày hắc đạo không
   * @param dayBranch - Chi của ngày
   * @param lunarMonth - Tháng âm lịch
   */
  isInauspiciousDay(dayBranch: string, lunarMonth: number): boolean {
    const godName = this.getDateGoodBadByChiAndMonth(dayBranch, lunarMonth);
    if (!godName) return false;

    const info = this.DATE_GOOD_BAD_DETAILS[godName];
    return info ? info.type === 'inauspicious' : false;
  }

  /**
   * Lấy tất cả ngày hoàng đạo trong tháng âm lịch
   * @param lunarMonth - Tháng âm lịch (1-12)
   */
  getAuspiciousDaysInMonth(lunarMonth: number): string[] {
    const monthKey = this.getMonthKey(lunarMonth);
    if (!monthKey) return [];

    const monthData = this.DATE_GOOD_BAD_LOOKUP_TABLE[monthKey];
    const auspiciousBranches: string[] = [];

    Object.entries(monthData).forEach(([branch, godName]) => {
      const info = this.DATE_GOOD_BAD_DETAILS[godName];
      if (info && info.type === 'auspicious') {
        auspiciousBranches.push(branch);
      }
    });

    return auspiciousBranches;
  }

  /**
   * Lấy tất cả ngày hắc đạo trong tháng âm lịch
   * @param lunarMonth - Tháng âm lịch (1-12)
   */
  getInauspiciousDaysInMonth(lunarMonth: number): string[] {
    const monthKey = this.getMonthKey(lunarMonth);
    if (!monthKey) return [];

    const monthData = this.DATE_GOOD_BAD_LOOKUP_TABLE[monthKey];
    const inauspiciousBranches: string[] = [];

    Object.entries(monthData).forEach(([branch, godName]) => {
      const info = this.DATE_GOOD_BAD_DETAILS[godName];
      if (info && info.type === 'inauspicious') {
        inauspiciousBranches.push(branch);
      }
    });

    return inauspiciousBranches;
  }

  /**
   * Lấy danh sách 6 thần hoàng đạo
   */
  getAuspiciousGods(): string[] {
    return Object.keys(this.DATE_GOOD_BAD_DETAILS).filter(
      (godName) => this.DATE_GOOD_BAD_DETAILS[godName].type === 'auspicious'
    );
  }

  /**
   * Lấy danh sách 6 thần hắc đạo
   */
  getInauspiciousGods(): string[] {
    return Object.keys(this.DATE_GOOD_BAD_DETAILS).filter(
      (godName) => this.DATE_GOOD_BAD_DETAILS[godName].type === 'inauspicious'
    );
  }

  /**
   * Lấy khóa tháng cho bảng tra cứu
   * @param lunarMonth - Tháng âm lịch (1-12)
   * @private
   */
  private getMonthKey(lunarMonth: number): string | null {
    if (lunarMonth === 1 || lunarMonth === 7) return '1,7';
    if (lunarMonth === 2 || lunarMonth === 8) return '2,8';
    if (lunarMonth === 3 || lunarMonth === 9) return '3,9';
    if (lunarMonth === 4 || lunarMonth === 10) return '4,10';
    if (lunarMonth === 5 || lunarMonth === 11) return '5,11';
    if (lunarMonth === 6 || lunarMonth === 12) return '6,12';
    return null;
  }

  /**
   * Lấy class màu hiển thị cho UI
   * @param godName - Tên thần
   */
  getDisplayColor(godName: string): string {
    const info = this.DATE_GOOD_BAD_DETAILS[godName];
    return info ? info.color : 'text-gray-600';
  }

  /**
   * Lấy class icon hiển thị cho UI
   * @param godName - Tên thần
   */
  getDisplayIcon(godName: string): string {
    const info = this.DATE_GOOD_BAD_DETAILS[godName];
    return info ? info.image : 'assets/images/avatar-default.webp';
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
