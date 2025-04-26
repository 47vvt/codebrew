const algorithmTemplates: Record<string, string> = {
  custom: `# Custom Algorithm
# Write your own algorithm here
# Use the following functions to visualize:
# - colour(node_id, color="red") - Color a node
# - traverse(from_node, to_node, color="blue") - Visualize edge traversal

def main(graph):
    """Your custom algorithm"""
    # Example: Color the first node
    if graph:
        first_node = list(graph.keys())[0]
        colour(first_node)
`,

  bfs: `# BFS Algorithm
def main(graph):
    """Breadth-First Search algorithm"""
    if not graph:
        print("Empty graph")
        return
    
    # Start BFS from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting BFS from node {start_node}")
    
    visited = set()
    queue = deque([start_node])
    visited.add(start_node)
    
    # Color the starting node
    colour(start_node)
    
    while queue:
        node = queue.popleft()
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                print(f"Visiting node {neighbor} from {node}")
                traverse(node, neighbor)
                visited.add(neighbor)
                queue.append(neighbor)
`,

  dfs: `# DFS Algorithm
def main(graph):
    """Depth-First Search algorithm"""
    if not graph:
        print("Empty graph")
        return
    
    # Start DFS from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting DFS from node {start_node}")
    
    visited = set()
    
    def dfs_recursive(node):
        visited.add(node)
        colour(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                print(f"Visiting node {neighbor} from {node}")
                traverse(node, neighbor)
                dfs_recursive(neighbor)
    
    # Run DFS from the start node
    dfs_recursive(start_node)
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
`,

  prim: `# Prim's Algorithm for Minimum Spanning Tree
def main(graph):
    """Prim's algorithm for finding minimum spanning tree"""
    if not graph:
        print("Empty graph")
        return
    
    # Start from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting Prim's algorithm from node {start_node}")
    
    # Track nodes in MST
    mst_nodes = {start_node}
    # Track edges in MST
    mst_edges = []
    
    # Color the starting node
    colour(start_node)
    
    # Continue until all nodes are in the MST
    total_weight = 0
    
    while len(mst_nodes) < len(graph):
        min_weight = float('infinity')
        min_edge = None
        
        # Find the minimum weight edge connecting MST to non-MST node
        for node in mst_nodes:
            for neighbor, weight in graph[node].items():
                if neighbor not in mst_nodes and weight < min_weight:
                    min_weight = weight
                    min_edge = (node, neighbor, weight)
        
        if min_edge is None:
            # Graph is not connected
            print("Graph is not connected - MST not possible")
            break
            
        u, v, weight = min_edge
        mst_nodes.add(v)
        mst_edges.append(min_edge)
        total_weight += weight
        
        print(f"Adding edge {u}-{v} with weight {weight}")
        traverse(u, v)
        colour(v)
    
    print("\\nMinimum Spanning Tree:")
    for u, v, weight in mst_edges:
        print(f"Edge {u}-{v} with weight {weight}")
    print(f"Total MST weight: {total_weight}")
`,

  bellman_ford: `# Bellman-Ford Algorithm
def main(graph):
    """Bellman-Ford shortest path algorithm"""
    if not graph:
        print("Empty graph")
        return
    
    # Start from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting Bellman-Ford algorithm from node {start_node}")
    
    # Initialize distances (all infinity except start node)
    distances = {node: float('infinity') for node in graph}
    distances[start_node] = 0
    
    # Color the starting node
    colour(start_node)
    
    # Create a list of all edges
    edges = []
    for u in graph:
        for v, weight in graph[u].items():
            edges.append((u, v, weight))
    
    # Relax all edges |V| - 1 times
    for _ in range(len(graph) - 1):
        for u, v, weight in edges:
            if distances[u] != float('infinity') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                print(f"Updated distance to {v} via {u} to {distances[v]}")
                traverse(u, v)
                colour(v)
    
    # Check for negative weight cycles
    for u, v, weight in edges:
        if distances[u] != float('infinity') and distances[u] + weight < distances[v]:
            print("Graph contains a negative weight cycle")
            return
    
    print("\\nFinal distances from node", start_node)
    for node, distance in distances.items():
        print(f"Node {node}: {distance}")
`,
}

export default algorithmTemplates
