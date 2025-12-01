import React from 'react';
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentIndicatorsProps {
  hasReceipt: boolean;
  hasPumpMeter: boolean;
  onViewReceipt?: () => void;
  onViewPumpMeter?: () => void;
}

export const DocumentIndicators: React.FC<DocumentIndicatorsProps> = ({
  hasReceipt,
  hasPumpMeter,
  onViewReceipt,
  onViewPumpMeter,
}) => {
  if (!hasReceipt && !hasPumpMeter) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  return (
    <div className="flex gap-2 items-center">
      <TooltipProvider>
        {hasReceipt && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-100"
                onClick={onViewReceipt}
              >
                <FileText className="h-4 w-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Receipt</TooltipContent>
          </Tooltip>
        )}

        {hasPumpMeter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-blue-100"
                onClick={onViewPumpMeter}
              >
                <ImageIcon className="h-4 w-4 text-blue-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Pump Photo</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};
