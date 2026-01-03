declare module '@tiyo/common' {
  // Add optional dateAdded field to Chapter via declaration merging
  interface Chapter {
    /** ISO 8601 date string when the chapter was added to the library */
    dateAdded?: string;
  }
}
