/* 
===================================================
ANIMATIONS CONTROLLER - Advanced motion choreography
===================================================
Purpose: Manage complex animations and transitions
Performance: GSAP-alternative using Web Animations API
Motion: Spring physics and easing curves
*/

// ===================================================
// 1. CUSTOM EASING FUNCTIONS
// ===================================================
// Purpose: Create natural-feeling animations with custom curves
const Easing = {
    // Smooth ease out with overshoot (spring effect)
    easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // Smooth ease in-out
    easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
    
    // Elastic bounce
    easeOutElastic: t => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    
    // Expo ease out
    easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)'
};

// ===================================================
// 2. STAGGERED ANIMATIONS UTILITY
// ===================================================
// Purpose: Animate multiple elements with sequential delays
// Usage: Great for lists, cards, or any repeated elements
function staggerAnimation(elements, animationOptions, staggerDelay = 100) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.animate(animationOptions.keyframes, {
                duration: animationOptions.duration || 600,
                easing: animationOptions.easing || Easing.easeOutBack,
                fill: 'forwards'
            });
        }, index * staggerDelay);
    });
}

// ===================================================
// 3. HERO SECTION ENTRANCE ANIMATION
// ===================================================
// Purpose: Choreograph hero section reveal on page load
// Motion: Sequential reveal with spring physics
window.addEventListener('load', () => {
    // Animate hero badge
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 800,
            easing: Easing.easeOutBack,
            delay: 200,
            fill: 'forwards'
        });
    }
    
    // Animate title lines with stagger
    const titleLines = document.querySelectorAll('.title-line');
    staggerAnimation(titleLines, {
        keyframes: [
            { opacity: 0, transform: 'translateY(30px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        duration: 800,
        easing: Easing.easeOutBack
    }, 150);
    
    // Animate subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        subtitle.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 800,
            easing: Easing.easeOutExpo,
            delay: 600,
            fill: 'forwards'
        });
    }
    
    // Animate CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.animate([
            { opacity: 0, transform: 'translateY(20px) scale(0.9)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], {
            duration: 800,
            easing: Easing.easeOutBack,
            delay: 800,
            fill: 'forwards'
        });
    }
});

// ===================================================
// 4. SCROLL-BASED PARALLAX ANIMATION
// ===================================================
// Purpose: Create depth with scroll-triggered motion
// Performance: Uses transform for GPU acceleration
class ParallaxController {
    constructor() {
        this.elements = [];
        this.ticking = false;
        this.init();
    }
    
    init() {
        // Find all elements with data-speed attribute
        const parallaxElements = document.querySelectorAll('[data-speed]');
        
        parallaxElements.forEach(element => {
            this.elements.push({
                element: element,
                speed: parseFloat(element.dataset.speed) || 0.5
            });
        });
        
        // Bind scroll listener
        window.addEventListener('scroll', () => this.onScroll());
    }
    
    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    }
    
    update() {
        const scrollY = window.scrollY;
        
        this.elements.forEach(({ element, speed }) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementHeight = rect.height;
            const viewportHeight = window.innerHeight;
            
            // Calculate parallax offset
            const scrollProgress = (scrollY - elementTop + viewportHeight) / (viewportHeight + elementHeight);
            const parallaxY = (scrollProgress - 0.5) * 100 * speed;
            
            // Apply transform
            element.style.transform = `translate3d(0, ${parallaxY}px, 0)`;
        });
        
        this.ticking = false;
    }
}

// Initialize parallax controller
const parallaxController = new ParallaxController();

// ===================================================
// 5. HOVER SCALE ANIMATION
// ===================================================
// Purpose: Add micro-interactions to interactive elements
// Motion: Smooth scale with spring easing
document.querySelectorAll('.card-icon, .carousel-btn, .theme-toggle').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' }
        ], {
            duration: 300,
            easing: Easing.easeOutBack,
            fill: 'forwards'
        });
    });
    
    element.addEventListener('mouseleave', function() {
        this.animate([
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: Easing.easeOutBack,
            fill: 'forwards'
        });
    });
});

// ===================================================
// 6. TEXT REVEAL ANIMATION
// ===================================================
// Purpose: Animate text with character-by-character reveal
// Motion: Sequential character fade-in
class TextReveal {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            duration: options.duration || 50,
            delay: options.delay || 0,
            ...options
        };
        this.originalText = element.textContent;
        this.init();
    }
    
    init() {
        // Split text into characters
        this.element.textContent = '';
        const chars = this.originalText.split('');
        
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.opacity = '0';
            span.style.display = 'inline-block';
            this.element.appendChild(span);
            
            // Animate each character
            setTimeout(() => {
                span.animate([
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 400,
                    easing: Easing.easeOutBack,
                    fill: 'forwards'
                });
            }, this.options.delay + (index * this.options.duration));
        });
    }
}

// ===================================================
// 7. INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ===================================================
// Purpose: Trigger animations when elements enter viewport
// Performance: More efficient than scroll listeners
const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const animationType = element.dataset.animate || 'fadeInUp';
            
            // Apply animation based on data attribute
            switch (animationType) {
                case 'fadeInUp':
                    element.animate([
                        { opacity: 0, transform: 'translateY(40px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], {
                        duration: 800,
                        easing: Easing.easeOutBack,
                        fill: 'forwards'
                    });
                    break;
                
                case 'fadeInLeft':
                    element.animate([
                        { opacity: 0, transform: 'translateX(-40px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ], {
                        duration: 800,
                        easing: Easing.easeOutBack,
                        fill: 'forwards'
                    });
                    break;
                
                case 'fadeInRight':
                    element.animate([
                        { opacity: 0, transform: 'translateX(40px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ], {
                        duration: 800,
                        easing: Easing.easeOutBack,
                        fill: 'forwards'
                    });
                    break;
                
                case 'scaleIn':
                    element.animate([
                        { opacity: 0, transform: 'scale(0.8)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ], {
                        duration: 800,
                        easing: Easing.easeOutBack,
                        fill: 'forwards'
                    });
                    break;
            }
            
            // Unobserve after animation (one-time animation)
            scrollAnimationObserver.unobserve(element);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all elements with data-animate attribute
document.querySelectorAll('[data-animate]').forEach(element => {
    scrollAnimationObserver.observe(element);
});

// ===================================================
// 8. RIPPLE EFFECT ON CLICK
// ===================================================
// Purpose: Material Design-inspired ripple feedback
// Motion: Expanding circle on click/tap
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Style ripple
    Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.5)',
        transform: 'scale(0)',
        pointerEvents: 'none'
    });
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Animate ripple
    ripple.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).onfinish = () => ripple.remove();
}

// Apply ripple to buttons
document.querySelectorAll('.cta-button, .submit-btn, .carousel-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        createRipple(e, this);
    });
});

// ===================================================
// 9. NUMBER COUNTER ANIMATION
// ===================================================
// Purpose: Animate numbers counting up (great for stats)
// Motion: Smooth interpolation with easing
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// ===================================================
// 10. PAGE TRANSITION ANIMATION
// ===================================================
// Purpose: Smooth transitions between sections or pages
// Motion: Fade with scale for depth
class PageTransition {
    constructor() {
        this.overlay = null;
        this.createOverlay();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: '9999',
            opacity: '0',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        document.body.appendChild(this.overlay);
    }
    
    async transition(callback) {
        // Fade in overlay
        this.overlay.style.pointerEvents = 'auto';
        await this.overlay.animate([
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 400,
            easing: Easing.easeOutExpo,
            fill: 'forwards'
        }).finished;
        
        // Execute callback (e.g., navigate to new page)
        if (callback) callback();
        
        // Fade out overlay
        await this.overlay.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(1.05)' }
        ], {
            duration: 400,
            easing: Easing.easeOutExpo,
            fill: 'forwards'
        }).finished;
        
        this.overlay.style.pointerEvents = 'none';
    }
}

// Initialize page transition controller
const pageTransition = new PageTransition();

// ===================================================
// 11. MORPHING SHAPES ANIMATION
// ===================================================
// Purpose: Smooth SVG path morphing
// Visual: Create organic, flowing animations
class PathMorph {
    constructor(element, paths, options = {}) {
        this.element = element;
        this.paths = paths;
        this.currentIndex = 0;
        this.options = {
            duration: options.duration || 2000,
            loop: options.loop !== false,
            ...options
        };
    }
    
    start() {
        this.morph();
    }
    
    morph() {
        const nextIndex = (this.currentIndex + 1) % this.paths.length;
        
        this.element.animate([
            { d: this.paths[this.currentIndex] },
            { d: this.paths[nextIndex] }
        ], {
            duration: this.options.duration,
            easing: Easing.easeInOutCubic,
            fill: 'forwards'
        }).onfinish = () => {
            this.currentIndex = nextIndex;
            if (this.options.loop) {
                setTimeout(() => this.morph(), this.options.delay || 0);
            }
        };
    }
}

// ===================================================
// INITIALIZATION LOG
// ===================================================
console.log('🎭 Animation controller initialized');
console.log('   Available animations: fadeInUp, fadeInLeft, fadeInRight, scaleIn');
console.log('   Parallax controller: active');
console.log('   Page transitions: ready');
