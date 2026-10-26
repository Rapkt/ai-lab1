import { Component, computed, effect, inject, signal } from '@angular/core';
import { PlayView } from './play-view/play-view';
import { RaceView } from './race-view/race-view';
import { SearchView } from './search-view/search-view';
import { SolveView } from './solve-view/solve-view';
import { SoundService } from './Service/Sound.service';
import { Icon } from './icon/icon';

type Mode = 'solve' | 'race' | 'play' | 'graph';

@Component({
  selector: 'app-root',
  imports: [SolveView, RaceView, PlayView, SearchView, Icon],
  templateUrl: './app.html',
})
export class App {
  sound = inject(SoundService);
  readonly modes: { id: Mode; label: string }[] = [
    { id: 'solve', label: 'Solve' },
    { id: 'race', label: 'Race' },
    { id: 'play', label: 'Play' },
    { id: 'graph', label: 'Graph' },
  ];
  readonly logo = [
    [11, 2],
    [20, 2],
    [2, 11],
    [11, 11],
    [20, 11],
    [2, 20],
    [11, 20],
    [20, 20],
  ];
  mode = signal<Mode>('solve');
  modeIndex = computed(() => this.modes.findIndex((m) => m.id === this.mode()));
  dark = signal(matchMedia('(prefers-color-scheme: dark)').matches);

  constructor() {
    effect(() => document.documentElement.classList.toggle('dark', this.dark()));
  }
}
