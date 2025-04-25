import { useRef, useState } from "react";
import * as d3 from "d3";

type Node = { id: number; x: number; y: number; color?: string };
type Edge = { from: number; to: number };

interface StaticGraphProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function StaticGraph({nodes, setNodes, edges, setEdges}: StaticGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const [x, y] = d3.pointer(event, svg);
    const id = nodes.length;
    setNodes((prev) => [...prev, { id, x, y }]);
    setSelected(null); // clicking background resets selection
  };

  const handleNodeClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // prevent background click
    if (selected === null) {
      setSelected(id);
    } else if (selected !== id) {
      setEdges((prev) => [...prev, { from: selected, to: id }]);
      setSelected(null);
    } else {
      setSelected(null);
    }
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setSelected(null);
  };

  return (
    <div className="p-4">
    <button
      onClick={handleReset}
      className="mb-4 p-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow"
    >
      Reset Graph
    </button>

    <div className="bg-gray-100 rounded-xl shadow-inner p-2">
      <svg
        ref={svgRef}
        width={800}
        height={600}
        className="rounded-lg"
        onClick={handleSvgClick}
      >

      {edges.map((edge, i) => {
        const source = nodes.find((n) => n.id === edge.from)!;
        const target = nodes.find((n) => n.id === edge.to)!;
        return (
          <line
            key={i}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke="black"
            strokeWidth={2}
          />
        );
      })}

      {nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <circle
            r={20}
            fill={node.color || (node.id === selected ? "orange" : "#69b3a2")}
            stroke="black"
            strokeWidth={1.5}
            onClick={(e) => handleNodeClick(node.id, e)}
            style={{ cursor: "pointer" }}
          />
          <text
            textAnchor="middle"
            y={5}
            fontSize={14}
            fill="black"
            pointerEvents="none"
          >
            {node.id}
          </text>
        </g>
      ))}

      </svg>
    </div>
  </div>

  );
}
