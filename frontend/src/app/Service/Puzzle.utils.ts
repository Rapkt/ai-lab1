import { HttpErrorResponse } from '@angular/common/http';

export const GOAL = '012345678';
export const validBoard = (s: string) => [...s].sort().join('') === GOAL;
export const adjacent = (i: number, z: number) =>
  Math.abs(i - z) === 3 || (Math.abs(i - z) === 1 && Math.floor(i / 3) === Math.floor(z / 3));

/** Random walk from the goal, so the board is always solvable. Fewer moves = easier board. */
export function shuffleBoard(moves = 80): string {
  let s: string[];
  do {
    s = GOAL.split('');
    for (let k = 0; k < moves; k++) {
      const z = s.indexOf('0');
      const opts: number[] = [];
      if (z > 2) opts.push(z - 3);
      if (z < 6) opts.push(z + 3);
      if (z % 3 > 0) opts.push(z - 1);
      if (z % 3 < 2) opts.push(z + 1);
      const n = opts[Math.floor(Math.random() * opts.length)];
      [s[z], s[n]] = [s[n], s[z]];
    }
  } while (s.join('') === GOAL);
  return s.join('');
}

export function errMsg(e: HttpErrorResponse): string {
  const d = e.error?.detail;
  return e.status === 0
    ? 'Can’t reach the solver. Is the backend running on port 8000?'
    : typeof d === 'string'
      ? d
      : 'The solver rejected this request.';
}
