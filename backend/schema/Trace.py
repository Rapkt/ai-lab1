from pydantic import BaseModel
from typing import List

class TraceNode(BaseModel):
    state: str
    parent: int
    depth: int
    on_path: bool

class TraceResponse(BaseModel):
    nodes: List[TraceNode]
    total_expanded: int
    sample_count: int
    truncated: bool