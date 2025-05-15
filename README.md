# Lịch-TXT

Ứng dụng lịch âm - dương trực quan, được thiết kế đặc biệt dành cho người lớn tuổi, hỗ trợ chế độ audio cho người mắt kém.

![App Preview](/assets/icons/icon-512x512.png)

## Tính năng chính

- **Xem lịch âm-dương song song**: Hiển thị rõ ràng cả lịch âm và dương cùng lúc
- **Hỗ trợ chế độ trợ giọng nói**: Đọc ngày tháng cho người khiếm thị hoặc mắt yếu
- **Hiển thị sự kiện sắp tới**: Tự động tính toán và hiển thị các lễ hội, ngày lễ quan trọng
- **Thiết kế tối ưu cho người cao tuổi**: Font chữ lớn, màu sắc tương phản cao
- **Hỗ trợ đầy đủ trên web và thiết bị di động**: Làm việc trên cả PWA và ứng dụng native Android

## Công nghệ sử dụng

- **Framework**: [Ionic](https://ionicframework.com/) + [Angular 19](https://angular.io/)
- **UI/UX**: [TailwindCSS](https://tailwindcss.com/)
- **PWA Support**: Angular Service Worker
- **Ngôn ngữ lập trình**: TypeScript
- **API**: Google Text-to-Speech API
- **Thư viện lịch âm**: viet-lunar-calendar

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- NPM hoặc Yarn
- Angular CLI
- Ionic CLI

### Cài đặt các dependency
```bash
# Cài đặt Ionic CLI
npm install -g @ionic/cli

# Cài đặt các dependency của dự án
npm install
```

### Chạy dự án trong môi trường phát triển
```bash
npm start
# HOẶC
ionic serve --port 4400 --host 0.0.0.0
```

### Build cho production
```bash
npm run build
# HOẶC
ionic build --prod
```

### Triển khai lên Vercel
```bash
npm run build:vercel
```

### Build ứng dụng Android
```bash
npm run android:setup
```

## Cấu trúc dự án

```
Lịch-TXT/
├── src/                      # Mã nguồn chính
│   ├── app/                  # Components Angular
│   │   ├── core/             # Core services và interfaces
│   │   │   ├── data/         # Dữ liệu tĩnh (lễ hội, ngày kỷ niệm)
│   │   │   ├── interfaces/   # Các interface TypeScript
│   │   │   └── services/     # Các service (lịch, TTS, storage)
│   │   ├── components/       # Các component dùng chung
│   │   ├── tab1/             # Tab Tổng quan
│   │   ├── tab2/             # Tab Bảng lịch
│   │   └── tabs/             # Quản lý tabs
│   ├── assets/               # Tài nguyên tĩnh
│   ├── environments/         # Biến môi trường
│   └── theme/                # Cấu hình giao diện
├── capacitor.config.ts       # Cấu hình Capacitor
├── ionic.config.json         # Cấu hình Ionic
├── angular.json              # Cấu hình Angular
└── tailwind.config.js        # Cấu hình Tailwind CSS
```

## Biến môi trường

Ứng dụng yêu cầu một API key của Google Text-to-Speech để hoạt động đầy đủ. Bạn cần tạo file `environment.ts` và `environment.prod.ts` trong thư mục `src/environments/` với nội dung sau:

```typescript
export const environment = {
  production: false, // true cho environment.prod.ts
  apiKey: 'YOUR_GOOGLE_TTS_API_KEY',
};
```

Bạn có thể sử dụng script `generate-env.js` để tạo file này tự động:

```bash
API_KEY=your_api_key node generate-env.js
```

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Nếu bạn muốn đóng góp, vui lòng:

1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## Giấy phép

Dự án được phân phối theo giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## Liên hệ

Trần Xuân Thanh - tranxuanthanhtxt2002@gmail.com

Website: [https://tranxuanthanhtxt.com](https://tranxuanthanhtxt.com)
