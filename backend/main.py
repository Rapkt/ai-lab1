import time

from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware

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