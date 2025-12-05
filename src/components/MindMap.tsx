import { useMemo, useRef, useCallback, useState } from "react";
import { Download, Maximize2, X, Image, FileImage, FileText, Presentation } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";

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
  const fullscreenSvgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const getCanvasFromSvg = useCallback(async (format: 'jpg' | 'png' | 'pdf' | 'pptx'): Promise<HTMLCanvasElement | null> => {
    const targetSvg = isFullscreen ? fullscreenSvgRef.current : svgRef.current;
    if (!targetSvg) return null;
    
    const svgData = new XMLSerializer().serializeToString(targetSvg);
    const canvas = document.createElement("canvas");
    canvas.width = width * 2; 
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    if (format === 'jpg' || format === 'pdf' || format === 'pptx') {
      ctx.fillStyle = "#1a1a2e"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => { 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
        resolve(canvas);
      };
      img.onerror = () => resolve(null);
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  }, [width, height, isFullscreen]);

  const handleDownload = useCallback(async (format: 'jpg' | 'png' | 'pdf' | 'pptx') => {
    const canvas = await getCanvasFromSvg(format);
    if (!canvas) return;
    
    const fileName = `mindmap-${title.replace(/\s+/g, "-").toLowerCase()}`;
    
    if (format === 'jpg' || format === 'png') {
      const link = document.createElement("a"); 
      link.download = `${fileName}.${format}`; 
      link.href = canvas.toDataURL(format === 'jpg' ? "image/jpeg" : "image/png", 0.95); 
      link.click();
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width * 2, height * 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, width * 2, height * 2);
      pdf.save(`${fileName}.pdf`);
    } else if (format === 'pptx') {
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pptx = new PptxGenJS();
      pptx.author = "Mind Map Generator";
      pptx.title = title;
      
      const slide = pptx.addSlide();
      slide.background = { color: "1a1a2e" };
      slide.addImage({
        data: imgData,
        x: 0.5,
        y: 0.5,
        w: 9,
        h: (9 * height) / width,
      });
      slide.addText(title, {
        x: 0.5,
        y: 0.2,
        fontSize: 18,
        color: "ffffff",
        bold: true
      });
      
      pptx.writeFile({ fileName: `${fileName}.pptx` });
    }
  }, [title, width, height, getCanvasFromSvg]);

  const getCurvedPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
    const curvature = 0.15;
    return `M ${x1} ${y1} Q ${midX + (-dy / dist) * dist * curvature} ${midY + (dx / dist) * dist * curvature} ${x2} ${y2}`;
  };

  const renderSvgContent = (ref: React.RefObject<SVGSVGElement>, bgColor: string) => (
    <svg ref={ref} width={width} height={height} style={{ minHeight: 300, background: bgColor }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      
      {connections.map((conn, idx) => (
        <path 
          key={idx} 
          d={getCurvedPath(conn.x1, conn.y1, conn.x2, conn.y2)} 
          fill="none" 
          stroke={conn.color} 
          strokeWidth={conn.level === 1 ? 3 : 2} 
          strokeLinecap="round" 
          opacity={0.8}
          filter="url(#glow)"
        />
      ))}
      
      {positionedNodes.map((node) => {
        const w = node.level === 0 ? Math.max(140, node.label.length * 10) : Math.max(90, Math.min(150, node.label.length * 8));
        const h = node.level === 0 ? 54 : 38;
        const isCenter = node.level === 0 && positionedNodes.filter(n => n.level === 0).length === 1;
        
        return (
          <g key={node.id}>
            <rect 
              x={node.x - w / 2 - 2} 
              y={node.y - h / 2 - 2} 
              width={w + 4} 
              height={h + 4} 
              rx={(h + 4) / 2} 
              fill={isCenter ? "rgba(99, 102, 241, 0.3)" : `${node.color}33`}
              filter="url(#glow)"
            />
            <rect 
              x={node.x - w / 2} 
              y={node.y - h / 2} 
              width={w} 
              height={h} 
              rx={h / 2} 
              fill={isCenter ? "url(#centerGradient)" : node.color}
              style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
            />
            <text 
              x={node.x} 
              y={node.y} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#ffffff" 
              fontWeight={isCenter ? 700 : 500} 
              fontSize={isCenter ? 15 : 12}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              {node.label.length > 22 ? node.label.slice(0, 20) + "..." : node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFullscreen(true)} 
              className="gap-2 bg-background/50 hover:bg-background/80 border-border/50"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-background/50 hover:bg-background/80 border-border/50">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('jpg')} className="gap-2 cursor-pointer">
                  <FileImage className="h-4 w-4" />
                  Download as JPG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('png')} className="gap-2 cursor-pointer">
                  <Image className="h-4 w-4" />
                  Download as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pdf')} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('pptx')} className="gap-2 cursor-pointer">
                  <Presentation className="h-4 w-4" />
                  Download as PPTX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="overflow-auto p-4">
          {renderSvgContent(svgRef, "#1a1a2e")}
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0f0f23]/95 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h3 className="font-bold text-lg text-foreground">{title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload('jpg')} className="gap-2 cursor-pointer">
                    <FileImage className="h-4 w-4" />
                    Download as JPG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('png')} className="gap-2 cursor-pointer">
                    <Image className="h-4 w-4" />
                    Download as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('pdf')} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('pptx')} className="gap-2 cursor-pointer">
                    <Presentation className="h-4 w-4" />
                    Download as PPTX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFullscreen(false)}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            {renderSvgContent(fullscreenSvgRef, "#0f0f23")}
          </div>
        </div>
      )}
    </>
  );
};