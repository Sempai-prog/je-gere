# Animation Optimization Rationale

## Current Implementation: `setInterval`
- Updates progress by 2.5% every 20ms.
- Assumes a consistent 20ms interval, which is not guaranteed (event loop delays, browser throttling).
- Animation duration is theoretically 800ms (100 / 2.5 * 20), but can drift.
- Does not pause when tab is inactive, wasting CPU/battery.
- Does not synchronize with display refresh rate (often 60Hz or 120Hz), leading to potential jank or skipped frames.

## Proposed Implementation: `requestAnimationFrame`
- Synchronizes with the browser's repaint cycle (typically 60Hz).
- Uses `performance.now()` to calculate progress based on elapsed time, ensuring the animation takes exactly ~800ms regardless of frame rate.
- Automatically pauses when the tab/window is inactive, saving resources.
- Provides smoother visual updates by avoiding frame skips and stutter.

This change aligns with best practices for web animations and improves overall efficiency, especially on lower-end devices or when the page is in the background.
