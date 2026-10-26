from schema.Node import Node
from tools import *


def solve_itr_dfs(inti_state: str, trace=None):
    lim = 0
    nodes_expanded = 0                      
    while True:
        if trace is not None:
            trace.clear()                   

        frontier = [Node(state=inti_state)]  
        best_depth = {}                     

        while frontier:
            node = frontier.pop()


            seen = best_depth.get(node.state)
            if seen is not None and seen <= node.depth:
                continue
            best_depth[node.state] = node.depth

            nodes_expanded += 1
            node.log(trace)

            if cheks(node.state):
                path = node.get_path()
                return path, len(path), nodes_expanded, lim

            if node.depth < lim:
                state1 = movment("up",str(node.state))
                state2 = movment("down", str(node.state))
                state3 = movment("right", str(node.state))
                state4 = movment("left", str(node.state))

                if(state1 != None and state1 ):
                    frontier.append(Node(state=state1,parent=node,move='up',depth=node.depth+1))
                if (state2 != None and state2 ):
                    frontier.append(Node(state=state2, parent=node, move='down', depth=node.depth + 1))
                if (state3 != None and state3 ):
                    frontier.append(Node(state=state3, parent=node, move='right', depth=node.depth + 1))
                if (state4 != None and state4 ):
                    frontier.append(Node(state=state4, parent=node, move='left', depth=node.depth + 1))
        lim += 1