// @ts-check

const nav = document.querySelector("[data-mobile-nav]");

if (nav) {
    const toggle = nav.querySelector("[data-mobile-nav-toggle]");
    const toggleLabel = nav.querySelector(".mobile-nav__toggle-label");
    const overlay = nav.querySelector("[data-mobile-nav-overlay]");
    const drawer = nav.querySelector("[data-mobile-nav-drawer]");
    const links = nav.querySelectorAll("[data-mobile-nav-link]");
    const main = document.querySelector(".site__main");

    /** @type {HTMLElement | null} */
    let lastFocused = null;
    let suppressToggleClick = false;

    const setOpen = (open) => {
        if (!toggle || !overlay || !drawer) {
            return;
        }

        nav.classList.toggle("mobile-nav--open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        overlay.setAttribute("aria-hidden", open ? "false" : "true");
        document.body.classList.toggle("mobile-nav-open", open);
        if (main instanceof HTMLElement) {
            main.inert = open;
        }

        if (toggleLabel) {
            toggleLabel.textContent = open ? "Close" : "Menu";
        }

        if (open) {
            lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            drawer.focus();
            return;
        }

        if (lastFocused) {
            lastFocused.focus();
            lastFocused = null;
        }
    };

    const closeIfBackdrop = (event) => {
        if (!nav.classList.contains("mobile-nav--open")) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Node) || drawer.contains(target)) {
            return;
        }

        suppressToggleClick = true;
        setOpen(false);
        window.setTimeout(() => {
            suppressToggleClick = false;
        }, 400);
    };

    setOpen(false);

    toggle?.addEventListener("click", (event) => {
        if (suppressToggleClick) {
            event.preventDefault();
            suppressToggleClick = false;
            return;
        }

        setOpen(!nav.classList.contains("mobile-nav--open"));
    });

    overlay?.addEventListener("pointerup", closeIfBackdrop);
    overlay?.addEventListener("click", closeIfBackdrop);

    links.forEach((link) => {
        link.addEventListener("click", () => {
            setOpen(false);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.classList.contains("mobile-nav--open")) {
            setOpen(false);
        }
    });
}
