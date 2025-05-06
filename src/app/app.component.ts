import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { isPlatform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {}

  async ngOnInit() {
  if (isPlatform('capacitor')) {
    // Đặt nền status bar khác với header
    await StatusBar.setBackgroundColor({ color: '#a8b0bd' }); // gray-100
    // Icon status bar màu đen
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.show();
  }
}
}
