// Theme Toggle Logic with Lucide Icon change
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    if (!isDark) {
        html.classList.remove('light');
        html.classList.add('dark');
        themeToggle.innerHTML = '<i data-lucide="sun" class="h-4 w-4"></i>';
    } else {
        html.classList.remove('dark');
        html.classList.add('light');
        themeToggle.innerHTML = '<i data-lucide="moon" class="h-4 w-4"></i>';
    }
    // Re-initialize icons for the toggle button
    lucide.createIcons();
});

// Option Pill Interactivity
document.querySelectorAll('.option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        // Toggle the active class
        pill.classList.toggle('active');
    });
});

// Smooth Scroll for Navigation
document.querySelectorAll('nav a, a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only prevent default if it's an internal link
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Mobile Menu Logic
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuClose = document.getElementById('mobile-menu-close');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.remove('translate-x-full');
});

mobileMenuClose.addEventListener('click', () => {
    mobileMenu.classList.add('translate-x-full');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
    });
});

// Validation and Submission Logic
const validateClientInfo = () => {
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const address = document.getElementById('client-address').value;

    if (!name || !phone || !address) {
        alert("Veuillez remplir vos informations (Nom, Téléphone, Adresse) avant de continuer.");
        document.getElementById('client-info').scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add error highlighting
        ['client-name', 'client-phone', 'client-address'].forEach(id => {
            const el = document.getElementById(id);
            if (!el.value) el.classList.add('border-red-500');
            else el.classList.remove('border-red-500');
        });
        return false;
    }
    return true;
};

// Intercept all "Prendre RDV" or "Diagnostic" actions
document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('RDV') || btn.textContent.includes('Envoi') || btn.textContent.includes('Lancer')) {
        btn.addEventListener('click', (e) => {
            if (!validateClientInfo()) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                // If valid, Proceed
                console.log('Form validated for:', document.getElementById('client-name').value);
            }
        });
    }
});

// QR Code Generation
const generateQRCode = () => {
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer && typeof QRCode !== 'undefined') {
        const vcard = `BEGIN:VCARD
FN:RC Service
TEL:0820444758
TEL:0993032484
EMAIL:contact@rc-service.com
END:VCARD`;

        new QRCode(qrContainer, {
            text: vcard,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
        });
    }
};

// Email Submission Logic
const submitViaEmail = () => {
    if (!validateClientInfo()) return;

    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const address = document.getElementById('client-address').value;

    // Collect all selected options
    const selectedOptions = [];
    document.querySelectorAll('.option-pill.active').forEach(pill => {
        const category = pill.closest('article')?.querySelector('h2')?.textContent || "Autre";
        selectedOptions.push(`[${category}] ${pill.textContent}`);
    });

    const body = `Bonjour,
    
Je souhaite demander un diagnostic technique.

--- INFORMATIONS CLIENT ---
Nom: ${name}
Téléphone: ${phone}
Adresse: ${address}

--- BESOINS IDENTIFIÉS ---
${selectedOptions.length > 0 ? selectedOptions.join('\n') : "Aucune option spécifique sélectionnée."}

Merci de me recontacter rapidement.`;

    const subject = `Demande de Diagnostic - ${name}`;
    const mailtoUrl = `mailto:contact@rc-service.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
};

// Event Listeners for Submission
document.getElementById('submit-diagnostic-email')?.addEventListener('click', submitViaEmail);

// Initialize everything on load or immediately if already loaded
if (document.readyState === 'complete') {
    generateQRCode();
} else {
    window.addEventListener('load', generateQRCode);
}
