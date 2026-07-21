import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Minimize2, Maximize2, Move, RotateCcw } from 'lucide-react';

interface DraggablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minimized?: boolean;
  visible?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  className?: string;
  resizable?: boolean;
  headerActions?: React.ReactNode;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  title,
  children,
  icon,
  initialPosition = { x: 20, y: 20 },
  initialSize = { width: 320, height: 500 },
  minimized = false,
  visible = true,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
  className = '',
  resizable = true,
  headerActions
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);
  
  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        
        // Begränsa till viewport
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - 100; // Lämna plats för header
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      }
      
      if (isResizing && panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        const newSize = {
          width: Math.max(280, e.clientX - rect.left),
          height: Math.max(200, e.clientY - rect.top)
        };
        
        setSize(newSize);
        onSizeChange?.(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size, onPositionChange, onSizeChange]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className={`absolute bg-slate-900 border border-slate-600/70 rounded-lg shadow-2xl ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: minimized ? 'auto' : size.width,
        height: minimized ? 'auto' : size.height,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-slate-600/50 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-white font-medium">
          {icon}
          <span className="text-sm">{title}</span>
          <Move className="h-3 w-3 text-slate-300" />
        </div>
        
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          {headerActions}
          {onMinimize && (
            <Button
              onClick={onMinimize}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-200 hover:text-white hover:bg-slate-700/50"
            >
              {minimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          )}
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-200 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div className="overflow-hidden">
          {children}
        </div>
      )}

      {/* Resize Handle */}
      {!minimized && resizable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-slate-600/50 hover:bg-slate-500/50 transition-colors"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-slate-400" />
        </div>
      )}
    </div>
  );
};