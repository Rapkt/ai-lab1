from math import sqrt


def cheks(state:str):
    return state == "012345678"

def movment(direction : str , state:str):
    index = state.index('0')
    state_list = list(state)
    if direction == "up":
        if (index - 3) < 0:
            return None
        state_list[index], state_list[index - 3] = state_list[index - 3], state_list[index]

    elif direction == "down":
        if (index + 3) > 8:
            return None
        state_list[index], state_list[index + 3] = state_list[index + 3], state_list[index]

    elif direction == "left":
        if (index - 1) // 3 != index // 3:
            return None
        state_list[index], state_list[index - 1] = state_list[index - 1], state_list[index]

    elif direction == "right":
        if (index + 1) // 3 != index // 3:
            return None
        state_list[index], state_list[index + 1] = state_list[index + 1], state_list[index]

    else:
        return None
    return "".join(state_list)


def heuristic(state: str, type: str):
    total = 0
    for i in range(9):
        v = int(state[i])
        if v == 0:
            continue
        row_gap = abs(i // 3 - v // 3)
        col_gap = abs(i % 3 - v % 3)

        if type == "manhattan":
            total += row_gap + col_gap
        elif type == "euclidean":
            total += sqrt(row_gap ** 2 + col_gap ** 2)
        else:
            return None
    return total
