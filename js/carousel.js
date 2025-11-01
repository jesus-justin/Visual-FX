/* 
===================================================
CAROUSEL CONTROLLER - 3D Interactive Showcase
===================================================
Purpose: Advanced carousel with 3D transforms and physics
Performance: GPU-accelerated transforms with touch support
Motion: Smooth momentum scrolling with spring physics
*/

// ===================================================
// 1. CAROUSEL CONFIGURATION
// ===================================================
const carouselConfig = {
    itemWidth: 320,           // Width of each carousel item
    itemGap: 32,              // Gap between items
    transitionDuration: 600,  // Animation duration in ms
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring easing
    autoplay: false,          // Auto-advance carousel
    autoplayDelay: 5000,      // Delay between auto-advances
    loop: true,               // Enable infinite loop
    dragEnabled: true,        // Enable drag/swipe
    dragThreshold: 50,        // Minimum drag distance to trigger slide
};

// ===================================================
// 2. CAROUSEL CLASS
// ===================================================
class Carousel3D {
    constructor(container, config) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.items = Array.from(this.track.querySelectorAll('.carousel-item'));
        this.config = config;
        
        // State
        this.currentIndex = 0;
        this.totalItems = this.items.length;
        this.isAnimating = false;
        this.autoplayTimer = null;
        
        // Drag state
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragDistance = 0;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupControls();
        this.setupDrag();
        this.setupKeyboard();
        
        // Initial positioning
        this.updateCarousel(false); // No animation on init
        
        // Start autoplay if enabled
        if (this.config.autoplay) {
            this.startAutoplay();
        }
        
        // Pause autoplay on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => {
            if (this.config.autoplay) this.startAutoplay();
        });
        
        console.log('🎠 Carousel initialized with', this.totalItems, 'items');
    }
    
    // ===================================================
    // 3. CAROUSEL CONTROLS
    // ===================================================
    setupControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
    }
    
    // Navigate to previous item
    prev() {
        if (this.isAnimating) return;
        
        this.currentIndex--;
        
        // Handle looping
        if (this.currentIndex < 0) {
            this.currentIndex = this.config.loop ? this.totalItems - 1 : 0;
        }
        
        this.updateCarousel();
        this.resetAutoplay();
    }
    
    // Navigate to next item
    next() {
        if (this.isAnimating) return;
        
        this.currentIndex++;
        
        // Handle looping
        if (this.currentIndex >= this.totalItems) {
            this.currentIndex = this.config.loop ? 0 : this.totalItems - 1;
        }
        
        this.updateCarousel();
        this.resetAutoplay();
    }
    
    // Navigate to specific index
    goTo(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.totalItems - 1));
        this.updateCarousel();
        this.resetAutoplay();
    }
    
    // ===================================================
    // 4. CAROUSEL UPDATE & ANIMATION
    // ===================================================
    updateCarousel(animate = true) {
        // Calculate transform
        const offset = -this.currentIndex * (this.config.itemWidth + this.config.itemGap);
        
        if (animate) {
            this.isAnimating = true;
            
            // Animate track position
            this.track.animate([
                { transform: `translateX(${parseFloat(this.track.style.transform.replace('translateX(', '').replace('px)', '')) || 0}px)` },
                { transform: `translateX(${offset}px)` }
            ], {
                duration: this.config.transitionDuration,
                easing: this.config.easing,
                fill: 'forwards'
            }).onfinish = () => {
                this.track.style.transform = `translateX(${offset}px)`;
                this.isAnimating = false;
            };
        } else {
            // Set position without animation
            this.track.style.transform = `translateX(${offset}px)`;
        }
        
        // Update item states (add active class, scale, etc.)
        this.updateItemStates();
        
        // Update progress bar
        this.updateProgress();
    }
    
    // ===================================================
    // 5. ITEM STATE MANAGEMENT
    // ===================================================
    // Purpose: Apply different styles to active/inactive items
    updateItemStates() {
        this.items.forEach((item, index) => {
            const distance = Math.abs(index - this.currentIndex);
            
            // Remove all state classes
            item.classList.remove('active', 'adjacent', 'distant');
            
            // Apply state based on distance from current
            if (index === this.currentIndex) {
                item.classList.add('active');
                this.animateActiveItem(item);
            } else if (distance === 1) {
                item.classList.add('adjacent');
            } else {
                item.classList.add('distant');
            }
            
            // Apply 3D perspective based on position
            const offset = (index - this.currentIndex) * 15; // degrees
            item.style.transform = `
                perspective(1000px)
                rotateY(${offset}deg)
                scale(${1 - distance * 0.1})
            `;
            item.style.opacity = 1 - distance * 0.3;
            item.style.zIndex = 100 - distance;
        });
    }
    
    // Special animation for active item
    animateActiveItem(item) {
        const inner = item.querySelector('.item-inner');
        if (inner) {
            inner.animate([
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: this.config.transitionDuration,
                easing: this.config.easing,
                fill: 'forwards'
            });
        }
    }
    
    // ===================================================
    // 6. PROGRESS BAR UPDATE
    // ===================================================
    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = ((this.currentIndex + 1) / this.totalItems) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    // ===================================================
    // 7. DRAG/SWIPE FUNCTIONALITY
    // ===================================================
    setupDrag() {
        if (!this.config.dragEnabled) return;
        
        // Mouse events
        this.track.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        
        // Touch events for mobile
        this.track.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0]));
        document.addEventListener('touchend', (e) => this.handleDragEnd(e.changedTouches[0]));
        
        // Prevent default drag behavior
        this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    handleDragStart(e) {
        if (this.isAnimating) return;
        
        this.isDragging = true;
        this.startX = e.clientX || e.pageX;
        this.currentX = this.startX;
        
        // Add dragging class for cursor change
        this.track.style.cursor = 'grabbing';
        this.track.style.userSelect = 'none';
        
        // Stop autoplay while dragging
        this.stopAutoplay();
    }
    
    handleDragMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.currentX = e.clientX || e.pageX;
        this.dragDistance = this.currentX - this.startX;
        
        // Apply drag effect (visual feedback)
        const currentOffset = -this.currentIndex * (this.config.itemWidth + this.config.itemGap);
        this.track.style.transform = `translateX(${currentOffset + this.dragDistance}px)`;
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.cursor = 'grab';
        this.track.style.userSelect = '';
        
        // Determine if drag was significant enough to change slide
        if (Math.abs(this.dragDistance) > this.config.dragThreshold) {
            if (this.dragDistance > 0) {
                this.prev();
            } else {
                this.next();
            }
        } else {
            // Snap back to current position
            this.updateCarousel();
        }
        
        // Reset drag state
        this.dragDistance = 0;
        
        // Restart autoplay if enabled
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }
    
    // ===================================================
    // 8. KEYBOARD NAVIGATION
    // ===================================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Only respond to keyboard if carousel is in view
            const rect = this.container.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (!inView) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goTo(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goTo(this.totalItems - 1);
                    break;
            }
        });
    }
    
    // ===================================================
    // 9. AUTOPLAY FUNCTIONALITY
    // ===================================================
    startAutoplay() {
        this.stopAutoplay(); // Clear any existing timer
        
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    resetAutoplay() {
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }
    
    // ===================================================
    // 10. DESTRUCTION (CLEANUP)
    // ===================================================
    destroy() {
        this.stopAutoplay();
        // Remove event listeners, etc.
        console.log('🎠 Carousel destroyed');
    }
}

// ===================================================
// 11. INITIALIZE CAROUSEL
// ===================================================
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (carouselContainer) {
        // Create carousel instance
        const carousel = new Carousel3D(carouselContainer, carouselConfig);
        
        // Expose to window for debugging (optional)
        window.carousel = carousel;
    }
});

// ===================================================
// 12. RESPONSIVE ADJUSTMENTS
// ===================================================
// Adjust carousel behavior based on screen size
function handleResize() {
    const width = window.innerWidth;
    
    // Mobile adjustments
    if (width < 768) {
        carouselConfig.itemWidth = 280;
        carouselConfig.itemGap = 16;
    } else {
        carouselConfig.itemWidth = 320;
        carouselConfig.itemGap = 32;
    }
}

window.addEventListener('resize', () => {
    let resizeTimeout;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
});

// Initial check
handleResize();

// ===================================================
// INITIALIZATION LOG
// ===================================================
console.log('🎡 Carousel module loaded');
console.log('   Configuration:', carouselConfig);
