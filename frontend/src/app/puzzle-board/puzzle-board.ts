import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-puzzle-board',
  styleUrl: './puzzle-board.css',
  templateUrl: './puzzle-board.html',
})
export class PuzzleBoard {
  state = input.required<string>();
  ring = input<number | null>(null); // 0..1 progress ring, hidden when null
  interactive = input(false);
  hint = input<number | null>(null); // tile to pulse
  tileClick = output<number>();
  readonly tiles = [1, 2, 3, 4, 5, 6, 7, 8];

  placed(n: number) {
    return this.state()[n] === String(n);
  }

  tf(n: number) {
    const i = this.state().indexOf(String(n));
    return `translate(${(i % 3) * 100}%, ${Math.floor(i / 3) * 100}%)`;
  }
}
