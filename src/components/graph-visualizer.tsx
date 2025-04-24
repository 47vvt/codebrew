import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Menu } from "lucide-react"
import CodeEditor from "./code-editor"
import GraphCanvas from "./graph-canvas"
import GraphArray from "./graph-array"
import AlgorithmSelector from "./algorithm-selector"

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number }>>([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 200, y: 150 },
    { id: 3, x: 150, y: 250 },
  ])

  const [edges, setEdges] = useState<Array<{ from: number; to: number }>>([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 1 },
  ])

  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bfs")
  const [code, setCode] = useState(`// BFS Algorithm
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
}`)

  const handleAddNode = (x: number, y: number) => {
    const newId = nodes.length > 0 ? Math.max(...nodes.map((n) => n.id)) + 1 : 1
    setNodes([...nodes, { id: newId, x, y }])
  }

  const handleAddEdge = (from: number, to: number) => {
    if (from !== to && !edges.some((e) => e.from === from && e.to === to)) {
      setEdges([...edges, { from, to }])
    }
  }

  const handleDeleteNode = (id: number) => {
    setNodes(nodes.filter((node) => node.id !== id))
    setEdges(edges.filter((edge) => edge.from !== id && edge.to !== id))
  }

  const handleDeleteEdge = (from: number, to: number) => {
    setEdges(edges.filter((edge) => !(edge.from === from && edge.to === to)))
  }

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm)

    // Update code based on selected algorithm
    if (algorithm === "bfs") {
      setCode(`// BFS Algorithm
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
}`)
    } else if (algorithm === "dfs") {
      setCode(`// DFS Algorithm
function dfs(graph, startNode, visited = new Set()) {
  visited.add(startNode);
  console.log(startNode); // Process node
  
  for (const neighbor of graph[startNode]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}`)
    } else if (algorithm === "dijkstra") {
      setCode(`// Dijkstra's Algorithm
function dijkstra(graph, startNode) {
  const distances = {};
  const visited = new Set();
  const previous = {};
  const queue = [];
  
  // Initialize distances
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
}`)
    }
  }

  // Convert graph to adjacency list representation
  const graphAsArray = () => {
    const graph: Record<number, number[]> = {}

    // Initialize all nodes with empty arrays
    nodes.forEach((node) => {
      graph[node.id] = []
    })

    // Add edges
    edges.forEach((edge) => {
      graph[edge.from].push(edge.to)
    })

    return graph
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <header className="border-b bg-background p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Graph Algorithm Visualizer</h1>
        </div>
        <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph Visualization Area */}
        <div className="w-1/2 border-r p-4 flex flex-col">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
          />
        </div>

        {/* Code Editor Area */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 justify-start">
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1 p-0 m-0 flex flex-col">
              <CodeEditor code={code} onChange={setCode} />
              <div className="border-t p-4">
                <h3 className="text-sm font-medium mb-2">Graph as Array</h3>
                <GraphArray graph={graphAsArray()} />
              </div>
            </TabsContent>
            <TabsContent value="output" className="flex-1 p-4">
              <div className="bg-muted p-4 rounded-md h-full overflow-auto">
                <pre className="text-sm">Output will appear here when you run the algorithm</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
