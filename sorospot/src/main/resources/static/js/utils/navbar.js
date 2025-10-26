document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isActive);
    });
    
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
});