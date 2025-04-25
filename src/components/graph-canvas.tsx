"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MousePointer, LinkIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

type GraphCanvasProps = {
  nodes: Node[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
}

type Mode = "select" | "addNode" | "addEdge" | "delete"

export default function GraphCanvas({ nodes, setNodes, edges, setEdges }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [mode, setMode] = useState<Mode>("select")
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const [draggingNode, setDraggingNode] = useState<number | null>(null)
  const [nextNodeId, setNextNodeId] = useState(1)

  // Handle SVG click
  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return

    if (mode === "addNode") {
      // Get the SVG's bounding rectangle
      const rect = svg.getBoundingClientRect()

      // Calculate the click position relative to the SVG
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Use nextNodeId for the new node ID and increment it
      setNodes((prev) => [...prev, { id: nextNodeId, x, y }])
      setNextNodeId(nextNodeId + 1)
    } else if (mode === "select") {
      // Clicking background deselects
      setSelectedNode(null)
    }
  }

  // Handle node click
  const handleNodeClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation() // prevent background click

    if (mode === "select") {
      setSelectedNode(id === selectedNode ? null : id)
    } else if (mode === "addEdge") {
      if (selectedNode === null) {
        // First node selection
        setSelectedNode(id)
      } else if (selectedNode !== id) {
        // Second node selection - create edge if it doesn't exist
        const edgeExists = edges.some(
          (e) => (e.from === selectedNode && e.to === id) || (e.from === id && e.to === selectedNode),
        )

        if (!edgeExists) {
          setEdges((prev) => [...prev, { from: selectedNode, to: id }])
        }
        setSelectedNode(null)
      }
    } else if (mode === "delete") {
      // Delete node and connected edges
      setNodes(nodes.filter((n) => n.id !== id))
      setEdges(edges.filter((e) => e.from !== id && e.to !== id))
    }
  }

  // Handle edge click
  const handleEdgeClick = (edge: Edge, event: React.MouseEvent) => {
    event.stopPropagation()

    if (mode === "delete") {
      setEdges(
        edges.filter((e) => !(e.from === edge.from && e.to === edge.to) && !(e.from === edge.to && e.to === edge.from)),
      )
    }
  }

  // Start dragging a node
  const handleNodeMouseDown = (id: number, event: React.MouseEvent) => {
    if (mode !== "select") return

    event.stopPropagation()
    setDraggingNode(id)
    setSelectedNode(id)
  }

  // Handle mouse move for dragging
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode === null || !svgRef.current) return

    // Get the SVG's bounding rectangle
    const rect = svgRef.current.getBoundingClientRect()

    // Calculate the mouse position relative to the SVG
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setNodes(nodes.map((node) => (node.id === draggingNode ? { ...node, x, y } : node)))
  }

  // End dragging
  const handleMouseUp = () => {
    setDraggingNode(null)
  }

  // Clear the canvas
  const clearCanvas = () => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setNextNodeId(1)
  }

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === "select" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setMode("select")}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select & Move</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === "addNode" ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    setMode("addNode")
                    setSelectedNode(null)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === "addEdge" ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    setMode("addEdge")
                    setSelectedNode(null)
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Edge</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === "delete" ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    setMode("delete")
                    setSelectedNode(null)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button variant="outline" size="sm" onClick={clearCanvas} className="text-xs">
          Clear All
        </Button>
      </div>

      <div className="relative flex-1 border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const source = nodes.find((n) => n.id === edge.from)
            const target = nodes.find((n) => n.id === edge.to)

            if (!source || !target) return null

            const edgeColor = edge.color || "black"
            const strokeWidth = edge.animating ? 3 : 2
            const strokeDasharray = edge.animating ? "5,5" : "none"

            return (
              <line
                key={`edge-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={edgeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                className={`transition-all duration-300 ${edge.animating ? "animate-pulse" : ""}`}
                onClick={(e) => handleEdgeClick(edge, e)}
                style={{ cursor: mode === "delete" ? "pointer" : "default" }}
              />
            )
          })}

          {/* Line for edge creation */}
          {mode === "addEdge" &&
            selectedNode !== null &&
            hoveredNode !== null &&
            selectedNode !== hoveredNode &&
            (() => {
              const fromNode = nodes.find((n) => n.id === selectedNode)
              const toNode = nodes.find((n) => n.id === hoveredNode)

              if (!fromNode || !toNode) return null

              return (
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="gray"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  pointerEvents="none"
                />
              )
            })()}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNode
            const isHovered = node.id === hoveredNode
            const isDragging = node.id === draggingNode

            let nodeColor = node.color || "#69b3a2" // Default color

            if (isSelected && !node.color) nodeColor = "orange"

            const nodeSize = node.animating ? 24 : 20
            const strokeWidth = isSelected || isHovered ? 3 : 1.5
            const strokeColor = (() => {
              if (isSelected) return "#3b82f6" // Blue for selected
              if (isHovered && mode === "addEdge") return "#10b981" // Green for potential edge
              if (isHovered && mode === "delete") return "#ef4444" // Red for delete
              return "black"
            })()

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                className={`transition-transform duration-150 ${node.animating ? "animate-pulse" : ""}`}
                style={{
                  cursor: mode === "select" ? "move" : "pointer",
                  transform: isDragging ? "scale(1.1)" : "scale(1)",
                }}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                onClick={(e) => handleNodeClick(node.id, e)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  r={nodeSize}
                  fill={nodeColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300"
                />
                <text
                  textAnchor="middle"
                  y={5}
                  fontSize={14}
                  fill="black"
                  pointerEvents="none"
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {node.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            {mode === "addNode" ? (
              <p>Click anywhere to add a node</p>
            ) : (
              <p>Select "Add Node" to start building your graph</p>
            )}
          </div>
        )}

        {/* Mode indicator */}
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs border">
          {mode === "select" && "Select & Move"}
          {mode === "addNode" && "Add Node"}
          {mode === "addEdge" && (selectedNode === null ? "Select first node" : "Select second node")}
          {mode === "delete" && "Delete Mode"}
        </div>
      </div>
    </div>
  )
}
