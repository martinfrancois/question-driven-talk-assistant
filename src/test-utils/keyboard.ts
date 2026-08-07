/**
 * Test-only helpers for driving real keyboard events.
 *
 * `react-hotkeys-hook` listens for `keydown`/`keyup` on `document` and matches
 * on `KeyboardEvent.code` (falling back to `.key`), so these helpers dispatch
 * genuine `KeyboardEvent`s carrying both. Nothing about the hotkey library is
 * stubbed: a regression in its matching, its modifier handling or its
 * "fire once per physical press" guard shows up as a failing test.
 *
 * The trailing `keyup` matters — the library latches a hotkey after `keydown`
 * and only re-arms it on `keyup`.
 */
export interface KeyPress {
  /** `KeyboardEvent.key`, e.g. `"t"`, `"Enter"`, `"ArrowUp"`. */
  key: string;
  /** `KeyboardEvent.code`, e.g. `"KeyT"`, `"Enter"`, `"ArrowUp"`. */
  code: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  /** Defaults to `document`, which is where `useHotkeys` binds. */
  target?: EventTarget;
}

const toEventInit = (press: KeyPress): KeyboardEventInit => ({
  key: press.key,
  code: press.code,
  ctrlKey: press.ctrl ?? false,
  shiftKey: press.shift ?? false,
  altKey: press.alt ?? false,
  metaKey: press.meta ?? false,
  bubbles: true,
  cancelable: true,
});

/** Dispatches a full keydown + keyup cycle. */
export function pressKey(press: KeyPress): void {
  const target = press.target ?? document;
  const init = toEventInit(press);
  target.dispatchEvent(new KeyboardEvent("keydown", init));
  target.dispatchEvent(new KeyboardEvent("keyup", init));
}

/**
 * Dispatches only the keydown half, for assertions about `preventDefault`
 * or about handlers that inspect the event itself.
 */
export function keyDown(press: KeyPress): KeyboardEvent {
  const target = press.target ?? document;
  const event = new KeyboardEvent("keydown", toEventInit(press));
  target.dispatchEvent(event);
  return event;
}

/** Releases a key previously sent with {@link keyDown}. */
export function keyUp(press: KeyPress): void {
  const target = press.target ?? document;
  target.dispatchEvent(new KeyboardEvent("keyup", toEventInit(press)));
}
