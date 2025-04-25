const algorithmTemplates: Record<string, string> = {
  bfs: `# BFS Algorithm
def main(adj):
    index = 0
    start_node = 0
    queue = [(start_node, -1)]
    visited = set()
    visited.add(start_node)

    while index<len(queue):
        
        node = queue[index][0];
        
        traverse(queue[index][1], queue[index][0])
        colour(node)
        for child in adj[node]:
            if child not in visited:
                queue.append((child, node))
                visited.add(node)
        index += 1
`,

  dfs: `# DFS Algorithm
def main(adj):
    visited = set()
    def dfs(node, parent):
        visited.add(node)
        traverse(parent, node)
        colour(node)
        for child in adj[node]:
            if child != parent and child not in visited:
                dfs(child, node)
    dfs(0, -1)
`,

  dijkstra: `// Dijkstra's Algorithm
function dijkstra(graph, startNode) {
  const distances = {};
  const visited = new Set();
  const previous = {};
  const queue = [];
  
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  queue.push({ node: startNode, distance: 0 });
  
  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const { node } = queue.shift();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (const neighbor in graph[node]) {
      const distance = distances[node] + graph[node][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = node;
        queue.push({ node: neighbor, distance });
      }
    }
  }
  
  return { distances, previous };
}
`, 
 order_traversal: `
  def main(adj):
    # both preorder and post order work on any tree.
    def preorder_traversal(node, parent):
        colour(node)
        for child in adj[node]:
            if child != parent:
                traverse(node, child)
                preorder_traversal(child, node)
        if (node):
            traverse(node, parent)

    def postorder_traversal(node, parent):
        for child in adj[node]:
            if child != parent:
                traverse(node, child)
                postorder_traversal(child, node)
        colour(node)
        if (node):
            traverse(node, parent)
    
    
    # for this one i think it should be binary tree
    # also ill clean it up later probably im sure theres a better way

    def inorder_traversal(node, parent):
        child_count = 0;
        if len(adj[node]) == 1:
            colour(node)
            if (node):
                traverse(node, parent)
            return
        lc = adj[node][0] if parent == adj[node][1] else adj[node][1]
        traverse(node, child)
        inorder_traversal(lc, node)
        colour(node)
        for child in adj[node]:
            if child != lc and child != parent:
                traverse(node, child)
                inorder_traversal(child, node)

        if (node):
            traverse(node, parent)

    # preorder_traversal(0, -1)
    # postorder_traversal(0, -1)
    # inorder_traversal(0, -1)
  `,






}

export default algorithmTemplates
