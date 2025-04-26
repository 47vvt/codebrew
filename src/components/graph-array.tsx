"use client"

import { useState } from "react"

type GraphArrayProps = {
  graph: Record<number, any>
}

export default function GraphArray({ graph }: GraphArrayProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleNode = (nodeId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  // Check if the graph is weighted (values are objects) or unweighted (values are arrays)
  const isWeighted = Object.values(graph).some((value) => typeof value === "object" && !Array.isArray(value))

  return (
    <div className="font-mono text-sm">
      {Object.entries(graph).map(([nodeId, neighbors]) => (
        <div key={nodeId} className="mb-2">
          <div
            className="flex items-center cursor-pointer hover:bg-muted p-1 rounded"
            onClick={() => toggleNode(nodeId)}
          >
            <span className="mr-2">{expanded[nodeId] ? "▼" : "►"}</span>
            <span className="font-bold">Node {nodeId}:</span>
          </div>

          {expanded[nodeId] && (
            <div className="pl-6 mt-1 space-y-1">
              {isWeighted
                ? // Weighted graph display
                  Object.entries(neighbors as Record<string, number>).map(([neighborId, weight]) => (
                    <div key={`${nodeId}-${neighborId}`} className="flex items-center">
                      <span className="mr-2">→</span>
                      <span>Node {neighborId}</span>
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                        weight: {weight}
                      </span>
                    </div>
                  ))
                : // Unweighted graph display
                  (neighbors as number[]).map((neighborId) => (
                    <div key={`${nodeId}-${neighborId}`} className="flex items-center">
                      <span className="mr-2">→</span>
                      <span>Node {neighborId}</span>
                    </div>
                  ))}

              {(isWeighted ? Object.keys(neighbors as Record<string, number>) : (neighbors as number[])).length ===
                0 && <div className="text-muted-foreground italic">No connections</div>}
            </div>
          )}
        </div>
      ))}

      {Object.keys(graph).length === 0 && <div className="text-muted-foreground italic">Empty graph</div>}
    </div>
  )
}
