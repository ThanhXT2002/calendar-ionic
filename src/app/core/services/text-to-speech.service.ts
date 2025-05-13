import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private readonly apiKey = environment.apiKey; // ⚠️ bảo mật nếu dùng production
  private readonly apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;

  constructor(private http: HttpClient) {}
  speak(text: string) {
    const body = {
      input: { text },
      voice: {
        languageCode: 'vi-VN',
        name: 'vi-VN-Wavenet-A', // giọng tự nhiên, có thể đổi A/B
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    return this.http.post<any>(this.apiUrl, body);
  }
}
