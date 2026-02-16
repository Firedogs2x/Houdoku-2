import * as React from 'react';

export type InputContextMenuOperations = {
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
  delete: () => void;
};

const setNativeValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value);
  } else {
    valueSetter?.call(element, value);
  }
};

const triggerReactChange = (element: HTMLInputElement | HTMLTextAreaElement) => {
  const event = new Event('input', { bubbles: true });
  element.dispatchEvent(event);
};

export const createInputContextMenuOperations = (
  element: HTMLInputElement | HTMLTextAreaElement | null,
  disabled?: boolean,
): InputContextMenuOperations => {
  return {
    cut: () => {
      if (element && !disabled) {
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const selectedText = element.value.substring(start, end);
        if (selectedText) {
          navigator.clipboard.writeText(selectedText).then(() => {
            const newValue = element.value.substring(0, start) + element.value.substring(end);
            setNativeValue(element, newValue);
            triggerReactChange(element);
            element.setSelectionRange(start, start);
          });
        }
      }
    },
    copy: () => {
      if (element) {
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const selectedText = element.value.substring(start, end);
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
          setNativeValue(element, newValue);
          triggerReactChange(element);
          const newCursorPos = start + text.length;
          element.setSelectionRange(newCursorPos, newCursorPos);
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
        if (start !== end) {
          const newValue = element.value.substring(0, start) + element.value.substring(end);
          setNativeValue(element, newValue);
          triggerReactChange(element);
          element.setSelectionRange(start, start);
        }
      }
    },
  };
};
