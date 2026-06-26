document.addEventListener('DOMContentLoaded', () => {
    // 1. Install Command Copy Utility Logic
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('python main.py');
            copyBtn.textContent = 'copied';
            setTimeout(() => { copyBtn.textContent = 'copy'; }, 1500);
        });
    }

    // 2. Structural Entry Reveal Observer Engine
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // 3. Typographic Scrolling Upscale Highlight Engine
    const textPanels = document.querySelectorAll('.feature-text-block');
    const scrollTracker = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                textPanels.forEach(p => p.classList.remove('active-scroll-panel'));
                entry.target.classList.add('active-scroll-panel');
            }
        });
    }, {
        root: null,
        threshold: 0.55, // Fires when panel reaches visual focus depth
        rootMargin: "-12% 0px -12% 0px"
    });

    textPanels.forEach(panel => scrollTracker.observe(panel));

    // 4. Interactive Gradient Mesh Backplate Dynamic Engine
    const glowField = document.getElementById('mesh-glow');
    const rightContainer = document.querySelector('.features-scroll-right');

    if (rightContainer && glowField) {
        rightContainer.addEventListener('mousemove', (e) => {
            const bounds = rightContainer.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top + rightContainer.scrollTop;

            glowField.style.opacity = '1';
            glowField.style.left = `${x}px`;
            glowField.style.top = `${y}px`;
        });

        rightContainer.addEventListener('mouseleave', () => {
            glowField.style.opacity = '0';
        });
    }

    // 5. Minimalist FAQ Dropmenu Accordion Action System
    document.querySelectorAll('.faq-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            const content = trigger.nextElementSibling;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                }
            });

            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
});