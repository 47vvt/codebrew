import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Menu } from "lucide-react"
import CodeEditor from "./code-editor"
import GraphCanvas from "./graph-canvas"
import GraphArray from "./graph-array"
import AlgorithmSelector from "./algorithm-selector"
import algorithmTemplates from "@/lib/algorithms"
import { runPython } from "./utils/pyodide-runner" // Import runPython if it's in another file
import library from "@/lib/library"

type Node = { id: number; x: number; y: number; color?: string };
type Edge = { from: number; to: number };

export default function GraphVisualizer() {

  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bfs")
  const [code, setCode] = useState(algorithmTemplates["bfs"] || "")
  const [output, setOutput] = useState("")

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);


  async function processGraphCommands(
    commands: string[],
  ) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const cmd of commands) {
      if (!cmd.startsWith("__GRAPH__")) continue;

      const parts = cmd.split(" ");
      const action = parts[1];
      await delay(100); // half-second delay between commands

      if (action === "colour" && parts[2]) {
        const targetId = parseInt(parts[2]);
        setNodes(prev =>
          prev.map(n => n.id === targetId ? { ...n, color: "red" } : n)
        );
      }

      if (action === "traverse" && parts[2] && parts[3]) {
        const from = parseInt(parts[2]);
        const to = parseInt(parts[3]);
        const exists = edges.some(
          e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
        );

        setEdges(prev => {

          if (!exists) return prev; // no such edge — do nothing

          return prev.map(e =>
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
              ? { ...e, color: "blue" }
              : e
          );
        });
        setNodes(prev => {
          if (!exists) return prev; // no such edge — do nothing
          return prev.map(n =>
            n.id === from || n.id === to ? { ...n, color: "blue" } : n
          )
        });
      }

    }
  }


  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm)
    setCode(algorithmTemplates[algorithm] || "# Algorithm not found")
  }

  const graphAsArray = () => {
    const graph: Record<number, number[]> = {}
    nodes.forEach(node => (graph[node.id] = []))
    edges.forEach(edge => {
      graph[edge.from].push(edge.to)
      graph[edge.to].push(edge.from)
    })
    return graph
  }

  const runAlgorithm = async () => {
    try {
      const boilerplate = library
      const graph = graphAsArray()
      const code_input = boilerplate + code + `\ngraph = ${JSON.stringify(graph, null, 2)}` + "\nmain(graph)"
      const result = await runPython(code_input)
      console.log(result.split(/\r?\n/))
      processGraphCommands(result.split(/\r?\n/)).then(()=>console.log(edges))
      setOutput(result)
    } catch (err) {
      setOutput("Error executing Python code")
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Graph Algorithm Visualizer</h1>
        </div>
        <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r p-4 flex flex-col">
          <GraphCanvas 
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        </div>

        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 justify-start">
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1 p-0 m-0 flex flex-col">
              <CodeEditor code={code} onChange={setCode} />
              <div className="border-t p-4 flex justify-between">
                <Button onClick={runAlgorithm} className="w-1/4">
                  Run
                </Button>
                <h3 className="text-sm font-medium">Graph as Array</h3>
                <GraphArray graph={graphAsArray()} />
              </div>
            </TabsContent>
            <TabsContent value="output" className="flex-1 p-4">
              <div className="bg-muted p-4 rounded-md h-full overflow-auto">
                <pre className="text-sm">{output || "Output will appear here when you run the algorithm"}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
