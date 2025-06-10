# RC Car Racing Game - Implementation Guide

## 1. Development Overview

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local web server for testing (e.g., Python's SimpleHTTPServer)
- Basic understanding of JavaScript, HTML5 Canvas

### Development Principles
1. **Test-Driven Development**: Write tests before implementation
2. **Incremental Development**: Build and test one feature at a time
3. **Continuous Testing**: Verify each component works before moving on
4. **Debug-First**: Build debugging tools alongside features
5. **Performance Monitoring**: Check FPS after each major addition
6. **Error Resilience**: Handle all edge cases gracefully

## 2. Phase 1: Core Foundation

### 2.1 Project Setup
```bash
# Create project structure
mkdir rc-car-racing
cd rc-car-racing
mkdir js js/entities js/systems js/ui js/data tests tests/unit tests/integration
touch index.html js/game.js test.html
```

### 2.2 Test Framework Setup
Create a simple test framework for TDD:

**File: tests/testFramework.js**
```javascript
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    describe(description, testFn) {
        console.log(`\n${description}`);
        testFn();
    }

    it(description, testFn) {
        try {
            testFn();
            console.log(`  ✓ ${description}`);
            this.results.push({description, passed: true});
        } catch (error) {
            console.error(`  ✗ ${description}`);
            console.error(`    ${error.message}`);
            this.results.push({description, passed: false, error});
        }
    }

    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toBeCloseTo(expected, precision = 2) {
                const diff = Math.abs(actual - expected);
                if (diff > Math.pow(10, -precision)) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toBeTruthy() {
                if (!actual) {
                    throw new Error(`Expected truthy but got ${actual}`);
                }
            },
            toContain(item) {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain ${item}`);
                }
            },
            toBeGreaterThan(expected) {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan(expected) {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            }
        };
    }

    summary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        console.log(`\nTests: ${passed}/${total} passed`);
        return passed === total;
    }
}

const test = new TestFramework();
```

### 2.3 Error Handling System
**File: js/systems/errorHandler.js**

```javascript
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.criticalError = false;
        this.setupGlobalHandler();
    }

    setupGlobalHandler() {
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                timestamp: Date.now()
            });

            // Prevent default error handling
            event.preventDefault();
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise rejection',
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            });
        });
    }

    logError(errorInfo) {
        this.errors.push(errorInfo);
        console.error('Game Error:', errorInfo);

        // Check if critical
        if (this.isCritical(errorInfo)) {
            this.handleCriticalError(errorInfo);
        }
    }

    isCritical(errorInfo) {
        const criticalKeywords = ['Canvas', 'WebGL', 'AudioContext', 'localStorage'];
        return criticalKeywords.some(keyword =>
            errorInfo.message && errorInfo.message.includes(keyword)
        );
    }

    handleCriticalError(errorInfo) {
        this.criticalError = true;

        // Display error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <h2>Critical Error</h2>
            <p>${errorInfo.message}</p>
            <button onclick="location.reload()">Reload Game</button>
        `;
        document.body.appendChild(errorDiv);
    }

    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            criticalError: this.criticalError,
            recentErrors: this.errors.slice(-10),
            errorsByType: this.categorizeErrors()
        };
    }

    categorizeErrors() {
        const categories = {};
        this.errors.forEach(error => {
            const category = this.getErrorCategory(error);
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }

    getErrorCategory(error) {
        if (error.message.includes('Canvas')) return 'Rendering';
        if (error.message.includes('Audio')) return 'Audio';
        if (error.message.includes('Network')) return 'Network';
        if (error.message.includes('localStorage')) return 'Storage';
        return 'Other';
    }
}
```

### 2.4 Game Loop Tests (TDD)
**File: tests/unit/gameLoop.test.js**

```javascript
test.describe('Game Loop', () => {
    test.it('should maintain 60 FPS', () => {
        const game = new Game(document.getElementById('testCanvas'));
        const frameTime = 1000/60;

        // Simulate 60 frames
        for (let i = 0; i < 60; i++) {
            const start = performance.now();
            game.update(frameTime/1000);
            game.render();
            const elapsed = performance.now() - start;

            test.expect(elapsed).toBeLessThan(frameTime);
        }
    });

    test.it('should handle variable timesteps', () => {
        const game = new Game(document.getElementById('testCanvas'));

        // Test with varying timesteps
        const timesteps = [16, 17, 15, 20, 14];
        timesteps.forEach(ms => {
            game.update(ms/1000);
            test.expect(game.accumulator).toBeCloseTo(0, 1);
        });
    });

    test.it('should gracefully handle errors', () => {
        const game = new Game(document.getElementById('testCanvas'));

        // Force an error
        game.cars = null;

        // Should not crash
        game.update(0.016);
        game.render();

        test.expect(game.errorHandler.errors.length).toBeGreaterThan(0);
    });
});
```

### 2.5 Game Loop Implementation
**File: js/game.js**

```javascript
class Game {
    constructor(canvas) {
        try {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Failed to get 2D context');
            }

            // Core systems
            this.errorHandler = new ErrorHandler();
            this.debugger = new GameDebugger(this);
            this.performanceMonitor = new PerformanceMonitor();

            // Game state
            this.running = false;
            this.paused = false;
            this.lastTime = 0;
            this.accumulator = 0;
            this.totalTime = 0;

            // Fixed timestep
            this.fixedTimestep = 1/60;
            this.maxTimestepCatchup = 5;

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleInitializationError(error);
        }
    }

    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <h1>Failed to Initialize Game</h1>
            <p>${error.message}</p>
            <p>Please ensure your browser supports HTML5 Canvas.</p>
        `;
        document.body.appendChild(errorMessage);
    }

    start() {
        try {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        } catch (error) {
            this.errorHandler.logError({
                message: 'Failed to start game loop',
                error: error
            });
        }
    }

    loop(currentTime) {
        try {
            if (!this.running) return;

            // Performance monitoring
            this.performanceMonitor.beginFrame();

            const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
            this.lastTime = currentTime;

            if (!this.paused) {
                // Fixed timestep with interpolation
                this.accumulator += deltaTime;

                let updates = 0;
                while (this.accumulator >= this.fixedTimestep && updates < this.maxTimestepCatchup) {
                    this.update(this.fixedTimestep);
                    this.accumulator -= this.fixedTimestep;
                    this.totalTime += this.fixedTimestep;
                    updates++;
                }

                // Interpolation value for rendering
                const interpolation = this.accumulator / this.fixedTimestep;
                this.render(interpolation);
            } else {
                this.render(0);
            }

            // Performance monitoring
            this.performanceMonitor.endFrame();

            requestAnimationFrame(this.loop.bind(this));

        } catch (error) {
            this.errorHandler.logError({
                message: 'Error in game loop',
                error: error,
                gameTime: this.totalTime
            });

            // Try to recover
            if (!this.errorHandler.criticalError) {
                requestAnimationFrame(this.loop.bind(this));
            }
        }
    }

    update(deltaTime) {
        try {
            // Update game state with error boundaries
            if (this.cars && Array.isArray(this.cars)) {
                this.cars.forEach(car => {
                    try {
                        car.update(deltaTime);
                    } catch (error) {
                        console.error(`Error updating car:`, error);
                        // Remove problematic car
                        const index = this.cars.indexOf(car);
                        if (index > -1) {
                            this.cars.splice(index, 1);
                        }
                    }
                });
            }

            // Debug update
            this.debugger.update(deltaTime);

        } catch (error) {
            this.errorHandler.logError({
                message: 'Error in update',
                error: error
            });
        }
    }

    render(interpolation) {
        try {
            // Clear canvas with error checking
            if (this.ctx) {
                this.ctx.fillStyle = '#4A5F3A';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Render game objects
                // ... rendering code ...

                // Debug overlay
                this.debugger.render(this.ctx);
            }
        } catch (error) {
            this.errorHandler.logError({
                message: 'Error in render',
                error: error
            });
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
}
```

### 2.6 Comprehensive Debug System
**File: js/systems/debugger.js**

```javascript
class GameDebugger {
    constructor(game) {
        this.game = game;
        this.enabled = false;
        this.panels = {
            performance: true,
            gameState: true,
            input: true,
            physics: true,
            ai: true,
            memory: true
        };

        this.setupDebugControls();
        this.commandHistory = [];
        this.logs = [];
    }

    setupDebugControls() {
        // Debug console
        this.createDebugConsole();

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.enabled = !this.enabled;
            }
            if (e.key === 'F2' && this.enabled) {
                e.preventDefault();
                this.showConsole();
            }
            if (e.key === 'F3' && this.enabled) {
                e.preventDefault();
                this.captureState();
            }
            if (e.key === 'F4' && this.enabled) {
                e.preventDefault();
                this.stepFrame();
            }
        });
    }

    createDebugConsole() {
        const console = document.createElement('div');
        console.id = 'debug-console';
        console.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: rgba(0, 0, 0, 0.9);
            color: #00FF00;
            font-family: monospace;
            display: none;
            z-index: 9999;
        `;

        console.innerHTML = `
            <div style="height: 160px; overflow-y: auto; padding: 10px;" id="debug-output"></div>
            <input type="text" id="debug-input" style="
                width: 100%;
                background: #000;
                color: #00FF00;
                border: 1px solid #00FF00;
                padding: 5px;
                font-family: monospace;
            " placeholder="Enter debug command...">
        `;

        document.body.appendChild(console);

        // Command input
        document.getElementById('debug-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(e.target.value);
                this.commandHistory.push(e.target.value);
                e.target.value = '';
            }
        });
    }

    executeCommand(command) {
        this.log(`> ${command}`);

        try {
            // Built-in commands
            const commands = {
                'help': () => this.showHelp(),
                'clear': () => this.clearConsole(),
                'fps': () => this.log(`FPS: ${this.game.performanceMonitor.fps}`),
                'cars': () => this.log(`Cars: ${this.game.cars ? this.game.cars.length : 0}`),
                'pause': () => this.game.pause(),
                'resume': () => this.game.resume(),
                'spawn': () => this.spawnTestCar(),
                'win': () => this.forceWin(),
                'lose': () => this.forceLose(),
                'damage': () => this.damagePlayer(),
                'teleport': (x, y) => this.teleportPlayer(x, y),
                'speed': (speed) => this.setPlayerSpeed(speed),
                'state': () => this.dumpGameState(),
                'errors': () => this.showErrors(),
                'perf': () => this.showPerformanceReport()
            };

            const parts = command.split(' ');
            const cmd = parts[0];
            const args = parts.slice(1);

            if (commands[cmd]) {
                commands[cmd](...args);
            } else {
                // Try to evaluate as JavaScript
                const result = eval(command);
                this.log(result);
            }
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
        }
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {timestamp, message, type};
        this.logs.push(logEntry);

        const output = document.getElementById('debug-output');
        if (output) {
            const color = {
                'info': '#00FF00',
                'warn': '#FFFF00',
                'error': '#FF0000'
            }[type];

            output.innerHTML += `<div style="color: ${color}">[${timestamp}] ${message}</div>`;
            output.scrollTop = output.scrollHeight;
        }
    }

    render(ctx) {
        if (!this.enabled) return;

        ctx.save();

        // Performance panel
        if (this.panels.performance) {
            this.renderPerformancePanel(ctx, 10, 10);
        }

        // Game state panel
        if (this.panels.gameState) {
            this.renderGameStatePanel(ctx, 10, 120);
        }

        // Input panel
        if (this.panels.input) {
            this.renderInputPanel(ctx, 10, 250);
        }

        // Physics visualization
        if (this.panels.physics) {
            this.renderPhysicsVisualization(ctx);
        }

        // AI debug
        if (this.panels.ai) {
            this.renderAIDebug(ctx);
        }

        // Memory usage
        if (this.panels.memory) {
            this.renderMemoryPanel(ctx, 600, 10);
        }

        ctx.restore();
    }

    renderPerformancePanel(ctx, x, y) {
        const perf = this.game.performanceMonitor;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 250, 100);

        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${perf.fps} (${perf.frameTime.toFixed(2)}ms)`, x + 10, y + 20);
        ctx.fillText(`Update: ${perf.updateTime.toFixed(2)}ms`, x + 10, y + 35);
        ctx.fillText(`Render: ${perf.renderTime.toFixed(2)}ms`, x + 10, y + 50);
        ctx.fillText(`Objects: ${this.getObjectCount()}`, x + 10, y + 65);
        ctx.fillText(`Draw Calls: ${perf.drawCalls}`, x + 10, y + 80);

        // FPS Graph
        ctx.strokeStyle = '#00FF00';
        ctx.beginPath();
        perf.fpsHistory.forEach((fps, i) => {
            const graphX = x + 130 + i * 2;
            const graphY = y + 80 - (fps / 60) * 60;
            if (i === 0) ctx.moveTo(graphX, graphY);
            else ctx.lineTo(graphX, graphY);
        });
        ctx.stroke();
    }

    renderGameStatePanel(ctx, x, y) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 200, 120);

        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.fillText(`State: ${this.game.currentState || 'MENU'}`, x + 10, y + 20);
        ctx.fillText(`Time: ${this.game.totalTime.toFixed(2)}s`, x + 10, y + 35);
        ctx.fillText(`Paused: ${this.game.paused}`, x + 10, y + 50);

        if (this.game.raceManager) {
            ctx.fillText(`Lap: ${this.game.raceManager.currentLap}/3`, x + 10, y + 65);
            ctx.fillText(`Position: ${this.game.raceManager.playerPosition}`, x + 10, y + 80);
            ctx.fillText(`Race Time: ${this.game.raceManager.raceTime.toFixed(2)}`, x + 10, y + 95);
        }
    }

    renderInputPanel(ctx, x, y) {
        if (!this.game.input) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 150, 100);

        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.fillText('Input State:', x + 10, y + 20);

        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        keys.forEach((key, i) => {
            const pressed = this.game.input.keys[key];
            ctx.fillStyle = pressed ? '#00FF00' : '#004400';
            ctx.fillText(`${key}: ${pressed ? 'ON' : 'OFF'}`, x + 10, y + 40 + i * 15);
        });
    }

    renderPhysicsVisualization(ctx) {
        if (!this.game.cars) return;

        this.game.cars.forEach(car => {
            // Collision boxes
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(car.x - 15, car.y - 10, 30, 20);

            // Velocity vector
            ctx.strokeStyle = '#00FF00';
            ctx.beginPath();
            ctx.moveTo(car.x, car.y);
            ctx.lineTo(car.x + car.velocity * 0.5 * Math.cos(car.angle),
                      car.y + car.velocity * 0.5 * Math.sin(car.angle));
            ctx.stroke();

            // Car data
            ctx.fillStyle = '#FFFF00';
            ctx.font = '10px monospace';
            ctx.fillText(`v:${car.velocity.toFixed(0)}`, car.x + 20, car.y);
            ctx.fillText(`a:${(car.angle * 180/Math.PI).toFixed(0)}°`, car.x + 20, car.y + 12);
        });
    }

    renderAIDebug(ctx) {
        if (!this.game.aiControllers) return;

        // Waypoints
        if (this.game.track && this.game.track.data.waypoints) {
            ctx.fillStyle = '#FFD700';
            this.game.track.data.waypoints.forEach((wp, i) => {
                ctx.beginPath();
                ctx.arc(wp.col * 40 + 20, wp.row * 40 + 20, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText(i, wp.col * 40 + 25, wp.row * 40 + 20);
            });
        }

        // AI target lines
        this.game.aiControllers.forEach(ai => {
            if (ai.targetWaypoint) {
                ctx.strokeStyle = '#00FFFF';
                ctx.beginPath();
                ctx.moveTo(ai.car.x, ai.car.y);
                ctx.lineTo(ai.targetWaypoint.x, ai.targetWaypoint.y);
                ctx.stroke();
            }
        });
    }

    renderMemoryPanel(ctx, x, y) {
        const memory = this.getMemoryUsage();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 180, 80);

        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.fillText('Memory Usage:', x + 10, y + 20);
        ctx.fillText(`Heap: ${memory.usedHeap}/${memory.totalHeap}MB`, x + 10, y + 35);
        ctx.fillText(`Objects: ${memory.objectCount}`, x + 10, y + 50);
        ctx.fillText(`Arrays: ${memory.arrayCount}`, x + 10, y + 65);
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedHeap: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
                totalHeap: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
                objectCount: this.countObjects(this.game),
                arrayCount: this.countArrays(this.game)
            };
        }
        return {
            usedHeap: 'N/A',
            totalHeap: 'N/A',
            objectCount: this.countObjects(this.game),
            arrayCount: this.countArrays(this.game)
        };
    }

    countObjects(obj, visited = new WeakSet()) {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) return 0;
        visited.add(obj);

        let count = 1;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                count += this.countObjects(obj[key], visited);
            }
        }
        return count;
    }

    countArrays(obj, visited = new WeakSet()) {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) return 0;
        visited.add(obj);

        let count = Array.isArray(obj) ? 1 : 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                count += this.countArrays(obj[key], visited);
            }
        }
        return count;
    }

    showConsole() {
        const console = document.getElementById('debug-console');
        if (console) {
            console.style.display = console.style.display === 'none' ? 'block' : 'none';
        }
    }

    captureState() {
        const state = {
            timestamp: Date.now(),
            gameTime: this.game.totalTime,
            cars: this.game.cars ? this.game.cars.map(car => ({
                x: car.x,
                y: car.y,
                angle: car.angle,
                velocity: car.velocity
            })) : [],
            raceState: this.game.raceManager ? {
                lap: this.game.raceManager.currentLap,
                time: this.game.raceManager.raceTime,
                position: this.game.raceManager.playerPosition
            } : null,
            performance: {
                fps: this.game.performanceMonitor.fps,
                frameTime: this.game.performanceMonitor.frameTime
            }
        };

        const stateStr = JSON.stringify(state, null, 2);
        console.log('Game State Captured:', stateStr);

        // Save to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(stateStr);
            this.log('State copied to clipboard');
        }

        return state;
    }
}

// Global debug commands for console
window.gameDebug = {
    enable: () => game.debugger.enabled = true,
    disable: () => game.debugger.enabled = false,
    pause: () => game.pause(),
    resume: () => game.resume(),
    state: () => game.debugger.captureState(),
    spawn: () => game.debugger.spawnTestCar(),
    teleport: (x, y) => game.debugger.teleportPlayer(x, y),
    speed: (s) => game.debugger.setPlayerSpeed(s),
    win: () => game.debugger.forceWin(),
    fps: () => game.performanceMonitor.fps,
    errors: () => game.errorHandler.getErrorReport()
};
```

## 3. Phase 2: Car System

### 3.1 Car Tests (TDD)
**File: tests/unit/car.test.js**

```javascript
test.describe('Car Physics', () => {
    test.it('should accelerate correctly', () => {
        const car = new Car(400, 300, CAR_TYPES.balanced);
        const initialSpeed = car.velocity;

        car.isAccelerating = true;
        car.update(0.016); // One frame

        test.expect(car.velocity).toBeGreaterThan(initialSpeed);
        test.expect(car.velocity).toBeLessThan(car.maxSpeed);
    });

    test.it('should have momentum when releasing accelerator', () => {
        const car = new Car(400, 300, CAR_TYPES.balanced);

        // Accelerate to speed
        car.isAccelerating = true;
        for (let i = 0; i < 60; i++) {
            car.update(0.016);
        }

        const speedBeforeRelease = car.velocity;

        // Release accelerator
        car.isAccelerating = false;
        car.update(0.016);

        // Should still have speed but less
        test.expect(car.velocity).toBeGreaterThan(0);
        test.expect(car.velocity).toBeLessThan(speedBeforeRelease);
    });

    test.it('should turn with inertia', () => {
        const car = new Car(400, 300, CAR_TYPES.balanced);
        car.velocity = 100; // Moving

        const initialAngle = car.angle;
        car.inputTurnRate = 1; // Full right turn

        car.update(0.016);

        // Should start turning but not instantly
        test.expect(car.currentTurnRate).toBeGreaterThan(0);
        test.expect(car.currentTurnRate).toBeLessThan(car.turnSpeed);
    });

    test.it('should handle edge cases gracefully', () => {
        const car = new Car(400, 300, CAR_TYPES.balanced);

        // Test with invalid inputs
        car.update(NaN);
        test.expect(car.x).toBe(400);
        test.expect(car.y).toBe(300);

        car.update(-1); // Negative time
        test.expect(car.velocity).toBeGreaterThan(-1);

        car.update(1000); // Huge timestep
        test.expect(car.velocity).toBeLessThan(car.maxSpeed * 2);
    });
});
```

### 3.2 Car Implementation with Error Handling
**File: js/entities/car.js**

```javascript
class Car {
    constructor(x, y, carType) {
        try {
            // Validate inputs
            if (typeof x !== 'number' || typeof y !== 'number') {
                throw new Error('Invalid car position');
            }
            if (!carType || typeof carType !== 'object') {
                throw new Error('Invalid car type');
            }

            // Position and movement
            this.x = x;
            this.y = y;
            this.angle = 0;
            this.velocity = 0;
            this.currentTurnRate = 0;
            this.inputTurnRate = 0;
            this.isAccelerating = false;

            // Car specifications
            this.maxSpeed = carType.maxSpeed || 200;
            this.acceleration = carType.acceleration || 150;
            this.deceleration = carType.deceleration || 300;
            this.turnSpeed = carType.turnSpeed || 2.5;
            this.color = carType.color || '#0052CC';

            // Collision
            this.width = 30;
            this.height = 20;

            // Racing data
            this.currentLap = 1;
            this.checkpointsHit = [];
            this.lapTimes = [];
            this.position = 1;
            this.lastValidPosition = {x, y, angle: 0};

            // Telemetry
            this.telemetry = {
                maxSpeedReached: 0,
                totalDistance: 0,
                totalRotation: 0,
                collisionCount: 0
            };

        } catch (error) {
            console.error('Error creating car:', error);
            // Return a default car
            this.x = 400;
            this.y = 300;
            this.initDefaults();
        }
    }

    initDefaults() {
        this.angle = 0;
        this.velocity = 0;
        this.currentTurnRate = 0;
        this.maxSpeed = 200;
        this.acceleration = 150;
        this.deceleration = 300;
        this.turnSpeed = 2.5;
        this.color = '#0052CC';
    }

    update(deltaTime, input) {
        try {
            // Validate deltaTime
            if (typeof deltaTime !== 'number' || isNaN(deltaTime) || deltaTime < 0) {
                console.warn('Invalid deltaTime:', deltaTime);
                return;
            }

            // Clamp deltaTime to prevent instability
            deltaTime = Math.min(deltaTime, 0.1);

            // Store last valid position
            this.lastValidPosition = {
                x: this.x,
                y: this.y,
                angle: this.angle
            };

            // Update physics
            this.updatePhysics(deltaTime, input);

            // Update telemetry
            this.updateTelemetry(deltaTime);

            // Validate position
            this.validatePosition();

        } catch (error) {
            console.error('Error updating car:', error);
            this.restoreLastValidPosition();
        }
    }

    updatePhysics(deltaTime, input) {
        // Apply momentum-based acceleration
        if (this.isAccelerating) {
            const accelerationForce = this.acceleration * 0.85;
            this.velocity += accelerationForce * deltaTime;

            // Approach max speed with curve
            const speedRatio = Math.min(this.velocity / this.maxSpeed, 1);
            const speedMultiplier = 1 - Math.pow(speedRatio, 2);
            this.velocity = Math.min(
                this.velocity * speedMultiplier + accelerationForce * deltaTime,
                this.maxSpeed
            );
        } else {
            // Natural deceleration with momentum
            this.velocity *= Math.pow(0.92, deltaTime * 60); // Frame-rate independent
            this.velocity = Math.max(this.velocity - this.deceleration * deltaTime, 0);
        }

        // Apply turning with inertia
        const targetTurnRate = this.inputTurnRate * this.turnSpeed;
        const turnAcceleration = (targetTurnRate - this.currentTurnRate) * 8.0;
        this.currentTurnRate += turnAcceleration * deltaTime;

        // Limit turn rate
        this.currentTurnRate = Math.max(-this.turnSpeed,
                                       Math.min(this.turnSpeed, this.currentTurnRate));

        // Update position with validation
        const dx = Math.cos(this.angle) * this.velocity * deltaTime;
        const dy = Math.sin(this.angle) * this.velocity * deltaTime;

        if (isFinite(dx) && isFinite(dy)) {
            this.x += dx;
            this.y += dy;
        }

        // Update angle
        if (this.velocity > 10) { // Only turn when moving
            const angleChange = this.currentTurnRate * deltaTime * (this.velocity / this.maxSpeed);
            if (isFinite(angleChange)) {
                this.angle += angleChange;
                // Normalize angle to 0-2π
                this.angle = ((this.angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            }
        }
    }

    validatePosition() {
        // Check bounds
        const maxX = 800;
        const maxY = 600;

        if (this.x < 0 || this.x > maxX || this.y < 0 || this.y > maxY) {
            console.warn('Car out of bounds:', this.x, this.y);
            this.x = Math.max(0, Math.min(maxX, this.x));
            this.y = Math.max(0, Math.min(maxY, this.y));
        }

        // Check for NaN
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.angle)) {
            console.error('Car position corrupted');
            this.restoreLastValidPosition();
        }
    }

    restoreLastValidPosition() {
        this.x = this.lastValidPosition.x;
        this.y = this.lastValidPosition.y;
        this.angle = this.lastValidPosition.angle;
        this.velocity = 0;
        this.currentTurnRate = 0;
    }

    updateTelemetry(deltaTime) {
        // Track max speed
        if (this.velocity > this.telemetry.maxSpeedReached) {
            this.telemetry.maxSpeedReached = this.velocity;
        }

        // Track distance
        this.telemetry.totalDistance += this.velocity * deltaTime;

        // Track rotation
        this.telemetry.totalRotation += Math.abs(this.currentTurnRate) * deltaTime;
    }

    render(ctx) {
        try {
            ctx.save();

            // Validate context
            if (!ctx || typeof ctx.translate !== 'function') {
                throw new Error('Invalid rendering context');
            }

            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Shadow
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';

            // Body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

            // Direction indicator
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.width/4, -2, this.width/4, 4);

            ctx.restore();

        } catch (error) {
            console.error('Error rendering car:', error);
            // Attempt basic recovery
            if (ctx) {
                ctx.restore();
            }
        }
    }

    getCorners() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const hw = this.width / 2;
        const hh = this.height / 2;

        return [
            { // Front left
                x: this.x + cos * hw - sin * hh,
                y: this.y + sin * hw + cos * hh
            },
            { // Front right
                x: this.x + cos * hw - sin * -hh,
                y: this.y + sin * hw + cos * -hh
            },
            { // Back right
                x: this.x + cos * -hw - sin * -hh,
                y: this.y + sin * -hw + cos * -hh
            },
            { // Back left
                x: this.x + cos * -hw - sin * hh,
                y: this.y + sin * -hw + cos * hh
            }
        ];
    }

    onCollision(other) {
        this.velocity *= 0.5;
        this.telemetry.collisionCount++;
    }
}
```

## 4. Phase 3: Track System

### 4.1 Track Tests (TDD)
**File: tests/unit/track.test.js**

```javascript
test.describe('Track System', () => {
    test.it('should load track data correctly', () => {
        const track = new Track(TRACK_DATA.oval);

        test.expect(track.name).toBe('Speedway Oval');
        test.expect(track.grid).toBeTruthy();
        test.expect(track.grid.length).toBe(15); // 15 rows
        test.expect(track.grid[0].length).toBe(20); // 20 columns
    });

    test.it('should detect on/off track correctly', () => {
        const track = new Track(TRACK_DATA.oval);

        // Test on-track position
        const onTrack = track.isPointOnTrack(200, 100); // Should be on track
        test.expect(onTrack).toBeTruthy();

        // Test off-track position
        const offTrack = track.isPointOnTrack(100, 100); // Should be grass
        test.expect(offTrack).toBe(false);
    });

    test.it('should handle invalid grid positions', () => {
        const track = new Track(TRACK_DATA.oval);

        // Test out of bounds
        test.expect(track.isPointOnTrack(-100, -100)).toBe(false);
        test.expect(track.isPointOnTrack(1000, 1000)).toBe(false);
    });
});
```

### 4.2 Track Implementation
**File: js/entities/track.js**

```javascript
class Track {
    constructor(trackData) {
        try {
            if (!trackData || typeof trackData !== 'object') {
                throw new Error('Invalid track data');
            }

            this.name = trackData.name || 'Unknown Track';
            this.backgroundColor = trackData.backgroundColor || '#4A5F3A';
            this.grid = this.validateGrid(trackData.grid);
            this.cellSize = 40;

            this.markers = trackData.markers || {};
            this.waypoints = this.processWaypoints(trackData.waypoints);

            // Pre-calculate track boundaries for performance
            this.boundaries = this.calculateBoundaries();

            // Track surface conditions
            this.surfaceConditions = {
                grip: 1.0,
                wetness: 0,
                temperature: 20
            };

        } catch (error) {
            console.error('Error creating track:', error);
            this.createDefaultTrack();
        }
    }

    validateGrid(grid) {
        if (!Array.isArray(grid) || grid.length === 0) {
            throw new Error('Invalid track grid');
        }

        const expectedRows = 15;
        const expectedCols = 20;

        if (grid.length !== expectedRows) {
            console.warn(`Track grid has ${grid.length} rows, expected ${expectedRows}`);
        }

        // Validate each row
        grid.forEach((row, index) => {
            if (!Array.isArray(row) || row.length !== expectedCols) {
                throw new Error(`Invalid row ${index} in track grid`);
            }
        });

        return grid;
    }

    processWaypoints(waypoints) {
        if (!Array.isArray(waypoints)) {
            return [];
        }

        return waypoints.map(wp => ({
            x: wp.col * this.cellSize + this.cellSize / 2,
            y: wp.row * this.cellSize + this.cellSize / 2,
            col: wp.col,
            row: wp.row
        }));
    }

    calculateBoundaries() {
        const boundaries = [];

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] !== 0) {
                    boundaries.push({
                        x: x * this.cellSize,
                        y: y * this.cellSize,
                        width: this.cellSize,
                        height: this.cellSize,
                        type: this.grid[y][x]
                    });
                }
            }
        }

        return boundaries;
    }

    isPointOnTrack(x, y) {
        try {
            // Quick bounds check
            if (x < 0 || y < 0 || x >= 800 || y >= 600) {
                return false;
            }

            const gridX = Math.floor(x / this.cellSize);
            const gridY = Math.floor(y / this.cellSize);

            // Check grid bounds
            if (gridY < 0 || gridY >= this.grid.length ||
                gridX < 0 || gridX >= this.grid[gridY].length) {
                return false;
            }

            return this.grid[gridY][gridX] !== 0;

        } catch (error) {
            console.error('Error checking track position:', error);
            return false;
        }
    }

    isCarOnTrack(car) {
        try {
            const corners = car.getCorners();

            // All corners must be on track
            for (const corner of corners) {
                if (!this.isPointOnTrack(corner.x, corner.y)) {
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('Error checking car on track:', error);
            return true; // Assume on track if error
        }
    }

    render(ctx) {
        try {
            // Clear with background color
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, 800, 600);

            // Render track pieces
            this.grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell !== 0) {
                        this.renderTrackPiece(ctx, cell, x * this.cellSize, y * this.cellSize);
                    }
                });
            });

            // Render track markings
            this.renderTrackMarkings(ctx);

            // Render debug info if enabled
            if (window.game && window.game.debugger && window.game.debugger.enabled) {
                this.renderDebugInfo(ctx);
            }

        } catch (error) {
            console.error('Error rendering track:', error);
            // Fallback to basic rendering
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, 800, 600);
        }
    }

    renderTrackPiece(ctx, type, x, y) {
        const pieces = {
            GRASS: 0,
            STRAIGHT_H: 1,
            STRAIGHT_V: 2,
            CORNER_NE: 3,
            CORNER_SE: 4,
            CORNER_SW: 5,
            CORNER_NW: 6,
            START_FINISH: 7,
            CHECKPOINT: 8
        };

        // Base asphalt
        ctx.fillStyle = '#2C2C2C';

        switch(type) {
            case pieces.STRAIGHT_H:
            case pieces.STRAIGHT_V:
            case pieces.START_FINISH:
            case pieces.CHECKPOINT:
                ctx.fillRect(x, y, this.cellSize, this.cellSize);
                break;

            case pieces.CORNER_NE: // └
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + this.cellSize, y);
                ctx.arc(x, y + this.cellSize, this.cellSize, -Math.PI/2, 0);
                ctx.closePath();
                ctx.fill();
                break;

            case pieces.CORNER_SE: // ┌
                ctx.beginPath();
                ctx.moveTo(x + this.cellSize, y + this.cellSize);
                ctx.lineTo(x + this.cellSize, y);
                ctx.arc(x, y, this.cellSize, 0, Math.PI/2);
                ctx.closePath();
                ctx.fill();
                break;

            case pieces.CORNER_SW: // ┐
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + this.cellSize);
                ctx.arc(x + this.cellSize, y, this.cellSize, Math.PI/2, Math.PI);
                ctx.closePath();
                ctx.fill();
                break;

            case pieces.CORNER_NW: // ┘
                ctx.beginPath();
                ctx.moveTo(x, y + this.cellSize);
                ctx.lineTo(x + this.cellSize, y + this.cellSize);
                ctx.arc(x + this.cellSize, y + this.cellSize, this.cellSize, Math.PI, -Math.PI/2);
                ctx.closePath();
                ctx.fill();
                break;
        }

        // Add white border lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Draw track edges based on surrounding cells
        this.drawTrackEdges(ctx, type, x, y);
    }

    drawTrackEdges(ctx, type, x, y) {
        // Simplified edge drawing - just outline the piece
        if (type !== 0) {
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        }
    }

    renderTrackMarkings(ctx) {
        // Start/finish line
        if (this.markers.startFinish) {
            const sf = this.markers.startFinish;
            const x = sf.col * this.cellSize;
            const y = sf.row * this.cellSize;

            // Checkered pattern
            const squareSize = 8;
            const numSquares = this.cellSize / squareSize;

            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < numSquares; i++) {
                for (let j = 0; j < numSquares; j++) {
                    if ((i + j) % 2 === 0) {
                        ctx.fillRect(x + i * squareSize, y + j * squareSize,
                                   squareSize, squareSize);
                    }
                }
            }
        }

        // Checkpoints
        if (this.markers.checkpoints) {
            ctx.setLineDash([10, 5]);
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 4;

            this.markers.checkpoints.forEach(checkpoint => {
                const x = checkpoint.col * this.cellSize;
                const y = checkpoint.row * this.cellSize;

                ctx.beginPath();
                if (checkpoint.orientation === 'vertical') {
                    ctx.moveTo(x + this.cellSize/2, y);
                    ctx.lineTo(x + this.cellSize/2, y + this.cellSize);
                } else {
                    ctx.moveTo(x, y + this.cellSize/2);
                    ctx.lineTo(x + this.cellSize, y + this.cellSize/2);
                }
                ctx.stroke();
            });

            ctx.setLineDash([]);
        }
    }

    renderDebugInfo(ctx) {
        // Render grid overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= 800; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }

        for (let y = 0; y <= 600; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }

        // Render waypoints
        if (this.waypoints) {
            ctx.fillStyle = '#FFD700';
            this.waypoints.forEach((wp, i) => {
                ctx.beginPath();
                ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText(i, wp.x + 8, wp.y);
            });
        }
    }
}
```

## 5. Phase 4: Collision System

### 5.1 Collision Tests (TDD)
**File: tests/unit/collision.test.js**

```javascript
test.describe('Collision System', () => {
    test.it('should detect car-to-car collisions', () => {
        const collision = new CollisionSystem();
        const car1 = new Car(100, 100, CAR_TYPES.balanced);
        const car2 = new Car(110, 100, CAR_TYPES.balanced);

        const result = collision.checkCarCollision(car1, car2);
        test.expect(result).toBeTruthy();
    });

    test.it('should not detect collision when cars are apart', () => {
        const collision = new CollisionSystem();
        const car1 = new Car(100, 100, CAR_TYPES.balanced);
        const car2 = new Car(200, 200, CAR_TYPES.balanced);

        const result = collision.checkCarCollision(car1, car2);
        test.expect(result).toBe(false);
    });

    test.it('should resolve collisions correctly', () => {
        const collision = new CollisionSystem();
        const car1 = new Car(100, 100, CAR_TYPES.balanced);
        const car2 = new Car(110, 100, CAR_TYPES.balanced);

        car1.velocity = 100;
        car2.velocity = 100;

        collision.resolveCollision(car1, car2);

        // Cars should be separated
        const distance = Math.sqrt(
            Math.pow(car2.x - car1.x, 2) +
            Math.pow(car2.y - car1.y, 2)
        );
        test.expect(distance).toBeGreaterThan(20);

        // Velocities should be reduced
        test.expect(car1.velocity).toBeLessThan(100);
        test.expect(car2.velocity).toBeLessThan(100);
    });
});
```

### 5.2 Collision System Implementation
**File: js/systems/collision.js**

```javascript
class CollisionSystem {
    constructor() {
        this.collisionPairs = new Set();
        this.spatialGrid = null;
        this.gridSize = 100; // Grid cell size for spatial partitioning

        // Collision statistics
        this.stats = {
            checksPerFrame: 0,
            collisionsPerFrame: 0,
            totalCollisions: 0
        };
    }

    update(cars, track) {
        try {
            this.stats.checksPerFrame = 0;
            this.stats.collisionsPerFrame = 0;

            // Build spatial grid for optimization
            this.buildSpatialGrid(cars);

            // Check car-to-car collisions
            this.checkCarCollisions(cars);

            // Check car-to-track collisions
            cars.forEach(car => {
                if (!track.isCarOnTrack(car)) {
                    this.handleOffTrack(car);
                }
            });

        } catch (error) {
            console.error('Error in collision system:', error);
        }
    }

    buildSpatialGrid(cars) {
        this.spatialGrid = {};

        cars.forEach(car => {
            const gridX = Math.floor(car.x / this.gridSize);
            const gridY = Math.floor(car.y / this.gridSize);
            const key = `${gridX},${gridY}`;

            if (!this.spatialGrid[key]) {
                this.spatialGrid[key] = [];
            }
            this.spatialGrid[key].push(car);
        });
    }

    getNearbyCars(car) {
        const nearby = [];
        const gridX = Math.floor(car.x / this.gridSize);
        const gridY = Math.floor(car.y / this.gridSize);

        // Check surrounding grid cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${gridX + dx},${gridY + dy}`;
                if (this.spatialGrid[key]) {
                    nearby.push(...this.spatialGrid[key]);
                }
            }
        }

        return nearby.filter(c => c !== car);
    }

    checkCarCollisions(cars) {
        const newCollisionPairs = new Set();

        cars.forEach(car1 => {
            const nearbyCars = this.getNearbyCars(car1);

            nearbyCars.forEach(car2 => {
                if (car1.id < car2.id) { // Avoid duplicate checks
                    this.stats.checksPerFrame++;

                    if (this.checkCarCollision(car1, car2)) {
                        const pairKey = `${car1.id}-${car2.id}`;
                        newCollisionPairs.add(pairKey);

                        // Only resolve if new collision
                        if (!this.collisionPairs.has(pairKey)) {
                            this.resolveCollision(car1, car2);
                            this.stats.collisionsPerFrame++;
                            this.stats.totalCollisions++;
                        }
                    }
                }
            });
        });

        this.collisionPairs = newCollisionPairs;
    }

    checkCarCollision(car1, car2) {
        try {
            // Simple AABB collision detection
            const dx = Math.abs(car1.x - car2.x);
            const dy = Math.abs(car1.y - car2.y);

            const combinedHalfWidths = (car1.width + car2.width) / 2;
            const combinedHalfHeights = (car1.height + car2.height) / 2;

            return dx < combinedHalfWidths && dy < combinedHalfHeights;

        } catch (error) {
            console.error('Error checking collision:', error);
            return false;
        }
    }

    resolveCollision(car1, car2) {
        try {
            // Calculate collision vector
            const dx = car2.x - car1.x;
            const dy = car2.y - car1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) {
                // Cars at exact same position - separate arbitrarily
                car1.x -= 1;
                car2.x += 1;
                return;
            }

            // Normalize collision vector
            const nx = dx / distance;
            const ny = dy / distance;

            // Minimum separation distance
            const minDistance = (car1.width + car2.width) / 2;
            const overlap = minDistance - distance;

            if (overlap > 0) {
                // Separate cars
                const separationX = nx * overlap * 0.5;
                const separationY = ny * overlap * 0.5;

                car1.x -= separationX;
                car1.y -= separationY;
                car2.x += separationX;
                car2.y += separationY;

                // Reduce velocities
                car1.velocity *= 0.5;
                car2.velocity *= 0.5;

                // Notify cars of collision
                car1.onCollision(car2);
                car2.onCollision(car1);

                // Add some randomness to prevent stuck states
                car1.angle += (Math.random() - 0.5) * 0.2;
                car2.angle += (Math.random() - 0.5) * 0.2;
            }

        } catch (error) {
            console.error('Error resolving collision:', error);
        }
    }

    handleOffTrack(car) {
        try {
            // Apply off-track penalties
            car.maxSpeed = CAR_TYPES.balanced.maxSpeed * 0.6;
            car.acceleration = CAR_TYPES.balanced.acceleration * 0.4;
            car.turnSpeed = CAR_TYPES.balanced.turnSpeed * 0.8;

            // Gradually slow down
            car.velocity *= 0.95;

        } catch (error) {
            console.error('Error handling off-track:', error);
        }
    }

    resetCarPhysics(car, carType) {
        // Reset physics when returning to track
        car.maxSpeed = carType.maxSpeed;
        car.acceleration = carType.acceleration;
        car.turnSpeed = carType.turnSpeed;
    }

    getDebugInfo() {
        return {
            spatialGridCells: Object.keys(this.spatialGrid || {}).length,
            activeCollisions: this.collisionPairs.size,
            checksPerFrame: this.stats.checksPerFrame,
            collisionsPerFrame: this.stats.collisionsPerFrame,
            totalCollisions: this.stats.totalCollisions
        };
    }
}
```

## 6. Phase 5: Input System

### 6.1 Input Tests (TDD)
**File: tests/unit/input.test.js**

```javascript
test.describe('Input System', () => {
    test.it('should register key presses', () => {
        const input = new InputManager();

        // Simulate key press
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(event);

        test.expect(input.isPressed('ArrowUp')).toBeTruthy();
    });

    test.it('should register key releases', () => {
        const input = new InputManager();

        // Press and release
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));

        test.expect(input.isPressed('ArrowUp')).toBe(false);
    });

    test.it('should track multiple keys', () => {
        const input = new InputManager();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

        test.expect(input.isPressed('ArrowUp')).toBeTruthy();
        test.expect(input.isPressed('ArrowLeft')).toBeTruthy();
    });

    test.it('should handle key aliases', () => {
        const input = new InputManager();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));

        const controls = input.getControls();
        test.expect(controls.accelerate).toBeTruthy();
    });
});
```

### 6.2 Input System Implementation
**File: js/systems/input.js**

```javascript
class InputManager {
    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.keyBindings = {
            // Primary controls
            'ArrowUp': 'accelerate',
            'ArrowDown': 'brake',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',

            // WASD controls
            'w': 'accelerate',
            'W': 'accelerate',
            's': 'brake',
            'S': 'brake',
            'a': 'left',
            'A': 'left',
            'd': 'right',
            'D': 'right',

            // Other controls
            'Enter': 'confirm',
            'Escape': 'pause',
            ' ': 'handbrake',
            'r': 'reset',
            'R': 'reset'
        };

        this.setupListeners();
        this.touchSupport = this.detectTouchSupport();

        // Input recording for replay
        this.recording = false;
        this.recordedInputs = [];
        this.replayIndex = 0;

        // Input statistics
        this.stats = {
            totalKeyPresses: 0,
            keyPressFrequency: {},
            lastInputTime: Date.now()
        };
    }

    setupListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
        window.addEventListener('keyup', this.handleKeyUp.bind(this), false);

        // Prevent default for game keys
        window.addEventListener('keydown', (e) => {
            if (this.keyBindings[e.key]) {
                e.preventDefault();
            }
        });

        // Handle window blur (release all keys)
        window.addEventListener('blur', this.releaseAllKeys.bind(this));

        // Touch events for future mobile support
        if (this.touchSupport) {
            this.setupTouchControls();
        }
    }

    handleKeyDown(event) {
        try {
            const action = this.keyBindings[event.key];
            if (action) {
                this.keys[action] = true;

                // Update statistics
                this.stats.totalKeyPresses++;
                this.stats.keyPressFrequency[action] =
                    (this.stats.keyPressFrequency[action] || 0) + 1;
                this.stats.lastInputTime = Date.now();

                // Record input if recording
                if (this.recording) {
                    this.recordedInputs.push({
                        time: Date.now(),
                        action: action,
                        type: 'down'
                    });
                }
            }
        } catch (error) {
            console.error('Error handling key down:', error);
        }
    }

    handleKeyUp(event) {
        try {
            const action = this.keyBindings[event.key];
            if (action) {
                this.keys[action] = false;

                // Record input if recording
                if (this.recording) {
                    this.recordedInputs.push({
                        time: Date.now(),
                        action: action,
                        type: 'up'
                    });
                }
            }
        } catch (error) {
            console.error('Error handling key up:', error);
        }
    }

    releaseAllKeys() {
        this.previousKeys = {...this.keys};
        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    isPressed(key) {
        // Support both action names and key names
        return this.keys[key] || this.keys[this.keyBindings[key]] || false;
    }

    wasJustPressed(key) {
        const action = this.keyBindings[key] || key;
        return this.keys[action] && !this.previousKeys[action];
    }

    wasJustReleased(key) {
        const action = this.keyBindings[key] || key;
        return !this.keys[action] && this.previousKeys[action];
    }

    getControls() {
        return {
            accelerate: this.keys.accelerate || false,
            brake: this.keys.brake || false,
            left: this.keys.left || false,
            right: this.keys.right || false,
            handbrake: this.keys.handbrake || false,
            pause: this.keys.pause || false,
            confirm: this.keys.confirm || false,
            reset: this.keys.reset || false
        };
    }

    update() {
        // Store previous state for edge detection
        this.previousKeys = {...this.keys};
    }

    // Touch control support
    detectTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    setupTouchControls() {
        // Virtual joystick for future mobile support
        console.log('Touch controls detected but not implemented in desktop version');
    }

    // Input recording for replay system
    startRecording() {
        this.recording = true;
        this.recordedInputs = [];
        console.log('Started input recording');
    }

    stopRecording() {
        this.recording = false;
        console.log(`Stopped input recording. ${this.recordedInputs.length} inputs recorded`);
        return this.recordedInputs;
    }

    startReplay(recordedInputs) {
        this.recordedInputs = recordedInputs;
        this.replayIndex = 0;
        console.log('Started input replay');
    }

    getReplayControls(currentTime) {
        if (this.replayIndex >= this.recordedInputs.length) {
            return this.getControls();
        }

        // Apply recorded inputs at the right time
        while (this.replayIndex < this.recordedInputs.length &&
               this.recordedInputs[this.replayIndex].time <= currentTime) {
            const input = this.recordedInputs[this.replayIndex];
            this.keys[input.action] = input.type === 'down';
            this.replayIndex++;
        }

        return this.getControls();
    }

    // Debug info
    getDebugInfo() {
        return {
            activeKeys: Object.keys(this.keys).filter(k => this.keys[k]),
            totalKeyPresses: this.stats.totalKeyPresses,
            mostUsedKey: this.getMostUsedKey(),
            timeSinceLastInput: Date.now() - this.stats.lastInputTime
        };
    }

    getMostUsedKey() {
        let maxKey = '';
        let maxCount = 0;

        for (let key in this.stats.keyPressFrequency) {
            if (this.stats.keyPressFrequency[key] > maxCount) {
                maxCount = this.stats.keyPressFrequency[key];
                maxKey = key;
            }
        }

        return `${maxKey} (${maxCount})`;
    }
}
```

## 7. Phase 6: AI System

### 7.1 AI Tests (TDD)
**File: tests/unit/ai.test.js**

```javascript
test.describe('AI Controller', () => {
    test.it('should follow waypoints', () => {
        const car = new Car(100, 100, CAR_TYPES.balanced);
        const track = new Track(TRACK_DATA.oval);
        const ai = new AIController(car, track, 'medium');

        // Should target first waypoint
        const target = ai.getTargetWaypoint();
        test.expect(target).toBeTruthy();
        test.expect(target.x).toBeGreaterThan(0);
    });

    test.it('should calculate steering correctly', () => {
        const car = new Car(100, 100, CAR_TYPES.balanced);
        car.angle = 0; // Facing right

        const track = new Track(TRACK_DATA.oval);
        const ai = new AIController(car, track, 'medium');

        // Target ahead and to the right
        const controls = ai.calculateControls({x: 200, y: 150});

        test.expect(controls.accelerate).toBeTruthy();
        test.expect(controls.right).toBeTruthy();
        test.expect(controls.left).toBe(false);
    });

    test.it('should respect difficulty settings', () => {
        const car = new Car(100, 100, CAR_TYPES.balanced);
        const track = new Track(TRACK_DATA.oval);

        const easyAI = new AIController(car, track, 'easy');
        const hardAI = new AIController(car, track, 'hard');

        test.expect(easyAI.speedModifier).toBeLessThan(hardAI.speedModifier);
        test.expect(easyAI.reactionTime).toBeGreaterThan(hardAI.reactionTime);
    });
});
```

### 7.2 AI Implementation
**File: js/entities/aiController.js**

```javascript
class AIController {
    constructor(car, track, difficulty = 'medium') {
        try {
            this.car = car;
            this.track = track;
            this.difficulty = difficulty;

            // Waypoint navigation
            this.currentWaypointIndex = 0;
            this.targetWaypoint = null;
            this.waypointRadius = 30;

            // Difficulty settings
            const difficultySettings = {
                easy: {
                    speedModifier: 0.8,
                    reactionTime: 0.3,
                    precision: 40,
                    mistakeChance: 0.05,
                    lookAhead: 1
                },
                medium: {
                    speedModifier: 0.9,
                    reactionTime: 0.2,
                    precision: 25,
                    mistakeChance: 0.02,
                    lookAhead: 2
                },
                hard: {
                    speedModifier: 0.95,
                    reactionTime: 0.1,
                    precision: 15,
                    mistakeChance: 0.01,
                    lookAhead: 3
                }
            };

            const settings = difficultySettings[difficulty] || difficultySettings.medium;
            Object.assign(this, settings);

            // AI state
            this.lastUpdateTime = 0;
            this.currentMistake = null;
            this.avoidanceTarget = null;

            // Telemetry
            this.telemetry = {
                waypointsHit: 0,
                totalDistance: 0,
                mistakeCount: 0,
                avgSpeed: 0
            };

        } catch (error) {
            console.error('Error creating AI controller:', error);
        }
    }

    update(deltaTime, otherCars) {
        try {
            // Update reaction time
            this.lastUpdateTime += deltaTime;

            if (this.lastUpdateTime < this.reactionTime) {
                return; // Still reacting
            }

            this.lastUpdateTime = 0;

            // Check for mistakes
            if (this.currentMistake) {
                this.handleMistake(deltaTime);
                return;
            }

            // Random mistake chance
            if (Math.random() < this.mistakeChance * deltaTime) {
                this.triggerMistake();
            }

            // Collision avoidance
            const avoidance = this.checkCollisionAvoidance(otherCars);
            if (avoidance) {
                this.avoidanceTarget = avoidance;
            }

            // Get target (avoidance or waypoint)
            const target = this.avoidanceTarget || this.getTargetWaypoint();

            if (target) {
                const controls = this.calculateControls(target);
                this.applyControls(controls);
            }

            // Update telemetry
            this.updateTelemetry(deltaTime);

        } catch (error) {
            console.error('Error updating AI:', error);
            // Fallback to simple forward movement
            this.car.isAccelerating = true;
        }
    }

    getTargetWaypoint() {
        if (!this.track.waypoints || this.track.waypoints.length === 0) {
            console.warn('No waypoints available');
            return null;
        }

        const currentWP = this.track.waypoints[this.currentWaypointIndex];

        // Check if reached current waypoint
        const dist = this.distance(this.car.x, this.car.y, currentWP.x, currentWP.y);
        if (dist < this.waypointRadius) {
            this.currentWaypointIndex =
                (this.currentWaypointIndex + 1) % this.track.waypoints.length;
            this.telemetry.waypointsHit++;
        }

        // Look ahead based on difficulty
        let targetIndex = this.currentWaypointIndex;
        for (let i = 0; i < this.lookAhead; i++) {
            targetIndex = (targetIndex + 1) % this.track.waypoints.length;
        }

        this.targetWaypoint = this.track.waypoints[targetIndex];

        // Add some randomness based on precision
        const randomOffset = (Math.random() - 0.5) * this.precision;
        return {
            x: this.targetWaypoint.x + randomOffset,
            y: this.targetWaypoint.y + randomOffset
        };
    }

    calculateControls(target) {
        const controls = {
            accelerate: false,
            brake: false,
            left: false,
            right: false
        };

        // Calculate angle to target
        const dx = target.x - this.car.x;
        const dy = target.y - this.car.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetAngle = Math.atan2(dy, dx);

        // Calculate angle difference
        let angleDiff = targetAngle - this.car.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Steering
        const steerThreshold = 0.1;
        if (angleDiff < -steerThreshold) {
            controls.left = true;
        } else if (angleDiff > steerThreshold) {
            controls.right = true;
        }

        // Speed control
        const cornerAngle = Math.abs(angleDiff);
        const speedFactor = 1 - (cornerAngle / Math.PI);
        const targetSpeed = this.car.maxSpeed * this.speedModifier * speedFactor;

        if (this.car.velocity < targetSpeed) {
            controls.accelerate = true;
        } else if (this.car.velocity > targetSpeed * 1.1) {
            controls.brake = true;
        }

        // Look ahead for sharp turns
        const nextWaypoint = this.getNextWaypoint();
        if (nextWaypoint) {
            const nextAngle = Math.atan2(
                nextWaypoint.y - target.y,
                nextWaypoint.x - target.x
            );
            const turnAngle = Math.abs(nextAngle - targetAngle);

            if (turnAngle > Math.PI / 3) { // Sharp turn ahead
                controls.brake = true;
                controls.accelerate = false;
            }
        }

        return controls;
    }

    applyControls(controls) {
        this.car.isAccelerating = controls.accelerate;
        this.car.inputTurnRate = 0;

        if (controls.left) {
            this.car.inputTurnRate = -1;
        } else if (controls.right) {
            this.car.inputTurnRate = 1;
        }

        // Apply speed modifier
        const originalMaxSpeed = this.car.maxSpeed;
        this.car.maxSpeed *= this.speedModifier;

        // Restore after update
        setTimeout(() => {
            this.car.maxSpeed = originalMaxSpeed;
        }, 0);
    }

    checkCollisionAvoidance(otherCars) {
        const avoidanceDistance = 60;
        const avoidanceAngle = Math.PI / 4;

        for (let other of otherCars) {
            if (other === this.car) continue;

            const dx = other.x - this.car.x;
            const dy = other.y - this.car.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < avoidanceDistance) {
                // Check if other car is in front
                const angleToOther = Math.atan2(dy, dx);
                let angleDiff = angleToOther - this.car.angle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                if (Math.abs(angleDiff) < avoidanceAngle) {
                    // Calculate avoidance direction
                    const avoidLeft = angleDiff > 0;
                    const avoidAngle = this.car.angle + (avoidLeft ? -Math.PI/2 : Math.PI/2);

                    return {
                        x: this.car.x + Math.cos(avoidAngle) * avoidanceDistance,
                        y: this.car.y + Math.sin(avoidAngle) * avoidanceDistance
                    };
                }
            }
        }

        this.avoidanceTarget = null;
        return null;
    }

    triggerMistake() {
        const mistakes = [
            { type: 'brake_late', duration: 0.5 },
            { type: 'turn_wide', duration: 0.8 },
            { type: 'overcorrect', duration: 1.0 }
        ];

        this.currentMistake = mistakes[Math.floor(Math.random() * mistakes.length)];
        this.currentMistake.startTime = 0;
        this.telemetry.mistakeCount++;
    }

    handleMistake(deltaTime) {
        this.currentMistake.startTime += deltaTime;

        switch (this.currentMistake.type) {
            case 'brake_late':
                this.car.isAccelerating = false;
                this.car.velocity *= 0.9;
                break;

            case 'turn_wide':
                this.car.inputTurnRate *= 0.5;
                break;

            case 'overcorrect':
                this.car.inputTurnRate *= -1.5;
                break;
        }

        if (this.currentMistake.startTime >= this.currentMistake.duration) {
            this.currentMistake = null;
        }
    }

    getNextWaypoint() {
        const nextIndex = (this.currentWaypointIndex + 1) % this.track.waypoints.length;
        return this.track.waypoints[nextIndex];
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    updateTelemetry(deltaTime) {
        this.telemetry.totalDistance += this.car.velocity * deltaTime;

        // Calculate average speed
        const samples = 60;
        if (!this.speedSamples) {
            this.speedSamples = [];
        }

        this.speedSamples.push(this.car.velocity);
        if (this.speedSamples.length > samples) {
            this.speedSamples.shift();
        }

        const sum = this.speedSamples.reduce((a, b) => a + b, 0);
        this.telemetry.avgSpeed = sum / this.speedSamples.length;
    }

    getDebugInfo() {
        return {
            waypoint: `${this.currentWaypointIndex}/${this.track.waypoints.length}`,
            targetDistance: this.targetWaypoint ?
                this.distance(this.car.x, this.car.y, this.targetWaypoint.x, this.targetWaypoint.y).toFixed(0) : 'N/A',
            speedModifier: this.speedModifier,
            currentMistake: this.currentMistake ? this.currentMistake.type : 'None',
            avgSpeed: this.telemetry.avgSpeed.toFixed(0),
            waypointsHit: this.telemetry.waypointsHit
        };
    }
}
```

## 8. Performance Monitoring

### 8.1 Performance Monitor Implementation
**File: js/systems/performance.js**

```javascript
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameTime = 0;
        this.updateTime = 0;
        this.renderTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Performance history
        this.fpsHistory = new Array(60).fill(0);
        this.frameTimeHistory = new Array(60).fill(0);

        // Performance thresholds
        this.thresholds = {
            criticalFPS: 30,
            warningFPS: 45,
            targetFPS: 60
        };

        // Frame timing
        this.frameStart = 0;
        this.updateStart = 0;

        // Draw call tracking
        this.drawCalls = 0;
        this.lastDrawCallReset = 0;

        // Memory tracking
        this.lastMemoryCheck = 0;
        this.memoryData = {
            used: 0,
            total: 0,
            limit: 50 * 1024 * 1024 // 50MB warning threshold
        };
    }

    beginFrame() {
        this.frameStart = performance.now();
        this.drawCalls = 0;
    }

    beginUpdate() {
        this.updateStart = performance.now();
    }

    endUpdate() {
        this.updateTime = performance.now() - this.updateStart;
    }

    endFrame() {
        const now = performance.now();
        this.frameTime = now - this.frameStart;
        this.renderTime = this.frameTime - this.updateTime;

        // Update FPS
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            // Update history
            this.fpsHistory.shift();
            this.fpsHistory.push(this.fps);
            this.frameTimeHistory.shift();
            this.frameTimeHistory.push(this.frameTime);

            // Check performance
            this.checkPerformance();
        }

        // Check memory periodically
        if (now - this.lastMemoryCheck > 5000) {
            this.checkMemory();
            this.lastMemoryCheck = now;
        }
    }

    incrementDrawCalls() {
        this.drawCalls++;
    }

    checkPerformance() {
        if (this.fps < this.thresholds.criticalFPS) {
            console.error(`Critical performance: ${this.fps} FPS`);
            this.suggestOptimizations();
        } else if (this.fps < this.thresholds.warningFPS) {
            console.warn(`Performance warning: ${this.fps} FPS`);
        }
    }

    checkMemory() {
        if (performance.memory) {
            this.memoryData.used = performance.memory.usedJSHeapSize;
            this.memoryData.total = performance.memory.totalJSHeapSize;

            if (this.memoryData.used > this.memoryData.limit) {
                console.warn(`High memory usage: ${(this.memoryData.used / 1024 / 1024).toFixed(2)}MB`);
            }
        }
    }

    suggestOptimizations() {
        const suggestions = [];

        if (this.drawCalls > 100) {
            suggestions.push('Reduce draw calls by batching operations');
        }

        if (this.updateTime > 8) {
            suggestions.push('Optimize update logic - taking ' + this.updateTime.toFixed(2) + 'ms');
        }

        if (this.renderTime > 8) {
            suggestions.push('Optimize rendering - taking ' + this.renderTime.toFixed(2) + 'ms');
        }

        if (suggestions.length > 0) {
            console.log('Performance suggestions:', suggestions);
        }
    }

    getStats() {
        return {
            fps: this.fps,
            frameTime: this.frameTime.toFixed(2),
            updateTime: this.updateTime.toFixed(2),
            renderTime: this.renderTime.toFixed(2),
            drawCalls: this.drawCalls,
            avgFPS: this.getAverageFPS(),
            minFPS: Math.min(...this.fpsHistory),
            maxFPS: Math.max(...this.fpsHistory),
            memory: this.memoryData
        };
    }

    getAverageFPS() {
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return (sum / this.fpsHistory.length).toFixed(1);
    }

    reset() {
        this.frameCount = 0;
        this.fps = 0;
        this.fpsHistory.fill(0);
        this.frameTimeHistory.fill(0);
    }
}
```

## 9. Integration Tests

### 9.1 Full Race Test
**File: tests/integration/race.test.js**

```javascript
test.describe('Full Race Integration', () => {
    test.it('should complete a full race without errors', () => {
        // Setup
        const canvas = document.getElementById('testCanvas');
        const game = new Game(canvas);

        // Initialize race
        game.initRace({
            track: 'oval',
            playerCar: 'balanced',
            difficulty: 'medium'
        });

        // Simulate 3 laps
        const updates = 3 * 60 * 60; // 3 minutes at 60 FPS

        for (let i = 0; i < updates; i++) {
            // Simulate input
            if (i % 120 === 0) { // Turn every 2 seconds
                game.input.keys.left = true;
            } else {
                game.input.keys.left = false;
            }
            game.input.keys.accelerate = true;

            // Update
            game.update(1/60);

            // Check for errors
            test.expect(game.errorHandler.criticalError).toBe(false);
        }

        // Verify race completed
        test.expect(game.raceManager.raceState).toBe('FINISHED');
    });

    test.it('should handle edge cases gracefully', () => {
        const game = new Game(document.getElementById('testCanvas'));

        // Test null states
        game.cars = null;
        game.update(1/60);
        test.expect(game.errorHandler.criticalError).toBe(false);

        // Test extreme timesteps
        game.update(1000); // 1 second timestep
        test.expect(game.accumulator).toBeLessThan(1);

        // Test missing track
        game.track = null;
        game.render();
        test.expect(game.errorHandler.criticalError).toBe(false);
    });
});
```

## 10. Debugging and Testing Guide

### 10.1 Common Debug Commands
```javascript
// In browser console:
gameDebug.enable()           // Enable debug overlay
gameDebug.pause()           // Pause game
gameDebug.state()           // Capture current state
gameDebug.spawn()           // Spawn test car
gameDebug.teleport(x, y)    // Teleport player
gameDebug.speed(300)        // Set player speed
gameDebug.win()             // Force win
gameDebug.errors()          // Show error report
gameDebug.fps               // Get current FPS

// Advanced debugging
game.debugger.showConsole() // Show debug console (F2)
game.debugger.panels.physics = true // Enable physics visualization
game.debugger.captureState() // Copy state to clipboard
```

### 10.2 Performance Testing
```javascript
// Run performance test
function runPerfTest() {
    const startTime = performance.now();
    let frames = 0;

    function frame() {
        game.update(1/60);
        game.render();
        frames++;

        if (performance.now() - startTime < 10000) { // 10 seconds
            requestAnimationFrame(frame);
        } else {
            const avgFPS = frames / 10;
            console.log(`Average FPS: ${avgFPS}`);
            console.log(`Performance stats:`, game.performanceMonitor.getStats());
        }
    }

    frame();
}
```

### 10.3 Error Recovery Testing
```javascript
// Test error recovery
function testErrorRecovery() {
    // Force various errors
    const tests = [
        () => game.cars.push(null),
        () => game.track = null,
        () => game.update('invalid'),
        () => game.render(null),
        () => { throw new Error('Test error'); }
    ];

    tests.forEach((test, i) => {
        try {
            test();
            game.update(1/60);
            console.log(`Test ${i}: Recovered successfully`);
        } catch (e) {
            console.log(`Test ${i}: Failed to recover`, e);
        }
    });

    console.log('Error report:', game.errorHandler.getErrorReport());
}
```

## 11. Deployment Checklist

### Pre-deployment Tasks
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Test on all target browsers
- [ ] Profile performance (maintain 60 FPS)
- [ ] Check memory leaks (stable over 10 min)
- [ ] Disable debug mode
- [ ] Remove console.log statements
- [ ] Minify JavaScript
- [ ] Test error recovery
- [ ] Verify localStorage works
- [ ] Test all input methods
- [ ] Play complete race on each track
- [ ] Test pause/resume functionality
- [ ] Verify AI difficulty levels
- [ ] Check collision detection
- [ ] Test all UI states

### Browser Testing Matrix
| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | ✓ | Primary target |
| Firefox | Latest | ✓ | Test WebGL fallback |
| Safari | Latest | ✓ | Test on macOS |
| Edge | Latest | ✓ | Test on Windows |

## 12. Future Enhancements

### Phase 2 Features
- Sound system integration
- Ghost car for time trials
- Track records leaderboard
- More car types
- Additional tracks
- Weather effects

### Phase 3 Features
- Multiplayer support
- Track editor
- Car customization
- Championship mode
- Replay system
- Mobile support

---
*This Implementation Guide provides a comprehensive roadmap for building the RC Car Racing Game with a focus on test-driven development, error handling, and debugging tools to support Claude Code.*