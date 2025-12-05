import { useMemo, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

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

interface PositionedNode extends MindMapNode {
  x: number;
  y: number;
  level: number;
  children: PositionedNode[];
}

const BRANCH_COLORS = [
  "#e11d48", "#9333ea", "#0284c7", "#16a34a",
  "#ea580c", "#eab308", "#0d9488", "#7c3aed",
];

export const MindMap = ({ title, nodes }: MindMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { positionedNodes, connections, width, height } = useMemo(() => {
    if (nodes.length === 0) {
      return { positionedNodes: [] as PositionedNode[], connections: [] as { x1: number; y1: number; x2: number; y2: number; color: string; level: number }[], width: 600, height: 400 };
    }

    const nodeMap = new Map<string, PositionedNode>();
    const roots: PositionedNode[] = [];

    nodes.forEach((node, idx) => {
      nodeMap.set(node.id, { ...node, x: 0, y: 0, level: 0, children: [], color: node.color || BRANCH_COLORS[idx % BRANCH_COLORS.length] });
    });

    nodes.forEach((node) => {
      const posNode = nodeMap.get(node.id)!;
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children.push(posNode);
        posNode.color = parent.color;
      } else {
        roots.push(posNode);
      }
    });

    const centerX = 400, centerY = 300;
    const levelRadius = [0, 150, 280, 380];
    let maxX = centerX, minX = centerX, maxY = centerY, minY = centerY;

    const positionNodes = (node: PositionedNode, level: number, startAngle: number, endAngle: number, branchColor: string) => {
      node.level = level;
      node.color = branchColor;
      if (level === 0) { node.x = centerX; node.y = centerY; }
      else {
        const angle = (startAngle + endAngle) / 2;
        const radius = levelRadius[Math.min(level, levelRadius.length - 1)];
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      }
      maxX = Math.max(maxX, node.x + 80); minX = Math.min(minX, node.x - 80);
      maxY = Math.max(maxY, node.y + 30); minY = Math.min(minY, node.y - 30);
      if (node.children.length > 0) {
        const step = (endAngle - startAngle) / node.children.length;
        node.children.forEach((child, idx) => positionNodes(child, level + 1, startAngle + idx * step, startAngle + (idx + 1) * step, branchColor));
      }
    };

    if (roots.length === 1) {
      const root = roots[0];
      root.x = centerX; root.y = centerY; root.level = 0;
      const count = root.children.length;
      if (count > 0) root.children.forEach((child, idx) => positionNodes(child, 1, (2 * Math.PI * idx) / count - Math.PI / count, (2 * Math.PI * idx) / count + Math.PI / count, BRANCH_COLORS[idx % BRANCH_COLORS.length]));
    } else {
      roots.forEach((root, idx) => positionNodes(root, 0, (2 * Math.PI * idx) / roots.length, (2 * Math.PI * (idx + 1)) / roots.length, BRANCH_COLORS[idx % BRANCH_COLORS.length]));
    }

    const conns: { x1: number; y1: number; x2: number; y2: number; color: string; level: number }[] = [];
    const collectConnections = (node: PositionedNode) => {
      node.children.forEach((child) => { conns.push({ x1: node.x, y1: node.y, x2: child.x, y2: child.y, color: child.color || BRANCH_COLORS[0], level: child.level }); collectConnections(child); });
    };
    roots.forEach(collectConnections);

    const padding = 60;
    const offsetX = -minX + padding, offsetY = -minY + padding;
    nodeMap.forEach(n => { n.x += offsetX; n.y += offsetY; });
    conns.forEach(c => { c.x1 += offsetX; c.y1 += offsetY; c.x2 += offsetX; c.y2 += offsetY; });

    return { positionedNodes: Array.from(nodeMap.values()), connections: conns, width: Math.max(maxX - minX + padding * 2, 600), height: Math.max(maxY - minY + padding * 2, 400) };
  }, [nodes]);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    canvas.width = width * 2; canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); const link = document.createElement("a"); link.download = `mindmap-${title.replace(/\s+/g, "-").toLowerCase()}.jpg`; link.href = canvas.toDataURL("image/jpeg", 0.95); link.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [title, width, height]);

  const getCurvedPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} Q ${midX + (-dy / dist) * dist * 0.05} ${midY + (dx / dist) * dist * 0.05} ${x2} ${y2}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download JPG
        </Button>
      </div>
      <div className="overflow-auto p-4">
        <svg ref={svgRef} width={width} height={height} style={{ minHeight: 300, background: "#ffffff" }}>
          {connections.map((conn, idx) => (
            <path key={idx} d={getCurvedPath(conn.x1, conn.y1, conn.x2, conn.y2)} fill="none" stroke={conn.color} strokeWidth={conn.level === 1 ? 4 : 2} strokeLinecap="round" opacity={0.7} />
          ))}
          {positionedNodes.map((node) => {
            const w = node.level === 0 ? Math.max(120, node.label.length * 9) : Math.max(80, Math.min(140, node.label.length * 7));
            const h = node.level === 0 ? 50 : 36;
            const isCenter = node.level === 0 && positionedNodes.filter(n => n.level === 0).length === 1;
            return (
              <g key={node.id}>
                <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={h / 2} fill={isCenter ? "#16a34a" : node.color} />
                <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontWeight={isCenter ? 700 : 500} fontSize={isCenter ? 14 : 11}>
                  {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
