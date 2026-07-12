/**
 * Desk2Door - Global Client-side Logic
 * Handles: Responsive menu, scroll effects, intersection observer animations, WhatsApp linkages, and PWA registration
 */

// ========================================================================
// Desk2Door - Email Notifications Configuration
// ========================================================================
// To receive email notifications when a customer submits an order or contact form:
// 1. Visit https://web3forms.com and register your email (kwizerapatto7@gmail.com)
// 2. You will receive an Access Key in your email instantly.
// 3. Paste the Access Key below in the 'accessKey' field.
window.DESK2DOOR_EMAIL_CONFIG = {
    accessKey: "YOUR_ACCESS_KEY_HERE", // Replace with your actual Web3Forms Access Key
    toEmail: "kwizerapatto7@gmail.com"  // Your business email address
};

window.sendEmailNotification = async (data, subject) => {
    const config = window.DESK2DOOR_EMAIL_CONFIG;
    if (!config || !config.accessKey || config.accessKey === "YOUR_ACCESS_KEY_HERE") {
        console.warn("Web3Forms Access Key is not configured. Email notification skipped.");
        return false;
    }

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: config.accessKey,
                subject: subject,
                from_name: "Desk2Door Notifications",
                ...data
            })
        });
        const result = await response.json();
        return result.success;
    } catch (e) {
        console.error("Error sending email via Web3Forms:", e);
        return false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Sticky Header Scroll Effect
    const header = document.querySelector('.header');
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once in case page loads scrolled down

    // 3. Current Page Navigation Highlighter
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageName || (pageName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, no need to track it further
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        revealElements.forEach(el => el.classList.add('active'));
    }

    // 5. WhatsApp Integration Helper
    const waNumber = '250795124101'; // Dedicated phone number for Desk2Door
    
    // WhatsApp Floating Button Click Action
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.addEventListener('click', (e) => {
            e.preventDefault();
            const text = encodeURIComponent("Hello Desk2Door! I would like to inquire about ordering a Study Tool Kit for my child.");
            window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
        });
    }

    // Dynamic WhatsApp Callout Buttons
    const waButtons = document.querySelectorAll('[data-wa-trigger]');
    waButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceType = btn.getAttribute('data-wa-trigger') || 'inquiry';
            let message = "Hello Desk2Door! I would like to get in touch about your school supplies services.";
            
            if (serviceType === 'basic') {
                message = "Hello Desk2Door! I want to order a Basic Study Tool Kit customized for my child's school list.";
            } else if (serviceType === 'standard') {
                message = "Hello Desk2Door! I want to order a Standard Study Tool Kit customized for my child's school list.";
            } else if (serviceType === 'premium') {
                message = "Hello Desk2Door! I want to order a Premium Study Tool Kit customized for my child's school list.";
            } else if (serviceType === 'whatsapp_order') {
                message = "Hello Desk2Door! I have a school supply list and would like to place an order directly via WhatsApp.";
            }
            
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
        });
    });

    // 6. Progressive Web App (PWA) Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('Desk2Door PWA Service Worker registered successfully:', reg.scope);
                })
                .catch(err => {
                    console.warn('Desk2Door PWA Service Worker registration failed:', err);
                });
        });
    }

    // 7. Contact Form Handler with Email Notification
    const contactForm = document.getElementById('desk2doorContactForm');
    const contactFormContainer = document.getElementById('contactFormContainer');
    
    if (contactForm && contactFormContainer) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const contactName = document.getElementById('contactName').value.trim();
            const contactEmail = document.getElementById('contactEmail').value.trim();
            const contactMessage = document.getElementById('contactMessage').value.trim();
            
            // Show success state immediately to the user
            contactFormContainer.innerHTML = `
                <div class="form-success-icon flex-center">✓</div>
                <h3 style="text-align:center">Message Sent!</h3>
                <p style="text-align:center;font-size:0.95rem">Thank you for contacting Desk2Door. We will reply to your email address shortly.</p>
            `;
            
            // Send email in the background
            if (window.sendEmailNotification) {
                await window.sendEmailNotification({
                    "Sender Name": contactName,
                    "Sender Email": contactEmail,
                    "Inquiry Message": contactMessage
                }, `New Desk2Door Inquiry from ${contactName}`);
            }
        });
    }
});

