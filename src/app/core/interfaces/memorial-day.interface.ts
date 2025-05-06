export interface IMemorialDay {
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
    | 'social'
    | 'professional'
    | 'political'
    | 'memorial'
    | 'public_holiday'
    | 'international'
    | 'education'
    | 'environment'
    | 'family'
    | 'children'
    | 'legal'
    | 'health'
    | 'women'
    | 'youth'
     | 'memorial';
  duration?: number;
  significance?: 'local' | 'regional' | 'national' | 'international';
  officialStatus?: 'official' | 'unofficial' | 'recognized';
}
