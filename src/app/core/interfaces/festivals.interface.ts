export interface IFestival {
  name: string;
  description: string;
  date: number;
  month: number;
  isLunar: boolean;
  region?: string[];
  type:
    | 'cultural'
    | 'religious'
    | 'historical'
    | 'agricultural'
    | 'maritime'
    | 'spiritual'
    | 'ethnic'
    | 'traditional'
    | 'national'
    | 'ceremonial'
    | 'sport'
    | 'folk'
    | 'royal'
    | 'memorial';
  duration?: number;
  significance?: 'local' | 'regional' | 'national' | 'international';
  officialStatus?: 'official' | 'unofficial' | 'recognized';
}
