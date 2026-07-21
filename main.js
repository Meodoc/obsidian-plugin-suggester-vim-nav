'use strict';

/*
 * Suggester Vim Nav
 * -----------------
 * Vim-style up/down navigation inside Obsidian's suggesters:
 *   - modal suggesters: command palette, quick switcher, etc.
 *   - inline editor popups: [[ links, #tags, and other EditorSuggest popups.
 *
 * Default keys: Alt+J = down, Alt+K = up.
 *
 * To use Ctrl instead of Alt, change MODIFIER below to "ctrl".
 * (If you KEEP your Ctrl+J / Ctrl+K "insert link" hotkeys, leave this on "alt"
 *  so the two don't collide.)
 */

const MODIFIER = "ctrl";   // "alt" or "ctrl"
const DOWN_KEY = "KeyJ";  // e.code for "move down"
const UP_KEY   = "KeyK";  // e.code for "move up"

const obsidian = require('obsidian');

module.exports = class SuggesterVimNav extends obsidian.Plugin {
  onload() {
    this._handler = (e) => this._onKeydown(e);
    // Capture phase (3rd arg = true) so this runs BEFORE Obsidian's hotkey
    // manager and the editor's CodeMirror keymap get the keystroke.
    document.addEventListener("keydown", this._handler, true);
    console.log("[suggester-vim-nav] loaded:", MODIFIER, "+ J / K");
  }

  onunload() {
    document.removeEventListener("keydown", this._handler, true);
  }

  _modOK(e) {
    // Require the chosen modifier and forbid the others, so the combo stays distinct.
    if (MODIFIER === "alt")  return e.altKey  && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    if (MODIFIER === "ctrl") return e.ctrlKey && !e.altKey  && !e.metaKey && !e.shiftKey;
    return false;
  }

  // Is a suggester currently on screen?
  //   Modal palette / switcher -> a focused ".prompt-input".
  //   Inline editor popup      -> a visible ".suggestion-container".
  _suggesterActive() {
    const el = document.activeElement;
    if (el && el.classList && el.classList.contains("prompt-input")) return true;
    const popup = document.querySelector(".suggestion-container");
    return !!(popup && popup.offsetParent !== null);
  }

  _fireArrow(key) {
    const isDown = key === "ArrowDown";
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key,
      code: key,
      keyCode: isDown ? 40 : 38,
      which:   isDown ? 40 : 38,
      bubbles: true,
      cancelable: true,
    }));
  }

  _onKeydown(e) {
    if (!this._modOK(e)) return;
    if (e.code !== DOWN_KEY && e.code !== UP_KEY) return;
    if (!this._suggesterActive()) return;   // don't hijack the keys while plain editing
    e.preventDefault();
    e.stopPropagation();
    this._fireArrow(e.code === DOWN_KEY ? "ArrowDown" : "ArrowUp");
  }
};
