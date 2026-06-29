// @ts-check

/** @typedef {{ id: string, section: HTMLElement }} NavSection */

const links = [...document.querySelectorAll(".scroll-nav__link")];

if (links.length) {
    /** @type {NavSection[]} */
    const sections = links.flatMap((link) => {
        const href = link.getAttribute("href");
        if (!href) {
            return [];
        }

        const id = href.slice(1);
        const section = document.getElementById(id);
        return section ? [{ id, section }] : [];
    });

    if (sections.length) {
        const setActive = (id) => {
            links.forEach((link) => {
                link.classList.toggle(
                    "scroll-nav__link--active",
                    link.getAttribute("href") === `#${id}`,
                );
            });
        };

        // Section activates when its top crosses this line (matches prior observer intent).
        const activationOffset = () => window.innerHeight * 0.35;

        const updateActiveSection = () => {
            const offset = activationOffset();
            let activeId = sections[0].id;

            for (const { id, section } of sections) {
                if (section.getBoundingClientRect().top <= offset) {
                    activeId = id;
                }
            }

            const atBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 2;

            if (atBottom) {
                const last = sections.at(-1);
                if (last) {
                    activeId = last.id;
                }
            }

            setActive(activeId);
        };

        let ticking = false;
        const onScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            requestAnimationFrame(() => {
                updateActiveSection();
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        updateActiveSection();
    }
}
