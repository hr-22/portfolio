/* ================================================================
   animations.js — Scroll reveal & animation utilities
   Portfolio: Hamsikha Rajagopal
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   SCROLL REVEAL — IntersectionObserver
   ---------------------------------------------------------------- */
(function initReveal() {
    const revealEls = document.querySelectorAll(
        '.reveal-up, .reveal-fade, .reveal-scale, .reveal-name'
    );

    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
})();

/* ----------------------------------------------------------------
   ROTATING WORD in hero tagline
   ---------------------------------------------------------------- */
(function initRotatingWord() {
    const el = document.getElementById('rotatingWord');
    if (!el) return;

    const words = ['functional', 'creative', 'intentional', 'delightful', 'purposeful'];
    let current = 0;

    function nextWord() {
        el.style.animation = 'wordFlipOut 0.3s ease forwards';

        setTimeout(() => {
            current = (current + 1) % words.length;
            el.textContent = words[current];
            el.style.animation = 'wordFlipIn 0.3s ease forwards';
        }, 320);
    }

    setInterval(nextWord, 2400);
})();
