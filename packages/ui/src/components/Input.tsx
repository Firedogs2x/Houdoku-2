import * as React from 'react';

import { cn } from '@houdoku/ui/util';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@houdoku/ui/components/ContextMenu';
import {
  createInputContextMenuOperations,
} from '@houdoku/ui/hooks/use-input-context-menu';
import { Clipboard, Copy, Scissors, Trash2, Type } from 'lucide-react';

type InputProps = React.ComponentProps<'input'> & {
  showContextMenu?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showContextMenu = true, ...props }, ref) => {
    const [targetElement, setTargetElement] = React.useState<HTMLInputElement | null>(null);

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

    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        onContextMenu={handleContextMenu}
        {...props}
      />
    );

    if (!showContextMenu) {
      return inputElement;
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{inputElement}</ContextMenuTrigger>
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
Input.displayName = 'Input';

export { Input };
