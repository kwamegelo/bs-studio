// Modern JavaScript for BS Studio Website

class BSStudio {
    constructor() {
        this.init();
    }

    init() {
        this.initializeComponents();
        this.bindEvents();
        this.setupAnimations();
        this.handleLoadingScreen();
    }

    initializeComponents() {
        // Cache DOM elements
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            header: document.getElementById('header'),
            menuToggle: document.getElementById('menuToggle'),
            navLinks: document.getElementById('navLinks'),
            themeToggle: document.getElementById('themeToggle'),
            scrollTop: document.getElementById('scrollTop'),
            cursor: document.getElementById('cursor'),
            contactForm: document.getElementById('contactForm'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            serviceCards: document.querySelectorAll('.service-card'),
            testimonialSlider: document.querySelector('.testimonials-slider'),
            testimonialCards: document.querySelectorAll('.testimonial-card'),
            sliderDots: document.querySelectorAll('.dot'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            statNumbers: document.querySelectorAll('[data-count]')
        };

        // Initialize state
        this.state = {
            currentTestimonial: 0,
            isMenuOpen: false,
            isDarkTheme: false,
            hasAnimatedStats: false
        };

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.state.isDarkTheme = savedTheme === 'dark';
            this.toggleTheme(false);
        }
    }

    bindEvents() {
        // Window events
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // Custom cursor
        if (this.elements.cursor) {
            document.addEventListener('mousemove', (e) => this.updateCursor(e));
            document.addEventListener('mouseenter', () => this.showCursor());
            document.addEventListener('mouseleave', () => this.hideCursor());
        }

        // Navigation events
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
                if (this.state.isMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Scroll to top button
        if (this.elements.scrollTop) {
            this.elements.scrollTop.addEventListener('click', () => this.scrollToTop());
        }

        // Services filter
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleServiceFilter(e));
        });

        // Testimonial slider
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.previousTestimonial());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextTestimonial());
        }

        // Testimonial dots
        this.elements.sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToTestimonial(index));
        });

        // Contact form
        if (this.elements.contactForm) {
            this.elements.contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
        }

        // Service card interactions
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.handleServiceCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleServiceCardHover(card, false));
        });
    }

    setupAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                delay: 100
            });
        }

        // Setup intersection observer for stats animation
        this.setupStatsAnimation();
        
        // Setup testimonial auto-play
        this.setupTestimonialAutoPlay();
    }

    handleLoadingScreen() {
        // Simulate loading time
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    this.elements.loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }

    handlePageLoad() {
        // Trigger animations for elements already in view
        this.animateVisibleElements();
        
        // Refresh AOS if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Header scroll effect
        if (this.elements.header) {
            if (scrollY > 100) {
                this.elements.header.classList.add('scrolled');
            } else {
                this.elements.header.classList.remove('scrolled');
            }
        }

        // Scroll to top button
        if (this.elements.scrollTop) {
            if (scrollY > 500) {
                this.elements.scrollTop.classList.add('visible');
            } else {
                this.elements.scrollTop.classList.remove('visible');
            }
        }

        // Parallax effects
        this.handleParallax(scrollY);
        
        // Update active navigation link
        this.updateActiveNavLink();
    }

    handleResize() {
        // Close mobile menu on resize
        if (window.innerWidth > 992 && this.state.isMenuOpen) {
            this.toggleMobileMenu();
        }
        
        // Refresh AOS if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    updateCursor(e) {
        if (!this.elements.cursor) return;
        
        requestAnimationFrame(() => {
            this.elements.cursor.style.left = e.clientX - 10 + 'px';
            this.elements.cursor.style.top = e.clientY - 10 + 'px';
        });
    }

    showCursor() {
        if (this.elements.cursor) {
            this.elements.cursor.style.opacity = '1';
        }
    }

    hideCursor() {
        if (this.elements.cursor) {
            this.elements.cursor.style.opacity = '0';
        }
    }

    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        
        if (this.elements.menuToggle) {
            this.elements.menuToggle.classList.toggle('active');
        }
        
        if (this.elements.navLinks) {
            this.elements.navLinks.classList.toggle('active');
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
    }

    handleNavClick(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                this.smoothScrollTo(targetElement.offsetTop - 80);
            }
        }
    }

    toggleTheme(save = true) {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        
        document.documentElement.setAttribute(
            'data-theme', 
            this.state.isDarkTheme ? 'dark' : 'light'
        );

        // Update theme toggle icon
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.state.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        // Save preference
        if (save) {
            localStorage.setItem('theme', this.state.isDarkTheme ? 'dark' : 'light');
        }
    }

    scrollToTop() {
        this.smoothScrollTo(0);
    }

    smoothScrollTo(target) {
        window.scrollTo({
            top: target,
            behavior: 'smooth'
        });
    }

    handleServiceFilter(e) {
        const filter = e.target.dataset.filter;
        
        // Update active filter button
        this.elements.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter service cards
        this.elements.serviceCards.forEach(card => {
            const category = card.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    setupStatsAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.hasAnimatedStats) {
                    this.animateStats();
                    this.state.hasAnimatedStats = true;
                }
            });
        }, { threshold: 0.5 });

        this.elements.statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    animateStats() {
        this.elements.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const increment = target / 100;
            let current = 0;
            
            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target + (stat.dataset.count.includes('%') ? '%' : '+');
                }
            };
            
            updateCount();
        });
    }

    setupTestimonialAutoPlay() {
        // Auto-play testimonials every 5 seconds
        setInterval(() => {
            if (!document.querySelector('.testimonials-slider:hover')) {
                this.nextTestimonial();
            }
        }, 5000);
    }

    nextTestimonial() {
        this.state.currentTestimonial = 
            (this.state.currentTestimonial + 1) % this.elements.testimonialCards.length;
        this.updateTestimonialSlider();
    }

    previousTestimonial() {
        this.state.currentTestimonial = 
            this.state.currentTestimonial === 0 
                ? this.elements.testimonialCards.length - 1 
                : this.state.currentTestimonial - 1;
        this.updateTestimonialSlider();
    }

    goToTestimonial(index) {
        this.state.currentTestimonial = index;
        this.updateTestimonialSlider();
    }

    updateTestimonialSlider() {
        // Update testimonial cards
        this.elements.testimonialCards.forEach((card, index) => {
            if (index === this.state.currentTestimonial) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update dots
        this.elements.sliderDots.forEach((dot, index) => {
            if (index === this.state.currentTestimonial) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    handleServiceCardHover(card, isHovering) {
        const overlay = card.querySelector('.service-overlay');
        const icons = card.querySelectorAll('.service-icon');
        
        if (isHovering) {
            // Stagger icon animations
            icons.forEach((icon, index) => {
                setTimeout(() => {
                    icon.style.transform = 'translateY(0)';
                    icon.style.opacity = '1';
                }, index * 100);
            });
        } else {
            icons.forEach(icon => {
                icon.style.transform = 'translateY(20px)';
                icon.style.opacity = '0';
            });
        }
    }

    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.name || !data.email || !data.service) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!this.isValidEmail(data.email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Simulate form submission
        this.showLoadingButton(e.target.querySelector('button[type="submit"]'), true);
        
        setTimeout(() => {
            this.showLoadingButton(e.target.querySelector('button[type="submit"]'), false);
            this.showNotification(
                `Thank you ${data.name}! Your message has been sent. We'll contact you shortly.`, 
                'success'
            );
            e.target.reset();
        }, 2000);
    }

    handleNewsletterForm(e) {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Simulate subscription
        const button = e.target.querySelector('button');
        this.showLoadingButton(button, true);
        
        setTimeout(() => {
            this.showLoadingButton(button, false);
            this.showNotification('Thank you for subscribing to our newsletter!', 'success');
            e.target.reset();
        }, 1500);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoadingButton(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        } else {
            button.disabled = false;
            button.innerHTML = '<span>Send Message</span><div class="btn-bg"></div>';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        this.addNotificationStyles();
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => this.removeNotification(notification), 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                min-width: 320px;
                max-width: 400px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10001;
                border-left: 4px solid var(--primary);
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-warning {
                border-left-color: #f59e0b;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 18px;
                color: var(--primary);
            }
            
            .notification-success .notification-content i {
                color: #10b981;
            }
            
            .notification-error .notification-content i {
                color: #ef4444;
            }
            
            .notification-warning .notification-content i {
                color: #f59e0b;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background: #f3f4f6;
            }
            
            @media (max-width: 480px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    handleParallax(scrollY) {
        // Parallax effect for floating elements
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px) rotate(${scrollY * 0.1}deg)`;
        });
        
        // Parallax effect for hero background
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            const yPos = -(scrollY * 0.5);
            heroBackground.style.transform = `translateY(${yPos}px)`;
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    animateVisibleElements() {
        const elements = document.querySelectorAll('[data-aos]');
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            
            if (isVisible) {
                element.classList.add('aos-animate');
            }
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Performance optimization
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Initialize performance optimizations
    optimizePerformance() {
        // Optimize scroll handler
        this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
        
        // Lazy load images
        this.lazyLoadImages();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    preloadCriticalResources() {
        // Preload important images
        const criticalImages = [
            'images/lash4.jpg',
            // Add more critical images here
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new BSStudio();
    
    // Make app globally accessible for debugging
    window.BSStudio = app;
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // You could send error reports to your analytics service here
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Handle unhandled promise rejections
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
        }, 0);
    });
}