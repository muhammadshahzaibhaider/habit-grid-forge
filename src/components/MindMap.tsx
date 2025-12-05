import { useMemo } from "react";

interface MindMapNode {
  id: string;
  label: string;
  parentId?: string | null;
  color?: string;
}

interface MindMapProps {
  title: string;
  nodes: MindMapNode[];
}

interface TreeNode extends MindMapNode {
  children: TreeNode[];
  level: number;
  x: number;
  y: number;
}

const COLORS = [
  "hsl(var(--week-1))",
  "hsl(var(--week-2))",
  "hsl(var(--week-3))",
  "hsl(var(--week-4))",
  "hsl(var(--week-5))",
];

export const MindMap = ({ title, nodes }: MindMapProps) => {
  const { treeNodes, connections, width, height } = useMemo(() => {
    // Build tree structure
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    nodes.forEach((node, idx) => {
      nodeMap.set(node.id, {
        ...node,
        children: [],
        level: 0,
        x: 0,
        y: 0,
        color: node.color || COLORS[idx % COLORS.length],
      });
    });

    nodes.forEach((node) => {
      const treeNode = nodeMap.get(node.id)!;
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(treeNode);
      } else {
        roots.push(treeNode);
      }
    });

    // Calculate positions
    const nodeWidth = 140;
    const nodeHeight = 40;
    const levelGap = 100;
    const siblingGap = 20;

    let maxX = 0;
    let maxY = 0;

    const calculateSubtreeWidth = (node: TreeNode): number => {
      if (node.children.length === 0) return nodeWidth;
      return node.children.reduce(
        (sum, child) => sum + calculateSubtreeWidth(child) + siblingGap,
        -siblingGap
      );
    };

    const positionNode = (node: TreeNode, level: number, startX: number): number => {
      node.level = level;
      node.y = level * (nodeHeight + levelGap) + 60;

      if (node.children.length === 0) {
        node.x = startX + nodeWidth / 2;
        maxX = Math.max(maxX, node.x + nodeWidth / 2);
        maxY = Math.max(maxY, node.y + nodeHeight);
        return startX + nodeWidth;
      }

      let currentX = startX;
      node.children.forEach((child) => {
        currentX = positionNode(child, level + 1, currentX) + siblingGap;
      });

      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x + lastChild.x) / 2;
      maxX = Math.max(maxX, node.x + nodeWidth / 2);
      maxY = Math.max(maxY, node.y + nodeHeight);

      return currentX - siblingGap;
    };

    let currentX = 50;
    roots.forEach((root) => {
      currentX = positionNode(root, 0, currentX) + 50;
    });

    // Generate connections
    const conns: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const collectConnections = (node: TreeNode) => {
      node.children.forEach((child) => {
        conns.push({
          x1: node.x,
          y1: node.y + nodeHeight / 2,
          x2: child.x,
          y2: child.y - nodeHeight / 2,
          color: child.color || COLORS[0],
        });
        collectConnections(child);
      });
    };
    roots.forEach(collectConnections);

    return {
      treeNodes: Array.from(nodeMap.values()),
      connections: conns,
      width: Math.max(maxX + 50, 400),
      height: Math.max(maxY + 50, 300),
    };
  }, [nodes]);

  return (
    <div className="bg-card rounded-lg border-2 border-border p-4 overflow-auto">
      <h3 className="font-bold text-sm mb-3 text-center">{title}</h3>
      <div className="overflow-auto">
        <svg width={width} height={height} className="min-w-full">
          {/* Connections */}
          {connections.map((conn, idx) => (
            <path
              key={idx}
              d={`M ${conn.x1} ${conn.y1} C ${conn.x1} ${(conn.y1 + conn.y2) / 2}, ${conn.x2} ${(conn.y1 + conn.y2) / 2}, ${conn.x2} ${conn.y2}`}
              fill="none"
              stroke={conn.color}
              strokeWidth={2}
              opacity={0.6}
            />
          ))}
          
          {/* Nodes */}
          {treeNodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - 70}
                y={node.y - 20}
                width={140}
                height={40}
                rx={8}
                fill={node.color || COLORS[0]}
                stroke="hsl(var(--border))"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-foreground"
                style={{ fontSize: node.level === 0 ? 12 : 10 }}
              >
                {node.label.length > 18 ? node.label.slice(0, 18) + "..." : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
