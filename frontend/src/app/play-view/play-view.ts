import { Component, computed, inject, signal } from '@angular/core';
import { ConfettiService } from '../Service/Confetti.service';
import { PuzzleBoard } from '../puzzle-board/puzzle-board';
import { GOAL, adjacent, errMsg, shuffleBoard } from '../Service/Puzzle.utils';
import { SolverService } from '../Solver/service';
import { SoundService } from '../Service/Sound.service';
@Component({
  imports: [PuzzleBoard],
  selector: 'app-play-view',
  styleUrl: './play-view.css',
  templateUrl: './play-view.html',
})
export class PlayView {
  private api = inject(SolverService);
  private sound = inject(SoundService);
  private confetti = inject(ConfettiService);

  board = signal(shuffleBoard(40));
  moves = signal(0);
  hint = signal<number | null>(null);
  hintInfo = signal<string | null>(null);
  busy = signal(false);
  error = signal<string | null>(null);
  solved = computed(() => this.board() === GOAL);

  move(n: number) {
    if (this.solved()) return;
    const b = this.board().split('');
    const i = b.indexOf(String(n));
    const z = b.indexOf('0');
    if (!adjacent(i, z)) return;
    [b[i], b[z]] = [b[z], b[i]];
    this.board.set(b.join(''));
    this.moves.update((m) => m + 1);
    this.hint.set(null);
    this.hintInfo.set(null);
    this.error.set(null);
    this.sound.tick();
    if (this.solved()) {
      this.sound.win();
      this.confetti.burst();
    }
  }

  /** Ask the A* backend for the optimal next move from the CURRENT position. */
  getHint() {
    if (this.solved() || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    const from = this.board();
    this.api.solve({ initstate: from, algorithm: 'A_Star', h_type: 'manhattan' }).subscribe({
      next: (r) => {
        // the tile that moves is whatever lands on the blank's current square
        this.hint.set(Number(r.states[1][from.indexOf('0')]));
        this.hintInfo.set(`${r.cost_of_path} moves`);
        this.busy.set(false);
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(errMsg(e));
      },
    });
  }

  newGame() {
    this.board.set(shuffleBoard(40));
    this.moves.set(0);
    this.hint.set(null);
    this.hintInfo.set(null);
    this.error.set(null);
  }
}
