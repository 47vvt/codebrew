"use client"

interface GraphArrayProps {
  graph: Record<number, number[]>
}

export default function GraphArray({ graph }: GraphArrayProps) {
  return (
    <div className="bg-muted p-3 rounded-md overflow-x-auto">
      <pre className="text-xs">{JSON.stringify(graph, null, 2)}</pre>
    </div>
  )
}
