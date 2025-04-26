"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Menu, Play, Pause, SkipForward, RotateCcw, HelpCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import CodeEditor from "./code-editor"
import GraphCanvas from "./graph-canvas"
import GraphArray from "./graph-array"
import AlgorithmSelector from "./algorithm-selector"
import algorithmTemplates from "@/lib/algorithms"
import { runPython } from "./utils/pyodide-runner"
import library from "@/lib/library"

type Node = {
  id: number
  x: number
  y: number
  color?: string
  label?: string
  animating?: boolean
}

type Edge = {
  from: number
  to: number
  color?: string
  animating?: boolean
}

type AnimationStep = {
  type: "node" | "edge" | "traversal"
  action: "color" | "traverse" | "reset"
  data: any
}

export default function GraphVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bfs")
  const [code, setCode] = useState(algorithmTemplates["bfs"] || "")
  const [output, setOutput] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationQueue, setAnimationQueue] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  const resetVisualization = () => {
    setNodes((prev) => prev.map((node) => ({ ...node, color: undefined, animating: false })))
    setEdges((prev) => prev.map((edge) => ({ ...edge, color: undefined, animating: false })))
    setCurrentStep(0)
    setIsAnimating(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }

  const processGraphCommands = (commands: string[]) => {
    const steps: AnimationStep[] = []

    for (const cmd of commands) {
      if (!cmd.startsWith("__GRAPH__")) continue

      const parts = cmd.split(" ")
      const action = parts[1]

      if (action === "colour" && parts[2]) {
        const targetId = Number.parseInt(parts[2])
        const color = parts[3] || "red"
        steps.push({
          type: "node",
          action: "color",
          data: { id: targetId, color },
        })
      }

      if (action === "traverse" && parts[2] && parts[3]) {
        const from = Number.parseInt(parts[2])
        const to = Number.parseInt(parts[3])
        const color = parts[4] || "blue"
        steps.push({
          type: "traversal",
          action: "traverse",
          data: { from, to, color },
        })
      }
    }

    return steps
  }

  const applyAnimationStep = (step: AnimationStep) => {
    const isMatchingEdge = (e: Edge, from: number, to: number) =>
      (e.from === from && e.to === to) || (e.from === to && e.to === from)

    const updateEdgeState = (from: number, to: number, color: string) => {
      setEdges((prev) =>
        prev.map((e) =>
          isMatchingEdge(e, from, to)
            ? { ...e, color, animating: true }
            : { ...e, animating: false }
        )
      )
    }

    const updateNodeState = (ids: number[], color: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (!ids.includes(n.id)) return { ...n, animating: false }
          if (n.color === "red" && color === "blue") return n // ❌ skip update
          return { ...n, color, animating: true }
        })
      )
    }
    

    if (step.type === "node" && step.action === "color") {
      const { id, color } = step.data
      updateNodeState([id], color)
    }

    if (step.type === "edge" && step.action === "traverse") {
      const { from, to, color } = step.data
      updateEdgeState(from, to, color)
    }

    if (step.type === "traversal" && step.action === "traverse") {
      const { from, to, color } = step.data

      const edgeExists = edges.some((e) => isMatchingEdge(e, from, to))
      if (!edgeExists) return // ⛔ no edge — do nothing

      updateEdgeState(from, to, color)
      updateNodeState([from, to], color)
    }
  }
 

  const runAnimation = async () => {
    setIsAnimating(true)

    for (let step = currentStep; step < animationQueue.length; step++) {
      applyAnimationStep(animationQueue[step])
      setCurrentStep(step + 1)

      await new Promise((resolve) => setTimeout(resolve, animationSpeed))
    }

    setIsAnimating(false)
  }

  const startAnimation = () => {
    if (isAnimating || currentStep >= animationQueue.length) return
    runAnimation()
  }

  const pauseAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }

  const stepForward = () => {
    if (currentStep < animationQueue.length) {
      pauseAnimation()
      applyAnimationStep(animationQueue[currentStep])
      setCurrentStep((prev) => prev + 1)
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (currentStep >= animationQueue.length && isAnimating) {
      setIsAnimating(false)
    }
  }, [currentStep, animationQueue.length, isAnimating])

  const handleAlgorithmChange = (algorithm: string) => {
    resetVisualization()
    setSelectedAlgorithm(algorithm)
    setCode(algorithmTemplates[algorithm] || "# Algorithm not found")
    setAnimationQueue([])
    setOutput("")
  }

  const graphAsArray = () => {
    const graph: Record<number, number[]> = {}
    nodes.forEach((node) => (graph[node.id] = []))
    edges.forEach((edge) => {
      if (!graph[edge.from]) graph[edge.from] = []
      if (!graph[edge.to]) graph[edge.to] = []

      graph[edge.from].push(edge.to)
      graph[edge.to].push(edge.from)
    })
    return graph
  }

  const runAlgorithm = async () => {
    resetVisualization()
    setAnimationQueue([])

    try {
      const boilerplate = library
      const graph = graphAsArray()

      const adj= `{
        ${Object.entries(graph)
          .map(([k, v]) => `${k}: [${v.join(", ")}]`)
          .join(",\n  ")}
      }`
      const code_input = boilerplate + code + `\ngraph = ${adj}` + "\nmain(graph)"
      // console.log(code_input)
      // const code_input = boilerplate + code + `\ngraph = ${JSON.stringify(graph, null, 2)}` + "\nmain(graph)"
      const result = await runPython(code_input)

      const commands = result.split(/\r?\n/)
      const steps = processGraphCommands(commands)

      setAnimationQueue(steps)
      setTotalSteps(steps.length)
      setOutput(result)

      setCurrentStep(0)
      setIsAnimating(true)
      setTimeout(() => {
        runAnimation()
      }, 500)
    } catch (err) {
      console.error(err)
      setOutput("Error executing Python code: " + String(err))
    }
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-background p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Graph Algorithm Visualizer</h1>
        </div>
        <div className="flex items-center gap-2">
          <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowLegend(!showLegend)}>
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show visualization legend</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Graph Visualization</h2>
            <div className="flex items-center gap-2">
              {showLegend && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center ml-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Current</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex-1 border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900">
            <GraphCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />

            {animationQueue.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={isAnimating ? pauseAnimation : startAnimation}>
                      {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={stepForward}
                      disabled={currentStep >= animationQueue.length}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={resetVisualization}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Speed:</span>
                    <Slider
                      className="w-24"
                      value={[animationSpeed]}
                      min={100}
                      max={2000}
                      step={100}
                      onValueChange={(value) => setAnimationSpeed(value[0])}
                    />
                  </div>

                  <Badge variant="outline">
                    Step {currentStep} of {totalSteps}
                  </Badge>
                </div>

                <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Graph as Array</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">Adjacency List</h3>
                  <GraphArray graph={graphAsArray()} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <div className="flex justify-between items-center px-4 pt-3">
              <TabsList className="justify-start">
                <TabsTrigger value="code">Code Editor</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>

              <Button onClick={runAlgorithm} className="gap-2" disabled={nodes.length === 0}>
                <Play className="h-4 w-4" />
                Run Algorithm
              </Button>
            </div>

            <TabsContent value="code" className="flex-1 p-0 m-0 flex flex-col">
              <CodeEditor code={code} onChange={setCode} />
            </TabsContent>

            <TabsContent value="output" className="flex-1 p-4">
              <div className="bg-muted p-4 rounded-md h-full overflow-auto">
                <pre className="text-sm font-mono">
                  {output || "Output will appear here when you run the algorithm"}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
