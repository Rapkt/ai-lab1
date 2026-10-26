import { Component, input } from '@angular/core';

export type IconName =
  'play' | 'pause' | 'prev' | 'next' | 'first' | 'last' | 'sun' | 'moon' | 'volume' | 'mute';



@Component({
  imports: [],
  selector: 'app-icon',
  styleUrl: './icon.css',
  templateUrl: './icon.html',
})
export class Icon {
  name = input.required<IconName>();
}
