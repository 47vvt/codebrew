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
        <SelectItem value="bfs">Breadth-First Search</SelectItem>
        <SelectItem value="dfs">Depth-First Search</SelectItem>
        <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
      </SelectContent>
    </Select>
  )
}
