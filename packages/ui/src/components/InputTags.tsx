

import * as React from 'react';
import { Badge } from '@houdoku/ui/components/Badge';
import { Button } from '@houdoku/ui/components/Button';
import { Clipboard, Copy, Scissors, Trash2, Type, XIcon } from 'lucide-react';
import { cn } from '@houdoku/ui/util';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@houdoku/ui/components/ContextMenu';
import { createInputContextMenuOperations } from '@houdoku/ui/hooks/use-input-context-menu';

type InputTagsProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string[];
  onChange: (value: ReadonlyArray<string>) => void;
  showContextMenu?: boolean;
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, showContextMenu = true, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState('');
    const [targetElement, setTargetElement] = React.useState<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (pendingDataPoint.includes(',')) {
        const newDataPoints = new Set([
          ...value,
          ...pendingDataPoint.split(',').map((chunk) => chunk.trim()),
        ]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    }, [pendingDataPoint, onChange, value]);

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    };

    const handleContextMenu = React.useCallback(
      (e: React.MouseEvent<HTMLInputElement>) => {
        if (!showContextMenu || props.disabled) return;
        setTargetElement(e.currentTarget);
      },
      [showContextMenu, props.disabled],
    );

    const operations = React.useMemo(
      () => createInputContextMenuOperations(targetElement, props.disabled),
      [targetElement, props.disabled],
    );

    const inputContent = (
      <div
        className={cn(
          'flex flex-wrap min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 gap-2 shadow-sm transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
      >
        {value.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className={cn(props.disabled && 'cursor-not-allowed')}
          >
            {item}
            <Button
              variant="ghost"
              size="icon"
              className={cn('ml-2 h-3 w-3', props.disabled && 'hidden')}
              onClick={() => {
                onChange(value.filter((i) => i !== item));
              }}
            >
              <XIcon className="w-3" />
            </Button>
          </Badge>
        ))}
        <input
          className="flex-1 outline-none placeholder:text-muted-foreground bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addPendingDataPoint();
            } else if (e.key === 'Backspace' && pendingDataPoint.length === 0 && value.length > 0) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          onContextMenu={handleContextMenu}
          {...props}
          ref={ref}
        />
      </div>
    );

    if (!showContextMenu) {
      return inputContent;
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{inputContent}</ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem
            onClick={operations.cut}
            disabled={props.disabled || !targetElement || targetElement.value.length === 0}
          >
            <Scissors className="h-4 w-4 mr-2" />
            Cut
          </ContextMenuItem>
          <ContextMenuItem
            onClick={operations.copy}
            disabled={!targetElement || targetElement.value.length === 0}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem onClick={operations.paste} disabled={props.disabled || !targetElement}>
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
          </ContextMenuItem>
          <ContextMenuItem
            onClick={operations.selectAll}
            disabled={!targetElement || targetElement.value.length === 0}
          >
            <Type className="h-4 w-4 mr-2" />
            Select All
          </ContextMenuItem>
          <ContextMenuItem
            onClick={operations.delete}
            disabled={props.disabled || !targetElement || targetElement.value.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

InputTags.displayName = 'InputTags';

export { InputTags };
