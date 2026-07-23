# Design Specification: Class Schedule Grid Drag-to-Resize

## Overview
This specification details the design for adding interactive vertical drag-to-resize functionality to course cards within the Admin Class Schedule Grid (`ClassScheduleGrid.tsx`). This allows administrators to adjust course duration directly from the grid interface.

---

## 1. Requirements & Intent
* **Goal**: Enable top and bottom edge dragging on scheduled course cards to extend or shorten start and end times.
* **Constraints**:
  * Grid snapping to 1-hour time slots (`TIME_SLOTS`).
  * Minimum duration of 1 time slot (1 hour).
  * Strict boundary enforcement (cannot resize earlier than `08:00` or later than `17:00`).
  * Zero collision/overlapping with adjacent class blocks on the same day.
  * Native React Pointer Events implementation without external heavy libraries.

---

## 2. Architecture & State Management

### Resizing State Definition
```typescript
interface ResizingState {
  day: string;
  handle: "top" | "bottom";
  originalBlockKeys: string[];
  currentStartIdx: number;
  currentEndIdx: number;
  cellData: ClassCell;
}
```

### Flow of Pointer Events
1. **Handle Trigger (`onPointerDown`)**:
   * Attached to `.resize-handle-top` and `.resize-handle-bottom` elements on the card.
   * Calls `e.currentTarget.setPointerCapture(e.pointerId)`.
   * Initializes `resizingState` with target `day`, initial start/end slot indices, handle orientation, and cell payload.

2. **Tracking Drag (`onPointerMove`)**:
   * Active only when `resizingState` is non-null.
   * Maps current pointer Y position (`e.clientY`) to grid row element index (`0..TIME_SLOTS.length - 1`).
   * Updates candidate `currentStartIdx` or `currentEndIdx`.
   * **Collision Validation**:
     * Iterate from start to end index candidate.
     * Ensure no slot in range is occupied by a *different* course code on the same day.
     * If collision occurs, clamp candidate index to immediately adjacent free slot.

3. **Commit State (`onPointerUp`)**:
   * Releases pointer capture.
   * Removes `originalBlockKeys` from `cells` Map.
   * Inserts `cellData` across new candidate slot keys.
   * Resets `resizingState` to `null`.

---

## 3. User Interface & Micro-Interactions
* **Resize Handles**:
  * Top handle: `absolute top-0 inset-x-0 h-2.5 cursor-ns-resize hover:bg-blue-500/50 rounded-t-xl z-20`
  * Bottom handle: `absolute bottom-0 inset-x-0 h-2.5 cursor-ns-resize hover:bg-blue-500/50 rounded-b-xl z-20`
* **Real-time Visual Feedback**:
  * Live update of duration badge text (e.g. `09:00 - 12:00` → `09:00 - 13:00`) during pointer drag.
  * Active highlight ring on resizing card.
