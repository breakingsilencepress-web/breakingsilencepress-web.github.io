document.addEventListener('DOMContentLoaded', function() {document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeTestimonialSlider();
    initializeScrollEffects();
    initializeFormHandlers();
    initializeDownloadTracking();
    initializeThemeToggle();
});

function initializeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    const menuIcon = document.querySelector('.mobile-menu i');
    
    if (!mobileMenu || !navMenu) return;
    
    mobileMenu.addEventListener('click', function() {
        const isExpanded = navMenu.classList.toggle('show');
        mobileMenu.setAttribute('aria-expanded', isExpanded);
        
        // Update icon
        if (menuIcon) {
            menuIcon.className = isExpanded ? 'fas fa-times' : 'fas fa-bars';
        }
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenu.contains(e.target) && navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
            mobileMenu.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (menuIcon) {
                menuIcon.className = 'fas fa-bars';
            }
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
            mobileMenu.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (menuIcon) {
                menuIcon.className = 'fas fa-bars';
            }
            mobileMenu.focus();
        }
    });
}

// Enhanced Smooth Scrolling with Better Navigation
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            // Calculate scroll position accounting for fixed header
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            // Smooth scroll
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without jumping
            history.pushState(null, null, targetId);
            
            // Close mobile menu if open
            const navMenu = document.querySelector('nav ul');
            const mobileMenu = document.querySelector('.mobile-menu');
            const menuIcon = document.querySelector('.mobile-menu i');
            
            if (navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                mobileMenu.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                if (menuIcon) {
                    menuIcon.className = 'fas fa-bars';
                }
            }
            
            // Update focus for accessibility
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
            targetElement.removeAttribute('tabindex');
        });
    });
}

// Enhanced Testimonial Slider with Touch Support and Loop
function initializeTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const nextBtn = document.querySelector('.testimonial-control.next');
    const prevBtn = document.querySelector('.testimonial-control.prev');
    
    if (!track || slides.length === 0) return;
    
    let currentSlide = 0;
    let autoScrollInterval;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;

    function updateSlider() {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateSliderControls();
    }

    function updateSliderControls() {
        // Update ARIA labels and states
        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== currentSlide);
        });
        
        // Update button states - remove disabled state since we're looping
        if (prevBtn) {
            prevBtn.setAttribute('aria-label', `Go to previous testimonial`);
        }
        
        if (nextBtn) {
            nextBtn.setAttribute('aria-label', `Go to next testimonial`);
        }
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlider();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    }

    // Touch and Mouse Events for Swipe
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    // Event Listeners for Slider
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Keyboard Navigation
    track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'Home') goToSlide(0);
        if (e.key === 'End') goToSlide(slides.length - 1);
    });

    // Touch Events
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        startPos = getPositionX(e);
        animationID = requestAnimationFrame(animation);
        track.style.cursor = 'grabbing';
        clearInterval(autoScrollInterval);
    });

    track.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    });

    track.addEventListener('touchend', () => {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100) {
            nextSlide();
        } else if (movedBy > 100) {
            prevSlide();
        }
        
        currentTranslate = -currentSlide * track.offsetWidth;
        prevTranslate = currentTranslate;
        
        updateSlider();
        track.style.cursor = 'grab';
        startAutoScroll();
    });

    // Mouse Events
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = getPositionX(e);
        animationID = requestAnimationFrame(animation);
        track.style.cursor = 'grabbing';
        clearInterval(autoScrollInterval);
    });

    track.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    });

    track.addEventListener('mouseup', () => {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100) {
            nextSlide();
        } else if (movedBy > 100) {
            prevSlide();
        }
        
        currentTranslate = -currentSlide * track.offsetWidth;
        prevTranslate = currentTranslate;
        
        updateSlider();
        track.style.cursor = 'grab';
        startAutoScroll();
    });

    track.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            cancelAnimationFrame(animationID);
            currentTranslate = -currentSlide * track.offsetWidth;
            prevTranslate = currentTranslate;
            updateSlider();
            track.style.cursor = 'grab';
            startAutoScroll();
        }
    });

    // Auto-scroll functionality
    function startAutoScroll() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            if (!isDragging) {
                nextSlide();
            }
        }, 5000);
    }

    // Pause auto-scroll on hover/focus
    track.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });

    track.addEventListener('mouseleave', () => {
        if (!isDragging) {
            startAutoScroll();
        }
    });

    track.addEventListener('focusin', () => {
        clearInterval(autoScrollInterval);
    });

    track.addEventListener('focusout', () => {
        startAutoScroll();
    });

    // Initialize
    updateSliderControls();
    startAutoScroll();
    
    // Make slider focusable
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Testimonial carousel');
}

// Enhanced Scroll Effects with Performance Optimization
function initializeScrollEffects() {
    const header = document.querySelector('header');
    if (!header) return;

    let ticking = false;
    
    function updateHeader() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'rgba(17, 17, 17, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        }
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    updateHeader();
}

function launchSubscriptionConfetti() {
    confetti({
        particleCount: 250,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function initializeFormHandlers() {
    const subscribeForm = document.querySelector('.subscribe-form');
    if (!subscribeForm) return;

    const emailInput = subscribeForm.querySelector('input[type="email"]');
    const submitBtn = subscribeForm.querySelector('button[type="submit"]');
    let hasShownConfetti = false;

    // Real-time validation
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        const errorElement = this.parentNode.querySelector('.error-message');
        
        if (email && !isValidEmail(email)) {
            this.classList.add('error');
            if (errorElement) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.classList.add('show');
            }
        } else {
            this.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        }
    });

    // Form submission
    subscribeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const originalText = submitBtn.textContent;

        if (!email || !isValidEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(subscribeForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new FormData(subscribeForm)
            });

            if (!response.ok) {
                throw new Error('Submission failed');
            }

            launchSubscriptionConfetti();
            showMessage(`🎉 Welcome! ${email} has been subscribed.`, 'success');

            subscribeForm.reset();

            submitBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
            submitBtn.style.backgroundColor = '#16a34a';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
            }, 5000);

        } catch (error) {
            showMessage('Subscription failed. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
}

document.getElementById('sample-download').addEventListener('click', function (e) {
    e.preventDefault();
    const fileUrl = '/Documents/chapter-1.pdf';
    
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Free-Sample.pdf"; // The name it will save as
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('Download failed.'));
});

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Enhanced Message Display
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.subscription-message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `subscription-message ${type}`;
    
    const icon = type === 'success' ? '✅' : '⚠️';
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${icon}</span>
            <span class="message-text">${message}</span>
        </div>
    `;

    // Add styles
    messageDiv.style.cssText = `
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
        color: ${type === 'success' ? '#16a34a' : '#dc2626'};
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        font-size: 0.95rem;
        animation: slideDown 0.3s ease-out;
    `;

    // Add message content styles
    const style = document.createElement('style');
    style.textContent = `
        .message-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
        .message-icon {
            font-size: 1.1em;
        }
        .message-text {
            line-height: 1.4;
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    const formParent = document.querySelector('.subscribe-form').parentNode;
    formParent.insertBefore(messageDiv, document.querySelector('.subscribe-form'));

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 5000);

    // Add slideUp animation
    if (!document.querySelector('#message-animations')) {
        const animationStyle = document.createElement('style');
        animationStyle.id = 'message-animations';
        animationStyle.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }
        `;
        document.head.appendChild(animationStyle);
    }
}

// Enhanced Download Tracking
function initializeDownloadTracking() {
    const downloadBtn = document.querySelector('.btn-download');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', function(e) {
        // Optional: Add a small delay to ensure tracking fires
        setTimeout(() => {
            // Track with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'free_sample',
                    'event_label': 'Breaking Silence Chapter 1',
                    'value': 1
                });
            }

            // Track with Facebook Pixel if available
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead');
            }

            // Console log for development
            console.log('Sample download initiated - tracking event fired');
        }, 100);
        
        // Visual feedback
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing Download...';
        this.disabled = true;
        
        // Simulate download preparation time
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Download Complete!';
            
            // Reset button after delay
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.disabled = false;
            }, 2000);
        }, 1500);
    });
}
function initializeThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const icon = toggle ? toggle.querySelector('i') : null;
    const logo = document.getElementById('logo-img');

    if (!toggle || !icon) return;

    // Helper to update theme icon
    function updateIcon(isLightTheme) {
        icon.className = isLightTheme ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Helper to update logo
    function updateLogo(isLightTheme) {
        if (!logo) return;
        logo.src = isLightTheme ? 'Assets/Logo-black.png' : 'Assets/Logo-white.png';
    }

    // Set initial theme based on saved preference or OS
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isLight = savedTheme === 'light' || (!savedTheme && !prefersDark);

    html.classList.toggle('light', isLight);
    updateIcon(isLight);
    updateLogo(isLight);

    // Toggle theme on click or keyboard
    const toggleTheme = () => {
        const nowLight = html.classList.toggle('light');
        localStorage.setItem('theme', nowLight ? 'light' : 'dark');
        updateIcon(nowLight);
        updateLogo(nowLight);
    };

    toggle.addEventListener('click', toggleTheme);
    toggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Sync with OS theme changes (if user hasn’t manually chosen)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            html.classList.toggle('light', e.matches);
            updateIcon(e.matches);
            updateLogo(e.matches);
        }
    });
}

// Additional Utility: Lazy Loading for Images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
    initializeLazyLoading();
}

// Error Handling and Fallbacks
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeMobileMenu,
        initializeSmoothScrolling,
        initializeTestimonialSlider,
        initializeScrollEffects,
        initializeFormHandlers,
        initializeDownloadTracking,
        isValidEmail,
        showMessage
    };
}


