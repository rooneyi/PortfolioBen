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
EMAIL:rc-service@rc-service.tech
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
    const filesInput = document.getElementById('client-files');
    const files = filesInput?.files || [];

    // Collect all selected options (ancienne sélection par cartes)
    const selectedOptions = [];
    document.querySelectorAll('.option-pill.active').forEach(pill => {
        const category = pill.closest('article')?.querySelector('h2')?.textContent || "Autre";
        selectedOptions.push(`[${category}] ${pill.textContent}`);
    });

    // Collect selected FAQ questions
    const selectedFaqs = [];
    document.querySelectorAll('.faq-question.selected').forEach(item => {
        const categoryTitle = item.closest('.faq-panel')?.querySelector('h3')?.textContent || 'FAQ';
        selectedFaqs.push(`[${categoryTitle}] ${item.textContent.trim()}`);
    });

    // Collect written answers on marked FAQ questions
    const detailedAnswers = [];
    document.querySelectorAll('.faq-answer').forEach(input => {
        const value = input.value.trim();
        if (!value) return;
        const li = input.closest('li');
        const questionText = li ? li.childNodes[0].textContent.trim() : 'Question';
        const categoryTitle = li?.closest('.faq-panel')?.querySelector('h3')?.textContent || 'FAQ';
        detailedAnswers.push(`[${categoryTitle}] ${questionText} -> ${value}`);
    });

    const body = `Bonjour,
    
Je souhaite demander un diagnostic technique.

--- INFORMATIONS CLIENT ---
Nom: ${name}
Téléphone: ${phone}
Adresse: ${address}

--- BESOINS IDENTIFIÉS ---
${selectedOptions.length > 0 ? selectedOptions.join('\n') : "Aucune option spécifique sélectionnée."}

--- PROBLÈMES SÉLECTIONNÉS DANS LES FAQS ---
${selectedFaqs.length > 0 ? selectedFaqs.join('\n') : "Aucun problème sélectionné dans les FAQs."}

--- RÉPONSES DÉTAILLÉES ---
${detailedAnswers.length > 0 ? detailedAnswers.join('\n') : "Aucune réponse écrite fournie."}

Merci de me recontacter rapidement.`;

    const subject = `Demande de Diagnostic - ${name}`;

    // Si des fichiers sont sélectionnés, on passe par le serveur (upload.php)
    if (files.length > 0) {
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('body', body);
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);

        Array.from(files).forEach((file) => {
            formData.append('attachments[]', file, file.name);
        });

        fetch('upload.php', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json().catch(() => ({})))
            .then((data) => {
                if (data && data.success) {
                    alert('Votre demande avec fichiers a bien été envoyée.');
                } else {
                    alert("L'envoi des fichiers a échoué. Vous pouvez réessayer ou envoyer un email manuel.");
                }
            })
            .catch(() => {
                alert("Erreur réseau pendant l'envoi des fichiers. Essayez plus tard ou envoyez un email manuel.");
            });
    } else {
        // Sinon, on garde le comportement mailto classique
        const mailtoUrl = `mailto:rc-service@rc-service.tech?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    }
};

// Event Listeners for Submission
document.getElementById('submit-diagnostic-email')?.addEventListener('click', submitViaEmail);

// FAQ Category Switching
const faqCategoryButtons = document.querySelectorAll('.faq-category');
const faqPanels = document.querySelectorAll('.faq-panel');

if (faqCategoryButtons.length && faqPanels.length) {
    faqCategoryButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-category');

            faqCategoryButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            faqPanels.forEach((panel) => {
                if (panel.getAttribute('data-category') === target) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });
}

// Make FAQ questions selectable
const initFaqSelectableQuestions = () => {
    const faqQuestions = document.querySelectorAll('.faq-panel ol li');
    faqQuestions.forEach((li) => {
        li.classList.add('faq-question');
        
        // Inject an input field under every question to permettre une réponse écrite
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Votre réponse...';
        input.className = 'faq-answer mt-2 w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none';

        // Prevent clicks inside the input from toggling selection on the whole question
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('keydown', (e) => e.stopPropagation());

        li.appendChild(input);

        li.addEventListener('click', () => {
            li.classList.toggle('selected');
        });
    });
};

initFaqSelectableQuestions();

// Initialize everything on load or immediately if already loaded
if (document.readyState === 'complete') {
    generateQRCode();
} else {
    window.addEventListener('load', generateQRCode);
}
