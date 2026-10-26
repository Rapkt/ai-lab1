from schema.Node import Node
from collections import deque
from tools import *

def solve_bfs(inti_state: str,trace = None):
    frontier = deque([Node(state=inti_state)])

    explored = set()

    nodes_expanded = 0
    max_depth = 0
    while frontier:
        node = frontier.popleft()
        if node.state in explored:
            continue

        explored.add(node.state)
        nodes_expanded += 1
        max_depth = max(max_depth, node.depth)
        node.log(trace)
        if(cheks(node.state)):
            path = node.get_path()
            return path,len(path),nodes_expanded,max_depth

        state1 = movment("up",str(node.state))
        state2 = movment("down", str(node.state))
        state3 = movment("right", str(node.state))
        state4 = movment("left", str(node.state))

        if(state1 != None and state1 not in explored):
            frontier.append(Node(state=state1,parent=node,move='up',depth=node.depth+1))
        if (state2 != None and state2 not in explored):
            frontier.append(Node(state=state2, parent=node, move='down', depth=node.depth + 1))
        if (state3 != None and state3 not in explored):
            frontier.append(Node(state=state3, parent=node, move='right', depth=node.depth + 1))
        if (state4 != None and state4 not in explored):
            frontier.append(Node(state=state4, parent=node, move='left', depth=node.depth + 1))
    return None,0,nodes_expanded,max_depth