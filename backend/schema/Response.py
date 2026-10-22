from pydantic import BaseModel
from typing import List

class Response(BaseModel):
    path_to_goal: List[str]
    states:List[str]
    cost_of_path: int
    nodes_expanded: int
    search_depth: int
    running_time: float