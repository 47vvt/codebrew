"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, MousePointer, Share2, Trash2 } from "lucide-react"

export default function GraphCanvas({ nodes, edges, onAddNode, onAddEdge, onDeleteNode, onDeleteEdge }) {
  const canvasRef = useRef(null)
  const [mode, setMode] = useState("select")
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState(null)

  const NODE_RADIUS = 20
  const NODE_COLOR = "#ffffff"
  const NODE_BORDER_COLOR = "#000000"
  const SELECTED_NODE_COLOR = "#e2e8f0"
  const EDGE_COLOR = "#000000"
  const ARROW_SIZE = 10

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight - 50 // Account for toolbar
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw function
    const draw = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      edges.forEach((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from)
        const toNode = nodes.find((n) => n.id === edge.to)

        if (fromNode && toNode) {
          // Calculate direction vector
          const dx = toNode.x - fromNode.x
          const dy = toNode.y - fromNode.y
          const length = Math.sqrt(dx * dx + dy * dy)

          // Normalize direction vector
          const ndx = dx / length
          const ndy = dy / length

          // Calculate start and end points (adjusted for node radius)
          const startX = fromNode.x + ndx * NODE_RADIUS
          const startY = fromNode.y + ndy * NODE_RADIUS
          const endX = toNode.x - ndx * NODE_RADIUS
          const endY = toNode.y - ndy * NODE_RADIUS

          // Draw edge
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)

          // Check if this edge is hovered
          const isHovered = hoveredEdge && hoveredEdge.from === edge.from && hoveredEdge.to === edge.to

          ctx.strokeStyle = isHovered ? "#4299e1" : EDGE_COLOR
          ctx.lineWidth = isHovered ? 3 : 2
          ctx.stroke()

          // Draw arrow
          const angle = Math.atan2(ndy, ndx)
          ctx.beginPath()
          ctx.moveTo(endX, endY)
          ctx.lineTo(
            endX - ARROW_SIZE * Math.cos(angle - Math.PI / 6),
            endY - ARROW_SIZE * Math.sin(angle - Math.PI / 6),
          )
          ctx.lineTo(
            endX - ARROW_SIZE * Math.cos(angle + Math.PI / 6),
            endY - ARROW_SIZE * Math.sin(angle + Math.PI / 6),
          )
          ctx.closePath()
          ctx.fillStyle = isHovered ? "#4299e1" : EDGE_COLOR
          ctx.fill()
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        const isSelected = node.id === selectedNode
        const isHovered = node.id === hoveredNode

        // Draw node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = isSelected ? SELECTED_NODE_COLOR : NODE_COLOR
        ctx.fill()
        ctx.strokeStyle = isHovered ? "#4299e1" : NODE_BORDER_COLOR
        ctx.lineWidth = isHovered || isSelected ? 3 : 2
        ctx.stroke()

        // Draw node ID
        ctx.fillStyle = "#000000"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.id.toString(), node.x, node.y)
      })

      // Draw line when adding edge
      if (mode === "addEdge" && selectedNode !== null) {
        const fromNode = nodes.find((n) => n.id === selectedNode)
        if (fromNode && canvas) {
          const rect = canvas.getBoundingClientRect()
          const mouseX = lastMouseX - rect.left
          const mouseY = lastMouseY - rect.top

          ctx.beginPath()
          ctx.moveTo(fromNode.x, fromNode.y)
          ctx.lineTo(mouseX, mouseY)
          ctx.strokeStyle = "#4299e1"
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    }

    // Animation loop
    let animationFrameId
    const animate = () => {
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [nodes, edges, selectedNode, hoveredNode, hoveredEdge, mode])

  // Track mouse position for drawing the edge line
  const [lastMouseX, setLastMouseX] = useState(0)
  const [lastMouseY, setLastMouseY] = useState(0)

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setLastMouseX(e.clientX)
    setLastMouseY(e.clientY)

    // Handle node dragging
    if (isDragging && draggedNode !== null) {
      const nodeIndex = nodes.findIndex((n) => n.id === draggedNode)
      if (nodeIndex !== -1) {
        const updatedNodes = [...nodes]
        updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], x, y }
        // This would normally update the nodes state, but we're avoiding it in the mousemove
        // to prevent too many rerenders. Instead, we'll update on mouseup.
        // For now, just update the canvas directly
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          // Redraw with updated node position
          // (simplified, the actual redraw happens in the effect)
        }
      }
      return
    }

    // Check if hovering over a node
    let hovered = null
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      const dx = x - node.x
      const dy = y - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= NODE_RADIUS) {
        hovered = node.id
        break
      }
    }
    setHoveredNode(hovered)

    // Check if hovering over an edge
    if (!hovered) {
      let hoveredE = null
      for (const edge of edges) {
        const fromNode = nodes.find((n) => n.id === edge.from)
        const toNode = nodes.find((n) => n.id === edge.to)

        if (fromNode && toNode) {
          // Calculate if point is near line
          const A = { x: fromNode.x, y: fromNode.y }
          const B = { x: toNode.x, y: toNode.y }
          const C = { x, y }

          const distAB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
          const distAC = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2)
          const distBC = Math.sqrt((C.x - B.x) ** 2 + (C.y - B.y) ** 2)

          // Check if point is near line segment using triangle inequality
          const buffer = 5 // Tolerance in pixels
          if (distAC + distBC >= distAB - buffer && distAC + distBC <= distAB + buffer) {
            hoveredE = edge
            break
          }
        }
      }
      setHoveredEdge(hoveredE)
    } else {
      setHoveredEdge(null)
    }
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === "select") {
      // Check if clicking on a node
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        const dx = x - node.x
        const dy = y - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= NODE_RADIUS) {
          setSelectedNode(node.id)
          setDraggedNode(node.id)
          setIsDragging(true)
          return
        }
      }

      // If not clicking on a node, deselect
      setSelectedNode(null)
    } else if (mode === "addNode") {
      onAddNode(x, y)
    } else if (mode === "addEdge") {
      // If a node is already selected, try to create an edge
      if (selectedNode !== null && hoveredNode !== null && hoveredNode !== selectedNode) {
        onAddEdge(selectedNode, hoveredNode)
        setSelectedNode(null)
      }
      // If no node is selected or clicking on empty space, select the hovered node
      else if (hoveredNode !== null) {
        setSelectedNode(hoveredNode)
      } else {
        setSelectedNode(null)
      }
    } else if (mode === "delete") {
      // Delete node if clicking on one
      if (hoveredNode !== null) {
        onDeleteNode(hoveredNode)
      }
      // Delete edge if clicking on one
      else if (hoveredEdge !== null) {
        onDeleteEdge(hoveredEdge.from, hoveredEdge.to)
      }
    }
  }

  const handleMouseUp = (e) => {
    if (isDragging && draggedNode !== null) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Update the node position
      const nodeIndex = nodes.findIndex((n) => n.id === draggedNode)
      if (nodeIndex !== -1) {
        const updatedNodes = [...nodes]
        updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], x, y }
        // This would update the nodes in the parent component
        // onUpdateNodes(updatedNodes)
      }
    }

    setIsDragging(false)
    setDraggedNode(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-1">
          <Button
            variant={mode === "select" ? "default" : "outline"}
            size="icon"
            onClick={() => setMode("select")}
            title="Select Mode"
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === "addNode" ? "default" : "outline"}
            size="icon"
            onClick={() => setMode("addNode")}
            title="Add Node Mode"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === "addEdge" ? "default" : "outline"}
            size="icon"
            onClick={() => setMode("addEdge")}
            title="Add Edge Mode"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === "delete" ? "default" : "outline"}
            size="icon"
            onClick={() => setMode("delete")}
            title="Delete Mode"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {mode === "select" && "Click and drag nodes to move them"}
          {mode === "addNode" && "Click anywhere to add a node"}
          {mode === "addEdge" && "Click on a node, then click on another node to create an edge"}
          {mode === "delete" && "Click on a node or edge to delete it"}
        </div>
      </div>
      <div className="flex-1 bg-muted/20 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoveredNode(null)
            setHoveredEdge(null)
          }}
        />
      </div>
    </div>
  )
}
