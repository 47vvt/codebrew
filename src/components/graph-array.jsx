"use client"

export default function GraphArray({ graph }) {
  return (
    <div className="bg-muted p-3 rounded-md overflow-x-auto">
      <pre className="text-xs">{JSON.stringify(graph, null, 2)}</pre>
    </div>
  )
}
