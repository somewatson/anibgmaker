# AGENTS.md

## Architecture
- **Single-Page App**: Pure HTML/CSS/JS. Entry point is `index.html`.
- **State Management**: `AppState` class handles configuration and query string synchronization.
- **Rendering**: 2D Canvas API. `main_2d.js` manages the animation loop and `Particle` lifecycle.
- **Theme System**: Strategy pattern. `Theme` base class in `themes.js` defines `update()` and `draw()`. New themes must implement these methods.
- **Audio**: Procedural audio managed by `AudioManager` in `audio.js`, tightly coupled to `main_2d.js` for mic-intensity visual boosts.

## Development & Verification
- **Run**: Open `index.html` in a modern browser.
- **Verification**: 
    - Use the UI sliders/pickers to test real-time updates.
    - Use "Copy Config URL" to verify that state persists via query parameters.
    - Test new themes by adding a class to `themes.js` and updating the `THEMES` mapping and `index.html` dropdown.

## Key Constraints & Quirks
- **Query String Priority**: `AppState.loadFromQueryString()` runs on init; URL parameters override default state.
- **Performance**: FPS is tracked and displayed in the UI. Avoid heavy computations in `Theme.update()` as it runs per-particle per-frame.
- **Audio Context**: Browser security requires user interaction (e.g., "Play Music" or "Enable Microphone" buttons) before audio can start.
- **Canvas Scaling**: `resize()` handler ensures the canvas always fills `window.innerWidth/Height`.
