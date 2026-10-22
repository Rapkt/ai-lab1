from pydantic import BaseModel, Field
from typing import Optional, Literal


class Input(BaseModel):
    initstate: str = Field(...,description="9 digits")

    algorithm: Literal["BFS","DFS","Iterative_DFS","A_Star"]
    h_type: Optional[Literal["manhattan","euclidean"]] = None