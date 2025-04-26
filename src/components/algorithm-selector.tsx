"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AlgorithmSelectorProps {
  selectedAlgorithm: string
  onAlgorithmChange: (algorithm: string) => void
}

export default function AlgorithmSelector({ selectedAlgorithm, onAlgorithmChange }: AlgorithmSelectorProps) {
  return (
    <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Algorithm" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="custom">Empty</SelectItem>
        <SelectItem value="bfs">Breadth First Search</SelectItem>
        <SelectItem value="dfs">Depth First Search (Recursive)</SelectItem>
        <SelectItem value="dfs2">Depth First Search (Iterative)</SelectItem>
        <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
        <SelectItem value="prim">Prim's Algorithm</SelectItem>
        <SelectItem value="bellman_ford">Bellman-Ford Algorithm</SelectItem>
      </SelectContent>
    </Select>
  )
}
