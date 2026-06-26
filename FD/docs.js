document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Link Active Highlighter Observer
    const links = document.querySelectorAll('.sb-link[href^="#"]');
    const sections = document.querySelectorAll('.docs-content section[id]');

    if (sections.length > 0 && links.length > 0) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                // Focus element when it passes 20% mark from top viewport bound
                if (e.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    const match = document.querySelector(`.sb-link[href="#${e.target.id}"]`);
                    if (match) match.classList.add('active');
                }
            });
        }, {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(s => spy.observe(s));
    }

    // 2. Terminal Chrome Snippet Copier Action System
    document.querySelectorAll('.dcode-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const rawText = btn.dataset.copy || btn.closest('.dcode').querySelector('pre').innerText;

            // Clean out text returns
            const textToCopy = rawText.replace(/^\s*#.*$/gm, '').trim();

            navigator.clipboard.writeText(textToCopy).then(() => {
                btn.textContent = 'copied';
                btn.style.color = 'var(--accent)';
                setTimeout(() => {
                    btn.textContent = 'copy';
                    btn.style.color = '';
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy text sequence: ', err);
            });
        });
    });

    // 3. Mobile View Layout Drawer Toggle Framework
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sb-toggle');

    if (toggle && sidebar) {
        const openSidebar = () => {
            sidebar.classList.add('open');
            toggle.style.background = 'var(--accent)';
            toggle.style.color = '#ffffff';
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            toggle.style.background = '';
            toggle.style.color = '';
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        // Tap background layout wrapper area to collapse active sidebar drawer
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
                closeSidebar();
            }
        });

        // Close when clicking an anchor links element item panel inside mobile viewport view
        links.forEach(l => {
            l.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            });
        });
    }
});