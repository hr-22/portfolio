/* 
   main.js — All interactive behaviour
   Portfolio: Hamsikha Rajagopal
 */

'use strict';

/* 
   LOADER
 */
(function initLoader() {
    const loader = document.getElementById('loader');
    const body   = document.body;

    if (!loader) return;

    // Minimum display time so the animation completes gracefully
    const MIN_TIME = 2400; // ms
    const start    = Date.now();

    function hideLoader() {
        const elapsed = Date.now() - start;
        const delay   = Math.max(0, MIN_TIME - elapsed);

        setTimeout(() => {
            loader.classList.add('exiting');

            loader.addEventListener('animationend', () => {
                loader.classList.add('hidden');
                body.classList.remove('loading');
            }, { once: true });

            // Fallback in case animationend doesn't fire
            setTimeout(() => {
                loader.classList.add('hidden');
                body.classList.remove('loading');
            }, 1000);
        }, delay);
    }

    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
})();

/* ----------------------------------------------------------------
   CUSTOM CURSOR
   ---------------------------------------------------------------- */
(function initCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (!dot || !ring) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animateRing() {
        ringX = lerp(ringX, mouseX, 0.12);
        ringY = lerp(ringY, mouseY, 0.12);
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        rafId = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand ring on hover of interactive elements
    const interactiveSelector = 'a, button, .skill-pill, .project-card, .hobby-card, .gallery-btn';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
            ring.classList.add('expanded');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
            ring.classList.remove('expanded');
        }
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });
})();

/* ----------------------------------------------------------------
   SCROLL PROGRESS BAR
   ---------------------------------------------------------------- */
(function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function update() {
        const scrollTop  = window.scrollY || document.documentElement.scrollTop;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width  = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ----------------------------------------------------------------
   NAV — scrolled state + active link highlight
   ---------------------------------------------------------------- */
(function initNav() {
    const nav         = document.getElementById('mainNav');
    const burger      = document.getElementById('navBurger');
    const drawer      = document.getElementById('mobileDrawer');
    const navLinks    = document.querySelectorAll('.nav-link:not(.contact-nav-btn)');
    const sections    = document.querySelectorAll('section[id]');
    const closeLinks  = document.querySelectorAll('[data-close]');

    if (!nav) return;

    // Scrolled style
    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        highlightNav();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Burger toggle
    if (burger && drawer) {
        burger.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('open');
            burger.classList.toggle('open', isOpen);
        });

        closeLinks.forEach((link) => {
            link.addEventListener('click', () => {
                drawer.classList.remove('open');
                burger.classList.remove('open');
            });
        });
    }

    // Active section highlight
    function highlightNav() {
        const scrollMid = window.scrollY + window.innerHeight / 3;

        let currentId = '';
        sections.forEach((section) => {
            if (section.offsetTop <= scrollMid) {
                currentId = section.id;
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            link.style.fontWeight = href === '#' + currentId ? '700' : '';
        });
    }
})();

/* ----------------------------------------------------------------
   SPINNING SIDE ELEMENT — show after hero
   ---------------------------------------------------------------- */
(function initSpin() {
    const spin = document.getElementById('spinContainer');
    const hero = document.getElementById('hero');

    if (!spin || !hero) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            spin.classList.toggle('visible', !entry.isIntersecting);
        },
        { threshold: 0.1 }
    );

    observer.observe(hero);
})();

/* ----------------------------------------------------------------
   GALLERY — card deck navigation (dynamic: autoplay + drag + tilt)
   ---------------------------------------------------------------- */
(function initGallery() {
    const deck    = document.getElementById('galleryDeck');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const curNum  = document.getElementById('gCurrentNum');
    const totNum  = document.getElementById('gTotalNum');

    if (!deck || !prevBtn || !nextBtn) return;

    const cards   = Array.from(deck.querySelectorAll('.g-card'));
    const total   = cards.length;
    let current   = 0;
    let autoTimer = null;
    let isAnimating = false;

    if (totNum) totNum.textContent = total;

    function setCards(newIndex, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const outCard = cards[current];
        const nextIdx = (newIndex + total) % total;
        const inCard  = cards[nextIdx];

        // direction: 1 = next (slide from right), -1 = prev (slide from left)
        outCard.classList.remove('active');
        outCard.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)';
        outCard.style.opacity = '0';
        outCard.style.transform = direction > 0
            ? 'translateX(-55px) rotate(-4deg)'
            : 'translateX(55px) rotate(4deg)';

        inCard.style.transition = 'none';
        inCard.style.opacity = '0';
        inCard.style.transform = direction > 0
            ? 'translateX(55px) rotate(4deg)'
            : 'translateX(-55px) rotate(-4deg)';
        inCard.classList.add('active');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                inCard.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)';
                inCard.style.opacity = '1';
                inCard.style.transform = 'translateX(0) rotate(0deg)';
            });
        });

        setTimeout(() => {
            outCard.style.transition = '';
            outCard.style.opacity = '';
            outCard.style.transform = '';
            isAnimating = false;
        }, 480);

        current = nextIdx;
        if (curNum) curNum.textContent = current + 1;
        syncDots(current);

        // Pulse the counter
        if (curNum) {
            curNum.parentElement.classList.add('counter-pop');
            setTimeout(() => curNum.parentElement.classList.remove('counter-pop'), 300);
        }
    }

    function goTo(index, dir) {
        const direction = dir !== undefined ? dir : (index > current ? 1 : -1);
        setCards(index, direction);
        resetAutoplay();
    }

    function startAutoplay() {
        autoTimer = setInterval(() => {
            setCards(current + 1, 1);
        }, 3500);
    }

    function resetAutoplay() {
        clearInterval(autoTimer);
        startAutoplay();
    }

    const dots = document.querySelectorAll('.g-dot');

    function syncDots(idx) {
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.dot);
            if (idx !== current) goTo(idx, idx > current ? 1 : -1);
        });
    });

    nextBtn.addEventListener('click', () => goTo(current + 1, 1));
    prevBtn.addEventListener('click', () => goTo(current - 1, -1));

    startAutoplay();

    // Pause autoplay on hover
    deck.addEventListener('mouseenter', () => clearInterval(autoTimer));
    deck.addEventListener('mouseleave', () => startAutoplay());

    // Keyboard navigation when gallery is in view
    document.addEventListener('keydown', (e) => {
        const galleryInView = deck.closest('section')?.getBoundingClientRect();
        if (!galleryInView) return;
        if (galleryInView.top < window.innerHeight && galleryInView.bottom > 0) {
            if (e.key === 'ArrowRight') goTo(current + 1, 1);
            if (e.key === 'ArrowLeft')  goTo(current - 1, -1);
        }
    });

    // Touch swipe
    let touchStartX = 0;
    deck.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoTimer);
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) goTo(current + 1, 1);
            else          goTo(current - 1, -1);
        }
        startAutoplay();
    }, { passive: true });

    // Mouse drag
    let dragStartX = 0, isDragging = false;
    deck.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        clearInterval(autoTimer);
        deck.style.cursor = 'grabbing';
    });
    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        deck.style.cursor = '';
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) goTo(current + 1, 1);
            else          goTo(current - 1, -1);
        }
        startAutoplay();
    });

    // Card 3D tilt on mouse move
    deck.addEventListener('mousemove', (e) => {
        const activeCard = deck.querySelector('.g-card.active');
        if (!activeCard) return;
        const rect = activeCard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        activeCard.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
    });
    deck.addEventListener('mouseleave', () => {
        const activeCard = deck.querySelector('.g-card.active');
        if (activeCard) activeCard.style.transform = '';
    });
})();

/* ----------------------------------------------------------------
   SMOOTH SCROLL for anchor links
   ---------------------------------------------------------------- */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();

/* ----------------------------------------------------------------
   PARALLAX — subtle on hero bg word
   ---------------------------------------------------------------- */
(function initParallax() {
    const bgWord = document.querySelector('.hero-bg-word');
    if (!bgWord) return;

    window.addEventListener('scroll', () => {
        const y = window.scrollY * 0.25;
        bgWord.style.transform = `translateY(${y}px)`;
    }, { passive: true });
})();

/* ----------------------------------------------------------------
   SKILL PILL — ripple hover effect
   ---------------------------------------------------------------- */
(function initSkillPillRipple() {
    document.querySelectorAll('.skill-pill').forEach((pill) => {
        pill.addEventListener('mouseenter', function(e) {
            this.style.transition = 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)';
        });
    });
})();
