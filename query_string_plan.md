# Implementation Plan: Query String Configuration and Menu Control

## Objective
Allow the project options to be set via a URL query string. When options are provided in the URL, the menu should be hidden by default to allow for a clean, shareable view.

## Steps

### 1. Exploration Phase
- **State Management:** Identify where options (settings) are stored and updated.
- **Menu Visibility:** Locate the logic and CSS classes controlling the visibility of the menu.
- **URL Handling:** Check for existing `window.location.search` parsing logic.

### 2. Design Phase
- **Mapping:** Create a mapping between query string keys and internal state variables.
- **Initialization Routine:**
    - On page load, parse `URLSearchParams`.
    - If valid parameters are found:
        - Override default state with URL values.
        - Set menu visibility to hidden.
    - If no parameters are found, maintain default behavior (menu visible).

### 3. Implementation Phase
- **URL Parser:** Implement a helper to extract and validate query parameters.
- **State Synchronization:**
    - Update the internal state based on the URL on startup.
    - Use `history.replaceState` to update the URL in real-time as the user changes options in the menu.
- **UI Toggle:** Apply the logic to hide the menu when initializing from a query string.

## Success Criteria
- Copying a URL with query parameters and opening it on another machine replicates the exact options.
- The menu is hidden automatically when parameters are present in the URL.
- Changing options via the menu updates the URL without reloading the page.
