import * as React from 'react';

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

type EditableContextMenuProps = {
  children: React.ReactElement;
  disabled?: boolean;
  showContextMenu?: boolean;
};

/**
 * Single consolidated component that wraps any text input/textarea
 * with the standard right-click context menu (Cut/Copy/Paste/Select All/Delete).
 * Identical look-and-feel across all editable fields in the app.
 */
export const EditableContextMenu: React.FC<EditableContextMenuProps> = ({
  children,
  disabled = false,
  showContextMenu = true,
}) => {
  const [targetElement, setTargetElement] = React.useState<
    HTMLInputElement | HTMLTextAreaElement | null
  >(null);

  const operations = React.useMemo(
    () => createInputContextMenuOperations(targetElement, disabled),
    [targetElement, disabled],
  );

  if (!showContextMenu) {
    return children;
  }

  const child = React.cloneElement(children, {
    onContextMenu: (e: React.MouseEvent) => {
      if (children.props.onContextMenu) {
        children.props.onContextMenu(e);
      }
      if (!disabled) {
        setTargetElement(
          e.currentTarget as HTMLInputElement | HTMLTextAreaElement,
        );
      }
    },
  } as React.HTMLAttributes<HTMLElement>);

  const hasValue = targetElement ? targetElement.value.length > 0 : false;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{child}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem
          onClick={operations.cut}
          disabled={disabled || !targetElement || !hasValue}
        >
          <Scissors className="h-4 w-4 mr-2" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem
          onClick={operations.copy}
          disabled={!targetElement || !hasValue}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem
          onClick={operations.paste}
          disabled={disabled || !targetElement}
        >
          <Clipboard className="h-4 w-4 mr-2" />
          Paste
        </ContextMenuItem>
        <ContextMenuItem
          onClick={operations.selectAll}
          disabled={!targetElement || !hasValue}
        >
          <Type className="h-4 w-4 mr-2" />
          Select All
        </ContextMenuItem>
        <ContextMenuItem
          onClick={operations.delete}
          disabled={disabled || !targetElement || !hasValue}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
