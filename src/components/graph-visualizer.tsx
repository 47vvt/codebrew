"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, RotateCcw, HelpCircle, Info, Save, Upload, Network, Moon, Sun } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

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
  weight: number
  color?: string
  animating?: boolean
}

// A command from the Python code
type GraphCommand = {
  type: "colour" | "traverse"
  params: string[]
  description?: string
}

export default function GraphVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("custom")
  const [code, setCode] = useState(algorithmTemplates["custom"] || "")
  const [output, setOutput] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isAnimating, setIsAnimating] = useState(false)
  const [commands, setCommands] = useState<GraphCommand[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const [showLegend, setShowLegend] = useState(false)
  const [stepDescription, setStepDescription] = useState<string>("")
  const [hasError, setHasError] = useState(false)
  const [activeTab, setActiveTab] = useState("code")

  const { theme, setTheme } = useTheme()

  // Reset all node and edge colors
  const resetVisualization = () => {
    setNodes((prev) => prev.map((node) => ({ ...node, color: undefined, animating: false })))
    setEdges((prev) => prev.map((edge) => ({ ...edge, color: undefined, animating: false })))
    setCurrentStep(0)
    setIsAnimating(false)
    setStepDescription("")
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }

  // Extract commands from Python output
  const extractCommands = (output: string): GraphCommand[] => {
    const lines = output.split(/\r?\n/)
    const commands: GraphCommand[] = []
    let lastDescription = ""

    for (const line of lines) {
      if (line.startsWith("__GRAPH__")) {
        const parts = line.split(" ")
        const commandType = parts[1] as "colour" | "traverse"

        if (commandType === "colour" || commandType === "traverse") {
          commands.push({
            type: commandType,
            params: parts.slice(2),
            description: lastDescription,
          })
          lastDescription = "" // Reset description after using it
        }
      } else if (line.trim()) {
        // Store non-graph lines as descriptions for the next command
        lastDescription = line.trim()
      }
    }

    return commands
  }

  // Apply a single command
  const applyCommand = (commandIndex: number) => {
    if (commandIndex >= commands.length) return

    const command = commands[commandIndex]

    if (command.type === "colour") {
      const nodeId = Number.parseInt(command.params[0])
      const color = command.params[1] || "red"

      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === nodeId) {
            return { ...node, color, animating: true }
          }
          // Keep other nodes as they are but turn off animation
          return { ...node, animating: false }
        }),
      )
    } else if (command.type === "traverse") {
      const fromId = Number.parseInt(command.params[0])
      const toId = Number.parseInt(command.params[1])
      const color = command.params[2] || "blue"

      // Update the edge
      setEdges((prev) =>
        prev.map((edge) => {
          if ((edge.from === fromId && edge.to === toId) || (edge.from === toId && edge.to === fromId)) {
            return { ...edge, color, animating: true }
          }
          // Keep other edges as they are but turn off animation
          return { ...edge, animating: false }
        }),
      )

      // Update both nodes, but don't change red nodes to blue
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === fromId || node.id === toId) {
            // Only update color if the node isn't already red
            if (node.color === "red") {
              return { ...node, animating: true }
            }
            return { ...node, color, animating: true }
          }
          // Keep other nodes as they are but turn off animation
          return { ...node, animating: false }
        }),
      )
    }

    // Update step description
    setStepDescription(command.description || "")
  }

  // Manual step forward
  const stepForward = () => {
    if (currentStep < commands.length) {
      // Apply the current command
      applyCommand(currentStep)

      // Move to the next step
      setCurrentStep(currentStep + 1)
    }
  }

  // Start or resume animation
  const startAnimation = () => {
    // If we're at the end, reset
    if (currentStep >= commands.length) {
      resetVisualization()
    }

    setIsAnimating(true)
  }

  // Pause animation
  const pauseAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }

  // Animation loop
  useEffect(() => {
    // If not animating, do nothing
    if (!isAnimating) return

    // If we're at the end, stop animating
    if (currentStep >= commands.length) {
      setIsAnimating(false)
      return
    }

    // Apply the current command
    applyCommand(currentStep)

    // Schedule the next step
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1)
    }, animationSpeed)

    // Store the timer reference
    animationRef.current = timer

    // Cleanup function
    return () => {
      clearTimeout(timer)
    }
  }, [isAnimating, currentStep, commands, animationSpeed])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  const handleAlgorithmChange = (algorithm: string) => {
    resetVisualization()
    setSelectedAlgorithm(algorithm)
    setCode(algorithmTemplates[algorithm] || "# Write your algorithm here")
    setCommands([])
    setOutput("")
    setHasError(false)
  }

  // Create weighted adjacency list
  const graphAsWeightedAdjacencyList = () => {
    const graph: Record<number, Record<number, number>> = {}

    // Initialize empty adjacency lists for all nodes
    nodes.forEach((node) => {
      graph[node.id] = {}
    })

    // Add edges with weights
    edges.forEach((edge) => {
      if (!graph[edge.from]) graph[edge.from] = {}
      if (!graph[edge.to]) graph[edge.to] = {}

      // Add bidirectional edges with weights
      graph[edge.from][edge.to] = edge.weight
      graph[edge.to][edge.from] = edge.weight
    })

    return graph
  }

  const runAlgorithm = async () => {
    resetVisualization()
    setCommands([])
    setHasError(false)

    try {
      const boilerplate = library
      const graph = graphAsWeightedAdjacencyList()

      // Format the weighted adjacency list for Python
      const formattedGraph = `{
        ${Object.entries(graph)
          .map(([nodeId, neighbors]) => {
            const neighborEntries = Object.entries(neighbors)
              .map(([neighborId, weight]) => `${neighborId}: ${weight}`)
              .join(", ")
            return `${nodeId}: {${neighborEntries}}`
          })
          .join(",\n  ")}
      }`

      const code_input = boilerplate + code + `\ngraph = ${formattedGraph}` + "\nmain(graph)"
      const result = await runPython(code_input)

      if (result.includes("Error")) {
        setHasError(true)
        setActiveTab("output")
      }

      const extractedCommands = extractCommands(result)

      setCommands(extractedCommands)
      setTotalSteps(extractedCommands.length)
      setOutput(result)

      // Auto-start animation if there are commands
      if (extractedCommands.length > 0) {
        setCurrentStep(0)

        // Start animation after a short delay
        setTimeout(() => {
          setIsAnimating(true)
        }, 100)
      }
    } catch (err) {
      console.error(err)
      setOutput("Error executing Python code:\n" + String(err))
      setHasError(true)
      setActiveTab("output")
    }
  }

  // Save graph to JSON
  const saveGraph = () => {
    const graphData = {
      nodes,
      edges,
    }

    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "graph.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Load graph from JSON
  const loadGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const graphData = JSON.parse(content)

        if (graphData.nodes && graphData.edges) {
          setNodes(graphData.nodes)
          setEdges(graphData.edges)
          resetVisualization()
        }
      } catch (err) {
        console.error("Error loading graph:", err)
        setOutput("Error loading graph: " + String(err))
        setHasError(true)
        setActiveTab("output")
      }
    }
    reader.readAsText(file)

    // Reset the input value so the same file can be loaded again
    event.target.value = ""
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Graph Sandbox</h1>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={saveGraph}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Graph</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <input type="file" id="load-graph" className="hidden" accept=".json" onChange={loadGraph} />
                  <Button variant="outline" size="icon" onClick={() => document.getElementById("load-graph")?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load Graph</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-primary">Graph Canvas</h2>
            <div className="flex items-center gap-2">
              {showLegend && (
                <div className="flex items-center gap-3 text-sm bg-muted/50 p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Current</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex-1 border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-md">
            <GraphCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />

            {commands.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={isAnimating ? pauseAnimation : startAnimation}>
                      {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={stepForward}
                      disabled={currentStep >= commands.length}
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

                  <Badge variant="outline" className="bg-primary/10">
                    Step {Math.min(currentStep, commands.length)} of {totalSteps}
                  </Badge>
                </div>

                {stepDescription && (
                  <div className="text-sm mb-2 bg-muted/50 p-2 rounded-md border border-border/50">
                    {stepDescription}
                  </div>
                )}

                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(Math.min(currentStep, commands.length) / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>View Graph Structure</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">Weighted Adjacency List</h3>
                  <div className="max-h-[300px] overflow-auto">
                    <GraphArray graph={graphAsWeightedAdjacencyList()} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Templates:</span>
              <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <TabsList className="justify-start">
                <TabsTrigger value="code">Code Editor</TabsTrigger>
                <TabsTrigger
                  value="output"
                  className={cn(
                    hasError && "relative",
                    hasError &&
                      "after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-red-500 after:rounded-full",
                  )}
                >
                  Output {hasError && <span className="ml-1 text-red-500">(!)</span>}
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={runAlgorithm}
                className="gap-2 bg-primary hover:bg-primary/90"
                disabled={nodes.length === 0}
              >
                <Play className="h-4 w-4" />
                Run Algorithm
              </Button>
            </div>

            <TabsContent value="code" className="flex-1 p-0 m-0 flex flex-col">
              <CodeEditor code={code} onChange={setCode} theme={theme} />
            </TabsContent>

            <TabsContent value="output" className="flex-1 p-4 m-0 overflow-hidden">
              <div
                className={cn("bg-muted p-4 rounded-md h-full overflow-auto", hasError && "border-2 border-red-500/50")}
              >
                <pre className={cn("text-sm font-mono whitespace-pre-wrap", hasError && "text-red-500")}>
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
