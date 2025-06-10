// RC Car Racing Game - Main Entry Point
// Architecture: Entity-Component System with State Machine
// Target: 60 FPS, Vanilla JavaScript, HTML5 Canvas

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fixedTimestep = 1/60; // 60 FPS target
        this.accumulator = 0;
        
        // Verify canvas setup
        if (!this.canvas || !this.ctx) {
            throw new Error('Failed to initialize canvas or context');
        }
        
        // Verify canvas dimensions
        if (this.canvas.width !== 800 || this.canvas.height !== 600) {
            console.warn('Canvas dimensions should be 800x600');
        }
        
        console.log('Game initialized - Canvas: 800x600, Target: 60 FPS');
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game started');
    }
    
    stop() {
        this.running = false;
        console.log('Game stopped');
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.running) return;
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Fixed timestep with accumulator pattern
        this.accumulator += this.deltaTime;
        
        while (this.accumulator >= this.fixedTimestep) {
            this.update(this.fixedTimestep);
            this.accumulator -= this.fixedTimestep;
        }
        
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(dt) {
        // Game logic updates will go here
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2C2C2C';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw setup verification
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RC Car Racing Game', 400, 280);
        this.ctx.fillText('Project Structure Setup Complete', 400, 320);
        
        // Debug info
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 400, 350);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        game.start();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.innerHTML = '<div style="color: white; text-align: center; margin-top: 50px;">Game initialization failed. Check console for details.</div>';
    }
});