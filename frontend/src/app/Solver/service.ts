import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type Algorithm = 'BFS' | 'DFS' | 'Iterative_DFS' | 'A_Star';
export type HeuristicType = 'manhattan' | 'euclidean';

export interface SolveRequest {
  initstate: string;
  algorithm: Algorithm;
  h_type?: HeuristicType;
}

export interface SolveResponse {
  path_to_goal: string[];
  states: string[]; // board after every move, including the start
  cost_of_path: number;
  nodes_expanded: number;
  search_depth: number;
  running_time: number; // ms
}

@Injectable({ providedIn: 'root' })
export class SolverService {
  private http = inject(HttpClient);
  private url = 'http://127.0.0.1:8000/solve';

  solve(req: SolveRequest) {
    return this.http.post<SolveResponse>(this.url, req);
  }
}
