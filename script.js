document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
    offset: 100,
  });

  // Elements
  const nav = document.querySelector("header nav");
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const yearEl = document.getElementById("current-year");
  const contactForm = document.getElementById("contact-form");
  const loadingScreen = document.getElementById("loading-screen");
  const themeToggle = document.querySelector(".theme-toggle");

  // Loading screen
  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }, 1000);
  });

  // Current year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle functionality
  if (themeToggle) {
    const currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);

    const icon = themeToggle.querySelector("i");
    icon.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";

    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      icon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
    });
  }

  // Typing animation for hero text
  const typingText = document.querySelector(".typing-text");
  if (typingText) {
    const text = "Arkadev Banerjee";
    let index = 0;
    typingText.textContent = "";

    const typeWriter = () => {
      if (index < text.length) {
        typingText.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
      }
    };

    setTimeout(typeWriter, 1500);
  }

  // Animated counters for stats
  const animateCounters = () => {
    const counters = document.querySelectorAll(".stat-number");
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-count"));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      updateCounter();
    });
  };

  // Trigger counter animation when hero section is visible
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(animateCounters, 2000);
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(heroSection);
  }

  // Skill bar animations
  const animateSkillBars = () => {
    const skillBars = document.querySelectorAll(".skill-progress");
    skillBars.forEach((bar) => {
      const width = bar.getAttribute("data-width");
      setTimeout(() => {
        bar.style.width = width + "%";
      }, 300);
    });
  };

  // Trigger skill bar animation when skills section is visible
  const skillsSection = document.querySelector(".skills");
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateSkillBars();
          observer.unobserve(entry.target);
        }
      });
    });
    observer.observe(skillsSection);
  }

  // Navbar shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Mobile menu toggle
  if (hamburger && navLinks) {
    let isMenuOpen = false;

    const toggleMenu = () => {
      isMenuOpen = !isMenuOpen;

      if (isMenuOpen) {
        navLinks.classList.add("active");
        hamburger.classList.add("active");
        document.body.classList.add("menu-open");
      } else {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    };

    const closeMenu = () => {
      if (isMenuOpen) {
        isMenuOpen = false;
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    };

    // Hamburger click
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking nav links
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        isMenuOpen &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    // Close menu on window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) {
        closeMenu();
      }
    });
  }

  // Parallax effect for hero background
  window.addEventListener(
    "scroll",
    () => {
      const scrolled = window.pageYOffset;
      const parallaxBg = document.querySelector(".particles-bg");
      if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    },
    { passive: true }
  );

  // Project card hover effects
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });

  // Enhanced contact form with better UX
  if (contactForm) {
    const inputs = contactForm.querySelectorAll("input, textarea");

    // Add focus/blur effects
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });

      input.addEventListener("blur", () => {
        if (!input.value) {
          input.parentElement.classList.remove("focused");
        }
      });
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector(".submit-button");
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      // Enhanced validation
      const errors = [];
      if (!payload.name?.trim()) errors.push("Name is required");
      if (!payload.email?.trim()) errors.push("Email is required");
      if (!payload.message?.trim()) errors.push("Message is required");
      if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        errors.push("Please enter a valid email address");
      }

      if (errors.length > 0) {
        showNotification(errors.join(", "), "error");
        return;
      }

      try {
        btn.disabled = true;
        const original = btn.textContent;
        btn.textContent = "Sending...";
        btn.style.background = "linear-gradient(90deg, #6b7280, #9ca3af)";

        // Simulate async submission
        await new Promise((res) => setTimeout(res, 1500));

        showNotification(
          "Thanks! Your message has been sent successfully.",
          "success"
        );
        contactForm.reset();
        inputs.forEach((input) =>
          input.parentElement.classList.remove("focused")
        );

        btn.textContent = original;
        btn.style.background = "";
        btn.disabled = false;
      } catch (err) {
        showNotification(
          "Something went wrong. Please try again later.",
          "error"
        );
        btn.disabled = false;
        btn.style.background = "";
      }
    });
  }

  // Custom notification system
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${
          type === "success"
            ? "fa-check-circle"
            : type === "error"
            ? "fa-exclamation-circle"
            : "fa-info-circle"
        }"></i>
        <span>${message}</span>
      </div>
    `;

    // Add notification styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#10b981"
          : type === "error"
          ? "#ef4444"
          : "#3b82f6"
      };
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  }

  // Add scroll indicator functionality
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.querySelector("#about").scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  // Easter egg: Konami code
  let konamiCode = [];
  const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

  document.addEventListener("keydown", (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
      konamiCode.shift();
    }

    if (konamiCode.join(",") === konamiSequence.join(",")) {
      showNotification(
        "🎉 Konami Code activated! You found the easter egg!",
        "success"
      );
      document.body.style.animation = "rainbow 2s infinite";
      setTimeout(() => {
        document.body.style.animation = "";
      }, 5000);
    }
  });

  // Add rainbow animation for easter egg
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rainbow {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }
    .notification {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      font-weight: 600;
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
    }
  `;
  document.head.appendChild(style);

  // Advanced Experience Card Interactions
  const experienceCards = document.querySelectorAll('.experience-card');
  
  experienceCards.forEach((card, index) => {
    let mouseX = 0, mouseY = 0;
    
    // Create particle container for each card
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      border-radius: 24px;
    `;
    card.appendChild(particleContainer);
    
    // Create floating particles
    function createParticle(x, y) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        border-radius: 50%;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        opacity: 0.8;
        animation: particleFloat 3s ease-out forwards;
      `;
      
      particleContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, 3000);
    }
    
    // Add particle animation styles
    if (!document.querySelector('#particle-styles')) {
      const particleStyles = document.createElement('style');
      particleStyles.id = 'particle-styles';
      particleStyles.textContent = `
        @keyframes particleFloat {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0.8;
          }
          10% {
            transform: translateY(-10px) scale(1);
            opacity: 1;
          }
          90% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-120px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(96, 165, 250, 0.6);
          }
        }
        
        @keyframes rippleExpand {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          100% {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(particleStyles);
    }
    
    // Mouse tracking for 3D tilt effect
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      mouseX = e.clientX - rect.left - rect.width / 2;
      mouseY = e.clientY - rect.top - rect.height / 2;
      
      // Create particles on mouse move
      if (Math.random() > 0.85) {
        createParticle(e.clientX - rect.left, e.clientY - rect.top);
      }
      
      // Calculate rotation values
      const rotateX = (mouseY / rect.height) * 8;
      const rotateY = (mouseX / rect.width) * 8;
      
      // Apply enhanced 3D transform
      card.style.transform = `
        perspective(1000px)
        rotateX(${-rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-15px)
        translateZ(50px)
        scale(1.03)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      mouseX = mouseY = 0;
    });
    
    // Advanced click interaction with burst effect
    card.addEventListener('click', (e) => {
      e.preventDefault();
      
      const ripple = document.createElement('div');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(96, 165, 250, 0.4), transparent);
        pointer-events: none;
        animation: rippleExpand 0.8s ease-out;
        transform: translate(-50%, -50%);
        z-index: 10;
      `;
      
      card.appendChild(ripple);
      
      // Burst particles effect
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const angle = (i / 12) * Math.PI * 2;
          const distance = 60 + Math.random() * 40;
          const burstX = x + Math.cos(angle) * distance;
          const burstY = y + Math.sin(angle) * distance;
          createParticle(burstX, burstY);
        }, i * 30);
      }
      
      // Add temporary glow effect
      card.style.animation = 'glowPulse 1s ease-in-out';
      
      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
        card.style.animation = '';
      }, 800);
    });
  });

  // Background particle system for experience section
  const experienceSection = document.querySelector('.experience');
  if (experienceSection) {
    const bgParticleContainer = document.createElement('div');
    bgParticleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    experienceSection.appendChild(bgParticleContainer);
    
    function createBackgroundParticle() {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const x = Math.random() * experienceSection.offsetWidth;
      const duration = Math.random() * 15 + 8;
      const colors = [
        'rgba(96, 165, 250, 0.4)',
        'rgba(52, 211, 153, 0.3)',
        'rgba(139, 92, 246, 0.3)'
      ];
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${x}px;
        top: 100%;
        animation: floatUp ${duration}s linear infinite;
        filter: blur(1px);
      `;
      
      bgParticleContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, duration * 1000);
    }
    
    // Add background particle animation
    if (!document.querySelector('#bg-particle-styles')) {
      const bgParticleStyles = document.createElement('style');
      bgParticleStyles.id = 'bg-particle-styles';
      bgParticleStyles.textContent = `
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(-50px) rotate(90deg) scale(1);
            opacity: 1;
          }
          90% {
            transform: translateY(-90vh) rotate(270deg) scale(0.5);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(bgParticleStyles);
    }
    
    // Create background particles continuously
    setInterval(createBackgroundParticle, 600);
  }
});
