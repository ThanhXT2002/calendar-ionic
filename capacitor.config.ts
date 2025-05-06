import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.calendar',
  appName: 'Lịch-TXT',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'DARK', // Hoặc 'LIGHT'
      backgroundColor: '#e5e7eb', // Mã màu hex
    },
  },
};

export default config;
