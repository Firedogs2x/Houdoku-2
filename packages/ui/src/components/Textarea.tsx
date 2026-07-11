import * as React from 'react';

import { cn } from '@houdoku/ui/util';
import { EditableContextMenu } from '@houdoku/ui/components/EditableContextMenu';

type TextareaProps = React.ComponentProps<'textarea'> & {
  showContextMenu?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showContextMenu = true, ...props }, ref) => {
    const textareaElement = (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    return (
      <EditableContextMenu disabled={props.disabled} showContextMenu={showContextMenu}>
        {textareaElement}
      </EditableContextMenu>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
