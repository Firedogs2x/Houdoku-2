import { Copy, Type } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
};

type MenuPosition = {
  x: number;
  y: number;
};

/**
 * GlobalContextMenu
 *
 * Handles right-click events across the entire renderer that are NOT already
 * handled by an existing Radix-UI–based context menu (EditableContextMenu,
 * LibraryGridContextMenu, ChapterTableContextMenu, SearchGridContextMenu, etc.).
 *
 * When an unhandled right-click occurs:
 *  1. Prevents the Chromium default context menu from appearing.
 *  2. Shows a floating menu (pure black background, white text) with relevant
 *     options such as "Copy" (when text is selected) and "Select All".
 *
 * The menu is dismissed on click-away, Escape, or after selecting an item.
 * Works identically on Windows, macOS, and Linux.
 */
export const GlobalContextMenu: React.FC = () => {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setPosition(null);
    setItems([]);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // If a Radix UI context menu (or any other handler) already processed
      // this event, do not interfere.
      if (e.defaultPrevented) {
        return;
      }

      // Let right-clicks inside Radix-UI–wrapped elements pass through.
      // Radix UI's ContextMenuTrigger calls preventDefault on its own events,
      // so by the time we see the event, defaultPrevented will be true if the
      // click was inside a Radix context menu trigger.
      // For all other cases we prevent the Chromium native menu.
      e.preventDefault();

      const selectedText = window.getSelection()?.toString().trim() ?? '';

      const menuItems: MenuItem[] = [];

      if (selectedText.length > 0) {
        menuItems.push({
          label: 'Copy',
          icon: <Copy className="h-4 w-4 mr-2" />,
          action: () => {
            navigator.clipboard.writeText(selectedText).catch(console.error);
            dismiss();
          },
        });
      }

      menuItems.push({
        label: 'Select All',
        icon: <Type className="h-4 w-4 mr-2" />,
        action: () => {
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            range.selectNodeContents(document.body);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          dismiss();
        },
      });

      setItems(menuItems);
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (position && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dismiss();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && position) {
        dismiss();
      }
    };

    const handleScroll = () => {
      if (position) {
        dismiss();
      }
    };

    // Use capture phase to ensure we see the event before it reaches
    // elements that might prevent default on their own.
    document.addEventListener('contextmenu', handleContextMenu, false);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, false);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [position, dismiss]);

  if (!position || items.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className="fixed z-[100] min-w-[8rem] overflow-hidden rounded-md border border-zinc-800 bg-black p-1 text-white shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          role="menuitem"
          disabled={item.disabled}
          className="relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-white hover:bg-zinc-800 hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => item.action()}
          onMouseEnter={() => {}}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};
