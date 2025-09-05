class BSStudio {
    constructor() {
        this.init();
    }

    init() {
        this.initializeComponents();
        this.bindEvents();
        this.setupAnimations();
        this.handleLoadingScreen();
        this.syncThemeIcon(); // Ensure icon matches saved theme
    }

    initializeComponents() {
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

        this.state = {
            currentTestimonial: 0,
            isMenuOpen: false,
            isDarkTheme: false,
            hasAnimatedStats: false
        };

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.state.isDarkTheme = savedTheme === 'dark';
            document.documentElement.setAttribute('data-theme', this.state.isDarkTheme ? 'dark' : 'light');
        }
    }

    syncThemeIcon() {
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            icon.className = this.state.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    bindEvents() {
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 200));

        if (this.elements.cursor) {
            document.addEventListener('mousemove', (e) => this.updateCursor(e));
        }

        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }


document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        this.handleNavClick(e);
        
        // Close mobile menu after clicking any link
        if (this.state.isMenuOpen) {
            this.toggleMobileMenu();
        }
    });
});

        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.elements.scrollTop) {
            this.elements.scrollTop.addEventListener('click', () => this.scrollToTop());
        }

        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleServiceFilter(e));
        });

        if (this.elements.prevBtn) this.elements.prevBtn.addEventListener('click', () => this.previousTestimonial());
        if (this.elements.nextBtn) this.elements.nextBtn.addEventListener('click', () => this.nextTestimonial());

        this.elements.sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToTestimonial(index));
        });

        if (this.elements.contactForm) {
            this.elements.contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
        }
    }

    setupAnimations() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }
        this.setupStatsAnimation();
        this.setupTestimonialAutoPlay();
    }

    handleLoadingScreen() {
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.classList.add('hidden');
                setTimeout(() => this.elements.loadingScreen.style.display = 'none', 500);
            }
        }, 2000);
    }

    handleScroll() {
        const scrollY = window.pageYOffset;

        if (this.elements.header) {
            this.elements.header.classList.toggle('scrolled', scrollY > 100);
        }

        if (this.elements.scrollTop) {
            this.elements.scrollTop.classList.toggle('visible', scrollY > 500);
        }

        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 80 && rect.bottom >= 80) {
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

    updateCursor(e) {
        if (this.elements.cursor) {
            this.elements.cursor.style.left = e.clientX - 10 + 'px';
            this.elements.cursor.style.top = e.clientY - 10 + 'px';
        }
    }

    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        this.elements.menuToggle?.classList.toggle('active');
        this.elements.navLinks?.classList.toggle('active');
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
    }

    handleNavClick(e) {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) this.smoothScrollTo(target.offsetTop - 80);
        }
    }

    smoothScrollTo(target) {
        window.scrollTo({ top: target, behavior: 'smooth' });
    }

    toggleTheme() {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        document.documentElement.setAttribute('data-theme', this.state.isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('theme', this.state.isDarkTheme ? 'dark' : 'light');
        this.syncThemeIcon();
    }

    syncThemeIcon() {
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            icon.className = this.state.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    scrollToTop() {
        this.smoothScrollTo(0);
    }

    handleServiceFilter(e) {
        const filter = e.target.dataset.filter;
        this.elements.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        this.elements.serviceCards.forEach(card => {
            const category = card.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            card.style.opacity = shouldShow ? '0' : '1';
            card.style.display = shouldShow ? 'block' : 'none';
            setTimeout(() => { card.style.opacity = shouldShow ? '1' : '0'; }, 50);
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
        this.elements.statNumbers.forEach(stat => observer.observe(stat));
    }

    animateStats() {
        this.elements.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const suffix = stat.dataset.suffix || '';
            let current = 0;
            const increment = target / 100;

            const update = () => {
                if (current < target) {
                    current += increment;
                    stat.textContent = Math.ceil(current) + suffix;
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = target + suffix;
                }
            };
            update();
        });
    }

    setupTestimonialAutoPlay() {
        setInterval(() => {
            if (!document.querySelector('.testimonials-slider:hover')) {
                this.nextTestimonial();
            }
        }, 5000);
    }

    nextTestimonial() {
        this.state.currentTestimonial = (this.state.currentTestimonial + 1) % this.elements.testimonialCards.length;
        this.updateTestimonialSlider();
    }

    previousTestimonial() {
        this.state.currentTestimonial = (this.state.currentTestimonial === 0)
            ? this.elements.testimonialCards.length - 1
            : this.state.currentTestimonial - 1;
        this.updateTestimonialSlider();
    }

    goToTestimonial(index) {
        this.state.currentTestimonial = index;
        this.updateTestimonialSlider();
    }

    updateTestimonialSlider() {
        this.elements.testimonialCards.forEach((card, i) => {
            card.classList.toggle('active', i === this.state.currentTestimonial);
        });
        this.elements.sliderDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.state.currentTestimonial);
        });
    }

    handleContactForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.email || !data.service) {
            this.showNotification('Please fill all required fields.', 'error');
            return;
        }
        if (!this.isValidEmail(data.email)) {
            this.showNotification('Please enter a valid email.', 'error');
            return;
        }

        this.showLoadingButton(e.target.querySelector('button[type="submit"]'), true);
        setTimeout(() => {
            this.showLoadingButton(e.target.querySelector('button[type="submit"]'), false);
            this.showNotification(`Thank you ${data.name}! Message sent.`, 'success');
            e.target.reset();
        }, 2000);
    }

    handleNewsletterForm(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email.', 'error');
            return;
        }
        const btn = e.target.querySelector('button');
        this.showLoadingButton(btn, true);
        setTimeout(() => {
            this.showLoadingButton(btn, false);
            this.showNotification('Thank you for subscribing!', 'success');
            e.target.reset();
        }, 1500);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showLoadingButton(button, loading) {
        if (!button) return;
        button.disabled = loading;
        button.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i> Sending...'
            : '<span>Send Message</span><div class="btn-bg"></div>';
    }

    showNotification(message, type) {
        if (document.querySelector('.notification')) return;
        const notif = document.createElement('div');
        notif.className = `notification notification-${type} show`;
        notif.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        document.body.appendChild(notif);
        notif.querySelector('.notification-close').onclick = () => this.removeNotification(notif);
        setTimeout(() => this.removeNotification(notif), 5000);
    }

    getIcon(type) {
        return { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' }[type] || 'info-circle';
    }

    removeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => { if (notif.parentNode) notif.remove(); }, 300);
    }

    addNotificationStyles() {
        if (document.getElementById('notif-styles')) return;
        const style = document.createElement('style');
        style.id = 'notif-styles';
        style.textContent = `/* See earlier CSS */`;
        document.head.appendChild(style);
    }

    throttle(func, delay) {
        let inThrottle;
        return () => {
            if (!inThrottle) {
                func();
                inThrottle = true;
                setTimeout(() => inThrottle = false, delay);
            }
        };
    }

    debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    handlePageLoad() {
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    handleResize() {
        if (window.innerWidth > 992 && this.state.isMenuOpen) {
            this.toggleMobileMenu();
        }
        if (typeof AOS !== 'undefined') AOS.refresh();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BSStudio(); 
});

// Error handling
window.addEventListener('error', e => console.error('Error:', e.error));
window.addEventListener('unhandledrejection', e => console.error('Unhandled Promise:', e.reason));

