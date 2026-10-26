import time

from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from schema.Trace import TraceNode , TraceResponse
from A_star import solve_A_star
from BFS import solve_bfs
from DFS import solve_dfs
from Iterative_DFS import solve_itr_dfs
from schema.Input import Input
from schema.Response import Response
from tools import movment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def is_solvable(state: str) -> bool:
    tiles = [int(c) for c in state if c != "0"]
    inversions = sum(
        1 for i in range(len(tiles)) for j in range(i + 1, len(tiles)) if tiles[i] > tiles[j]
    )
    return inversions % 2 == 0


def replay(state: str, path: list[str]) -> list[str]:
    states = [state]
    for move in path:
        state = movment(move, state)
        states.append(state)
    return states

MAX_NODES = 1500
MAX_PATH = 5000
@app.post("/solve", response_model=Response)
def solve(data: Input):
    if not is_solvable(data.initstate):
        raise HTTPException(status_code=422, detail="This board is unsolvable")

    start_time = time.perf_counter()

    if data.algorithm == "BFS":
        path, cost, expanded, depth = solve_bfs(data.initstate)
    elif data.algorithm == "DFS":
        path, cost, expanded, depth = solve_dfs(data.initstate)
    elif data.algorithm == "Iterative_DFS":
        path, cost, expanded, depth = solve_itr_dfs(data.initstate)
    else:
        if not data.h_type:
            raise HTTPException(status_code=400, detail="h_type required for A*")
        path, cost, expanded, depth = solve_A_star(data.initstate, data.h_type)

    running_time_ms = (time.perf_counter() - start_time) * 1000

    if path is None:
        raise HTTPException(status_code=404, detail="No solution found")

    return Response(
        path_to_goal=path,
        states=replay(data.initstate, path),
        cost_of_path=cost,
        nodes_expanded=expanded,
        search_depth=depth,
        running_time=round(running_time_ms, 3),
    )

@app.post("/trace", response_model=TraceResponse)
def trace(data: Input):
    if not is_solvable(data.initstate):
        raise HTTPException(status_code=422, detail="This board is unsolvable")
    t: list = []
    if data.algorithm == "BFS":
        path,*_ = solve_bfs(data.initstate,trace=t)
    elif data.algorithm == "DFS":
        path, *_ = solve_dfs(data.initstate, trace=t)
    elif data.algorithm == "Iterative_DFS":
        path, *_ = solve_itr_dfs(data.initstate, trace=t)
    else:
        if not data.h_type:
            raise HTTPException(status_code=400, detail="h_type required for A*")
        path, *_ = solve_A_star(data.initstate, data.h_type, trace=t)

    if path is None or not t:
        raise HTTPException(status_code=404, detail="No solution found")

    by_uid = {e[0]: i for i, e in enumerate(t)}
    on_path, i = set(), len(t) - 1
    while i >= 0:
        on_path.add(i)
        i = by_uid.get(t[i][1], -1)
    if len(on_path) > MAX_PATH:
        raise HTTPException(status_code=413, detail="Solution path is too long to draw. Try an easier board.")

    keep = [i for i in range(len(t)) if i < MAX_NODES or i in on_path]
    new_idx = {old: n for n, old in enumerate(keep)}
    nodes = [
        TraceNode(
            state=t[o][2],
            parent=new_idx.get(by_uid.get(t[o][1], -1), -1),
            depth=t[o][3],
            on_path=o in on_path,
        )
        for o in keep
    ]
    return TraceResponse(
        nodes=nodes,
        total_expanded=len(t),
        sample_count=min(len(t), MAX_NODES),
        truncated=len(t) > MAX_NODES,
    )