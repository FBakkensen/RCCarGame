# RC Car Racing Game - Asset Specification Document

## 1. Visual Design Philosophy

### Core Principles
- **Minimalist Flat Design**: Clean geometric shapes with no textures or gradients
- **High Contrast**: Ensure gameplay clarity and accessibility
- **Performance First**: Simple shapes optimized for Canvas rendering
- **Consistent Style**: Unified visual language across all assets

### Technical Constraints
- All assets must be representable as Canvas drawing commands
- No external image files - everything generated programmatically
- Prioritize mathematical precision over organic shapes
- Colors defined in hex format for consistency

## 2. Color Palette

### Primary Colors
```javascript
const COLOR_PALETTE = {
    // Track Environment Colors
    tracks: {
        grass: "#4A5F3A",           // Realistic grass green
        asphalt: "#2C2C2C",         // Dark asphalt
        asphaltWorn: "#3A3A3A",     // Worn track sections
        trackBorder: "#FFFFFF",      // White track borders
        centerLine: "#F5F5F5",      // Off-white dashed line
        startFinish: "#CC0000",     // Racing red start/finish
        checkpoint: "#FF6600",      // Safety orange checkpoints
        kerbs: ["#CC0000", "#FFFFFF"] // Red/white alternating
    },

    // Car Colors - Realistic automotive paints
    cars: {
        playerBalanced: "#0052CC",  // Racing blue
        playerSpeed: "#CC0000",     // Racing red
        ai1: "#F5F5F5",            // Pearl white
        ai2: "#1A1A1A",            // Carbon black
        ai3: "#006633",            // British racing green
        carOutline: "#1A1A1A",     // Black outline
        chrome: "#C0C0C0",         // Chrome details
        rubber: "#1A1A1A",         // Tire color
        windshield: "rgba(30, 30, 30, 0.7)" // Dark tinted glass
    },

    // UI Colors
    ui: {
        background: "#1A1A1A",      // Dark background
        backgroundAlpha: "rgba(26, 26, 26, 0.9)",
        text: "#FFFFFF",           // White text
        textSecondary: "#B0B0B0",  // Gray secondary text
        buttonPrimary: "#0052CC",   // Racing blue
        buttonHover: "#003D99",     // Darker blue
        buttonDisabled: "#4A4A4A",  // Dark gray
        success: "#009933",         // Racing green
        warning: "#FF6600",         // Orange
        danger: "#CC0000"          // Racing red
    },

    // Effect Colors
    effects: {
        tireMarks: "rgba(26, 26, 26, 0.6)",    // Dark rubber marks
        smokeDust: "rgba(160, 160, 160, 0.4)",  // Gray smoke/dust
        mudDust: "rgba(74, 95, 58, 0.5)",       // Brownish-green dust
        sparks: ["#FFD700", "#FFA500", "#FFFFFF"], // Yellow/orange/white sparks
        confetti: ["#CC0000", "#0052CC", "#FFFFFF", "#FFD700"] // Victory colors
    }
};
```

## 3. Car Specifications

### 3.1 Dimensions and Structure
```javascript
const CAR_ASSET_SPECS = {
    // Base dimensions (pixels)
    dimensions: {
        width: 30,
        height: 20,
        wheelWidth: 4,
        wheelHeight: 6,
        cornerRadius: 2
    },

    // Visual components
    components: {
        body: {
            type: "roundedRect",
            width: 30,
            height: 20,
            cornerRadius: 2,
            fillColor: "carColor",  // Dynamic based on car type
            strokeColor: COLOR_PALETTE.cars.carOutline,
            strokeWidth: 1
        },

        // Four wheels
        wheels: [
            {x: -10, y: -8, width: 4, height: 6},  // Front left
            {x: 10, y: -8, width: 4, height: 6},   // Front right
            {x: -10, y: 8, width: 4, height: 6},   // Rear left
            {x: 10, y: 8, width: 4, height: 6}     // Rear right
        ],

        // Racing stripes
        stripes: {
            type: "doubleStripe",
            width: 2,
            gap: 2,
            length: 24,
            color: "#FFFFFF",
            opacity: 0.8
        },

        // Car number
        number: {
            font: "bold 10px Arial",
            color: "#FFFFFF",
            background: "#1A1A1A",
            padding: 2,
            position: {x: 0, y: 0}  // Center
        },

        // Windshield and windows
        glass: {
            windshield: {
                type: "trapezoid",
                x: 6,
                y: -6,
                topWidth: 6,
                bottomWidth: 10,
                height: 12,
                fillColor: COLOR_PALETTE.cars.windshield
            },

            rearWindow: {
                type: "rect",
                x: -8,
                y: -4,
                width: 4,
                height: 8,
                fillColor: COLOR_PALETTE.cars.windshield
            }
        },

        // Front lights
        headlights: [
            {x: 13, y: -5, radius: 1.5, color: "#FFFFCC"},
            {x: 13, y: 5, radius: 1.5, color: "#FFFFCC"}
        ],

        // Rear lights
        taillights: [
            {x: -14, y: -5, radius: 1, color: "#CC0000"},
            {x: -14, y: 5, radius: 1, color: "#CC0000"}
        ]
    },

    // Shadow for depth
    shadow: {
        offsetX: 1,
        offsetY: 1,
        blur: 2,
        color: "rgba(0, 0, 0, 0.3)"
    }
};
```

### 3.2 Car Rendering Function
```javascript
// Enhanced car rendering with details
function renderCar(ctx, x, y, angle, carColor, carNumber) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shadow
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";

    // Wheels (drawn first, partially hidden by body)
    ctx.fillStyle = COLOR_PALETTE.cars.rubber;
    CAR_ASSET_SPECS.components.wheels.forEach(wheel => {
        ctx.fillRect(wheel.x - wheel.width/2, wheel.y - wheel.height/2,
                     wheel.width, wheel.height);
    });

    // Body
    ctx.fillStyle = carColor;
    ctx.strokeStyle = COLOR_PALETTE.cars.carOutline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-15, -10, 30, 20, 2);
    ctx.fill();
    ctx.stroke();

    // Reset shadow for details
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    // Racing stripes
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(-1, -12, 2, 24);
    ctx.fillRect(3, -12, 2, 24);

    // Windshield
    ctx.fillStyle = COLOR_PALETTE.cars.windshield;
    ctx.beginPath();
    ctx.moveTo(6, -3);
    ctx.lineTo(8, -6);
    ctx.lineTo(11, -6);
    ctx.lineTo(13, -3);
    ctx.lineTo(13, 3);
    ctx.lineTo(11, 6);
    ctx.lineTo(8, 6);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();

    // Rear window
    ctx.fillRect(-10, -4, 4, 8);

    // Headlights
    ctx.fillStyle = "#FFFFCC";
    ctx.beginPath();
    ctx.arc(13, -5, 1.5, 0, Math.PI * 2);
    ctx.arc(13, 5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Taillights
    ctx.fillStyle = "#CC0000";
    ctx.beginPath();
    ctx.arc(-14, -5, 1, 0, Math.PI * 2);
    ctx.arc(-14, 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Car number
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(-5, -3, 10, 6);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(carNumber, 0, 0);

    ctx.restore();
}
```

## 4. Track Specifications

### 4.1 Track Grid System
```javascript
const TRACK_GRID_SPECS = {
    // Canvas divided into grid
    grid: {
        cols: 20,           // 20 columns
        rows: 15,           // 15 rows
        cellSize: 40,       // 40x40 pixels per cell
        canvasWidth: 800,   // 20 * 40
        canvasHeight: 600   // 15 * 40
    },

    // Track properties
    track: {
        width: 2,           // 2 grid cells wide (80px)
        borderWidth: 4,     // Border line width in pixels
        centerLineWidth: 2, // Center dashed line width
        centerLineDash: [10, 10] // Dash pattern
    },

    // Track piece types
    pieces: {
        GRASS: 0,
        STRAIGHT_H: 1,      // Horizontal straight
        STRAIGHT_V: 2,      // Vertical straight
        CORNER_NE: 3,       // Northeast corner (└)
        CORNER_SE: 4,       // Southeast corner (┌)
        CORNER_SW: 5,       // Southwest corner (┐)
        CORNER_NW: 6,       // Northwest corner (┘)
        START_FINISH: 7,    // Start/finish line
        CHECKPOINT: 8       // Checkpoint marker
    }
};
```

### 4.2 Track Layouts Using Grid

#### Oval Track (Grid Layout)
```javascript
const OVAL_TRACK_GRID = {
    name: "Speedway Oval",
    backgroundColor: COLOR_PALETTE.tracks.grass,
    startPosition: {col: 5, row: 2, direction: "right"},

    // 20x15 grid layout (0 = grass, numbers = track pieces)
    layout: [
        //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
        [ 0, 0, 0, 0, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0], // 1
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 2
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 3
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 4
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 5
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 6
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 7
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 8
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 9
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 10
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 11
        [ 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // 12
        [ 0, 0, 0, 0, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 0, 0, 0, 0], // 13
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // 14
    ],

    // Special markers (grid coordinates)
    markers: {
        startFinish: {col: 7, row: 1, orientation: "vertical"},
        checkpoints: [
            {col: 15, row: 7, orientation: "horizontal"},
            {col: 7, row: 13, orientation: "vertical"},
            {col: 4, row: 7, orientation: "horizontal"}
        ]
    },

    // AI waypoints (center of track pieces)
    waypoints: [
        {col: 6, row: 1},   {col: 10, row: 1},  {col: 14, row: 1},
        {col: 15, row: 3},  {col: 15, row: 7},  {col: 15, row: 11},
        {col: 14, row: 13}, {col: 10, row: 13}, {col: 6, row: 13},
        {col: 4, row: 11},  {col: 4, row: 7},   {col: 4, row: 3}
    ]
};
```

#### Rectangle Track with Chicanes (Grid Layout)
```javascript
const CITY_CIRCUIT_GRID = {
    name: "City Circuit",
    backgroundColor: COLOR_PALETTE.tracks.grass,
    startPosition: {col: 2, row: 2, direction: "right"},

    layout: [
        // Simplified representation with chicanes
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 6, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 6, 1, 1, 1, 1, 3, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 5, 1, 1, 3, 6, 1, 4, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 6, 1, 1, 4, 5, 1, 3, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0],
        [ 0, 5, 1, 1, 1, 1, 4, 0, 0, 0, 0, 0, 5, 1, 1, 1, 1, 4, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
};
```

### 4.3 Track Rendering System
```javascript
// Render track from grid
function renderTrackFromGrid(ctx, trackGrid) {
    const cellSize = TRACK_GRID_SPECS.grid.cellSize;

    // First pass: Draw grass background
    ctx.fillStyle = trackGrid.backgroundColor;
    ctx.fillRect(0, 0, 800, 600);

    // Second pass: Draw track pieces
    trackGrid.layout.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell !== 0) {
                const xPos = x * cellSize;
                const yPos = y * cellSize;
                renderTrackPiece(ctx, cell, xPos, yPos, cellSize);
            }
        });
    });

    // Third pass: Draw track markings
    renderTrackMarkings(ctx, trackGrid);

    // Fourth pass: Draw kerbs on corners
    renderKerbs(ctx, trackGrid);
}

// Render individual track piece
function renderTrackPiece(ctx, pieceType, x, y, size) {
    const pieces = TRACK_GRID_SPECS.pieces;

    // Base asphalt
    ctx.fillStyle = COLOR_PALETTE.tracks.asphalt;

    switch(pieceType) {
        case pieces.STRAIGHT_H:
        case pieces.STRAIGHT_V:
        case pieces.START_FINISH:
        case pieces.CHECKPOINT:
            ctx.fillRect(x, y, size, size);
            break;

        case pieces.CORNER_NE: // └
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.arc(x, y + size, size, -Math.PI/2, 0);
            ctx.closePath();
            ctx.fill();
            break;

        case pieces.CORNER_SE: // ┌
            ctx.beginPath();
            ctx.moveTo(x + size, y + size);
            ctx.lineTo(x + size, y);
            ctx.arc(x, y, size, 0, Math.PI/2);
            ctx.closePath();
            ctx.fill();
            break;

        case pieces.CORNER_SW: // ┐
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + size);
            ctx.arc(x + size, y, size, Math.PI/2, Math.PI);
            ctx.closePath();
            ctx.fill();
            break;

        case pieces.CORNER_NW: // ┘
            ctx.beginPath();
            ctx.moveTo(x, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.arc(x + size, y + size, size, Math.PI, -Math.PI/2);
            ctx.closePath();
            ctx.fill();
            break;
    }

    // Add white border lines
    ctx.strokeStyle = COLOR_PALETTE.tracks.trackBorder;
    ctx.lineWidth = TRACK_GRID_SPECS.track.borderWidth;

    // Draw appropriate borders based on piece type
    drawTrackBorders(ctx, pieceType, x, y, size);
}

// Draw kerbs on corner pieces
function renderKerbs(ctx, trackGrid) {
    const cellSize = TRACK_GRID_SPECS.grid.cellSize;
    const kerbWidth = 8;
    const kerbPattern = COLOR_PALETTE.tracks.kerbs;

    trackGrid.layout.forEach((row, y) => {
        row.forEach((cell, x) => {
            const pieces = TRACK_GRID_SPECS.pieces;

            // Only corners get kerbs
            if (cell >= pieces.CORNER_NE && cell <= pieces.CORNER_NW) {
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                // Draw alternating red/white kerb pattern
                ctx.save();
                ctx.translate(xPos + cellSize/2, yPos + cellSize/2);

                // Create kerb pattern based on corner type
                drawCornerKerbs(ctx, cell, cellSize, kerbWidth, kerbPattern);

                ctx.restore();
            }
        });
    });
}

// Draw special track markings
function renderTrackMarkings(ctx, trackGrid) {
    const cellSize = TRACK_GRID_SPECS.grid.cellSize;

    // Start/finish line
    if (trackGrid.markers.startFinish) {
        const sf = trackGrid.markers.startFinish;
        const x = sf.col * cellSize;
        const y = sf.row * cellSize;

        // Checkered pattern
        const squareSize = 8;
        const numSquares = Math.floor(cellSize / squareSize);

        ctx.fillStyle = "#FFFFFF";
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
    trackGrid.markers.checkpoints.forEach(checkpoint => {
        const x = checkpoint.col * cellSize;
        const y = checkpoint.row * cellSize;

        ctx.strokeStyle = COLOR_PALETTE.tracks.checkpoint;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);

        if (checkpoint.orientation === "vertical") {
            ctx.beginPath();
            ctx.moveTo(x + cellSize/2, y);
            ctx.lineTo(x + cellSize/2, y + cellSize);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize/2);
            ctx.lineTo(x + cellSize, y + cellSize/2);
            ctx.stroke();
        }

        ctx.setLineDash([]);
    });
}

## 5. UI Element Specifications

### 5.1 Button Specifications
```javascript
const BUTTON_SPECS = {
    standard: {
        width: 200,
        height: 50,
        cornerRadius: 5,
        fontSize: 18,
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        letterSpacing: 1,

        states: {
            normal: {
                background: COLOR_PALETTE.ui.buttonPrimary,
                text: COLOR_PALETTE.ui.text,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                shadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
            },
            hover: {
                background: COLOR_PALETTE.ui.buttonHover,
                text: COLOR_PALETTE.ui.text,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                shadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
                transform: "translateY(-2px)" // Lift effect
            },
            pressed: {
                background: COLOR_PALETTE.ui.buttonHover,
                text: COLOR_PALETTE.ui.text,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                shadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                transform: "translateY(1px)" // Press effect
            },
            disabled: {
                background: COLOR_PALETTE.ui.buttonDisabled,
                text: "rgba(255, 255, 255, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                shadow: "none"
            }
        }
    },

    small: {
        width: 100,
        height: 35,
        cornerRadius: 3,
        fontSize: 14,
        letterSpacing: 0
    },

    icon: {
        width: 40,
        height: 40,
        cornerRadius: 20,  // Circular
        iconSize: 20
    }
};
```

### 5.2 HUD Elements
```javascript
const HUD_SPECS = {
    // Lap counter
    lapCounter: {
        position: {x: 20, y: 20},
        background: COLOR_PALETTE.ui.backgroundAlpha,
        padding: 10,
        cornerRadius: 5,
        border: {
            width: 1,
            color: "rgba(255, 255, 255, 0.2)"
        },

        text: {
            label: {
                font: "14px Arial",
                color: COLOR_PALETTE.ui.textSecondary,
                text: "LAP"
            },
            value: {
                font: "bold 24px Arial",
                color: COLOR_PALETTE.ui.text,
                format: "{current}/{total}"
            }
        }
    },

    // Position indicator
    positionIndicator: {
        position: {x: 20, y: 80},
        size: {width: 60, height: 60},
        cornerRadius: 5,

        background: {
            1: COLOR_PALETTE.ui.success,    // 1st place green
            2: COLOR_PALETTE.ui.warning,    // 2nd place orange
            3: COLOR_PALETTE.ui.buttonPrimary, // 3rd place blue
            4: COLOR_PALETTE.ui.danger      // 4th place red
        },

        text: {
            position: {
                font: "bold 32px Arial",
                color: COLOR_PALETTE.ui.text
            },
            suffix: {
                font: "16px Arial",
                color: COLOR_PALETTE.ui.text,
                values: {1: "ST", 2: "ND", 3: "RD", 4: "TH"}
            }
        }
    },

    // Timer with race time
    timer: {
        position: {x: "center", y: 20},
        font: "bold 28px monospace",
        color: COLOR_PALETTE.ui.text,
        background: COLOR_PALETTE.ui.backgroundAlpha,
        padding: {x: 20, y: 10},
        cornerRadius: 5,
        format: "00:00.00",

        // Lap time split display
        lapSplit: {
            font: "18px monospace",
            color: COLOR_PALETTE.ui.success,  // Green for improvement
            colorSlow: COLOR_PALETTE.ui.danger, // Red for slower
            position: {x: "center", y: 60},
            fadeTime: 3000  // Show for 3 seconds
        }
    },

    // Speedometer
    speedometer: {
        position: {x: "right-100", y: 20},
        size: {width: 80, height: 40},
        background: COLOR_PALETTE.ui.backgroundAlpha,
        padding: 10,
        cornerRadius: 5,

        text: {
            speed: {
                font: "bold 20px monospace",
                color: COLOR_PALETTE.ui.text
            },
            unit: {
                font: "12px Arial",
                color: COLOR_PALETTE.ui.textSecondary,
                text: "MPH"
            }
        },

        // Speed bar indicator
        bar: {
            width: 60,
            height: 4,
            background: "rgba(255, 255, 255, 0.2)",
            fill: {
                normal: COLOR_PALETTE.ui.text,
                high: COLOR_PALETTE.ui.warning,    // Orange at 80%+
                max: COLOR_PALETTE.ui.danger       // Red at 95%+
            }
        }
    },

    // Mini-map
    miniMap: {
        position: {x: "right-120", y: "bottom-120"},
        size: {width: 100, height: 100},
        background: "rgba(26, 26, 26, 0.8)",
        border: {
            width: 2,
            color: "rgba(255, 255, 255, 0.3)"
        },

        // Track representation
        track: {
            color: "rgba(255, 255, 255, 0.2)",
            width: 8
        },

        // Car indicators
        carDots: {
            player: {
                radius: 3,
                color: "#FFFFFF",
                outline: {
                    color: "#000000",
                    width: 1
                },
                pulse: true  // Pulsing effect
            },
            ai: {
                radius: 2,
                colors: {
                    ahead: "#00FF00",   // Green if ahead
                    behind: "#FF0000"   // Red if behind
                }
            }
        }
    }
};
```Counter: {
        position: {x: 20, y: 20},
        background: COLOR_PALETTE.ui.backgroundAlpha,
        padding: 10,
        cornerRadius: 5,

        text: {
            label: {
                font: "16px Arial",
                color: COLOR_PALETTE.ui.text,
                text: "LAP"
            },
            value: {
                font: "bold 24px Arial",
                color: COLOR_PALETTE.ui.text,
                format: "{current}/{total}"
            }
        }
    },

    // Position indicator
    positionIndicator: {
        position: {x: 20, y: 80},
        size: {width: 60, height: 60},

        background: {
            1: COLOR_PALETTE.ui.success,    // 1st place green
            2: COLOR_PALETTE.ui.warning,    // 2nd place orange
            3: COLOR_PALETTE.ui.buttonPrimary, // 3rd place blue
            4: COLOR_PALETTE.ui.danger      // 4th place red
        },

        text: {
            font: "bold 36px Arial",
            color: COLOR_PALETTE.ui.text
        }
    },

    // Timer
    timer: {
        position: {x: "center", y: 20},
        font: "bold 32px monospace",
        color: COLOR_PALETTE.ui.textDark,
        background: "rgba(255, 255, 255, 0.8)",
        padding: {x: 20, y: 10},
        cornerRadius: 5,
        format: "00:00.00"
    },

    // Mini-map
    miniMap: {
        position: {x: "right-120", y: "bottom-120"},
        size: {width: 100, height: 100},
        background: COLOR_PALETTE.ui.backgroundAlpha,
        border: {
            width: 2,
            color: COLOR_PALETTE.ui.text
        },

        carDots: {
            player: {
                radius: 3,
                color: "#FFFFFF",
                outline: "#000000"
            },
            ai: {
                radius: 2,
                color: "#E74C3C"
            }
        }
    }
};
```

### 5.3 Menu Layouts
```javascript
const MENU_SPECS = {
    mainMenu: {
        background: {
            gradient: {
                type: "linear",
                angle: 180,
                colors: ["#2C2C2C", "#1A1A1A"]  // Dark gradient
            }
        },

        title: {
            text: "RC CAR RACING",
            position: {x: "center", y: 100},
            font: {
                size: 64,
                family: "Arial Black, sans-serif",
                weight: "bold"
            },
            color: COLOR_PALETTE.ui.text,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                blur: 8,
                color: "rgba(0, 0, 0, 0.5)"
            },

            // Subtle animation
            glow: {
                color: COLOR_PALETTE.ui.buttonPrimary,
                size: 20,
                pulse: true
            }
        },

        subtitle: {
            text: "PROFESSIONAL RACING SIMULATOR",
            position: {x: "center", y: 150},
            font: "18px Arial",
            color: COLOR_PALETTE.ui.textSecondary,
            letterSpacing: 2
        }
    },

    carSelect: {
        title: {
            text: "SELECT YOUR CAR",
            font: "32px Arial",
            color: COLOR_PALETTE.ui.text
        },

        carDisplay: {
            position: {x: "center", y: 200},
            scale: 4,  // 4x normal size for preview
            rotation: -15,  // Slight angle for dynamic look

            // Rotating platform effect
            platform: {
                radius: 100,
                color: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                rotation: true  // Slow rotation
            }
        },

        // Car statistics display
        statsDisplay: {
            position: {x: "center", y: 350},
            width: 300,

            stats: [
                {label: "TOP SPEED", property: "maxSpeed", unit: "MPH"},
                {label: "ACCELERATION", property: "acceleration", unit: ""},
                {label: "HANDLING", property: "turnSpeed", unit: ""}
            ],

            bar: {
                width: 200,
                height: 8,
                background: "rgba(255, 255, 255, 0.1)",
                fill: COLOR_PALETTE.ui.buttonPrimary,
                cornerRadius: 4
            }
        },

        // Car name and description
        carInfo: {
            name: {
                font: "24px Arial",
                color: COLOR_PALETTE.ui.text
            },
            description: {
                font: "14px Arial",
                color: COLOR_PALETTE.ui.textSecondary,
                maxWidth: 400
            }
        }
    },

    trackSelect: {
        title: {
            text: "CHOOSE CIRCUIT",
            font: "32px Arial",
            color: COLOR_PALETTE.ui.text
        },

        // Track preview cards
        trackCard: {
            width: 200,
            height: 150,
            margin: 20,
            background: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            cornerRadius: 8,

            hover: {
                background: "rgba(255, 255, 255, 0.1)",
                borderColor: COLOR_PALETTE.ui.buttonPrimary,
                scale: 1.05
            },

            // Mini track preview
            preview: {
                scale: 0.15,  // 15% of actual size
                opacity: 0.8
            },

            // Track info
            info: {
                name: {
                    font: "18px Arial",
                    color: COLOR_PALETTE.ui.text
                },
                difficulty: {
                    font: "14px Arial",
                    colors: {
                        "Easy": COLOR_PALETTE.ui.success,
                        "Medium": COLOR_PALETTE.ui.warning,
                        "Hard": COLOR_PALETTE.ui.danger
                    }
                }
            }
        }
    }
};
```

## 6. Visual Effects Specifications

### 6.1 Particle Effects
```javascript
const PARTICLE_SPECS = {
    // Tire smoke when accelerating/turning
    tireSmoke: {
        count: 5,
        lifetime: 800,  // milliseconds
        size: {min: 4, max: 12},
        color: COLOR_PALETTE.effects.smokeDust,
        velocity: {min: 10, max: 30},
        fadeOut: true,
        spread: 45,  // degrees
        growthRate: 1.5 // Size multiplier over lifetime
    },

    // Dust clouds on grass
    grassDust: {
        count: 8,
        lifetime: 1000,
        size: {min: 6, max: 15},
        color: COLOR_PALETTE.effects.mudDust,
        velocity: {min: 15, max: 40},
        fadeOut: true,
        spread: 60,
        turbulence: 0.2 // Random drift
    },

    // Collision sparks
    collision: {
        count: 15,
        lifetime: 400,
        size: {min: 2, max: 4},
        colors: COLOR_PALETTE.effects.sparks,
        velocity: {min: 50, max: 150},
        gravity: 300,  // pixels/second²
        spread: 360,
        sparkTrail: true // Leave brief trail
    },

    // Speed lines at high velocity
    speedLines: {
        count: 5,
        length: {min: 30, max: 60},
        width: {min: 1, max: 3},
        color: "rgba(255, 255, 255, 0.3)",
        minSpeed: 0.8,  // 80% of max speed to activate
        fadeDistance: 20 // Fade over last 20 pixels
    },

    // Victory confetti
    confetti: {
        count: 50,
        lifetime: 3000,
        size: {width: 8, height: 12},
        colors: COLOR_PALETTE.effects.confetti,
        velocity: {min: 100, max: 300},
        gravity: 150,
        rotationSpeed: {min: 2, max: 5}, // radians/second
        spread: 120, // Upward cone
        fadeStart: 2000 // Start fading after 2 seconds
    }
};

// Skid marks that persist on track
const SKID_MARK_SPECS = {
    width: 4,
    color: COLOR_PALETTE.effects.tireMarks,
    maxLength: 100,          // Maximum pixels per mark
    fadeTime: 5000,          // Milliseconds to fade completely
    minSpeed: 0.3,          // Minimum speed ratio to create marks
    minTurnAngle: 0.2,      // Minimum turn angle (radians) to create marks

    // Render settings
    lineCap: "round",
    lineJoin: "round",

    // Performance limits
    maxMarksPerCar: 10,     // Maximum concurrent marks per car
    maxTotalMarks: 50       // Maximum total marks on track
};
```

### 6.2 Environmental Effects
```javascript
const ENVIRONMENTAL_EFFECTS = {
    // Track surface variations
    surfaceEffects: {
        // Worn asphalt patches
        wornPatches: {
            color: COLOR_PALETTE.tracks.asphaltWorn,
            opacity: 0.6,
            noiseScale: 0.1,  // Perlin noise for organic shape
            coverage: 0.15    // 15% of track surface
        },

        // Oil spills (affect car handling)
        oilSpills: {
            color: "rgba(20, 20, 20, 0.7)",
            shimmer: "rgba(100, 100, 150, 0.3)",
            radius: {min: 20, max: 40},
            count: 2  // Per track
        },

        // Track rubber buildup
        rubberBuildup: {
            color: "rgba(10, 10, 10, 0.4)",
            width: 15,
            opacity: 0.6,
            position: "racing_line" // Along optimal path
        }
    },

    // Weather effects (future enhancement)
    weatherEffects: {
        rain: {
            dropletCount: 200,
            dropletSize: {min: 2, max: 4},
            dropletSpeed: 400,
            splashRadius: 8,
            trackWetness: 0.7,
            visibility: 0.8
        }
    }
};
```

### 6.3 Effect Rendering Functions
```javascript
// Particle system base
class ParticleSystem {
    constructor(spec) {
        this.particles = [];
        this.spec = spec;
        this.pool = new Array(100); // Pre-allocated pool
    }

    emit(x, y, direction) {
        for (let i = 0; i < this.spec.count; i++) {
            const particle = this.getFromPool() || {};

            // Initialize particle
            const angle = direction + (Math.random() - 0.5) *
                         (this.spec.spread * Math.PI / 180);
            const speed = this.spec.velocity.min +
                         Math.random() * (this.spec.velocity.max - this.spec.velocity.min);

            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = this.spec.size.min +
                           Math.random() * (this.spec.size.max - this.spec.size.min);
            particle.life = this.spec.lifetime;
            particle.maxLife = this.spec.lifetime;
            particle.color = Array.isArray(this.spec.colors) ?
                           this.spec.colors[Math.floor(Math.random() * this.spec.colors.length)] :
                           this.spec.color;

            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx * deltaTime / 1000;
            p.y += p.vy * deltaTime / 1000;

            // Apply gravity if specified
            if (this.spec.gravity) {
                p.vy += this.spec.gravity * deltaTime / 1000;
            }

            // Update life
            p.life -= deltaTime;

            // Remove dead particles
            if (p.life <= 0) {
                this.returnToPool(p);
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();

        this.particles.forEach(p => {
            const lifeRatio = p.life / p.maxLife;
            let alpha = 1;

            if (this.spec.fadeOut) {
                alpha = lifeRatio;
            }

            // Set color with alpha
            const color = p.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            ctx.fillStyle = color;

            // Render particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// Skid mark system
class SkidMarkSystem {
    constructor() {
        this.marks = [];
        this.maxMarks = SKID_MARK_SPECS.maxTotalMarks;
    }

    addMark(x, y, carId) {
        // Find or create mark for this car
        let mark = this.marks.find(m => m.carId === carId && !m.finished);

        if (!mark) {
            // Remove oldest mark if at limit
            if (this.marks.length >= this.maxMarks) {
                this.marks.shift();
            }

            mark = {
                carId: carId,
                points: [],
                createdAt: Date.now(),
                finished: false
            };
            this.marks.push(mark);
        }

        // Add point to mark
        mark.points.push({x, y});

        // Limit mark length
        if (mark.points.length > SKID_MARK_SPECS.maxLength) {
            mark.finished = true;
        }
    }

    render(ctx) {
        const now = Date.now();

        ctx.save();
        ctx.strokeStyle = SKID_MARK_SPECS.color;
        ctx.lineWidth = SKID_MARK_SPECS.width;
        ctx.lineCap = SKID_MARK_SPECS.lineCap;
        ctx.lineJoin = SKID_MARK_SPECS.lineJoin;

        // Render marks with fade
        this.marks.forEach(mark => {
            const age = now - mark.createdAt;
            const alpha = Math.max(0, 1 - (age / SKID_MARK_SPECS.fadeTime));

            if (alpha > 0 && mark.points.length > 1) {
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                mark.points.forEach((point, i) => {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
            }
        });

        ctx.restore();

        // Clean up old marks
        this.marks = this.marks.filter(mark =>
            (now - mark.createdAt) < SKID_MARK_SPECS.fadeTime
        );
    }
}

## 7. Animation Specifications

### 7.1 UI Animations
```javascript
const ANIMATION_SPECS = {
    buttonHover: {
        duration: 150,
        easing: "ease-out",
        properties: ["transform", "shadow"]
    },

    menuTransition: {
        duration: 300,
        easing: "ease-in-out",
        type: "slide",  // slide, fade, or both
        direction: "left"
    },

    countdown: {
        numbers: {
            duration: 1000,
            scale: {from: 2, to: 0.8},
            opacity: {from: 1, to: 0},
            font: "bold 120px Arial"
        },

        go: {
            text: "GO!",
            duration: 500,
            scale: {from: 0, to: 1.5, final: 1},
            color: COLOR_PALETTE.ui.success
        }
    }
};
```

## 8. Asset Production Guidelines

### 8.1 Coordinate System
- Origin (0,0) at top-left corner
- X increases rightward
- Y increases downward
- Angles in radians (0 = right, π/2 = down)

### 8.2 Drawing Order
1. Background color/gradient
2. Track surface
3. Track markings (lines, checkpoints)
4. Cars (sorted by Y position for depth)
5. Particle effects
6. UI elements
7. Debug overlays (if enabled)

### 8.3 Performance Guidelines
- Use `ctx.save()` and `ctx.restore()` sparingly
- Batch similar drawing operations
- Pre-calculate repeated values
- Round coordinates to integers for pixel-perfect rendering
- Cache gradient and pattern objects

### 8.4 Naming Conventions
```javascript
// Color naming
COLOR_PALETTE.category.specificColor

// Asset functions
renderCarType()    // Car rendering
drawTrackElement() // Track components
createUIButton()   // UI elements
updateParticle()   // Effects

// State naming
STATE_MENU_MAIN
STATE_RACING_ACTIVE
STATE_RACE_FINISHED
```

## 9. Responsive Scaling

### 9.1 Canvas Scaling Strategy
```javascript
const SCALING = {
    targetWidth: 800,
    targetHeight: 600,
    maintainAspectRatio: true,

    scaleMode: "fit",  // fit, fill, or fixed

    uiScaling: {
        minScale: 0.75,
        maxScale: 1.25,

        // Elements that should not scale
        fixedSizeElements: ["miniMap", "fpsCounter"]
    }
};
```

### 9.2 High-DPI Support
```javascript
// Handle retina displays
function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    return ctx;
}
```

## 10. Accessibility Considerations

### 10.1 Color Contrast
- All text maintains WCAG AA compliance (4.5:1 ratio)
- Interactive elements have distinct hover states
- Position indicators use both color and number

### 10.2 Visual Clarity
- Minimum font size: 16px
- Clear borders between track and background
- High contrast car colors against all backgrounds

## 11. UI Polish and Transitions

### 11.1 Loading Screen
```javascript
const LOADING_SCREEN = {
    background: COLOR_PALETTE.ui.background,

    // Animated car icon
    loadingAnimation: {
        type: "car_wheel_spin",
        car: {
            scale: 2,
            color: COLOR_PALETTE.ui.buttonPrimary,
            wheelSpinSpeed: 720  // degrees per second
        },

        // Progress bar
        progressBar: {
            position: {x: "center", y: 350},
            width: 300,
            height: 6,
            background: "rgba(255, 255, 255, 0.1)",
            fill: COLOR_PALETTE.ui.buttonPrimary,
            cornerRadius: 3,

            // Animated shimmer effect
            shimmer: {
                color: "rgba(255, 255, 255, 0.3)",
                width: 50,
                speed: 300  // pixels per second
            }
        }
    },

    // Loading tips
    tips: {
        position: {x: "center", y: 400},
        font: "14px Arial",
        color: COLOR_PALETTE.ui.textSecondary,
        fadeTime: 3000,  // Change tip every 3 seconds

        messages: [
            "Use the racing line for optimal lap times",
            "Brake before corners, accelerate through the apex",
            "Draft behind opponents for a speed boost",
            "Different cars suit different driving styles"
        ]
    }
};
```

### 11.2 Menu Transition Animations
```javascript
const MENU_TRANSITIONS = {
    // Slide transitions between menus
    slide: {
        duration: 300,  // milliseconds
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",  // Material Design easing

        directions: {
            forward: {from: "100%", to: "0%"},     // Slide in from right
            back: {from: "-100%", to: "0%"}        // Slide in from left
        }
    },

    // Fade transitions
    fade: {
        duration: 200,
        easing: "ease-in-out",

        stages: {
            out: {opacity: {from: 1, to: 0}, scale: {from: 1, to: 0.95}},
            in: {opacity: {from: 0, to: 1}, scale: {from: 1.05, to: 1}}
        }
    },

    // Element stagger animation
    stagger: {
        delayPerElement: 50,  // milliseconds
        maxDelay: 300,        // Cap total delay

        animation: {
            opacity: {from: 0, to: 1},
            transform: {from: "translateY(20px)", to: "translateY(0)"}
        }
    }
};
```

### 11.3 Race Countdown Sequence
```javascript
const COUNTDOWN_SEQUENCE = {
    // Pre-race camera pan
    cameraPan: {
        duration: 3000,
        path: "track_overview",  // Pan across track
        easing: "ease-in-out"
    },

    // Countdown numbers
    numbers: {
        values: [3, 2, 1],
        duration: 800,  // Per number

        animation: {
            initial: {
                scale: 0,
                opacity: 0,
                rotation: -180
            },
            enter: {
                scale: 2,
                opacity: 1,
                rotation: 0,
                duration: 200,
                easing: "back-out"
            },
            hold: {
                duration: 400
            },
            exit: {
                scale: 4,
                opacity: 0,
                duration: 200,
                easing: "ease-in"
            }
        },

        style: {
            font: "bold 120px Arial",
            color: COLOR_PALETTE.ui.text,
            stroke: {
                color: COLOR_PALETTE.ui.background,
                width: 4
            },
            shadow: {
                color: "rgba(0, 0, 0, 0.5)",
                blur: 10,
                offsetX: 0,
                offsetY: 5
            }
        }
    },

    // GO! animation
    go: {
        text: "GO!",
        duration: 1000,

        animation: {
            enter: {
                scale: {from: 0, to: 2, final: 1.5},
                opacity: {from: 0, to: 1},
                duration: 300,
                easing: "elastic-out"
            },

            pulse: {
                scale: {from: 1.5, to: 1.7},
                duration: 200,
                repeat: 2
            },

            exit: {
                opacity: {from: 1, to: 0},
                scale: {from: 1.5, to: 1},
                duration: 500,
                delay: 500
            }
        },

        style: {
            font: "bold 140px Arial",
            color: COLOR_PALETTE.ui.success,
            glow: {
                color: COLOR_PALETTE.ui.success,
                size: 20
            }
        }
    },

    // Engine rev sound cue (visual)
    engineRevIndicator: {
        position: {x: "center", y: 400},
        width: 200,
        height: 10,

        animation: {
            fillAmount: {from: 0, to: 1},
            duration: 2000,

            colors: [
                {at: 0, color: COLOR_PALETTE.ui.text},
                {at: 0.6, color: COLOR_PALETTE.ui.warning},
                {at: 0.9, color: COLOR_PALETTE.ui.danger}
            ]
        }
    }
};
```

### 11.4 Achievement Notifications
```javascript
const ACHIEVEMENT_NOTIFICATIONS = {
    position: {x: "center", y: 100},

    animation: {
        enter: {
            from: {y: -100, opacity: 0, scale: 0.8},
            to: {y: 100, opacity: 1, scale: 1},
            duration: 500,
            easing: "back-out"
        },

        hold: {
            duration: 3000
        },

        exit: {
            to: {y: -100, opacity: 0, scale: 0.8},
            duration: 300,
            easing: "ease-in"
        }
    },

    style: {
        background: COLOR_PALETTE.ui.backgroundAlpha,
        border: "2px solid",
        borderColor: COLOR_PALETTE.ui.success,
        cornerRadius: 8,
        padding: {x: 20, y: 15},

        icon: {
            size: 32,
            color: COLOR_PALETTE.ui.success
        },

        title: {
            font: "bold 18px Arial",
            color: COLOR_PALETTE.ui.text
        },

        description: {
            font: "14px Arial",
            color: COLOR_PALETTE.ui.textSecondary
        }
    },

    // Achievement types
    types: {
        "first_win": {
            icon: "trophy",
            title: "First Victory!",
            description: "Won your first race"
        },
        "perfect_lap": {
            icon: "star",
            title: "Perfect Lap",
            description: "No collisions or track limits"
        },
        "speed_demon": {
            icon: "lightning",
            title: "Speed Demon",
            description: "Reached maximum speed"
        },
        "close_call": {
            icon: "warning",
            title: "Close Call",
            description: "Won by less than 0.1 seconds"
        }
    }
};
```

### 11.5 Pause Menu Overlay
```javascript
const PAUSE_MENU = {
    overlay: {
        color: "rgba(0, 0, 0, 0.7)",
        blur: 5  // Blur game content behind
    },

    container: {
        position: {x: "center", y: "center"},
        width: 300,
        height: 400,
        background: COLOR_PALETTE.ui.background,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        cornerRadius: 8,

        animation: {
            enter: {
                scale: {from: 0.9, to: 1},
                opacity: {from: 0, to: 1},
                duration: 200
            }
        }
    },

    title: {
        text: "PAUSED",
        font: "32px Arial",
        color: COLOR_PALETTE.ui.text,
        margin: 30
    },

    buttons: [
        {text: "RESUME", action: "RESUME", highlight: true},
        {text: "RESTART RACE", action: "RESTART"},
        {text: "SETTINGS", action: "SETTINGS"},
        {text: "QUIT TO MENU", action: "QUIT", danger: true}
    ]
};
```

## 12. Performance Profiles

### 12.1 Quality Settings
```javascript
const PERFORMANCE_PROFILES = {
    high: {
        name: "High Quality",
        targetFPS: 60,

        particles: {
            tireSmoke: {maxCount: 20, lifetime: 1000},
            collision: {maxCount: 30, lifetime: 500},
            grassDust: {maxCount: 15, lifetime: 1200},
            speedLines: {enabled: true, count: 5},
            confetti: {maxCount: 100}
        },

        effects: {
            skidMarks: {enabled: true, maxMarks: 50, fadeTime: 5000},
            shadows: {enabled: true, quality: "high"},
            trackDetails: {enabled: true, wornPatches: true, rubberBuildup: true}
        },

        rendering: {
            antialiasing: true,
            pixelRatio: window.devicePixelRatio || 1,
            updateRate: 60
        }
    },

    medium: {
        name: "Balanced",
        targetFPS: 60,

        particles: {
            tireSmoke: {maxCount: 10, lifetime: 800},
            collision: {maxCount: 15, lifetime: 400},
            grassDust: {maxCount: 8, lifetime: 1000},
            speedLines: {enabled: true, count: 3},
            confetti: {maxCount: 50}
        },

        effects: {
            skidMarks: {enabled: true, maxMarks: 30, fadeTime: 3000},
            shadows: {enabled: true, quality: "medium"},
            trackDetails: {enabled: true, wornPatches: false, rubberBuildup: false}
        },

        rendering: {
            antialiasing: true,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
            updateRate: 60
        }
    },

    low: {
        name: "Performance",
        targetFPS: 60,

        particles: {
            tireSmoke: {maxCount: 5, lifetime: 500},
            collision: {maxCount: 10, lifetime: 300},
            grassDust: {maxCount: 0, lifetime: 0},
            speedLines: {enabled: false},
            confetti: {maxCount: 20}
        },

        effects: {
            skidMarks: {enabled: false},
            shadows: {enabled: false},
            trackDetails: {enabled: false}
        },

        rendering: {
            antialiasing: false,
            pixelRatio: 1,
            updateRate: 60
        }
    }
};

// Auto-detection logic
const AUTO_DETECT_QUALITY = {
    checkDuration: 5000,  // Test for 5 seconds

    thresholds: {
        high: {minFPS: 55, avgFPS: 58},
        medium: {minFPS: 45, avgFPS: 50},
        low: {minFPS: 30, avgFPS: 40}
    },

    // Downgrade if performance drops
    dynamicAdjustment: {
        enabled: true,
        checkInterval: 10000,  // Check every 10 seconds
        downgradeThreshold: 45,  // FPS
        upgradeThreshold: 58     // FPS
    }
};
```

### 12.2 Rendering Optimizations
```javascript
const RENDER_OPTIMIZATION = {
    // Culling
    viewportCulling: {
        enabled: true,
        padding: 100  // Pixels outside viewport to still render
    },

    // Batching
    drawCallBatching: {
        particlesBatchSize: 100,
        skidMarksBatchSize: 50
    },

    // LOD (Level of Detail)
    levelOfDetail: {
        cars: {
            near: {distance: 200, details: "full"},      // All details
            medium: {distance: 400, details: "reduced"}, // No small details
            far: {distance: 600, details: "minimal"}     // Basic shape only
        },

        effects: {
            particleDistanceCutoff: 500,  // Don't render particles beyond
            skidMarkDistanceCutoff: 400   // Don't render skid marks beyond
        }
    },

    // Update frequencies
    updateFrequencies: {
        physics: 60,      // Hz - Always 60 for consistency
        particles: 30,    // Hz - Can be lower
        ui: 10,          // Hz - UI updates
        minimap: 5       // Hz - Minimap updates
    }
};
```

### 12.3 Memory Management
```javascript
const MEMORY_LIMITS = {
    // Object pools
    objectPools: {
        particles: {
            initialSize: 200,
            maxSize: 500,
            growthRate: 50
        },

        skidMarkPoints: {
            initialSize: 500,
            maxSize: 1000,
            growthRate: 100
        }
    },

    // Texture atlasing (if using images in future)
    textureAtlas: {
        maxSize: 2048,  // pixels
        padding: 2      // pixels between sprites
    },

    // Garbage collection hints
    gcStrategy: {
        particleCleanupInterval: 5000,     // ms
        skidMarkCleanupInterval: 10000,    // ms
        removeInvisibleElements: true
    }
};
```

## 13. Future Enhancements (Extended)

### 13.1 Weather and Time of Day System
```javascript
const WEATHER_SYSTEM = {
    // Time of day presets
    timeOfDay: {
        dawn: {
            skyGradient: ["#FFB6C1", "#87CEEB", "#FFA07A"],
            ambientLight: 0.6,
            sunPosition: {angle: 10, color: "#FFD700"},
            trackTint: "rgba(255, 200, 150, 0.1)",
            shadowLength: 1.5,
            shadowOpacity: 0.3
        },

        day: {
            skyGradient: ["#87CEEB", "#98D8E8"],
            ambientLight: 1.0,
            sunPosition: {angle: 60, color: "#FFFFED"},
            trackTint: "rgba(0, 0, 0, 0)",
            shadowLength: 0.8,
            shadowOpacity: 0.5
        },

        sunset: {
            skyGradient: ["#FF6B6B", "#FF8E53", "#FFD93D"],
            ambientLight: 0.7,
            sunPosition: {angle: 170, color: "#FF6347"},
            trackTint: "rgba(255, 100, 50, 0.2)",
            shadowLength: 2.0,
            shadowOpacity: 0.4
        },

        night: {
            skyGradient: ["#0F0C29", "#24243E", "#302B63"],
            ambientLight: 0.3,
            moonPosition: {angle: 45, color: "#F8F8FF"},
            trackTint: "rgba(0, 0, 50, 0.3)",
            shadowLength: 0.5,
            shadowOpacity: 0.2,

            // Car headlights
            headlights: {
                range: 150,
                angle: 30,
                color: "#FFFFCC",
                intensity: 0.8
            }
        }
    },

    // Weather conditions
    weather: {
        clear: {
            visibility: 1.0,
            trackGrip: 1.0,
            particleEffects: []
        },

        rain: {
            visibility: 0.7,
            trackGrip: 0.6,

            particleEffects: {
                raindrops: {
                    count: 200,
                    speed: 400,
                    angle: 15,  // Wind effect
                    size: {width: 1, height: 8},
                    color: "rgba(200, 200, 255, 0.4)"
                },

                splashes: {
                    probability: 0.1,  // Per raindrop
                    size: 8,
                    duration: 200,
                    color: "rgba(255, 255, 255, 0.5)"
                },

                mist: {
                    opacity: 0.2,
                    color: "rgba(200, 200, 200, 0.3)"
                }
            },

            // Wet track reflections
            trackEffects: {
                wetness: 0.8,
                reflectionStrength: 0.3,
                puddleLocations: "random",
                sprayFromCars: true
            }
        },

        fog: {
            visibility: 0.4,
            trackGrip: 0.9,

            effects: {
                fogColor: "rgba(200, 200, 200, 0.6)",
                fogStart: 100,  // Distance in pixels
                fogEnd: 400,
                patchiness: 0.3  // Variation in density
            }
        }
    },

    // Dynamic weather changes
    dynamicWeather: {
        enabled: true,
        changeInterval: {min: 30000, max: 120000},  // 30s to 2min
        transitionDuration: 10000,  // 10 seconds

        // Weather progression chains
        progressions: [
            ["clear", "fog", "clear"],
            ["clear", "rain", "clear"],
            ["fog", "rain", "fog", "clear"]
        ]
    }
};
```

### 13.2 Track Surface Conditions
```javascript
const TRACK_CONDITIONS = {
    // Dynamic rubber buildup
    rubberBuildup: {
        enabled: true,

        racing_line: {
            buildupRate: 0.001,  // Per car pass
            maxBuildup: 0.5,

            effects: {
                gripIncrease: 0.2,     // 20% more grip
                visualDarkening: 0.4   // Darker appearance
            }
        },

        off_racing_line: {
            debrisAccumulation: 0.002,  // Marbles
            gripDecrease: 0.1          // 10% less grip
        }
    },

    // Temperature effects
    temperature: {
        ambient: {
            range: {min: 15, max: 35},  // Celsius
            effects_on_grip: {
                cold: {below: 20, gripMultiplier: 0.9},
                optimal: {range: [20, 28], gripMultiplier: 1.0},
                hot: {above: 28, gripMultiplier: 0.95}
            }
        },

        track: {
            heatingRate: 0.1,    // Per minute of sun
            coolingRate: 0.05,   // Per minute of shade

            effects: {
                hot_spots: {
                    in_sun: {tempIncrease: 10, gripDecrease: 0.05},
                    in_shade: {tempDecrease: 5, gripIncrease: 0.02}
                }
            }
        }
    }
};
```

---
*This Asset Specification Document provides precise guidelines for creating consistent, performant visual assets for the RC Car Racing Game.*