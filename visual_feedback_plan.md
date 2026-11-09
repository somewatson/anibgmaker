# Visual Feedback Loop Plan

## Objective
Establish an automated visual feedback loop that allows the AI to examine the rendered output of the backgrounds to iteratively improve their aesthetics.

## Architecture
Since the AI operates in a headless environment, a "Screenshot Bridge" is required to bridge the gap between the code and the visual rendering.

### 1. The Screenshot Bridge (Client-Side)
A local Node.js service will be implemented to run on the user's machine.
- **Technology Stack**: Node.js, Playwright or Puppeteer.
- **Functionality**:
    - Launches a headless browser.
    - Navigates to the application (`index.html` via local server or hosted URL).
    - Captures high-resolution screenshots of the canvas.
    - Exposes a simple REST API (e.g., `GET /screenshot`) to serve the image.

### 2. The Analysis Loop (AI-Side)
The AI will utilize its vision capabilities and available tools to analyze the output.
- **Trigger**: After implementing a change, the AI calls the Screenshot Bridge API.
- **Acquisition**: Use `webfetch` or `execute` to retrieve the image from the bridge.
- **Analysis**: Process the image to identify visual artifacts, composition issues, or color imbalances.
- **Refinement**: Adjust the mathematical constants, physics, or theme logic based on the visual evidence.

## Workflow
1. **Implementation**: AI modifies `themes.js`, `main_2d.js`, or other relevant files.
2. **Request**: AI fetches a screenshot from the local bridge.
3. **Observation**: AI analyzes the resulting image.
4. **Iteration**: AI applies corrections and repeats until the desired visual result is achieved.

## Requirements for Setup
- Node.js installed on the host machine.
- Necessary permissions to allow the AI to access the local API endpoint (e.g., tunnel or open port).
- A local web server serving the project files.
