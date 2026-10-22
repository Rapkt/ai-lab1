# to do
# movement (direction , init state) -> state | null
from cmath import sqrt


def cheks(state:str):
    for i in range(0,9,1):
        if state[i] != str(i):
            return False
    return True

def movment(direction : str , state:str):
    index = 0
    for i in range(0,9,1):
        if state[i] == str(0):
            index = i
    
    if direction == "up":     
        if (i - 3) < 0:
            return None
        direction[i] = direction[i-3]
        direction[i-3] = str(0)
        return direction
    elif direction == "down":     
        if (i + 3) > 8:
            return None
        direction[i] = direction[i+3]
        direction[i+3] = str(0)
        return direction   
    elif direction == "left":     
        if (i - 1) // 3 != i // 3:
            return None
        direction[i] = direction[i-1]
        direction[i-1] = str(0)
        return direction
    elif direction == "right":     
            if (i + 1) // 3 != i // 3:
                return None
            direction[i] = direction[i+1]
            direction[i+1] = str(0)
            return direction
    else :
        return None


def heuristic(state: str, type: str):
    total = 0
    for i in range(9):
        v = int(state[i])
        row_gap = abs(i // 3 - v // 3)
        col_gap = abs(i % 3 - v % 3)

        if type == "manhattan":
            total += row_gap + col_gap
        elif type == "euclidean":
            total += sqrt(row_gap ** 2 + col_gap ** 2)
        else:
            return None
    return total
