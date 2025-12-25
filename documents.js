document.querySelectorAll('.btn-download').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const cardTitle = this.closest('.document-card').querySelector('h3').textContent;
        alert(`Starting download of: ${cardTitle}\n\n(Note: This is a demo. In a real implementation, this would download the PDF.)`);
    });
});

document.querySelectorAll('.btn-read').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const cardTitle = this.closest('.document-card').querySelector('h3').textContent;
        alert(`Opening document: ${cardTitle}\n\n(Note: This is a demo. In a real implementation, this would open the PDF in a viewer.)`);
    });
});
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
initializeThemeToggle();