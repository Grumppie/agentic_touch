import { EditorView } from '@codemirror/view'
export const customTheme = EditorView.theme({
  "&": {
    width: "100%",        // editor fills wrapper
    height: "100%",
    outline: "none",
  },

  ".cm-scroller": {
    overflowX: "auto",    // horizontal scroll INSIDE
    overflowY: "auto",
  },

  ".cm-content": {
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "14px",

    minWidth: "100%",     // 🔑 prevents fit-content growth
    whiteSpace: "pre",    // 🔑 disables line wrapping
  },
});
