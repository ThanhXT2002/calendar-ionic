import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle } from "@ionic/angular/standalone";
import { isPlatform } from '@ionic/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonTitle, IonToolbar, IonHeader, CommonModule],
})
export class HeaderComponent implements OnInit {
  isIOS = isPlatform('ios');

  @Input() name?: string;
  constructor() {}

  getMarginTopClass() {
    if (this.isIOS) {
      return 'mt-1';
    }

    return;
  }

  getPadingClass() {
    if (this.isIOS) {
      return 'py-2';
    }

    return;
  }

  ngOnInit() {}
}
