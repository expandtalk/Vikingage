import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1190] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer — z över de flytande kartikonerna (z-[1050–1110]) så de inte "läcker" ovanpå lådan (Daniel). */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background border-t transform transition-transform duration-300 ease-in-out z-[1200] lg:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 65px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};