const algorithmTemplates: Record<string, string> = {
  bfs: `// BFS Algorithm
function bfs(graph, startNode) {
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);
  
  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node); // Process node
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
`,

  dfs: `// DFS Algorithm
function dfs(graph, startNode, visited = new Set()) {
  visited.add(startNode);
  console.log(startNode); // Process node
  
  for (const neighbor of graph[startNode]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}
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
}

export default algorithmTemplates
