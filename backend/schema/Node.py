from typing import Optional


class Node:
    def __init__(self, state: str, parent=None,move:str=None,depth:int =0,cost:Optional[int] =0):
        self.state = state
        self.parent = parent
        self.move = move
        self.depth = depth
        self.cost = cost
    def __lt__(self,other):
        return self.depth < other.depth
    def get_path(self):
        path = []
        current = self
        while current.parent is not None:
            path.append(current.move)
            current = current.parent
        path.reverse()
        return path