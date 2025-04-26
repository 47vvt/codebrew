"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MousePointer, LinkIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

type GraphCanvasProps = {
  nodes: Node[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
}

type Mode = "select" | "addNode" | "addEdge" | "delete"

export default function GraphCanvas({ nodes, setNodes, edges, setEdges }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>("select")
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const [draggingNode, setDraggingNode] = useState<number | null>(null)
  const { theme } = useTheme()

  // Calculate distance between two points (for edge weight)
  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.round(Math.sqrt(dx * dx + dy * dy))
  }

  // Handle container click for adding nodes
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "addNode") return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setNodes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id))
      let newId = 1
      while (existingIds.has(newId)) newId++
      return [...prev, { id: newId, x, y }]
    })
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
          // Find the nodes to calculate distance
          const sourceNode = nodes.find((n) => n.id === selectedNode)
          const targetNode = nodes.find((n) => n.id === id)

          if (sourceNode && targetNode) {
            // Calculate weight based on distance
            const weight = calculateDistance(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y)

            // Add the new edge with weight
            setEdges((prev) => [...prev, { from: selectedNode, to: id, weight }])
          }
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
  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggingNode === null || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Update node position
    setNodes(nodes.map((node) => (node.id === draggingNode ? { ...node, x, y } : node)))

    // Update weights of connected edges
    setEdges(
      edges.map((edge) => {
        if (edge.from === draggingNode || edge.to === draggingNode) {
          const sourceNode = nodes.find((n) => n.id === edge.from)
          const targetNode = nodes.find((n) => n.id === edge.to)

          if (sourceNode && targetNode) {
            // If the dragged node is the source, use the new coordinates
            const sourceX = edge.from === draggingNode ? x : sourceNode.x
            const sourceY = edge.from === draggingNode ? y : sourceNode.y

            // If the dragged node is the target, use the new coordinates
            const targetX = edge.to === draggingNode ? x : targetNode.x
            const targetY = edge.to === draggingNode ? y : targetNode.y

            // Calculate new weight
            const weight = calculateDistance(sourceX, sourceY, targetX, targetY)
            return { ...edge, weight }
          }
        }
        return edge
      }),
    )
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

      <div
        ref={containerRef}
        className="relative flex-1 border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900"
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
      >
        {/* Render edges */}
        {edges.map((edge, i) => {
          const source = nodes.find((n) => n.id === edge.from)
          const target = nodes.find((n) => n.id === edge.to)

          if (!source || !target) return null

          const edgeColor = edge.color || (theme === "dark" ? "white" : "black")
          const strokeWidth = edge.animating ? 3 : 2
          const strokeDasharray = edge.animating ? "5,5" : "none"

          // Calculate midpoint for weight label
          const midX = (source.x + target.x) / 2
          const midY = (source.y + target.y) / 2

          // Offset the label slightly to not overlap the line
          const dx = target.x - source.x
          const dy = target.y - source.y
          const angle = Math.atan2(dy, dx)
          const offset = 10
          const labelX = midX + offset * Math.sin(angle)
          const labelY = midY - offset * Math.cos(angle)

          return (
            <div
              key={`edge-${i}`}
              className={`absolute top-0 left-0 w-full h-full pointer-events-none ${edge.animating ? "animate-pulse" : ""}`}
              style={{
                zIndex: 1,
              }}
            >
              <svg width="100%" height="100%" className="absolute top-0 left-0">
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={edgeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-300 pointer-events-auto"
                  onClick={(e) => handleEdgeClick(edge, e)}
                  style={{ cursor: mode === "delete" ? "pointer" : "default" }}
                />

                {/* Weight label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme === "dark" ? "white" : "black"}
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  <tspan
                    className={theme === "dark" ? "bg-slate-800 px-1 py-0.5 rounded" : "bg-white px-1 py-0.5 rounded"}
                  >
                    {edge.weight}
                  </tspan>
                </text>
              </svg>
            </div>
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

            // Calculate potential weight
            const weight = calculateDistance(fromNode.x, fromNode.y, toNode.x, toNode.y)

            // Calculate midpoint for weight label
            const midX = (fromNode.x + toNode.x) / 2
            const midY = (fromNode.y + toNode.y) / 2

            return (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <svg width="100%" height="100%" className="absolute top-0 left-0">
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="gray"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />

                  {/* Potential weight label */}
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={theme === "dark" ? "white" : "gray"}
                    fontSize="12"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    <tspan
                      className={
                        theme === "dark" ? "bg-slate-800/80 px-1 py-0.5 rounded" : "bg-white/80 px-1 py-0.5 rounded"
                      }
                    >
                      {weight}
                    </tspan>
                  </text>
                </svg>
              </div>
            )
          })()}

        {/* Render nodes */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNode
          const isHovered = node.id === hoveredNode
          const isDragging = node.id === draggingNode

          let nodeColor = node.color || "#69b3a2" // Default color

          if (isSelected && !node.color) nodeColor = "orange"

          const nodeSize = node.animating ? 24 : 20
          const borderWidth = isSelected || isHovered ? 3 : 1.5
          const borderColor = (() => {
            if (isSelected) return "#3b82f6" // Blue for selected
            if (isHovered && mode === "addEdge") return "#10b981" // Green for potential edge
            if (isHovered && mode === "delete") return "#ef4444" // Red for delete
            return theme === "dark" ? "white" : "black"
          })()

          return (
            <div
              key={`node-${node.id}`}
              className={`absolute rounded-full flex items-center justify-center transition-all duration-150 ${
                node.animating ? "animate-pulse" : ""
              }`}
              style={{
                left: node.x - nodeSize,
                top: node.y - nodeSize,
                width: nodeSize * 2,
                height: nodeSize * 2,
                backgroundColor: nodeColor,
                border: `${borderWidth}px solid ${borderColor}`,
                cursor: mode === "select" ? "move" : "pointer",
                zIndex: isDragging ? 10 : 2,
                transform: isDragging ? "scale(1.1)" : "scale(1)",
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onClick={(e) => handleNodeClick(node.id, e)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <span className="text-xs text-white font-bold">{node.id}</span>
            </div>
          )
        })}

        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            {mode === "addNode" ? (
              <p>Click anywhere to add a node</p>
            ) : (
              <p>Select "+" and click anywhere on the canvas.</p>
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
