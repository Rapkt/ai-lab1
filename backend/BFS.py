from schema.Node import Node
from collections import deque
from tools import *

# 0 8
def solve_bfs(inti_state: str):
    frontier = deque([Node(state=inti_state)])

    explored = set()
    explored.add(str(inti_state))

    while frontier:
        node = frontier.popleft()
        explored.add(str(node.state))
        if(cheks(str(node.state))):
            return node

        state1 = movment("up",str(node.state))
        state2 = movment("down", str(node.state))
        state3 = movment("right", str(node.state))
        state4 = movment("left", str(node.state))

        if(state1 != None and state1 not in explored):
            frontier.append(Node(state=state1,parent=node,move='up',depth=node.depth+1,cost=node.cost+1))
        if (state2 != None and state2 not in explored):
            frontier.append(Node(state=state2, parent=node, move='down', depth=node.depth + 1, cost=node.cost + 1))
        if (state3 != None and state3 not in explored):
            frontier.append(Node(state=state3, parent=node, move='right', depth=node.depth + 1, cost=node.cost + 1))
        if (state4 != None and state4 not in explored):
            frontier.append(Node(state=state4, parent=node, move='left', depth=node.depth + 1, cost=node.cost + 1))