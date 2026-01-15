## Houdoku is a free and open source manga reader for the desktop.

Download Houdoku from [GitHub releases page](https://github.com/Firedogs2x/houdoku/releases).

## Home Page
![Home Page 2026-01-14](https://github.com/user-attachments/assets/6d91d0e0-b54e-4399-8469-e47b8064597c)

## Series Card
![Series Card Mod 2026-01-14](https://github.com/user-attachments/assets/adb03bb9-8fbc-42ba-afe4-64739c660146)

The Series card has some new features.
In the upper right corner the number of unread chapters and the total numbers are shown (unread chapters only was visible in older version) (See note below).
Indicator positioned just below the total number of chapters has two functions.
  1) Shows that no chapters have been read in that series.
  2) Shows new chapters have been added after the last time a chapter was read in that series.
Below the title is the date showing the last time a chapter in that series was read.
NOTE: The total number of chapters may show up wrong. This is because some websites allow multiple chapters with the same number to be upload to website.
(Example: Currently the program sees Vol. 1 Ch. 1 the same as Ch 1).


## Features
- Semi-automated Series loader. Button located on Add Series page. Must have Settings / Folder tab filled out for option to work.
- Read manga from popular websites or import ones from your filesystem,
  all in one place.
- Download chapters for offline reading.
- Customizable reader interface with multiple layouts and settings.
- Tagging and filtering support to easily browse and manage large libraries.
- Cross-platform!

## Documentation

User guides and documentation are available on
[houdoku.org](https://houdoku.org).

## Development

Install dependencies:

```
pnpm i
```

Start the app in the dev environment:

```
pnpm dev
```

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
