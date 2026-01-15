## Houdoku is a free and open source manga reader for the desktop.

## Home Page
![Home Page 2026-01-14](https://github.com/user-attachments/assets/d8bed88a-8693-4e6c-8f09-ceabe2c1dbc5)

## Series Card Layout
![Series Card Mod 2026-01-14](https://github.com/user-attachments/assets/4c256cbb-acd2-4453-96b1-b29cd64ebfd2)

The card has been updated to show both the number unread chapters and the total number of chapters (See Note 1).
Card also now has an indicator, located under the total number of chapters, this indicator has two funtions:
  1) No chapters in the series have been read.
  2) A new chapter has been added since the last time you read a chapter in that series.
At the very bottom this is the date of the last time you read a chapter in the series.


## Houdoku Features

- The ability to semi-auto load series. (Please read the information located on the Settings / Folder tab).
- Read manga from popular websites or import ones from your filesystem,
  all in one place.
- Download chapters for offline reading (Don't know if works).
- Customizable reader interface with multiple layouts and settings.
- Tagging and filtering support to easily browse and manage large libraries.
- Cross-platform!

## Download

Download Houdoku from [GitHub releases page](https://github.com/Firedogs2x/houdoku/releases).

## Documentation

User guides and documentation are available on: (Covers up to V1.16.0)
[houdoku.org](https://houdoku.org).


## Stack

**Application**: This is an Electron application. The majority of the functionality is performed in the renderer thread. Exceptions are for cases like accessing the window class (i.e. to support minimizing the window), locating application directories, and for working with extensions. The renderer can invoke these functions through ipc.

**UI**: The interface uses React components. Most base components (text, buttons, links, etc.) use [Radix primitives](https://www.radix-ui.com/primitives) and were designed by [shadcn](https://ui.shadcn.com).

**State**: [Recoil](https://recoiljs.org) is used for state management. Hooks are used for small
non-shared behavior.

**Storage**: Library data and settings are saved with `localStorage`. Thumbnails are stored in
the user-data path.

**Plugins/Extensions**: See the [Tiyo](https://github.com/xgi/tiyo) repo. Dynamic loading is handled by [aki-plugin-manager](https://github.com/xgi/aki-plugin-manager).

## Content Sources

Houdoku allows users to import manga from their filesystem (e.g. as zip files
or folders of images). To read manga from 3rd-party "content sources", the
Tiyo plugin can be installed from the Plugins tab in the client.

To learn about Tiyo or request a new content source, please go to https://github.com/xgi/tiyo

## License

[MIT License](https://github.com/Firedogs2x/houdoku/blob/master/LICENSE.txt)
