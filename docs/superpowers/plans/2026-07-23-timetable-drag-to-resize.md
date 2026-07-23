# Timetable Drag-to-Resize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add native top and bottom drag-to-resize handles to course cards in `ClassScheduleGrid.tsx` allowing users to dynamically extend or shorten course start/end time slots on the timetable grid with collision validation.

**Architecture:** Use React Pointer Events (`onPointerDown`, `setPointerCapture`, `onPointerMove`, `onPointerUp`) to track resizing handles on course card borders. Calculate target row index from pointer Y coordinates relative to table grid geometry, validate collision against occupied cells on the target day, and update the `cells` state Map on release.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, Phosphor Icons.

## Global Constraints
- Target File: `components/admin/ClassScheduleGrid.tsx`
- Grid snapping: 1-hour slots mapped to `TIME_SLOTS` array.
- Minimum duration: 1 slot (1 hour).
- Bounds: `08:00` (index 0) to `17:00` (index 8).

---

### Task 1: Add Resizing State and Handler Utilities to ClassScheduleGrid

**Files:**
- Modify: `components/admin/ClassScheduleGrid.tsx`

**Interfaces:**
- Produces: `ResizingState` interface and state tracking `resizingState`

- [ ] **Step 1: Define ResizingState interface and state**

Add `ResizingState` interface and `resizingState` state variable to `ClassScheduleGrid.tsx`:

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

- [ ] **Step 2: Add Pointer Event Handlers for Drag Resizing**

Implement `handleResizeStart`, `handleResizeMove`, and `handleResizeEnd` in `ClassScheduleGrid.tsx`:

```typescript
  const handleResizeStart = (
    e: React.PointerEvent,
    day: string,
    handle: "top" | "bottom",
    blockKeys: string[],
    cell: ClassCell
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const slotIndices = blockKeys
      .map((k) => TIME_SLOTS.findIndex((s) => k.endsWith(`_${s}`)))
      .filter((idx) => idx !== -1)
      .sort((a, b) => a - b);

    if (slotIndices.length === 0) return;

    setResizingState({
      day,
      handle,
      originalBlockKeys: blockKeys,
      currentStartIdx: slotIndices[0],
      currentEndIdx: slotIndices[slotIndices.length - 1],
      cellData: cell,
    });
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizingState) return;

    // Find table row index under cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const tdOrTr = element?.closest("td[data-slot], tr");
    const slotAttr = tdOrTr?.getAttribute("data-slot");
    
    if (!slotAttr) return;

    const targetIdx = TIME_SLOTS.indexOf(slotAttr);
    if (targetIdx === -1) return;

    const { handle, day, originalBlockKeys, currentStartIdx, currentEndIdx } = resizingState;

    let newStart = currentStartIdx;
    let newEnd = currentEndIdx;

    if (handle === "top") {
      newStart = Math.min(targetIdx, currentEndIdx);
    } else {
      newEnd = Math.max(targetIdx, currentStartIdx);
    }

    // Collision check against occupied cells on same day
    let hasCollision = false;
    for (let s = newStart; s <= newEnd; s++) {
      const key = `${day}_${TIME_SLOTS[s]}`;
      const existingCell = cells.get(key);
      if (existingCell && !originalBlockKeys.includes(key)) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      setResizingState({
        ...resizingState,
        currentStartIdx: newStart,
        currentEndIdx: newEnd,
      });
    }
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!resizingState) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const { day, originalBlockKeys, currentStartIdx, currentEndIdx, cellData } = resizingState;

    const updatedMap = new Map(cells);
    originalBlockKeys.forEach((k) => updatedMap.delete(k));

    for (let s = currentStartIdx; s <= currentEndIdx; s++) {
      const slot = TIME_SLOTS[s];
      const key = `${day}_${slot}`;
      updatedMap.set(key, {
        ...cellData,
        day,
        time_slot: slot,
      });
    }

    setCells(updatedMap);
    setResizingState(null);
  };
```

- [ ] **Step 3: Add Top/Bottom Resize Handles to Course Card Component in JSX**

Attach pointer listeners and resize handle overlay bars inside course cards (`ClassScheduleGrid.tsx`):

```tsx
<div
  draggable={!resizingState}
  onDragStart={(e) => handleDragStart(e, spanInfo.blockKeys, cell)}
  className={`h-full min-h-full flex-1 p-2.5 rounded-xl border relative text-center flex flex-col justify-between group/card cursor-grab active:cursor-grabbing transition-all shadow-xs ${d.color} ${
    isResizingThisCard ? "ring-2 ring-blue-500 shadow-md" : ""
  }`}
>
  {/* Top Resize Handle */}
  <div
    onPointerDown={(e) => handleResizeStart(e, d.key, "top", spanInfo.blockKeys, cell)}
    onPointerMove={handleResizeMove}
    onPointerUp={handleResizeEnd}
    className="absolute top-0 inset-x-0 h-3 cursor-ns-resize hover:bg-blue-500/40 rounded-t-xl z-20 transition-colors"
    title="Drag to resize start time"
  />

  {/* Card Content ... */}

  {/* Bottom Resize Handle */}
  <div
    onPointerDown={(e) => handleResizeStart(e, d.key, "bottom", spanInfo.blockKeys, cell)}
    onPointerMove={handleResizeMove}
    onPointerUp={handleResizeEnd}
    className="absolute bottom-0 inset-x-0 h-3 cursor-ns-resize hover:bg-blue-500/40 rounded-b-xl z-20 transition-colors"
    title="Drag to resize end time"
  />
</div>
```

- [ ] **Step 4: Verify build with next build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit changes**

```bash
git add components/admin/ClassScheduleGrid.tsx
git commit -m "feat(admin): implement drag-to-resize for class schedule grid cards"
```
