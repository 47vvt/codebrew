const algorithmTemplates: Record<string, string> = {
  custom: `
# Write your own algorithm here
# Use the following functions to visualise:
# - colour(node, color="red") - Colour a node
# - traverse(from_node, to_node) - Visualise edge traversal

def main(graph: dict[int, dict[int, int]]) -> None:
    # write your code below
    # return does nothing, print to stdout
    
`,

  bfs: `# BFS Algorithm
def main(adj):
    q = deque([(0,1)])
    seen = set()

    while q:
        prev, u = q.popleft()
        if u in seen:
            continue
        traverse(prev, u)
        colour(u)
        seen.add(u)

        for v in adj[u]:
            if v not in seen:
                q.append((u,v))

`,

  dfs: `# DFS (recursive)
def main(adj):
    seen = set()
    def dfs(prev, u):
        if u in seen:
            return
        traverse(prev, u)
        colour(u)
        seen.add(u)
        for v in adj[u]:
            dfs(u,v)

    dfs(0,1)
`,
  dfs2: `# DFS (iterative)

def main(adj):
    s = [(0,1)]
    seen = set()

    while s:
        prev, u = s.pop()
        if u in seen:
            continue
        traverse(prev, u)
        colour(u)
        seen.add(u)

        for v in adj[u]:
            if v not in seen:
                s.append((u,v))


`,

  dijkstra: `# Dijkstra's Algorithm
def main(adj):
    n = len(adj)
    pq = [(0,1)] # let node 1 be source (0 distance)
    dist = [sys.maxsize] * (n+1)
    seen = set()
    
    while pq:
        d, u = heappop(pq)
        if u in seen:
            continue
        seen.add(u)
        colour(u)
        dist[u] = d
        for v in adj[u]:
            if v not in seen:
                w = adj[u][v]
                heappush(pq, (d+w,v))
    print(dist[1:]) # exclude 0 (not a node)
`,

  prim: `# Prim's Algorithm for Minimum Spanning Tree

def main(adj):
    n = len(adj)
    pq = [(0,0,1)] # let node 1 be source (0 distance)
    mst_total = 0
    seen = set()
    
    while pq:
        w, prev, u = heappop(pq)
        if u in seen:
            continue
        traverse(prev,u)
        seen.add(u)
        colour(u)
        mst_total += w
        for v in adj[u]:
            if v not in seen:
                w = adj[u][v]
                heappush(pq, (w,u,v))
    
    print(mst_total)
`,

  bellman_ford: `# Bellman-Ford Algorithm
def main(adj):
    n = len(adj)
    dist = [float('inf')] * (n + 1)
    dist[1] = 0
    for _ in range(n - 1):
        for u in adj:
            for v, w in adj[u].items():
                traverse(u,v)
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w

    print(dist[1:]) # exclude 0 (not a node)
`,
}

export default algorithmTemplates
