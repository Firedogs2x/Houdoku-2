import * as React from 'react';

export type InputContextMenuOperations = {
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
  delete: () => void;
};

export const createInputContextMenuOperations = (
  element: HTMLInputElement | HTMLTextAreaElement | null,
  disabled?: boolean,
): InputContextMenuOperations => {
  return {
    cut: () => {
      if (element && !disabled) {
        const selectedText = element.value.substring(
          element.selectionStart || 0,
          element.selectionEnd || 0,
        );
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          const start = element.selectionStart || 0;
          const end = element.selectionEnd || 0;
          const newValue = element.value.substring(0, start) + element.value.substring(end);
          element.value = newValue;
          const event = new Event('input', { bubbles: true });
          element.dispatchEvent(event);
        }
      }
    },
    copy: () => {
      if (element) {
        const selectedText = element.value.substring(
          element.selectionStart || 0,
          element.selectionEnd || 0,
        );
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
        } else {
          navigator.clipboard.writeText(element.value);
        }
      }
    },
    paste: () => {
      if (element && !disabled) {
        navigator.clipboard.readText().then((text) => {
          const start = element.selectionStart || 0;
          const end = element.selectionEnd || 0;
          const newValue = element.value.substring(0, start) + text + element.value.substring(end);
          element.value = newValue;
          const event = new Event('input', { bubbles: true });
          element.dispatchEvent(event);
        });
      }
    },
    selectAll: () => {
      if (element) {
        element.select();
      }
    },
    delete: () => {
      if (element && !disabled) {
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const newValue = element.value.substring(0, start) + element.value.substring(end);
        element.value = newValue;
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
      }
    },
  };
};
