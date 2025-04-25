const algorithmTemplates: Record<string, string> = {
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
def dfs_recursive(graph, node, visited):
    """Helper function for recursive DFS"""
    visited.add(node)
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            print(f"Visiting node {neighbor} from {node}")
            traverse(node, neighbor)
            dfs_recursive(graph, neighbor, visited)

def main(graph):
    """Depth-First Search algorithm"""
    if not graph:
        print("Empty graph")
        return
    
    # Start DFS from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting DFS from node {start_node}")
    
    visited = set()
    
    # Color the starting node
    colour(start_node)
    
    # Run DFS
    dfs_recursive(graph, start_node, visited)
`,

  dijkstra: `# Dijkstra's Algorithm
def main(graph):
    """Dijkstra's shortest path algorithm"""
    if not graph:
        print("Empty graph")
        return
    
    # For this demo, we'll use a simple unweighted graph
    # In a real implementation, edges would have weights
    
    # Start from the first node in the graph
    start_node = list(graph.keys())[0]
    print(f"Starting Dijkstra's algorithm from node {start_node}")
    
    # Initialize distances (all infinity except start node)
    distances = {node: float('infinity') for node in graph}
    distances[start_node] = 0
    
    # Priority queue for nodes to visit
    # (distance, node)
    pq = [(0, start_node)]
    visited = set()
    
    # Color the starting node
    colour(start_node)
    
    while pq:
        current_distance, current_node = heappop(pq)
        
        # Skip if we've already processed this node
        if current_node in visited:
            continue
            
        visited.add(current_node)
        
        for neighbor in graph[current_node]:
            # For simplicity, all edges have weight 1
            distance = current_distance + 1
            
            if distance < distances[neighbor]:
                print(f"Found shorter path to {neighbor} via {current_node}")
                traverse(current_node, neighbor)
                distances[neighbor] = distance
                heappush(pq, (distance, neighbor))
`,
}

export default algorithmTemplates
