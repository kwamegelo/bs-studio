// Modern JavaScript for BS Studio Lash Extensions Website

class BSStudioWebsite {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSlideshow();
        this.setupSmoothScroll();
        this.setupHeaderScroll();
        this.setupFAQ();
        this.setupForm();
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');

        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav?.classList.remove('active');
                menuToggle?.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav?.contains(e.target) && !menuToggle?.contains(e.target)) {
                nav?.classList.remove('active');
                menuToggle?.classList.remove('active');
            }
        });
    }

    initializeSlideshow() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.slide-nav.prev');
        const nextBtn = document.querySelector('.slide-nav.next');

        if (!slides.length) return;

        this.totalSlides = slides.length;

        // Initialize first slide as active
        this.showSlide(0);

        // Previous button
        prevBtn?.addEventListener('click', () => {
            this.previousSlide();
        });

        // Next button
        nextBtn?.addEventListener('click', () => {
            this.nextSlide();
        });

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showSlide(index);
            });
        });

        // Auto-play slideshow (optional)
        this.startAutoPlay();

        // Pause auto-play on hover
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });

            slideshowContainer.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }

        // Touch/swipe support for mobile
        this.setupTouchNavigation();
    }

    showSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');

        if (index >= this.totalSlides) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.totalSlides - 1;
        } else {
            this.currentSlide = index;
        }

        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current slide and activate corresponding dot
        if (slides[this.currentSlide]) {
            slides[this.currentSlide].classList.add('active');
        }
        if (dots[this.currentSlide]) {
            dots[this.currentSlide].classList.add('active');
        }
    }

    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    previousSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    setupTouchNavigation() {
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (!slideshowContainer) return;

        let startX = 0;
        let endX = 0;

        slideshowContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        slideshowContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });

        // Prevent default touch behavior to avoid interference
        slideshowContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    handleSwipe() {
        const threshold = 50; // Minimum distance for swipe
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped left - show next slide
                this.nextSlide();
            } else {
                // Swiped right - show previous slide
                this.previousSlide();
            }
        }
    }

    setupSmoothScroll() {
        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Smooth scroll for CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            if (button.textContent.includes('Book') || button.textContent.includes('Appointment')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const bookingSection = document.querySelector('.booking');
                    if (bookingSection) {
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                        const targetPosition = bookingSection.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    }

    setupHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;

            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (question && answer) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });

                    // Toggle current item
                    if (isActive) {
                        item.classList.remove('active');
                    } else {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    setupForm() {
        const form = document.querySelector('.appointment-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const formObject = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }

            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    this.showFieldError(field, 'This field is required');
                    isValid = false;
                } else {
                    this.clearFieldError(field);
                }
            });

            // Email validation
            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value && !this.isValidEmail(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }

            if (isValid) {
                this.submitForm(formObject);
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    this.showFieldError(input, 'This field is required');
                } else {
                    this.clearFieldError(input);
                }
            });

            // Email validation on blur
            if (input.type === 'email') {
                input.addEventListener('blur', () => {
                    if (input.value && !this.isValidEmail(input.value)) {
                        this.showFieldError(input, 'Please enter a valid email address');
                    } else if (input.value) {
                        this.clearFieldError(input);
                    }
                });
            }
        });
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#e74c3c';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 14px;
            margin-top: 4px;
            animation: fadeInUp 0.3s ease;
        `;
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async submitForm(formData) {
        const submitButton = document.querySelector('.appointment-form button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Booking...';
        submitButton.disabled = true;

        try {
            // Simulate form submission (replace with actual API call)
            await this.simulateFormSubmission(formData);
            
            // Show success message
            this.showSuccessMessage();
            
            // Reset form
            document.querySelector('.appointment-form').reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Sorry, there was an error booking your appointment. Please try again or call us directly.');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    async simulateFormSubmission(formData) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (90% success rate for demo)
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Appointment booked successfully!' });
                } else {
                    reject(new Error('Simulated server error'));
                }
            }, 2000);
        });
    }

    showSuccessMessage() {
        const message = this.createNotification(
            'Appointment Booked Successfully!',
            'Thank you for your booking. We\'ll contact you shortly to confirm your appointment.',
            'success'
        );
        this.showNotification(message);
    }

    showErrorMessage(text) {
        const message = this.createNotification(
            'Booking Error',
            text,
            'error'
        );
        this.showNotification(message);
    }

    createNotification(title, text, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            notification.style.color = 'white';
        } else {
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            notification.style.color = 'white';
        }

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 20px; margin-top: 2px;">
                    ${type === 'success' ? '✓' : '⚠'}
                </div>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
                    <div style="opacity: 0.9; font-size: 14px; line-height: 1.4;">${text}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; margin-left: auto;">
                    ×
                </button>
            </div>
        `;

        return notification;
    }

    showNotification(notification) {
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    setupIntersectionObserver() {
        // Animate elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll(`
            .benefit-item,
            .included-item,
            .pricing-card,
            .tip-category,
            .testimonial-card,
            .faq-item
        `);

        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BSStudioWebsite();
});

// Global functions for backward compatibility
function plusSlides(n) {
    if (window.bsStudio) {
        if (n === 1) {
            window.bsStudio.nextSlide();
        } else if (n === -1) {
            window.bsStudio.previousSlide();
        }
    }
}

// Store instance globally for external access
document.addEventListener('DOMContentLoaded', () => {
    window.bsStudio = new BSStudioWebsite();
});

// Additional enhancements
class PerformanceOptimizer {
    static init() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup service worker for caching (if needed)
        this.setupServiceWorker();
    }

    static setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    }

    static preloadCriticalResources() {
        // Preload hero image if exists
        const heroImage = document.querySelector('.hero img, .hero-background');
        if (heroImage) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImage.src || heroImage.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            document.head.appendChild(link);
        }
    }

    static setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Register service worker if sw.js exists
                navigator.serviceWorker.register('/sw.js').catch(() => {
                    // Service worker not available, continue without it
                });
            });
        }
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    PerformanceOptimizer.init();
});