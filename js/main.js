/* 
===================================================
MAIN JAVASCRIPT - Core functionality and coordination
===================================================
Purpose: Initialize all modules and manage global interactions
Performance: Modular architecture for maintainability
*/

// ===================================================
// 1. SMOOTH SCROLL BEHAVIOR
// ===================================================
// Purpose: Enhanced smooth scrolling with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            // Calculate offset for fixed navigation
            const navHeight = document.querySelector('.main-nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            
            // Smooth scroll with custom easing
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================================
// 2. NAVIGATION SCROLL EFFECT
// ===================================================
// Purpose: Add glassmorphism effect to nav on scroll
// Performance: Uses requestAnimationFrame for smooth updates
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavigation() {
    const nav = document.getElementById('mainNav');
    const scrollY = window.scrollY;
    
    // Add 'scrolled' class when user scrolls down 50px
    if (scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    // Performance: Use requestAnimationFrame to throttle updates
    if (!ticking) {
        window.requestAnimationFrame(updateNavigation);
        ticking = true;
    }
});

// ===================================================
// 3. ACTIVE NAVIGATION LINK TRACKING
// ===================================================
// Purpose: Highlight current section in navigation
// Uses Intersection Observer for performance
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current section link
            const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, observerOptions);

// Observe all sections
sections.forEach(section => sectionObserver.observe(section));

// ===================================================
// 4. SCROLL-TRIGGERED ANIMATIONS
// ===================================================
// Purpose: Animate elements when they enter viewport
// Uses Intersection Observer for better performance than scroll events
const animatedElements = document.querySelectorAll('.feature-card, .section-header');

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add 'visible' class to trigger CSS animations
            entry.target.classList.add('visible');
            
            // Optional: Unobserve after animation (one-time animation)
            // animationObserver.unobserve(entry.target);
        }
    });
}, {
    root: null,
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: '0px 0px -100px 0px' // Trigger slightly before element enters viewport
});

// Observe all animated elements
animatedElements.forEach(element => animationObserver.observe(element));

// ===================================================
// 5. MAGNETIC BUTTON EFFECT
// ===================================================
// Purpose: Create magnetic hover effect for interactive elements
// Motion: Buttons follow cursor with spring physics
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate center of element
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate offset from center (max 20px movement)
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        const moveX = deltaX * 20;
        const moveY = deltaY * 20;
        
        // Apply transform with spring-like easing
        this.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    element.addEventListener('mouseleave', function() {
        // Return to original position with smooth transition
        this.style.transform = 'translate(0, 0)';
    });
});

// ===================================================
// 6. 3D TILT EFFECT FOR CARDS
// ===================================================
// Purpose: Create depth with 3D perspective on mouse movement
// Visual: Cards tilt based on cursor position
const tiltElements = document.querySelectorAll('[data-tilt]');

tiltElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation (max 10 degrees)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Inverted for natural feel
        const rotateY = ((x - centerX) / centerX) * 10;
        
        // Apply 3D transform
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    element.addEventListener('mouseleave', function() {
        // Return to flat position
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// ===================================================
// 7. THEME TOGGLE
// ===================================================
// Purpose: Switch between dark and light themes
// Persistence: Save preference to localStorage
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Check for saved theme preference or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light-mode', currentTheme === 'light');

themeToggle.addEventListener('click', () => {
    // Toggle theme class
    document.body.classList.toggle('light-mode');
    
    // Get new theme
    const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Optional: Update CSS custom properties for light mode
    if (theme === 'light') {
        root.style.setProperty('--color-bg-primary', '#ffffff');
        root.style.setProperty('--color-bg-secondary', '#f5f5f7');
        root.style.setProperty('--color-bg-tertiary', '#e8e8ed');
        root.style.setProperty('--color-text-primary', '#1d1d1f');
        root.style.setProperty('--color-text-secondary', '#515154');
        root.style.setProperty('--color-text-muted', '#86868b');
    } else {
        // Reset to dark mode values
        root.style.setProperty('--color-bg-primary', '#0f0f23');
        root.style.setProperty('--color-bg-secondary', '#1a1a2e');
        root.style.setProperty('--color-bg-tertiary', '#16213e');
        root.style.setProperty('--color-text-primary', '#ffffff');
        root.style.setProperty('--color-text-secondary', '#a0a0b8');
        root.style.setProperty('--color-text-muted', '#6b6b8a');
    }
});

// ===================================================
// 8. FORM VALIDATION & SUBMISSION
// ===================================================
// Purpose: Validate contact form and provide feedback
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    }, 1000);
});

// ===================================================
// 9. NOTIFICATION SYSTEM
// ===================================================
// Purpose: Show user feedback messages
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1',
        color: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
        zIndex: '1000',
        animation: 'slideInRight 0.3s ease',
        fontSize: '0.875rem',
        fontWeight: '600',
        maxWidth: '300px'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations to stylesheet dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ===================================================
// 10. PERFORMANCE MONITORING
// ===================================================
// Purpose: Log performance metrics in development
// Optimization: Monitor FPS and load times
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            console.log('🚀 Performance Metrics:');
            console.log(`   Page Load Time: ${loadTime}ms`);
            console.log(`   DOM Ready: ${domReady}ms`);
            console.log(`   Resources Loaded: ${performance.getEntriesByType('resource').length}`);
        }, 0);
    });
}

// ===================================================
// 11. LAZY LOADING IMAGES
// ===================================================
// Purpose: Load images only when they enter viewport
// Performance: Reduces initial page load time
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===================================================
// 12. PARALLAX SCROLL EFFECT
// ===================================================
// Purpose: Add depth with parallax scrolling
// Performance: Uses transform for GPU acceleration
const parallaxElements = document.querySelectorAll('[data-parallax]');

if (parallaxElements.length > 0) {
    let parallaxTicking = false;
    
    function updateParallax() {
        const scrolled = window.scrollY;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        parallaxTicking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            window.requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    });
}

// ===================================================
// 13. CURSOR TRAIL EFFECT (Optional Enhancement)
// ===================================================
// Purpose: Create elegant cursor trail for premium feel
// Can be toggled on/off based on user preference
let cursorTrailEnabled = false; // Set to true to enable

if (cursorTrailEnabled) {
    const trail = [];
    const trailLength = 20;
    
    // Create trail elements
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        Object.assign(dot.style, {
            position: 'fixed',
            width: '4px',
            height: '4px',
            background: `rgba(99, 102, 241, ${1 - i / trailLength})`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'transform 0.1s ease'
        });
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    // Update trail positions
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let x = mouseX;
        let y = mouseY;
        
        trail.forEach((dot, index) => {
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            dot.style.transform = `scale(${(trailLength - index) / trailLength})`;
            
            // Each dot follows the previous one
            const nextDot = trail[index + 1] || trail[0];
            x += (parseInt(nextDot.style.left) - x) * 0.3;
            y += (parseInt(nextDot.style.top) - y) * 0.3;
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// ===================================================
// INITIALIZATION COMPLETE
// ===================================================
console.log('✨ Quantum Portfolio Explorer initialized successfully!');
console.log('📊 All systems operational');
