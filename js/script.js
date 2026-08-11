/* ==========================================================================
   Portfólio — Wellington Barboza
   ========================================================================== */

const EMAIL = "contatowellington1587@gmail.com";

/* --- Máquina de escrever ----------------------------------------------- */
function setupTypewriter() {
    const target = document.getElementById("typewriter-text");
    if (!target) return;

    const text = "Wellington Barboza :)";
    const speed = 85;

    // Quem prefere menos movimento recebe o texto pronto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        target.textContent = text;
        return;
    }

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
        const isTarget = panel.id === targetId;
        panel.hidden = !isTarget;
        panel.classList.toggle("active", isTarget);
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

        // Navegação por setas, como manda o padrão ARIA de tablist.
        button.addEventListener("keydown", (event) => {
            const keys = {
                ArrowDown: 1,
                ArrowRight: 1,
                ArrowUp: -1,
                ArrowLeft: -1,
            };
            const step = keys[event.key];
            if (!step) return;

            event.preventDefault();
            const next = buttons[(index + step + buttons.length) % buttons.length];
            openTab(next.dataset.tabTarget);
            next.focus();
        });
    });
}

/* --- Scroll reveal ------------------------------------------------------ */
function setupReveal() {
    const sections = document.querySelectorAll(".reveal");
    if (!sections.length) return;

    const showAll = () =>
        sections.forEach((section) => section.classList.add("active"));

    if (!("IntersectionObserver" in window)) {
        showAll();
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

    // Rede de segurança: o conteúdo nunca fica invisível.
    window.setTimeout(showAll, 3000);
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

    function setStatus(message, isError) {
        let status = form.querySelector(".form-status");
        if (!status) {
            status = document.createElement("p");
            status.className = "form-status";
            status.setAttribute("role", "status");
            form.appendChild(status);
        }
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

        if (!name || !email || !message) {
            setStatus("Preencha todos os campos antes de enviar.", true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="ph ph-circle-notch" aria-hidden="true"></i> Enviando...';
        }
        setStatus("Enviando sua mensagem...", false);

        try {
            const response = await fetch("api/contato.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus(
                    "Mensagem enviada! Vou responder o mais rápido possível.",
                    false,
                );
                form.reset();
            } else {
                setStatus(
                    data.message || "Não foi possível enviar. Abrindo seu e-mail...",
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
