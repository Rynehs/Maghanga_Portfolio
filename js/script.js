document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const revealElements = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll("[data-count]");
  const currentYear = document.querySelector("#current-year");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------
     Header scroll state
  --------------------------------------- */

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 30);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true,
  });

  /* ---------------------------------------
     Mobile navigation
  --------------------------------------- */

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;

    navMenu.classList.remove("open");
    navToggle.classList.remove("active");

    navToggle.setAttribute("aria-expanded", "false");

    document.body.classList.remove("nav-open");
  };

  const openMenu = () => {
    if (!navToggle || !navMenu) return;

    navMenu.classList.add("open");
    navToggle.classList.add("active");

    navToggle.setAttribute("aria-expanded", "true");

    document.body.classList.add("nav-open");
  };

  if (navToggle && navMenu) {
    // Make sure accessibility state exists.
    navToggle.setAttribute("aria-expanded", "false");

    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu after selecting a navigation item.
    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside it.
    document.addEventListener("click", (event) => {
      if (!navMenu.classList.contains("open")) return;

      const clickedInsideMenu = navMenu.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        closeMenu();
      }
    });

    // Allow Escape to close the mobile menu.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  /* ---------------------------------------
     Scroll reveal animations
  --------------------------------------- */

  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  }

  /* ---------------------------------------
     Animated statistics
  --------------------------------------- */

  const animateCounter = (element) => {
    const target = Number(element.dataset.count);

    if (!Number.isFinite(target)) return;

    const duration = 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic.
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(
        target * easedProgress
      );

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    counters.forEach((counter) => {
      if (counter.dataset.count) {
        counter.textContent = counter.dataset.count;
      }
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.6,
      }
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }

  /* ---------------------------------------
     Active navigation item
  --------------------------------------- */

  if (
    "IntersectionObserver" in window &&
    sections.length &&
    navLinks.length
  ) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeId = entry.target.id;

          navLinks.forEach((link) => {
            const href = link.getAttribute("href");

            link.classList.toggle(
              "active",
              href === `#${activeId}`
            );
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ---------------------------------------
     Current year
  --------------------------------------- */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------
     Close mobile navigation on resize
  --------------------------------------- */

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
});