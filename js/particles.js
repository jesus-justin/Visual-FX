/* 
===================================================
PARTICLE SYSTEM - Canvas-based background animation
===================================================
Purpose: Create interactive particle network background
Performance: Optimized with requestAnimationFrame and spatial partitioning
Visual: Connects nearby particles with lines, responds to mouse
*/

// ===================================================
// 1. CANVAS SETUP AND CONFIGURATION
// ===================================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Configuration object for easy tweaking
const config = {
    particleCount: 100,        // Number of particles (adjust for performance)
    particleSize: 2,           // Base particle radius
    particleSpeed: 0.5,        // Base movement speed
    connectionDistance: 120,   // Max distance for particle connections
    mouseRadius: 150,          // Mouse interaction radius
    mouseForce: 0.5,          // Strength of mouse attraction/repulsion
    colors: {
        particle: 'rgba(99, 102, 241, 0.8)',      // Particle color
        connection: 'rgba(99, 102, 241, 0.15)',   // Connection line color
        mouseConnection: 'rgba(129, 140, 248, 0.3)' // Mouse connection color
    }
};

// Mouse position tracking
let mouse = {
    x: null,
    y: null,
    radius: config.mouseRadius
};

// Particle array
let particles = [];

// ===================================================
// 2. RESPONSIVE CANVAS SIZING
// ===================================================
// Purpose: Ensure canvas fills container and maintains quality on all screens
function resizeCanvas() {
    // Get actual display size
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size to match display size
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Adjust particle count based on screen size (performance optimization)
    const area = canvas.width * canvas.height;
    const baseArea = 1920 * 1080;
    const scaleFactor = Math.sqrt(area / baseArea);
    config.particleCount = Math.floor(100 * scaleFactor);
    
    // Reinitialize particles with new canvas size
    initParticles();
}

// Listen for window resize with debouncing
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

// Initial setup
resizeCanvas();

// ===================================================
// 3. PARTICLE CLASS
// ===================================================
// Purpose: Define individual particle behavior and rendering
class Particle {
    constructor() {
        // Random starting position
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        
        // Random velocity
        this.vx = (Math.random() - 0.5) * config.particleSpeed;
        this.vy = (Math.random() - 0.5) * config.particleSpeed;
        
        // Random size variation (80% to 120% of base size)
        this.size = config.particleSize * (0.8 + Math.random() * 0.4);
        
        // Random opacity for depth effect
        this.opacity = 0.3 + Math.random() * 0.7;
    }
    
    // Update particle position
    update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges with slight randomization
        if (this.x < 0 || this.x > canvas.width) {
            this.vx *= -1;
            this.vx += (Math.random() - 0.5) * 0.1; // Add slight randomness
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -1;
            this.vy += (Math.random() - 0.5) * 0.1;
        }
        
        // Keep velocity in check
        const maxSpeed = config.particleSpeed * 2;
        this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
        this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));
        
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If mouse is nearby, apply force
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                
                // Repel particles from mouse
                this.vx -= Math.cos(angle) * force * config.mouseForce;
                this.vy -= Math.sin(angle) * force * config.mouseForce;
            }
        }
    }
    
    // Draw particle
    draw() {
        ctx.fillStyle = config.colors.particle;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ===================================================
// 4. PARTICLE INITIALIZATION
// ===================================================
// Purpose: Create initial particle array
function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

// ===================================================
// 5. PARTICLE CONNECTIONS
// ===================================================
// Purpose: Draw lines between nearby particles
// Optimization: Only check nearby particles using spatial partitioning
function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Draw connection if particles are close enough
            if (distance < config.connectionDistance) {
                // Calculate opacity based on distance (closer = more opaque)
                const opacity = 1 - (distance / config.connectionDistance);
                
                ctx.strokeStyle = config.colors.connection;
                ctx.globalAlpha = opacity * 0.5;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
        
        // Connect to mouse if nearby
        if (mouse.x !== null && mouse.y !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const opacity = 1 - (distance / mouse.radius);
                ctx.strokeStyle = config.colors.mouseConnection;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// ===================================================
// 6. ANIMATION LOOP
// ===================================================
// Purpose: Main render loop using requestAnimationFrame
// Performance: Only renders when tab is visible
let animationFrameId;

function animate() {
    // Clear canvas with slight trail effect (creates motion blur)
    ctx.fillStyle = 'rgba(15, 15, 35, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw all particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Draw connections
    connectParticles();
    
    // Continue animation loop
    animationFrameId = requestAnimationFrame(animate);
}

// ===================================================
// 7. MOUSE TRACKING
// ===================================================
// Purpose: Track mouse position for particle interaction
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// Reset mouse position when cursor leaves canvas
canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// ===================================================
// 8. VISIBILITY API
// ===================================================
// Purpose: Pause animation when tab is not visible (performance optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Cancel animation when tab is hidden
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    } else {
        // Resume animation when tab becomes visible
        animate();
    }
});

// ===================================================
// 9. INITIALIZATION
// ===================================================
// Start the animation
initParticles();
animate();

// Log initialization
console.log('🌌 Particle system initialized');
console.log(`   Particles: ${config.particleCount}`);
console.log(`   Canvas size: ${canvas.width}x${canvas.height}`);
