import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ConfettiService } from '../Service/Confetti.service';
import { PuzzleBoard } from '../puzzle-board/puzzle-board';
import { GOAL, errMsg, shuffleBoard, validBoard } from '../Service/Puzzle.utils';
import { Algorithm, HeuristicType, SolverService, TraceResponse } from '../Solver/service';
import { SoundService } from '../Service/Sound.service';
import { Icon } from '../icon/icon';

@Component({
  imports: [PuzzleBoard, Icon],
  selector: 'app-search-view',
  styleUrl: './search-view.css',
  templateUrl: './search-view.html',
})
export class SearchView implements AfterViewInit, OnDestroy {
  private api = inject(SolverService);
  private sound = inject(SoundService);
  private confetti = inject(ConfettiService);
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  readonly algorithms: { id: Algorithm; label: string; short: string }[] = [
    { id: 'BFS', label: 'BFS', short: 'BFS' },
    { id: 'DFS', label: 'DFS', short: 'DFS' },
    { id: 'Iterative_DFS', label: 'Iterative DFS', short: 'IDS' },
    { id: 'A_Star', label: 'A*', short: 'A*' },
  ];
  readonly heuristics: HeuristicType[] = ['manhattan', 'euclidean'];

  initState = signal(shuffleBoard(12)); // shallow board = small, readable tree
  algorithm = signal<Algorithm>('A_Star');
  heuristic = signal<HeuristicType>('manhattan');
  data = signal<TraceResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  playing = signal(false);
  done = signal(false);
  speed = signal(3);
  shown = signal(0);

  valid = computed(() => validBoard(this.initState()));
  algoIndex = computed(() => this.algorithms.findIndex((a) => a.id === this.algorithm()));
  heuristicIndex = computed(() => this.heuristics.indexOf(this.heuristic()));
  pathLen = computed(() =>
    Math.max(0, (this.data()?.nodes.filter((n) => n.on_path).length ?? 1) - 1),
  );
  current = computed(() => {
    const d = this.data();
    if (!d) return GOAL;
    return this.done() ? GOAL : d.nodes[Math.max(0, this.shown() - 1)].state;
  });

  // animation + layout state (plain fields: updated every frame)
  private pos = 0; // nodes revealed (float)
  private ppos = 0; // path nodes revealed (float)
  private last = 0;
  private raf = 0;
  private parent = new Int32Array(0);
  private depth = new Int32Array(0);
  private px = new Float32Array(0);
  private py = new Float32Array(0);
  private pathIdx: number[] = [];
  private maxDepth = 1;
  private sampleCount = 0;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;

  shuffle() {
    return shuffleBoard(12);
  }
  setInit(v: string) {
    this.initState.set(v.replace(/\D/g, '').slice(0, 9));
    this.pause();
    this.data.set(null);
    this.error.set(null);
    this.shown.set(0);
    this.draw();
  }

  visualize() {
    if (!this.valid() || this.loading()) return;
    this.pause();
    this.loading.set(true);
    this.error.set(null);
    const algorithm = this.algorithm();
    this.api
      .trace({
        initstate: this.initState(),
        algorithm,
        h_type: algorithm === 'A_Star' ? this.heuristic() : undefined,
      })
      .subscribe({
        next: (d) => {
          this.layout(d);
          this.data.set(d);
          this.loading.set(false);
          this.pos = 0;
          this.ppos = 0;
          this.done.set(false);
          this.shown.set(0);
          this.play();
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(errMsg(e));
        },
      });
  }

  /** Radial tree layout: depth -> radius, each subtree gets an angle slice proportional to its leaves. */
  private layout(d: TraceResponse) {
    const n = d.nodes.length;
    this.parent = Int32Array.from(d.nodes, (x) => x.parent);
    this.depth = Int32Array.from(d.nodes, (x) => x.depth);
    this.maxDepth = 1;
    for (const v of this.depth) if (v > this.maxDepth) this.maxDepth = v;
    const has = new Uint8Array(n);
    for (let i = 1; i < n; i++) if (this.parent[i] >= 0) has[this.parent[i]] = 1;
    const leaves = new Float64Array(n);
    for (let i = 0; i < n; i++) leaves[i] = has[i] ? 0 : 1;
    for (let i = n - 1; i > 0; i--) if (this.parent[i] >= 0) leaves[this.parent[i]] += leaves[i];
    const start = new Float64Array(n),
      span = new Float64Array(n),
      cur = new Float64Array(n);
    span[0] = 2 * Math.PI;
    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = this.parent[i];
      if (i > 0 && p >= 0) {
        span[i] = (span[p] * leaves[i]) / leaves[p];
        start[i] = cur[p];
        cur[p] += span[i];
      }
      cur[i] = start[i];
      const a = start[i] + span[i] / 2;
      const r = i === 0 ? 0 : (this.depth[i] / this.maxDepth) * 0.97;
      this.px[i] = Math.cos(a) * r;
      this.py[i] = Math.sin(a) * r;
    }
    this.pathIdx = d.nodes.flatMap((x, i) => (x.on_path ? [i] : []));
    this.sampleCount = d.sample_count;
  }

  // ---- playback: phase 1 reveals expansions, phase 2 lights up the solution ----
  play() {
    if (!this.data()) return;
    if (this.pos >= this.sampleCount && this.ppos >= this.pathIdx.length) {
      this.pos = 0;
      this.ppos = 0;
      this.done.set(false);
    }
    this.playing.set(true);
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.tick);
  }
  pause() {
    this.playing.set(false);
    cancelAnimationFrame(this.raf);
  }
  scrub(v: number) {
    this.pause();
    this.pos = v;
    this.ppos = 0;
    this.done.set(false);
    this.shown.set(v);
    this.draw();
  }

  private tick = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    const S = this.sampleCount,
      P = this.pathIdx.length;
    if (this.pos < S) this.pos = Math.min(S, this.pos + (S / (16 / this.speed())) * dt);
    else if (this.ppos < P) this.ppos = Math.min(P, this.ppos + Math.max(P / 1.6, 25) * dt);
    this.shown.set(Math.ceil(this.pos));
    this.draw();
    if (this.pos >= S && this.ppos >= P) {
      this.playing.set(false);
      this.done.set(true);
      this.sound.win();
      this.confetti.burst();
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private draw() {
    const cv = this.cv().nativeElement;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = devicePixelRatio || 1,
      w = cv.clientWidth,
      h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const dark = document.documentElement.classList.contains('dark');
    if (!this.data()) {
      ctx.fillStyle = dark ? '#9a9aa6' : '#737373';
      ctx.font = '15px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pick an algorithm and press Visualize', w / 2, h / 2);
      return;
    }
    const R = Math.min(w, h) / 2 - 16,
      cx = w / 2,
      cy = h / 2;
    const X = (i: number) => cx + this.px[i] * R,
      Y = (i: number) => cy + this.py[i] * R;
    const k = Math.min(this.sampleCount, Math.ceil(this.pos));

    ctx.lineWidth = 1;
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.13)';
    ctx.beginPath();
    for (let i = 1; i < k; i++) {
      const p = this.parent[i];
      ctx.moveTo(X(p), Y(p));
      ctx.lineTo(X(i), Y(i));
    }
    ctx.stroke();
    for (let i = 0; i < k; i++) {
      ctx.fillStyle = `hsl(${200 + (130 * this.depth[i]) / this.maxDepth} 85% ${dark ? 66 : 58}%)`;
      ctx.beginPath();
      ctx.arc(X(i), Y(i), 2.5, 0, 6.283);
      ctx.fill();
    }
    if (this.pos < this.sampleCount && k > 0) {
      // the node being expanded right now
      ctx.strokeStyle = '#0a84ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(X(k - 1), Y(k - 1), 7, 0, 6.283);
      ctx.stroke();
    }

    const pk = Math.floor(this.ppos);
    if (pk > 1) {
      ctx.save();
      ctx.strokeStyle = '#0a84ff';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(10,132,255,.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let j = 1; j < pk; j++) {
        const a = this.pathIdx[j - 1],
          b = this.pathIdx[j];
        ctx.moveTo(X(a), Y(a));
        ctx.lineTo(X(b), Y(b));
      }
      ctx.stroke();
      ctx.restore();
    }
    // start (white) and goal (green) markers
    ctx.fillStyle = dark ? '#fff' : '#171717';
    ctx.beginPath();
    ctx.arc(X(0), Y(0), 5, 0, 6.283);
    ctx.fill();
    if (pk >= this.pathIdx.length && pk > 0) {
      const g = this.pathIdx[this.pathIdx.length - 1];
      ctx.fillStyle = '#30d158';
      ctx.beginPath();
      ctx.arc(X(g), Y(g), 6.5, 0, 6.283);
      ctx.fill();
    }
  }

  ngAfterViewInit() {
    const cv = this.cv().nativeElement;
    this.draw();
    this.ro = new ResizeObserver(() => this.draw());
    this.ro.observe(cv);
    this.mo = new MutationObserver(() => this.draw()); // redraw when dark mode flips
    this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.mo?.disconnect();
  }
}
