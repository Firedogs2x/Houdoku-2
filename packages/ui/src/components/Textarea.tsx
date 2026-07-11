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

type TextareaProps = React.ComponentProps<'textarea'> & {
  showContextMenu?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showContextMenu = true, ...props }, ref) => {
    const [targetElement, setTargetElement] = React.useState<HTMLTextAreaElement | null>(null);

    const handleContextMenu = React.useCallback(
      (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!showContextMenu || props.disabled) return;
        setTargetElement(e.currentTarget);
      },
      [showContextMenu, props.disabled],
    );

    const operations = React.useMemo(
      () => createInputContextMenuOperations(targetElement, props.disabled),
      [targetElement, props.disabled],
    );

    const textareaElement = (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        onContextMenu={handleContextMenu}
        {...props}
      />
    );

    if (!showContextMenu) {
      return textareaElement;
    }

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{textareaElement}</ContextMenuTrigger>
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
Textarea.displayName = 'Textarea';

export { Textarea };
