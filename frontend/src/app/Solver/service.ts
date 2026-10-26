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
  states: string[];
  cost_of_path: number;
  nodes_expanded: number;
  search_depth: number;
  running_time: number;
}

export interface TraceNode {
  state: string;
  parent: number;
  depth: number;
  on_path: boolean;
}

export interface TraceResponse {
  nodes: TraceNode[];
  total_expanded: number;
  sample_count: number;
  truncated: boolean;
}

@Injectable({ providedIn: 'root' })
export class SolverService {
  private http = inject(HttpClient);
  private url = 'http://13.49.241.24:8000';

  solve(req: SolveRequest) {
    return this.http.post<SolveResponse>(`${this.url}/solve`, req);
  }

  trace(req: SolveRequest) {
    return this.http.post<TraceResponse>(`${this.url}/trace`, req);
  }
}
