import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ConfettiService } from '../Service/Confetti.service';
import { SoundService } from '../Service/Sound.service';
import {
  Algorithm,
  HeuristicType,
  SolveRequest,
  SolveResponse,
  SolverService,
} from '../Solver/service';
import { Icon } from '../icon/icon';
import { PuzzleBoard } from '../puzzle-board/puzzle-board';

const GOAL = '012345678';

@Component({
  selector: 'app-solve-view',
  templateUrl: './solve-view.html',
  imports: [Icon, PuzzleBoard],
})
export class SolveView implements OnDestroy {
  private api = inject(SolverService);
  private sound = inject(SoundService);
  private confetti = inject(ConfettiService);

  readonly tiles = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly algorithms: { id: Algorithm; label: string; short: string }[] = [
    { id: 'BFS', label: 'BFS', short: 'BFS' },
    { id: 'DFS', label: 'DFS', short: 'DFS' },
    { id: 'Iterative_DFS', label: 'Iterative DFS', short: 'IDS' },
    { id: 'A_Star', label: 'A*', short: 'A*' },
  ];
  readonly heuristics: HeuristicType[] = ['manhattan', 'euclidean'];
  readonly arrows: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' };

  initState = signal('125340678');
  algorithm = signal<Algorithm>('A_Star');
  heuristic = signal<HeuristicType>('manhattan');
  result = signal<SolveResponse | null>(null);
  compare = signal<Record<HeuristicType, SolveResponse> | null>(null);
  step = signal(0);
  playing = signal(false);
  delay = signal(500);
  loading = signal(false);
  error = signal<string | null>(null);
  private timer?: ReturnType<typeof setInterval>;

  // Index of the selected option; the glass pill slides to this position
  algoIndex = computed(() => this.algorithms.findIndex((a) => a.id === this.algorithm()));
  heuristicIndex = computed(() => this.heuristics.indexOf(this.heuristic()));

  validInit = computed(() => [...this.initState()].sort().join('') === GOAL);
  board = computed(() => {
    const r = this.result();
    if (r) return r.states[this.step()];
    return this.validInit() ? this.initState() : GOAL;
  });
  total = computed(() => (this.result()?.states.length ?? 1) - 1);
  progress = computed(() => (this.total() > 0 ? this.step() / this.total() : 0));
  pathPreview = computed(() => this.result()?.path_to_goal.slice(0, 150) ?? []);
  stats = computed(() => {
    const r = this.result();
    if (!r) return [];
    return [
      { label: 'Path cost', value: String(r.cost_of_path) },
      { label: 'Nodes expanded', value: r.nodes_expanded.toLocaleString() },
      { label: 'Search depth', value: String(r.search_depth) },
      { label: 'Running time', value: r.running_time.toFixed(1) + ' ms' },
    ];
  });

  /** Position of a tile: translate by whole-tile steps so CSS can slide it. */
  tileTransform(n: number) {
    const i = this.board().indexOf(String(n));
    return `translate(${(i % 3) * 100}%, ${Math.floor(i / 3) * 100}%)`;
  }

  setInit(value: string) {
    this.initState.set(value.replace(/\D/g, '').slice(0, 9));
    this.clearResult();
  }

  /** Random walk from the goal, so the board is always solvable. */
  shuffle() {
    const s = GOAL.split('');
    for (let k = 0; k < 80; k++) {
      const z = s.indexOf('0');
      const opts: number[] = [];
      if (z > 2) opts.push(z - 3);
      if (z < 6) opts.push(z + 3);
      if (z % 3 > 0) opts.push(z - 1);
      if (z % 3 < 2) opts.push(z + 1);
      const n = opts[Math.floor(Math.random() * opts.length)];
      [s[z], s[n]] = [s[n], s[z]];
    }
    this.setInit(s.join(''));
  }

  private request(h: HeuristicType = this.heuristic()): SolveRequest {
    const algorithm = this.algorithm();
    return {
      initstate: this.initState(),
      algorithm,
      h_type: algorithm === 'A_Star' ? h : undefined,
    };
  }

  solve() {
    if (!this.validInit() || this.loading()) return;
    this.pause();
    this.loading.set(true);
    this.error.set(null);
    this.compare.set(null);
    this.api.solve(this.request()).subscribe({
      next: (r) => {
        this.result.set(r);
        this.step.set(0);
        this.loading.set(false);
        this.play();
      },
      error: (e) => this.fail(e),
    });
  }

  /** Runs A* with both heuristics on the current board (for the report). */
  runCompare() {
    if (!this.validInit() || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const base = { initstate: this.initState(), algorithm: 'A_Star' as Algorithm };
    forkJoin({
      manhattan: this.api.solve({ ...base, h_type: 'manhattan' }),
      euclidean: this.api.solve({ ...base, h_type: 'euclidean' }),
    }).subscribe({
      next: (c) => {
        this.compare.set(c);
        this.loading.set(false);
      },
      error: (e) => this.fail(e),
    });
  }

  private fail(e: HttpErrorResponse) {
    this.loading.set(false);
    const detail = e.error?.detail;
    this.error.set(
      e.status === 0
        ? 'Can’t reach the solver. Is the backend running on port 8000?'
        : typeof detail === 'string'
          ? detail
          : 'The solver rejected this request.',
    );
  }

  private clearResult() {
    this.pause();
    this.result.set(null);
    this.compare.set(null);
    this.error.set(null);
    this.step.set(0);
  }

  // ---- playback ----
  play() {
    if (this.total() === 0) return;
    if (this.step() >= this.total()) this.step.set(0);
    this.playing.set(true);
    this.startTimer();
  }
  pause() {
    clearInterval(this.timer);
    this.playing.set(false);
  }
  toggle() {
    this.playing() ? this.pause() : this.play();
  }
  seek(i: number) {
    this.pause();
    this.step.set(Math.max(0, Math.min(this.total(), i)));
  }
  setSpeed(speed: number) {
    this.delay.set(1030 - speed);
    if (this.playing()) this.startTimer();
  }
  private startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.step() >= this.total()) {
        this.pause();
        this.sound.win();
        this.confetti.burst();
        return;
      }
      this.step.update((s) => s + 1);
      if (this.delay() > 100) this.sound.tick();
    }, this.delay());
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
}

