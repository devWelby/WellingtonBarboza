/* ==========================================================================
   Portfólio — Wellington Barboza
   ========================================================================== */

const EMAIL = "contato@wellingtonbarboza.com";

/* --- Máquina de escrever ----------------------------------------------- */
function setupTypewriter() {
    const target = document.getElementById("typewriter-text");
    if (!target) return;

    // O nome já vem escrito no HTML, para quem está sem JavaScript e para
    // buscadores. Aqui ele é apagado e redigitado letra a letra.
    const text = target.textContent;
    const speed = 85;

    // Quem prefere menos movimento fica com o texto pronto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    target.textContent = "";
    let index = 0;
    (function type() {
        if (index >= text.length) return;
        target.textContent += text.charAt(index);
        index += 1;
        window.setTimeout(type, speed);
    })();
}

/* --- Abas de projetos --------------------------------------------------- */
function openTab(targetId) {
    document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.hidden = panel.id !== targetId;
    });

    document.querySelectorAll(".tab-btn").forEach((button) => {
        const isTarget = button.dataset.tabTarget === targetId;
        button.classList.toggle("active", isTarget);
        button.setAttribute("aria-selected", String(isTarget));
        button.tabIndex = isTarget ? 0 : -1;
    });
}

function setupTabs() {
    const buttons = Array.from(document.querySelectorAll(".tab-btn"));
    if (!buttons.length) return;

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            openTab(button.dataset.tabTarget);
        });

        // Setas, Home e End, como manda o padrão ARIA de tablist.
        button.addEventListener("keydown", (event) => {
            const last = buttons.length - 1;
            const targets = {
                ArrowDown: (index + 1) % buttons.length,
                ArrowRight: (index + 1) % buttons.length,
                ArrowUp: (index + last) % buttons.length,
                ArrowLeft: (index + last) % buttons.length,
                Home: 0,
                End: last,
            };
            const target = targets[event.key];
            if (target === undefined) return;

            event.preventDefault();
            const next = buttons[target];
            openTab(next.dataset.tabTarget);
            next.focus();
        });
    });
}

/* --- Scroll reveal ------------------------------------------------------ */
function setupReveal() {
    const sections = document.querySelectorAll(".reveal");
    if (!sections.length) return;

    // Navegador sem IntersectionObserver recebe tudo visível de uma vez.
    if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => section.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -80px 0px", threshold: 0.05 },
    );

    sections.forEach((section) => observer.observe(section));
}

/* --- Voltar ao topo ------------------------------------------------------ */
function setupBackToTop() {
    const button = document.getElementById("btn-top");
    if (!button) return;

    const toggle = () => button.classList.toggle("show", window.scrollY > 400);

    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* --- Ano do rodapé ------------------------------------------------------- */
function setupCurrentYear() {
    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();
}

/* --- Formulário de contato ----------------------------------------------- */
function setupContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const submitBtn = form.querySelector("button[type='submit']");
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";

    const status = form.querySelector(".form-status");

    function setStatus(message, isError) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle("error", Boolean(isError));
    }

    function fallbackMailto(name, email, message) {
        const subject = encodeURIComponent(`Contato pelo portfólio - ${name}`);
        const body = encodeURIComponent(
            `Nome: ${name}\nEmail: ${email}\n\n${message}`,
        );
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        const website = form.website ? form.website.value : "";

        if (!name || !email || !message) {
            setStatus("Preencha todos os campos antes de enviar.", true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<svg class="icon" aria-hidden="true"><use href="#i-circle-notch"></use></svg> Enviando...';
        }
        setStatus("Enviando sua mensagem...", false);

        try {
            const response = await fetch("api/contato.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message, website }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus(
                    "Mensagem enviada! Vou responder o mais rápido possível.",
                    false,
                );
                form.reset();
            } else if (response.status < 500) {
                // Erro de validação ou limite de envios: a pessoa precisa
                // corrigir ou esperar, não adianta abrir o e-mail.
                setStatus(
                    data.message || "Confira os dados e tente novamente.",
                    true,
                );
            } else {
                setStatus(
                    data.message ||
                        "Não foi possível enviar. Abrindo seu e-mail...",
                    true,
                );
                fallbackMailto(name, email, message);
            }
        } catch (error) {
            setStatus("Servidor indisponível. Abrindo seu e-mail...", true);
            fallbackMailto(name, email, message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

/* --- Início -------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
    setupTypewriter();
    setupTabs();
    setupReveal();
    setupBackToTop();
    setupCurrentYear();
    setupContactForm();
});
