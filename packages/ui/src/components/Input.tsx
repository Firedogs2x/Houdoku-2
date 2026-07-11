import * as React from 'react';

import { cn } from '@houdoku/ui/util';
import { EditableContextMenu } from '@houdoku/ui/components/EditableContextMenu';

type InputProps = React.ComponentProps<'input'> & {
  showContextMenu?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showContextMenu = true, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    return (
      <EditableContextMenu disabled={props.disabled} showContextMenu={showContextMenu}>
        {inputElement}
      </EditableContextMenu>
    );
  },
);
Input.displayName = 'Input';

export { Input };
