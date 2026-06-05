import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

export type NodeType = 'input' | 'output' | 'and' | 'or' | 'not';

export interface LogicNodeProps {
  id: string;
  type: NodeType;
  value?: boolean;
  label?: string;
  x: number;
  y: number;
}

export function LogicNode({
  id,
  type,
  value = false,
  label = '',
  onToggle,
  onPinClick,
  onDelete,
  onLabelChange,
  isValidTarget,
  onStartEdit,
  onEndEdit
}: Omit<LogicNodeProps, 'x' | 'y'> & {
  onToggle?: (id: string) => void;
  onPinClick?: (e: React.PointerEvent, nodeId: string, isOutput: boolean, pinIndex?: number) => void;
  onDelete?: (id: string) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
  isValidTarget?: (nodeId: string, isPinOutput: boolean) => boolean;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
}) {
  
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  const startEditing = () => {
    setIsEditingLabel(true);
    onStartEdit?.();
  };

  const stopEditing = (val: string) => {
    setIsEditingLabel(false);
    onLabelChange?.(id, val);
    onEndEdit?.();
  };

  const renderGate = () => {
    switch (type) {
      case 'and':
        return (
          <div className="w-16 h-12 flex items-center justify-center">
            <svg width="64" height="48" viewBox="0 0 64 48" className="overflow-visible select-none pointer-events-none">
              <path
                d="M 12 4 L 12 44 H 32 C 45 44 54 35 54 24 C 54 13 45 4 32 4 Z"
                className={cn(
                  "fill-zinc-900/90 stroke-blue-500 stroke-2 transition-all duration-200",
                  value && "stroke-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                )}
              />
              <text x="26" y="28" className="fill-zinc-300 text-[10px] font-bold tracking-wider" textAnchor="middle">AND</text>
            </svg>
          </div>
        );
      case 'or':
        return (
          <div className="w-16 h-12 flex items-center justify-center">
            <svg width="64" height="48" viewBox="0 0 64 48" className="overflow-visible select-none pointer-events-none">
              <path
                d="M 10 4 C 18 16 18 32 10 44 C 28 44 46 36 58 24 C 46 12 28 4 10 4 Z"
                className={cn(
                  "fill-zinc-900/90 stroke-purple-500 stroke-2 transition-all duration-200",
                  value && "stroke-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                )}
              />
              <text x="26" y="28" className="fill-zinc-300 text-[10px] font-bold tracking-wider" textAnchor="middle">OR</text>
            </svg>
          </div>
        );
      case 'not':
        return (
          <div className="w-14 h-12 flex items-center justify-center">
            <svg width="56" height="48" viewBox="0 0 56 48" className="overflow-visible select-none pointer-events-none">
              <path
                d="M 12 8 L 12 40 L 38 24 Z"
                className={cn(
                  "fill-zinc-900/90 stroke-rose-500 stroke-2 transition-all duration-200",
                  value && "stroke-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                )}
              />
              <circle
                cx="43"
                cy="24"
                r="5"
                className={cn(
                  "fill-zinc-900 stroke-rose-500 stroke-2 transition-all duration-200",
                  value && "stroke-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                )}
              />
              <text x="22" y="27" className="fill-zinc-300 text-[9px] font-bold" textAnchor="middle">NOT</text>
            </svg>
          </div>
        );
      case 'input':
        return (
          <div 
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 cursor-pointer transition-all duration-200 select-none",
              value 
                ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            )}
            onPointerDown={(e) => { e.stopPropagation(); onToggle?.(id); }}
          >
            <span className="text-sm font-bold tracking-wider">{value ? '1' : '0'}</span>
          </div>
        );
      case 'output':
        return (
          <div 
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 transition-all duration-200 select-none",
              value 
                ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.5)] animate-pulse" 
                : "bg-zinc-900 border-zinc-700 text-zinc-500"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider">{value ? 'ON' : 'OFF'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const hasInputs = type !== 'input';
  const hasOutputs = type !== 'output';

  const getPinClass = (isPinOutput: boolean) => {
    const activeTarget = isValidTarget?.(id, isPinOutput);
    return cn(
      "w-4 h-4 rounded-full border-2 cursor-crosshair transition-all duration-200",
      activeTarget 
        ? "bg-green-400 border-green-500 scale-125 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.7)]" 
        : "bg-zinc-300 border-zinc-600 hover:bg-white hover:scale-125 hover:scale-110"
    );
  };

  return (
    <div className="relative group select-none flex flex-col items-center">
      {/* Delete Button */}
      <button 
        onPointerDown={(e) => { e.stopPropagation(); onDelete?.(id); }}
        className="absolute -top-6 -right-6 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Editable Label Above Node */}
      <div className="absolute -top-6 w-full flex justify-center z-20">
        {isEditingLabel ? (
          <input 
            ref={inputRef}
            className="w-16 bg-zinc-800 text-white text-xs text-center border border-zinc-600 rounded outline-none select-text cursor-text"
            value={tempLabel}
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={() => {
              stopEditing(tempLabel);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                stopEditing(tempLabel);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="text-xs text-zinc-400 font-mono cursor-text min-h-[16px] px-1 hover:bg-zinc-800 rounded bg-zinc-900/50 whitespace-nowrap"
            onPointerDown={(e) => { 
              e.stopPropagation(); 
              startEditing(); 
            }}
          >
            {label || (type === 'input' ? 'x' : type === 'output' ? 'Out' : '+ text')}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Input Pins */}
        {hasInputs && (
          <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-center gap-3">
            {type === 'not' || type === 'output' ? (
              <div 
                data-pin="true"
                data-node-id={id}
                data-pin-type="input"
                data-pin-index={0}
                className={getPinClass(false)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPinClick?.(e, id, false, 0);
                }}
              />
            ) : (
              <>
                <div 
                  data-pin="true"
                  data-node-id={id}
                  data-pin-type="input"
                  data-pin-index={0}
                  className={getPinClass(false)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onPinClick?.(e, id, false, 0);
                  }}
                />
                <div 
                  data-pin="true"
                  data-node-id={id}
                  data-pin-type="input"
                  data-pin-index={1}
                  className={getPinClass(false)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onPinClick?.(e, id, false, 1);
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* Main Gate UI */}
        {renderGate()}

        {/* Output Pin */}
        {hasOutputs && (
          <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-center">
            <div 
              data-pin="true"
              data-node-id={id}
              data-pin-type="output"
              data-pin-index={0}
              className={getPinClass(true)}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPinClick?.(e, id, true, 0);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
