class Node:
    def __init__(self, state: list[int], parent=None,move:str=None,depth:int =0,cost : int = 0):
        self.state = state
        self.parent = parent
        self.move = move
        self.depth = depth
        self.cost = cost