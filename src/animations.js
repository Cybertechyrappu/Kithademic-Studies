// animations.js — Entry animations, transitions, and scroll-reveal

// ─── Splash Screen ────────────────────────────────────────────────────────────

/**
 * Hides the splash screen with a smooth fade-out after a minimum display time.
 * @param {number} minMs - Minimum time to show the splash (ms)
 */
export function hideSplash(minMs = 1800) {
    const splash = document.getElementById('splash');
    if (!splash) return;

    const elapsed = Date.now() - (window._splashStart || Date.now());
    const remaining = Math.max(0, minMs - elapsed);

    setTimeout(() => {
        splash.classList.add('splash-exit');
        setTimeout(() => {
            splash.style.display = 'none';
            splash.remove();
        }, 600);
    }, remaining);
}

/**
 * Starts the splash screen clock and progress bar animation.
 */
export function initSplash() {
    window._splashStart = Date.now();
    const bar = document.querySelector('.splash-loader-bar');
    if (bar) {
        requestAnimationFrame(() => {
            bar.style.transition = 'width 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.width = '90%';
        });
    }

    // Arabic text shimmer cycling
    const taglines = [
        'اطلبوا العلم من المهد إلى اللحد',
        'Knowledge is the light of the heart',
        'بِسْمِ ٱللَّٰهِ الرَّحْمَٰنِ الرَّحِيمِ'
    ];
    let idx = 0;
    const tagline = document.getElementById('splashTagline');
    if (tagline) {
        setInterval(() => {
            idx = (idx + 1) % taglines.length;
            tagline.style.opacity = '0';
            setTimeout(() => {
                tagline.textContent = taglines[idx];
                tagline.style.opacity = '1';
            }, 300);
        }, 1500);
    }
}

// ─── Hero Animations ──────────────────────────────────────────────────────────

/**
 * Triggers staggered entrance animation on home section children.
 */
export function animateHero() {
    const items = document.querySelectorAll('.hero-content > *');
    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${i * 110}ms, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${i * 110}ms`;
        requestAnimationFrame(() => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 60);
        });
    });
}

// ─── Page Transitions ─────────────────────────────────────────────────────────

let _transitionLocked = false;

/**
 * Animated page switch with fade + slide.
 * @param {string} pageId - Target page id
 */
export function animatedShowPage(pageId) {
    if (_transitionLocked) return;

    const all = document.querySelectorAll('.page');
    const current = document.querySelector('.page.active');
    const target = document.getElementById(pageId);

    if (!target || (current === target)) return;

    _transitionLocked = true;

    if (current) {
        current.classList.add('page-exit');
        setTimeout(() => {
            current.classList.add('hidden');
            current.classList.remove('active', 'page-exit');
            revealPage(target, () => { _transitionLocked = false; });
        }, 180);
    } else {
        all.forEach(p => { p.classList.add('hidden'); p.classList.remove('active'); });
        revealPage(target, () => { _transitionLocked = false; });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function revealPage(target, done) {
    target.classList.remove('hidden');
    target.classList.add('active', 'page-enter');

    if (target.id === 'home') {
        animateHero();
    }

    setTimeout(() => {
        target.classList.remove('page-enter');
        done();
    }, 380);
}

// ─── Card Scroll-Reveal ───────────────────────────────────────────────────────

let _rvObserver = null;

/**
 * Attach scroll-reveal animation to all .course-card and .video-card elements.
 * Cards start hidden and fade+slide in when they enter the viewport.
 */
export function setupScrollReveal() {
    if (_rvObserver) {
        _rvObserver.disconnect();
    }

    const cards = document.querySelectorAll('.course-card, .video-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = `opacity 0.45s ease ${(i % 6) * 60}ms, transform 0.45s ease ${(i % 6) * 60}ms`;
    });

    _rvObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                _rvObserver.unobserve(card);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    cards.forEach(card => _rvObserver.observe(card));
}

// ─── Modal Animations ─────────────────────────────────────────────────────────

/**
 * Animate modal open.
 * @param {string} id - Modal element id
 */
export function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => modal.classList.add('modal-visible'));
    });
    setTimeout(() => modal.classList.remove('modal-enter'), 350);
}

/**
 * Animate modal close.
 * @param {string} id - Modal element id
 */
export function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-exit');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-exit');
    }, 280);
}

// ─── Nav Entrance ─────────────────────────────────────────────────────────────

/**
 * Slides the bottom nav up from below on first load.
 */
export function animateNavIn() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    nav.style.transform = 'translateX(-50%) translateY(120px)';
    nav.style.opacity = '0';
    nav.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, opacity 0.5s ease 0.3s';
    requestAnimationFrame(() => {
        setTimeout(() => {
            nav.style.transform = 'translateX(-50%) translateY(0)';
            nav.style.opacity = '1';
        }, 80);
    });
}

// ─── Top Brand Entrance ───────────────────────────────────────────────────────

export function animateTopBrandIn() {
    const bar = document.querySelector('.top-brand');
    if (!bar) return;
    bar.style.transform = 'translateY(-100%)';
    bar.style.opacity = '0';
    bar.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1) 0.15s, opacity 0.4s ease 0.15s';
    requestAnimationFrame(() => {
        setTimeout(() => {
            bar.style.transform = 'translateY(0)';
            bar.style.opacity = '1';
        }, 80);
    });
}
