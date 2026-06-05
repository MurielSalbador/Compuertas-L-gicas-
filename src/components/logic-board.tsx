import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { LogicNode, type NodeType } from './logic-gate-nodes';
import { Trash2, Play, Info } from 'lucide-react';

interface NodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  value: boolean; // Computed or manual value
  label?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const getPinCoords = (node: NodeData, isOutput: boolean, pinIndex: number = 0) => {
  let width = 64;
  if (node.type === 'not') width = 56;
  if (node.type === 'input' || node.type === 'output') width = 40;

  let x = isOutput ? node.x + width + 4 : node.x - 4;
  let y = node.y + (node.type === 'input' || node.type === 'output' ? 20 : 24);

  if (!isOutput && (node.type === 'and' || node.type === 'or')) {
    if (pinIndex === 0) {
      y = node.y + 14;
    } else {
      y = node.y + 34;
    }
  }
  return { x, y };
};

export function LogicBoard() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [drawingConnection, setDrawingConnection] = useState<{
    from: string;
    fromPinType: 'input' | 'output';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    initialClientX: number;
    initialClientY: number;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Evaluate the entire circuit continuously with synchronous propagation
  useEffect(() => {
    let currentNodes = [...nodes];
    let anyUpdated = false;

    for (let depth = 0; depth < 10; depth++) {
      let stepUpdated = false;
      
      const getNodeValue = (id: string) => {
        return currentNodes.find(n => n.id === id)?.value ?? false;
      };

      currentNodes = currentNodes.map(node => {
        if (node.type === 'input') return node;

        const incoming = connections
          .filter(c => c.to === node.id)
          .map(c => getNodeValue(c.from));

        let newValue = false;
        switch (node.type) {
          case 'and':
            // An AND gate needs at least 2 connected inputs and all connected inputs must be true
            newValue = incoming.length >= 2 && incoming.every(v => v === true);
            break;
          case 'or':
            // An OR gate is true if at least one input is true
            newValue = incoming.some(v => v === true);
            break;
          case 'not':
            // A NOT gate negates its input (defaulting to false if disconnected, so NOT(false) = true)
            newValue = incoming.length > 0 ? !incoming[0] : true;
            break;
          case 'output':
            newValue = incoming.length > 0 ? incoming.some(v => v === true) : false;
            break;
        }

        if (node.value !== newValue) {
          stepUpdated = true;
          anyUpdated = true;
          return { ...node, value: newValue };
        }
        return node;
      });

      if (!stepUpdated) break;
    }

    if (anyUpdated) {
      setNodes(currentNodes);
    }
  }, [connections, nodes]);

  const addNode = (type: NodeType) => {
    setNodes(prev => [
      ...prev,
      {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        x: 100 + prev.length * 20,
        y: 100 + prev.length * 20,
        value: false,
        label: ''
      }
    ]);
  };

  const handleToggle = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id && n.type === 'input' ? { ...n, value: !n.value } : n));
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  const handleDelete = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    // Only drag with left click and when not editing a label
    if (e.button !== 0 || editingNodeId === nodeId) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNode({
      id: nodeId,
      offsetX: e.clientX - node.x,
      offsetY: e.clientY - node.y
    });
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const handlePinPointerDown = (
    e: React.PointerEvent,
    nodeId: string,
    isOutput: boolean,
    pinIndex: number = 0
  ) => {
    e.stopPropagation();

    if (drawingConnection) {
      // If we are already drawing and clicked a pin, try to connect them!
      const targetPinType = isOutput ? 'output' : 'input';
      if (nodeId !== drawingConnection.from && drawingConnection.fromPinType !== targetPinType) {
        const fromNodeId = drawingConnection.fromPinType === 'output' ? drawingConnection.from : nodeId;
        const toNodeId = drawingConnection.fromPinType === 'input' ? drawingConnection.from : nodeId;

        const toNode = nodes.find(n => n.id === toNodeId);
        if (toNode) {
          const incomingCount = connections.filter(c => c.to === toNodeId).length;
          let maxInputs = 0;
          if (toNode.type === 'and' || toNode.type === 'or') maxInputs = 2;
          if (toNode.type === 'not' || toNode.type === 'output') maxInputs = 1;

          if (incomingCount < maxInputs) {
            const exists = connections.some(c => c.from === fromNodeId && c.to === toNodeId);
            if (!exists) {
              setConnections(prev => [...prev, {
                id: `conn-${Date.now()}`,
                from: fromNodeId,
                to: toNodeId
              }]);
            }
          }
        }
      }
      setDrawingConnection(null);
      return;
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const coords = getPinCoords(node, isOutput, pinIndex);

    setDrawingConnection({
      from: nodeId,
      fromPinType: isOutput ? 'output' : 'input',
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      initialClientX: e.clientX,
      initialClientY: e.clientY
    });
  };

  const checkIsValidTarget = useCallback((nodeId: string, isPinOutput: boolean) => {
    if (!drawingConnection) return false;
    if (drawingConnection.from === nodeId) return false;
    
    const targetPinType = isPinOutput ? 'output' : 'input';
    if (drawingConnection.fromPinType === targetPinType) return false;

    if (!isPinOutput) {
      const targetNode = nodes.find(n => n.id === nodeId);
      if (!targetNode) return false;

      const incomingCount = connections.filter(c => c.to === nodeId).length;
      let maxInputs = 0;
      if (targetNode.type === 'and' || targetNode.type === 'or') maxInputs = 2;
      if (targetNode.type === 'not' || targetNode.type === 'output') maxInputs = 1;
      
      if (incomingCount >= maxInputs) return false;
    }

    return true;
  }, [drawingConnection, connections, nodes]);

  useEffect(() => {
    if (!drawingConnection && !draggingNode) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (drawingConnection && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setDrawingConnection(prev => prev ? {
          ...prev,
          currentX: e.clientX - rect.left,
          currentY: e.clientY - rect.top,
        } : null);
      }

      if (draggingNode) {
        const newX = e.clientX - draggingNode.offsetX;
        const newY = e.clientY - draggingNode.offsetY;
        setNodes(prev => prev.map(n => n.id === draggingNode.id ? { ...n, x: newX, y: newY } : n));
      }
    };

    const handlePointerUp = () => {
      if (draggingNode) {
        setDraggingNode(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [drawingConnection, draggingNode]);

  const clearBoard = () => {
    setNodes([]);
    setConnections([]);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-6 z-10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Play className="w-5 h-5 text-purple-500" />
            LogicBoard
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Interactive boolean algebra simulator.</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase text-zinc-500 tracking-wider">Add Elements</h3>
          <button onClick={() => addNode('input')} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-left border border-zinc-700 hover:border-green-500/50">
            <div className="w-4 h-4 bg-green-500 rounded-sm" /> Input (0/1)
          </button>
          <button onClick={() => addNode('and')} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-left border border-zinc-700 hover:border-blue-500/50">
            <div className="w-5 h-4 bg-blue-600 rounded-r-full rounded-l-sm" /> AND
          </button>
          <button onClick={() => addNode('or')} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-left border border-zinc-700 hover:border-purple-500/50">
            <div className="w-5 h-4 bg-purple-600" style={{ clipPath: 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%, 20% 50%)' }} /> OR
          </button>
          <button onClick={() => addNode('not')} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-left border border-zinc-700 hover:border-rose-500/50">
            <div className="w-4 h-4 bg-rose-600 rounded-full" /> NOT
          </button>
          <button onClick={() => addNode('output')} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-left border border-zinc-700 hover:border-yellow-400/50">
            <div className="w-4 h-4 bg-yellow-400 rounded-full" /> Output
          </button>
        </div>

        <div className="mt-auto">
          <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50 mb-4 text-xs text-zinc-400 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p>Arrastra desde un pin de un nodo a otro para conectarlos.</p>
            </div>
            <p>Haz clic en un cable para eliminarlo.</p>
            <p>Haz clic en la etiqueta superior para cambiar el texto.</p>
          </div>
          <button 
            onClick={clearBoard}
            className="w-full flex items-center justify-center gap-2 p-2 text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors border border-transparent hover:border-rose-900"
          >
            <Trash2 className="w-4 h-4" /> Clear Board
          </button>
        </div>
      </div>

      <div 
        ref={boardRef}
        className="flex-1 relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] cursor-crosshair"
        onPointerDown={() => {
          if (drawingConnection) {
            setDrawingConnection(null);
          }
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const fromCoords = getPinCoords(fromNode, true, 0);
            const incoming = connections.filter(c => c.to === toNode.id);
            const index = incoming.findIndex(c => c.id === conn.id);
            const toCoords = getPinCoords(toNode, false, index);

            const startX = fromCoords.x;
            const startY = fromCoords.y;
            const endX = toCoords.x;
            const endY = toCoords.y;

            const isOn = fromNode.value;

            return (
              <path
                key={conn.id}
                d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={isOn ? "#22c55e" : "#52525b"}
                strokeWidth="3"
                className="transition-all duration-200 cursor-pointer hover:stroke-rose-500 hover:stroke-[5px] pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConnection(conn.id);
                }}
              />
            );
          })}

          {drawingConnection && (
            <path
              d={(() => {
                const isFromOutput = drawingConnection.fromPinType === 'output';
                const controlOffset = isFromOutput ? 50 : -50;
                return `M ${drawingConnection.startX} ${drawingConnection.startY} ` +
                       `C ${drawingConnection.startX + controlOffset} ${drawingConnection.startY}, ` +
                       `${drawingConnection.currentX - controlOffset} ${drawingConnection.currentY}, ` +
                       `${drawingConnection.currentX} ${drawingConnection.currentY}`;
              })()}
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-10 shadow-xl select-none"
            style={{ left: node.x, top: node.y }}
            onPointerDown={(e) => handleNodePointerDown(e, node.id)}
          >
            <LogicNode
              id={node.id}
              type={node.type}
              value={node.value}
              label={node.label}
              onToggle={handleToggle}
              onPinClick={handlePinPointerDown}
              onDelete={handleDelete}
              onLabelChange={handleLabelChange}
              isValidTarget={checkIsValidTarget}
              onStartEdit={() => setEditingNodeId(node.id)}
              onEndEdit={() => setEditingNodeId(null)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
