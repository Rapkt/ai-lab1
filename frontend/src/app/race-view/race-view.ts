import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { PuzzleBoard } from '../puzzle-board/puzzle-board';
import { GOAL, errMsg, shuffleBoard, validBoard } from '../Service/Puzzle.utils';
import { Algorithm, HeuristicType, SolveResponse, SolverService } from '../Solver/service';

@Component({
  imports: [PuzzleBoard],
  selector: 'app-race-view',
  styleUrl: './race-view.css',
  templateUrl: './race-view.html',
})
export class RaceView {
  private api = inject(SolverService);
  readonly defs: { id: Algorithm; label: string; h?: HeuristicType }[] = [
    { id: 'BFS', label: 'BFS' },
    { id: 'DFS', label: 'DFS' },
    { id: 'Iterative_DFS', label: 'Iterative DFS' },
    { id: 'A_Star', label: 'A* · Manhattan', h: 'manhattan' },
  ];
  private readonly HEAD_START = 700; // ms before the first tile moves

  initState = signal(shuffleBoard(22)); // moderate depth keeps DFS/IDS quick
  results = signal<(SolveResponse | null)[] | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  elapsed = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  valid = computed(() => validBoard(this.initState()));
  bests = computed(() => {
    const rs = (this.results() ?? []).filter((r): r is SolveResponse => !!r);
    return {
      cost: Math.min(...rs.map((r) => r.cost_of_path)),
      nodes: Math.min(...rs.map((r) => r.nodes_expanded)),
      time: Math.min(...rs.map((r) => r.running_time)),
    };
  });

  setInit(v: string) {
    this.initState.set(v.replace(/\D/g, '').slice(0, 9));
    this.reset();
  }
  shuffle() {
    this.setInit(shuffleBoard(22));
  }

  /** ms per move: capped so even a 3000-move DFS finishes in ~9 s */
  private dt(r: SolveResponse) {
    return Math.min(220, 9000 / Math.max(r.cost_of_path, 1));
  }
  step(r: SolveResponse) {
    return Math.min(
      r.cost_of_path,
      Math.floor(Math.max(0, this.elapsed() - this.HEAD_START) / this.dt(r)),
    );
  }
  boardOf(i: number) {
    const r = this.results()?.[i];
    if (r) return r.states[this.step(r)];
    return this.valid() ? this.initState() : GOAL;
  }
  ringOf(i: number) {
    const r = this.results()?.[i];
    return r ? this.step(r) / Math.max(r.cost_of_path, 1) : 0;
  }

  start() {
    if (!this.valid() || this.loading()) return;
    this.reset();
    this.loading.set(true);
    forkJoin(
      this.defs.map((d) =>
        this.api.solve({ initstate: this.initState(), algorithm: d.id, h_type: d.h }).pipe(
          catchError((e) => {
            this.error.set(errMsg(e));
            return of(null);
          }),
        ),
      ),
    ).subscribe((rs) => {
      this.results.set(rs);
      this.loading.set(false);
      this.run(rs);
    });
  }

  private run(rs: (SolveResponse | null)[]) {
    const end =
      Math.max(...rs.map((r) => (r ? this.HEAD_START + this.dt(r) * r.cost_of_path : 0))) + 200;
    const t0 = performance.now();
    this.timer = setInterval(() => {
      const e = performance.now() - t0;
      this.elapsed.set(e);
      if (e > end) clearInterval(this.timer);
    }, 40);
  }

  private reset() {
    clearInterval(this.timer);
    this.results.set(null);
    this.error.set(null);
    this.elapsed.set(0);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
