// src/hooks/map/longPressGeometry.ts
// Ren geometri-hjälpare för långtryck-detektorn (useMapCreateMarkedPlace, Task 4). Avgör om
// fingret flyttat sig så mycket under en pågående långtryck-timer att trycket ska tolkas som en
// panorering/drag istället för ett stillastående långtryck — och därmed avbrytas. Extraherad som
// ren funktion (inga DOM/Leaflet-beroenden) så logiken är trivialt testbar utan att mocka touch-
// events eller kartan.
export const LONG_PRESS_MS = 550;
export const LONG_PRESS_MOVE_CANCEL_PX = 12;

export const exceedsMoveThreshold = (
  dx: number,
  dy: number,
  thresholdPx: number = LONG_PRESS_MOVE_CANCEL_PX,
): boolean => Math.sqrt(dx * dx + dy * dy) > thresholdPx;
