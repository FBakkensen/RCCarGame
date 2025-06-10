# RC Car Racing Game - Technical Design Document

## 1. System Architecture Overview

### Core Architecture Pattern
- **Game State Machine**: Manages game states (Menu, Racing, PostRace)
- **Entity-Component System (ECS)**: Lightweight implementation for game objects
- **Event-Driven Input**: Decoupled input handling
- **Fixed Timestep Game Loop**: Consistent physics simulation

### Technology Stack
- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML5 Canvas 2D Context
- **Build System**: None (single HTML file with inline scripts for simplicity)
- **Asset Format**: JSON for track data, inline SVG-style paths for rendering
- **Target Platform**: Desktop browsers only (Chrome, Firefox, Safari, Edge)

## 2. File Structure

```
rc-car-racing/
├── index.html              # Main entry point
├── game.js                 # Core game engine and loop
├── entities/
│   ├── car.js             # Car class and physics
│   ├── aiController.js    # AI behavior logic
│   └── track.js           # Track representation
├── systems/
│   ├── renderer.js        # Canvas rendering system
│   ├── physics.js         # Physics calculations
│   ├── collision.js       # Collision detection
│   └── input.js           # Input handling
├── ui/
│   ├── menu.js            # Menu system
│   └── hud.js             # In-game UI
└── data/
    ├── tracks.js          # Track definitions
    └── carTypes.js        # Car specifications
```

## 3. Core Classes and Data Structures

### 3.1 Game Class
```javascript
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = 'MENU'; // MENU, RACING, POST_RACE
        this.currentTrack = null;
        this.cars = [];
        this.player = null;
        this.raceTimer = 0;
        this.frameTime = 1000 / 60; // 60 FPS target
    }

    // Core methods
    init() {}
    update(deltaTime) {}
    render() {}
    changeState(newState) {}
}
```

### 3.2 Car Class
```javascript
class Car {
    constructor(x, y, carType) {
        // Position and movement
        this.x = x;
        this.y = y;
        this.angle = 0; // rotation in radians
        this.currentSpeed = 0;
        this.isAccelerating = false;

        // Car specifications
        this.maxSpeed = carType.maxSpeed;
        this.acceleration = carType.acceleration;
        this.deceleration = carType.deceleration;
        this.turnSpeed = carType.turnSpeed;

        // Collision
        this.width = 30;
        this.height = 20;
        this.bounds = this.calculateBounds();

        // Racing data
        this.currentLap = 1;
        this.checkpointsHit = [];
        this.lapTimes = [];
        this.position = 1;
    }

    update(deltaTime) {}
    checkCollision(other) {}
    calculateBounds() {}
}
```

### 3.3 Track Class
```javascript
class Track {
    constructor(trackData) {
        this.name = trackData.name;
        this.checkpoints = trackData.checkpoints;
        this.boundaries = trackData.boundaries;
        this.startPositions = trackData.startPositions;
        this.waypoints = trackData.waypoints; // For AI

        // Visual data
        this.centerLine = trackData.centerLine;
        this.width = trackData.trackWidth;
        this.backgroundColor = trackData.backgroundColor;
    }

    isPointOnTrack(x, y) {}
    getNextCheckpoint(currentIndex) {}
    getNearestWaypoint(x, y) {}
}
```

### 3.4 AIController Class
```javascript
class AIController {
    constructor(car, track, difficulty) {
        this.car = car;
        this.track = track;
        this.currentWaypointIndex = 0;
        this.difficulty = difficulty; // affects speed and precision

        // AI tuning parameters
        this.lookAheadDistance = 50;
        this.steeringSmoothing = 0.1;
        this.speedModifier = 0.8 + (difficulty * 0.15);
    }

    update(deltaTime) {
        const targetWaypoint = this.getTargetWaypoint();
        this.steerTowards(targetWaypoint);
        this.manageSpeed();
    }
}
```

## 4. Game Loop Implementation

### 4.1 Fixed Timestep with Interpolation
```javascript
class GameLoop {
    constructor(game) {
        this.game = game;
        this.fps = 60;
        this.frameTime = 1000 / this.fps;
        this.lastTime = 0;
        this.accumulator = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;

        // Fixed timestep updates
        while (this.accumulator >= this.frameTime) {
            this.game.update(this.frameTime / 1000);
            this.accumulator -= this.frameTime;
        }

        // Render with interpolation
        const interpolation = this.accumulator / this.frameTime;
        this.game.render(interpolation);

        requestAnimationFrame(this.loop.bind(this));
    }
}
```

## 5. Physics and Collision Detection

### 5.1 Car Physics Model
```javascript
// Ultra-simple direct control physics
updateCarPhysics(car, deltaTime) {
    // Direct speed control (no momentum)
    if (car.isAccelerating) {
        car.currentSpeed = Math.min(car.currentSpeed + car.acceleration * deltaTime, car.maxSpeed);
    } else {
        // Quick deceleration when not accelerating
        car.currentSpeed = Math.max(car.currentSpeed - car.deceleration * deltaTime, 0);
    }

    // Update position based on angle and speed
    car.x += Math.cos(car.angle) * car.currentSpeed * deltaTime;
    car.y += Math.sin(car.angle) * car.currentSpeed * deltaTime;
}

// Direct steering control
applyCarControls(car, controls, deltaTime) {
    // Set acceleration state
    car.isAccelerating = controls.accelerate;

    // Direct turning (only when moving)
    if (car.currentSpeed > 0) {
        if (controls.left) {
            car.angle -= car.turnSpeed * deltaTime * (car.currentSpeed / car.maxSpeed);
        }
        if (controls.right) {
            car.angle += car.turnSpeed * deltaTime * (car.currentSpeed / car.maxSpeed);
        }
    }
}
```

### 5.2 Collision Detection System
```javascript
// AABB collision for cars
checkCarCollision(car1, car2) {
    return !(car1.x + car1.width < car2.x ||
             car2.x + car2.width < car1.x ||
             car1.y + car1.height < car2.y ||
             car2.y + car2.height < car1.y);
}

// Point-in-polygon for track boundaries
isCarOnTrack(car, track) {
    // Check car corners against track polygon
    const corners = car.getCorners();
    for (const corner of corners) {
        if (!this.pointInPolygon(corner, track.boundaries)) {
            return false;
        }
    }
    return true;
}

// Collision response
resolveCollision(car1, car2) {
    // Simple position-based separation
    const dx = car2.x - car1.x;
    const dy = car2.y - car1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (car1.width + car2.width) / 2;

    if (distance < minDistance) {
        // Normalize and separate
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minDistance - distance;

        // Push cars apart
        car1.x -= nx * overlap * 0.5;
        car1.y -= ny * overlap * 0.5;
        car2.x += nx * overlap * 0.5;
        car2.y += ny * overlap * 0.5;

        // Reduce speed on collision
        car1.currentSpeed *= 0.5;
        car2.currentSpeed *= 0.5;
    }
}
```

## 6. Canvas Rendering Pipeline

### 6.1 Rendering Order and Layers
```javascript
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering

        // Camera for future enhancements
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
    }

    render(game, interpolation) {
        // Clear canvas
        this.ctx.fillStyle = game.currentTrack.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render layers in order
        this.renderTrack(game.currentTrack);
        this.renderCars(game.cars, interpolation);
        this.renderEffects(game.effects);
        this.renderUI(game.ui);
    }
}
```

### 6.2 Optimized Shape Rendering
```javascript
// Track rendering using paths
renderTrack(track) {
    this.ctx.save();

    // Draw track boundaries
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    track.boundaries.forEach((point, index) => {
        if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
        } else {
            this.ctx.lineTo(point.x, point.y);
        }
    });
    this.ctx.closePath();
    this.ctx.stroke();

    // Draw center line
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    track.centerLine.forEach((point, index) => {
        if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
        } else {
            this.ctx.lineTo(point.x, point.y);
        }
    });
    this.ctx.stroke();

    this.ctx.restore();
}

// Car rendering with rotation
renderCar(car, interpolation) {
    this.ctx.save();

    // Simple position rendering (no interpolation needed with direct control)
    this.ctx.translate(car.x, car.y);
    this.ctx.rotate(car.angle);

    // Simple rectangle with direction indicator
    this.ctx.fillStyle = car.color;
    this.ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);

    // Direction indicator
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(car.width/4, -2, car.width/4, 4);

    this.ctx.restore();
}
```

## 7. Input Handling System

### 7.1 Keyboard Input Manager
```javascript
class InputManager {
    constructor() {
        this.keys = {};
        this.keyBindings = {
            'ArrowUp': 'accelerate',
            'ArrowDown': 'brake',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'accelerate',
            's': 'brake',
            'a': 'left',
            'd': 'right'
        };

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            const action = this.keyBindings[e.key];
            if (action) {
                this.keys[action] = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const action = this.keyBindings[e.key];
            if (action) {
                this.keys[action] = false;
                e.preventDefault();
            }
        });
    }

    getControls() {
        return {
            accelerate: this.keys.accelerate || false,
            brake: this.keys.brake || false,
            left: this.keys.left || false,
            right: this.keys.right || false
        };
    }
}
```

## 8. AI Waypoint System

### 8.1 Waypoint Navigation
```javascript
class WaypointSystem {
    constructor(track) {
        this.waypoints = track.waypoints;
        this.waypointRadius = 30; // Detection radius
    }

    getTargetWaypoint(aiController) {
        const car = aiController.car;
        const currentWP = this.waypoints[aiController.currentWaypointIndex];

        // Check if reached current waypoint
        const dist = this.distance(car.x, car.y, currentWP.x, currentWP.y);
        if (dist < this.waypointRadius) {
            aiController.currentWaypointIndex =
                (aiController.currentWaypointIndex + 1) % this.waypoints.length;
        }

        // Look ahead for smoother turns
        const lookAheadIndex =
            (aiController.currentWaypointIndex + 1) % this.waypoints.length;
        return this.waypoints[lookAheadIndex];
    }

    calculateSteering(car, targetPoint) {
        // Calculate angle to target
        const dx = targetPoint.x - car.x;
        const dy = targetPoint.y - car.y;
        const targetAngle = Math.atan2(dy, dx);

        // Calculate angle difference
        let angleDiff = targetAngle - car.angle;

        // Normalize angle to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        return angleDiff;
    }
}
```

## 9. Performance Optimization Strategies

### 9.1 Rendering Optimizations
- **Dirty Rectangle System**: Only redraw changed areas
- **Object Pooling**: Reuse particle and effect objects
- **Batch Drawing**: Group similar draw calls
- **Pre-calculated Values**: Cache trigonometric calculations

### 9.2 Physics Optimizations
- **Spatial Partitioning**: Grid-based collision detection for multiple cars
- **Broad Phase Collision**: AABB checks before detailed collision
- **Simplified Math**: Direct position updates without complex physics

### 9.3 Memory Management
```javascript
// Object pool for particles
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        const obj = this.pool.pop() || this.createFn();
        this.active.push(obj);
        return obj;
    }

    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
}
```

## 10. Implementation Priorities

### Phase 1 Critical Path
1. Basic game loop with fixed timestep
2. Car physics and keyboard controls
3. Simple track rendering
4. Collision detection with track boundaries

### Phase 2 Racing Features
1. AI waypoint following
2. Lap counting and checkpoints
3. Multiple car types
4. Race state management

### Phase 3 Polish
1. Optimized rendering pipeline
2. Visual effects (particles)
3. Complete UI system
4. Performance profiling and optimization

## 11. Technical Risk Mitigation

### Identified Risks
- **Canvas Performance**: Modern browsers handle Canvas well, but complex scenes may need optimization
- **AI Pathfinding Complexity**: Waypoint system is simple and proven
- **Collision Detection at High Speed**: Fixed timestep prevents tunneling issues

### Mitigation Strategies
- Start with minimal visual complexity and add features incrementally
- Use performance profiling early to identify bottlenecks
- Keep physics simple to avoid edge cases

## 12. Track Data Specification

### 12.1 Track JSON Format
```javascript
{
    "name": "Oval Track",
    "backgroundColor": "#2ECC40",
    "trackWidth": 80,

    // Center line points for visual reference
    "centerLine": [
        {"x": 200, "y": 100},
        {"x": 600, "y": 100},
        {"x": 700, "y": 200},
        {"x": 700, "y": 400},
        {"x": 600, "y": 500},
        {"x": 200, "y": 500},
        {"x": 100, "y": 400},
        {"x": 100, "y": 200}
    ],

    // Outer and inner boundaries for collision
    "boundaries": {
        "outer": [
            {"x": 200, "y": 60},
            {"x": 600, "y": 60},
            {"x": 740, "y": 200},
            {"x": 740, "y": 400},
            {"x": 600, "y": 540},
            {"x": 200, "y": 540},
            {"x": 60, "y": 400},
            {"x": 60, "y": 200}
        ],
        "inner": [
            {"x": 200, "y": 140},
            {"x": 600, "y": 140},
            {"x": 660, "y": 200},
            {"x": 660, "y": 400},
            {"x": 600, "y": 460},
            {"x": 200, "y": 460},
            {"x": 140, "y": 400},
            {"x": 140, "y": 200}
        ]
    },

    // Checkpoints for lap counting
    "checkpoints": [
        {"x1": 400, "y1": 60, "x2": 400, "y2": 140, "id": 0},
        {"x1": 660, "y1": 300, "x2": 740, "y2": 300, "id": 1},
        {"x1": 400, "y1": 460, "x2": 400, "y2": 540, "id": 2},
        {"x1": 60, "y1": 300, "x2": 140, "y2": 300, "id": 3}
    ],

    // Starting positions (up to 4 cars)
    "startPositions": [
        {"x": 350, "y": 80, "angle": 0},
        {"x": 350, "y": 120, "angle": 0},
        {"x": 450, "y": 80, "angle": 0},
        {"x": 450, "y": 120, "angle": 0}
    ],

    // AI waypoints
    "waypoints": [
        {"x": 300, "y": 100},
        {"x": 500, "y": 100},
        {"x": 650, "y": 150},
        {"x": 700, "y": 300},
        {"x": 650, "y": 450},
        {"x": 500, "y": 500},
        {"x": 300, "y": 500},
        {"x": 150, "y": 450},
        {"x": 100, "y": 300},
        {"x": 150, "y": 150}
    ]
}
```

### 12.2 Track Types
```javascript
// tracks.js
const TRACKS = {
    oval: {
        name: "Speedway Oval",
        difficulty: "Easy",
        // ... full JSON structure
    },

    rectangle: {
        name: "City Circuit",
        difficulty: "Medium",
        // ... includes chicanes
    },

    figure8: {
        name: "Crossover Challenge",
        difficulty: "Hard",
        // ... includes bridge/tunnel for crossover
    }
};
```

## 13. Car Specifications

### 13.1 Car Type Definitions
```javascript
// carTypes.js
const CAR_TYPES = {
    balanced: {
        name: "Rally Racer",
        color: "#3498DB",
        maxSpeed: 200,           // pixels per second
        acceleration: 150,       // pixels per second²
        deceleration: 300,       // pixels per second² (braking)
        turnSpeed: 2.5,          // radians per second
        width: 30,
        height: 20,
        description: "Well-rounded performance for beginners"
    },

    speed: {
        name: "Speed Demon",
        color: "#E74C3C",
        maxSpeed: 280,           // 40% faster top speed
        acceleration: 100,       // 33% slower acceleration
        deceleration: 250,       // slightly worse braking
        turnSpeed: 2.0,          // 20% slower turning
        width: 32,
        height: 18,
        description: "High top speed but challenging to control"
    }

    // Future car types can be added here
};
```

### 13.2 AI Difficulty Modifiers
```javascript
const AI_DIFFICULTY = {
    easy: {
        speedModifier: 0.8,      // 80% of car's max speed
        reactionTime: 0.3,       // seconds before steering correction
        waypointPrecision: 40    // pixels - larger = less precise
    },

    medium: {
        speedModifier: 0.9,
        reactionTime: 0.2,
        waypointPrecision: 30
    },

    hard: {
        speedModifier: 0.95,
        reactionTime: 0.1,
        waypointPrecision: 20
    }
};
```

## 14. UI State Management

### 14.1 Game State Machine
```javascript
class GameStateManager {
    constructor() {
        this.states = {
            LOADING: new LoadingState(),
            MAIN_MENU: new MainMenuState(),
            CAR_SELECT: new CarSelectState(),
            TRACK_SELECT: new TrackSelectState(),
            RACING: new RacingState(),
            PAUSED: new PausedState(),
            POST_RACE: new PostRaceState()
        };

        this.currentState = this.states.LOADING;
        this.stateStack = [];  // For pause functionality
    }

    changeState(newStateName, data = {}) {
        this.currentState.exit();
        this.currentState = this.states[newStateName];
        this.currentState.enter(data);
    }

    pushState(stateName) {
        this.stateStack.push(this.currentState);
        this.currentState = this.states[stateName];
        this.currentState.enter();
    }

    popState() {
        if (this.stateStack.length > 0) {
            this.currentState.exit();
            this.currentState = this.stateStack.pop();
        }
    }
}
```

### 14.2 Menu Specifications
```javascript
// Main Menu Layout
const MAIN_MENU = {
    title: {
        text: "RC CAR RACING",
        font: "48px Arial",
        color: "#2C3E50",
        y: 150
    },

    buttons: [
        {
            text: "START RACE",
            x: "center",
            y: 250,
            width: 200,
            height: 50,
            action: "CAR_SELECT"
        },
        {
            text: "SETTINGS",
            x: "center",
            y: 320,
            width: 200,
            height: 50,
            action: "SETTINGS"
        },
        {
            text: "INSTRUCTIONS",
            x: "center",
            y: 390,
            width: 200,
            height: 50,
            action: "INSTRUCTIONS"
        }
    ],

    style: {
        buttonColor: "#3498DB",
        buttonHoverColor: "#2980B9",
        textColor: "#FFFFFF",
        font: "20px Arial"
    }
};
```

### 14.3 In-Game HUD Layout
```javascript
const HUD_LAYOUT = {
    // Top-left: Race Info
    raceInfo: {
        x: 20,
        y: 20,
        elements: [
            {type: "text", label: "LAP", value: "currentLap/totalLaps"},
            {type: "text", label: "POSITION", value: "position/totalCars"}
        ]
    },

    // Top-center: Timer
    timer: {
        x: "center",
        y: 20,
        font: "32px Arial",
        color: "#2C3E50"
    },

    // Top-right: Best Lap
    bestLap: {
        x: "right-20",
        y: 20,
        label: "BEST LAP",
        font: "18px Arial",
        color: "#27AE60"
    },

    // Mini-map (bottom-right)
    miniMap: {
        x: "right-120",
        y: "bottom-120",
        width: 100,
        height: 100,
        borderColor: "#34495E",
        backgroundColor: "rgba(255,255,255,0.8)"
    }
};
```

### 14.4 Post-Race Statistics
```javascript
const POST_RACE_SCREEN = {
    title: {
        text: (position) => position === 1 ? "VICTORY!" : `FINISHED ${position}${getOrdinalSuffix(position)}`,
        font: "48px Arial",
        color: (position) => position === 1 ? "#27AE60" : "#E74C3C"
    },

    statistics: [
        {label: "Final Position", value: "position/totalCars"},
        {label: "Total Time", value: "formatTime(totalTime)"},
        {label: "Best Lap", value: "formatTime(bestLap)"},
        {label: "Average Lap", value: "formatTime(avgLap)"}
    ],

    buttons: [
        {text: "RACE AGAIN", action: "RESTART_RACE"},
        {text: "NEW RACE", action: "CAR_SELECT"},
        {text: "MAIN MENU", action: "MAIN_MENU"}
    ]
};
```

## 15. Track Boundary Implementation Decision

### Chosen Approach: Dual Polygon System
After consideration, the **dual polygon approach** (inner and outer boundaries) is selected for these reasons:
- **Simplicity**: Clear separation between track edges
- **Performance**: Simple point-in-polygon tests
- **Flexibility**: Easy to create varied track widths in different sections
- **AI Benefits**: Can use space between boundaries for waypoint generation

### Implementation Details
```javascript
// Collision check uses both boundaries
isCarOnTrack(car) {
    const corners = car.getCorners();
    for (const corner of corners) {
        // Must be inside outer AND outside inner boundary
        if (!pointInPolygon(corner, this.outerBoundary) ||
            pointInPolygon(corner, this.innerBoundary)) {
            return false;
        }
    }
    return true;
}
```

## 16. Sound System Placeholders

### 16.1 Sound Event Triggers
```javascript
// SoundManager placeholder for future implementation
class SoundManager {
    constructor() {
        this.enabled = false;  // Will be true when audio is implemented
        this.volume = 1.0;
        this.muted = false;
    }

    // Placeholder methods that will trigger actual sounds later
    playEngineStart(carType) {
        // Future: Play car-specific engine start sound
        console.log(`[Sound] Engine start: ${carType}`);
    }

    updateEngineSound(speed, maxSpeed) {
        // Future: Modulate engine pitch based on speed
        // pitch = basePitch + (speed/maxSpeed) * pitchRange
    }

    playCollision(impactForce) {
        // Future: Play collision sound with volume based on impact
        console.log(`[Sound] Collision: force ${impactForce}`);
    }

    playCheckpoint() {
        // Future: Play checkpoint passed sound
        console.log(`[Sound] Checkpoint passed`);
    }

    playCountdown(number) {
        // Future: Play countdown beeps (3, 2, 1, GO!)
        console.log(`[Sound] Countdown: ${number}`);
    }

    playLapComplete(lapTime, isBestLap) {
        // Future: Play lap complete sound, special sound for best lap
        console.log(`[Sound] Lap complete: ${lapTime}ms${isBestLap ? ' (BEST!)' : ''}`);
    }

    playRaceFinish(position) {
        // Future: Play victory fanfare or completion sound
        console.log(`[Sound] Race finished: position ${position}`);
    }

    playMenuHover() {
        // Future: Play subtle UI hover sound
    }

    playMenuSelect() {
        // Future: Play UI selection confirmation
    }
}
```

### 16.2 Sound Integration Points
```javascript
// In Car class
class Car {
    update(deltaTime) {
        // Existing physics code...

        // Sound trigger point
        if (this.soundManager) {
            this.soundManager.updateEngineSound(this.currentSpeed, this.maxSpeed);
        }
    }

    onCollision(other) {
        // Existing collision code...

        // Sound trigger point
        if (this.soundManager) {
            const impactForce = Math.abs(this.currentSpeed - other.currentSpeed);
            this.soundManager.playCollision(impactForce);
        }
    }
}

// In Race Manager
class RaceManager {
    checkCheckpoint(car, checkpoint) {
        // Existing checkpoint code...

        // Sound trigger point
        if (this.soundManager) {
            this.soundManager.playCheckpoint();
        }
    }

    completeLap(car, lapTime) {
        // Existing lap code...

        // Sound trigger point
        if (this.soundManager) {
            const isBestLap = lapTime < car.bestLapTime;
            this.soundManager.playLapComplete(lapTime, isBestLap);
        }
    }
}
```

### 16.3 UI Sound Settings
```javascript
// Settings menu structure
const SETTINGS_MENU = {
    title: "SETTINGS",
    options: [
        {
            type: "toggle",
            label: "Sound Effects",
            property: "soundEnabled",
            default: true,
            note: "Coming in future update"
        },
        {
            type: "slider",
            label: "Volume",
            property: "volume",
            min: 0,
            max: 100,
            default: 70,
            disabled: true,  // Until audio implemented
            note: "Coming in future update"
        },
        {
            type: "select",
            label: "Controls",
            property: "controlScheme",
            options: ["WASD", "Arrow Keys"],
            default: "WASD"
        }
    ]
};
```

## 17. Debug and Development Features

### 15.1 Debug Renderer
```javascript
class DebugRenderer {
    constructor(enabled = false) {
        this.enabled = enabled;
        this.showCollisionBoxes = true;
        this.showWaypoints = true;
        this.showCheckpoints = true;
        this.showPerformanceStats = true;
        this.showCarData = true;
    }

    render(ctx, game) {
        if (!this.enabled) return;

        ctx.save();

        // Collision boxes
        if (this.showCollisionBoxes) {
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 2;
            game.cars.forEach(car => {
                ctx.strokeRect(
                    car.x - car.width/2,
                    car.y - car.height/2,
                    car.width,
                    car.height
                );
            });
        }

        // AI Waypoints
        if (this.showWaypoints) {
            ctx.fillStyle = "#FFD700";
            game.currentTrack.waypoints.forEach((wp, index) => {
                ctx.beginPath();
                ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText(index, wp.x + 10, wp.y);
            });
        }

        // Checkpoints
        if (this.showCheckpoints) {
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 3;
            game.currentTrack.checkpoints.forEach(cp => {
                ctx.beginPath();
                ctx.moveTo(cp.x1, cp.y1);
                ctx.lineTo(cp.x2, cp.y2);
                ctx.stroke();
            });
        }

        ctx.restore();
    }
}
```

### 15.2 Performance Monitor
```javascript
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameTime = 0;
        this.updateTime = 0;
        this.renderTime = 0;
        this.frames = 0;
        this.lastTime = performance.now();

        // History for graphs
        this.fpsHistory = new Array(60).fill(0);
        this.frameTimeHistory = new Array(60).fill(0);
    }

    beginFrame() {
        this.frameStart = performance.now();
    }

    endUpdate() {
        this.updateTime = performance.now() - this.frameStart;
    }

    endRender() {
        this.renderTime = performance.now() - this.frameStart - this.updateTime;
        this.frameTime = performance.now() - this.frameStart;

        // Update FPS counter
        this.frames++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = currentTime;

            // Update history
            this.fpsHistory.shift();
            this.fpsHistory.push(this.fps);
            this.frameTimeHistory.shift();
            this.frameTimeHistory.push(this.frameTime);
        }
    }

    render(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(x, y, 200, 100);

        ctx.fillStyle = "#00FF00";
        ctx.font = "12px monospace";
        ctx.fillText(`FPS: ${this.fps}`, x + 10, y + 20);
        ctx.fillText(`Frame: ${this.frameTime.toFixed(2)}ms`, x + 10, y + 35);
        ctx.fillText(`Update: ${this.updateTime.toFixed(2)}ms`, x + 10, y + 50);
        ctx.fillText(`Render: ${this.renderTime.toFixed(2)}ms`, x + 10, y + 65);

        // Mini FPS graph
        ctx.strokeStyle = "#00FF00";
        ctx.beginPath();
        this.fpsHistory.forEach((fps, i) => {
            const graphX = x + 10 + i * 3;
            const graphY = y + 90 - (fps / 60) * 20;
            if (i === 0) ctx.moveTo(graphX, graphY);
            else ctx.lineTo(graphX, graphY);
        });
        ctx.stroke();

        ctx.restore();
    }
}
```

### 15.3 Hot Reload Configuration
```javascript
// config.js - Hot reloadable parameters
window.GameConfig = {
    physics: {
        maxSpeed: 200,
        acceleration: 150,
        deceleration: 300,
        turnSpeed: 2.5
    },

    ai: {
        lookAheadDistance: 50,
        waypointRadius: 30,
        speedModifier: 0.9
    },

    rendering: {
        showFPS: true,
        antialiasing: false,
        particleCount: 50
    },

    debug: {
        enabled: false,
        keyToggle: "F1",
        options: {
            collisionBoxes: true,
            waypoints: true,
            checkpoints: true,
            performance: true
        }
    }
};

// Debug console commands
window.gameDebug = {
    setSpeed: (speed) => {
        window.GameConfig.physics.maxSpeed = speed;
        console.log(`Max speed set to ${speed}`);
    },

    toggleDebug: () => {
        window.GameConfig.debug.enabled = !window.GameConfig.debug.enabled;
    },

    winRace: () => {
        if (window.game && window.game.state === 'RACING') {
            window.game.player.currentLap = 3;
            window.game.checkWinCondition();
        }
    },

    resetCar: () => {
        if (window.game && window.game.player) {
            const start = window.game.currentTrack.startPositions[0];
            window.game.player.x = start.x;
            window.game.player.y = start.y;
            window.game.player.angle = start.angle;
            window.game.player.currentSpeed = 0;
        }
    }
};
```

## 18. Future Enhancements (Out of Current Scope)

### 18.1 Save System (Server-Side)
**Note**: The save system is planned for a future phase and will be implemented server-side. This section documents the data structure for future reference.

```javascript
// Data structure for future server-side persistence
const PlayerSaveData = {
    playerId: "unique-player-id",
    statistics: {
        totalRaces: 0,
        victories: 0,
        totalLaps: 0,
        totalPlayTime: 0  // in seconds
    },

    trackRecords: {
        "track-id": {
            bestLapTime: {
                time: 0,
                carType: "balanced",
                date: "2025-01-01T00:00:00Z"
            },
            bestRaceTime: {
                time: 0,
                carType: "balanced",
                date: "2025-01-01T00:00:00Z"
            },
            racesCompleted: 0
        }
    },

    carRecords: {
        "balanced": {
            racesCompleted: 0,
            victories: 0,
            bestLapTime: 0
        },
        "speed": {
            racesCompleted: 0,
            victories: 0,
            bestLapTime: 0
        }
    },

    preferences: {
        preferredCar: "balanced",
        controlScheme: "WASD",
        soundEnabled: true,
        volume: 70
    }
};

// Placeholder API structure for future implementation
class SaveManager {
    async saveRaceResult(raceData) {
        // Future: POST to server API
        console.log("[Future API] Save race result:", raceData);
    }

    async loadPlayerData(playerId) {
        // Future: GET from server API
        console.log("[Future API] Load player data:", playerId);
    }

    async updateTrackRecord(trackId, lapTime, carType) {
        // Future: PUT to server API
        console.log("[Future API] Update track record:", trackId, lapTime, carType);
    }
}
```

### 18.2 Additional Future Features
- **Multiplayer**: Real-time racing with websockets
- **Track Editor**: User-generated content system
- **Championship Mode**: Multi-race tournaments
- **Power-ups**: Speed boosts, shields, etc.
- **Advanced AI**: Machine learning-based opponents
- **Replay System**: Record and playback races

---
*This Technical Design Document provides implementation-ready specifications for Claude Code to build the RC Car Racing Game efficiently.*