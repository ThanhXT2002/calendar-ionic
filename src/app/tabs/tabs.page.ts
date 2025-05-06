import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, calendar, sunny, star, settings, albums } from 'ionicons/icons';
import { HeaderComponent } from "../components/header/header.component";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, HeaderComponent],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  title = 'Lịch - Tổng quan';

  constructor() {
    addIcons({ albums, calendar, sunny, settings, star });
  }

  onClickTab(tab: string) {
    console.log('Tab clicked:', tab);
    this.title = "Lịch - " + tab;
  }

}
