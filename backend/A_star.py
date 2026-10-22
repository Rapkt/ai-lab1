import heapq
from schema.Node import Node
from tools import *

def solve_A_star(inti_state: str,h_type: str):
    frontier = []
    explored = set()
    counter = 0    # tie breaker

    heapq.heappush(frontier , (heuristic(str(inti_state),h_type), counter, Node(state=inti_state)))

    while frontier:
        _, _, node = heapq.heappop(frontier)

        explored.add(str(node.state))

        if(cheks(str(node.state))):
            return node

        state1 = movment("up", str(node.state))
        state2 = movment("down", str(node.state))
        state3 = movment("right", str(node.state))
        state4 = movment("left", str(node.state))
        
        if(state1 != None and state1 not in explored):
            child =Node(state=state1,parent=node,move='up',depth=node.depth+1,cost=node.cost+1)
            counter += 1
            f = child.cost + heuristic(str(child.state),h_type)
            heapq.heappush(frontier, (f, counter, child))
            
        if (state2 != None and state2 not in explored):
            child =Node(state=state2, parent=node, move='down', depth=node.depth + 1, cost=node.cost + 1)
            counter += 1
            f = child.cost + heuristic(str(child.state),h_type)
            heapq.heappush(frontier, (f, counter, child))
            
        if (state3 != None and state3 not in explored):
            child =Node(state=state3, parent=node, move='right', depth=node.depth + 1, cost=node.cost + 1)
            counter += 1
            f = child.cost + heuristic(str(child.state),h_type)
            heapq.heappush(frontier, (f, counter, child))
            
        if (state4 != None and state4 not in explored):
            child =Node(state=state4, parent=node, move='left', depth=node.depth + 1, cost=node.cost + 1)
            counter += 1
            f = child.cost + heuristic(str(child.state),h_type)
            heapq.heappush(frontier, (f, counter, child))
