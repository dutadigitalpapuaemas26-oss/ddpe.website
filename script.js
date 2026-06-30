document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       1. NAVBAR PREMIUM PURPLE-BLUE
       ========================================================= */
    const navbar = document.querySelector(".navbar");

    const updateNavbar = () => {
        if (!navbar) return;

        const isScrolled = window.scrollY > 24;

        navbar.style.background = isScrolled
            ? "linear-gradient(135deg, rgba(10, 7, 30, 0.96), rgba(27, 19, 72, 0.94), rgba(10, 34, 82, 0.94))"
            : "rgba(9, 7, 28, 0.82)";

        navbar.style.boxShadow = isScrolled
            ? "0 14px 34px rgba(5, 3, 20, 0.34)"
            : "0 10px 32px rgba(6, 4, 20, 0.18)";

        navbar.style.borderBottomColor = isScrolled
            ? "rgba(96, 165, 250, 0.32)"
            : "rgba(167, 139, 250, 0.22)";

        navbar.style.height = isScrolled ? "72px" : "84px";
    };

    let scrollTicking = false;

    window.addEventListener(
        "scroll",
        () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    updateNavbar();
                    scrollTicking = false;
                });

                scrollTicking = true;
            }
        },
        { passive: true }
    );

    updateNavbar();

    /* =========================================================
       2. SISTEM NAVIGASI SECTION DENGAN TRANSISI PREMIUM
       ========================================================= */

    const pages = Array.from(
        document.querySelectorAll("header.hero, section")
    );

    const footer = document.querySelector("footer");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let isTransitioning = false;

    const getPageById = (id) =>
        pages.find((page) => page.id === id);

    const getActivePage = () =>
        pages.find((page) => page.dataset.active === "true");

    const getHomePage = () =>
        document.getElementById("home") || pages[0];

    const removeAnimationClasses = (element) => {
        element.classList.remove("fade-in-page", "fade-out-page");
    };

    const setPageActive = (page, active) => {
        if (!page) return;

        if (active) {
            page.dataset.active = "true";
            page.setAttribute("aria-hidden", "false");
        } else {
            page.removeAttribute("data-active");
            page.setAttribute("aria-hidden", "true");
        }
    };

    const getTargetFromUrl = () => {
        const id = decodeURIComponent(
            window.location.hash.replace("#", "")
        );

        if (id === "kontak") return "kontak";

        return getPageById(id) || getHomePage();
    };

    const saveHistory = (pageId) => {
        const homePage = getHomePage();

        if (pageId === homePage?.id) {
            history.pushState(
                { page: pageId },
                "",
                `${window.location.pathname}${window.location.search}`
            );
            return;
        }

        history.pushState(
            { page: pageId },
            "",
            `#${encodeURIComponent(pageId)}`
        );
    };

    const animateElement = (element, keyframes, options) => {
        if (reducedMotion || !element.animate) {
            return Promise.resolve();
        }

        const animation = element.animate(keyframes, options);

        return animation.finished
            .catch(() => {})
            .then(() => animation.cancel());
    };

    const showPage = async (
        targetPage,
        { updateHistory = true, animate = true } = {}
    ) => {
        if (!targetPage || isTransitioning) return;

        const currentPage = getActivePage();

        if (currentPage === targetPage) {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });

            return;
        }

        isTransitioning = true;
        closeNavMenu();

        if (currentPage) {
            removeAnimationClasses(currentPage);

            if (animate) {
                await animateElement(
                    currentPage,
                    [
                        {
                            opacity: 1,
                            transform: "translateY(0) scale(1)"
                        },
                        {
                            opacity: 0,
                            transform: "translateY(-12px) scale(0.992)"
                        }
                    ],
                    {
                        duration: 260,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "forwards"
                    }
                );
            }

            currentPage.style.display = "none";
            setPageActive(currentPage, false);
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

        targetPage.style.display = "";
        targetPage.style.opacity = "";
        targetPage.style.transform = "";

        removeAnimationClasses(targetPage);
        setPageActive(targetPage, true);

        if (animate) {
            await animateElement(
                targetPage,
                [
                    {
                        opacity: 0,
                        transform: "translateY(18px) scale(1.008)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0) scale(1)"
                    }
                ],
                {
                    duration: 520,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "forwards"
                }
            );
        }

        if (updateHistory) {
            saveHistory(targetPage.id);
        }

        isTransitioning = false;
    };

    /* Menentukan halaman yang terbuka ketika website dimuat */
    const initialTarget = getTargetFromUrl();

    pages.forEach((page) => {
        removeAnimationClasses(page);

        if (page === initialTarget) {
            page.style.display = "";
            setPageActive(page, true);
        } else {
            page.style.display = "none";
            setPageActive(page, false);
        }
    });

    /* Jika URL langsung menuju #kontak */
    if (initialTarget === "kontak" && footer) {
        window.setTimeout(() => {
            footer.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });
        }, 100);
    }

    /* Tangkap klik semua navigasi berbasis #id */
    document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href^="#"]');

        if (!link) return;

        const href = link.getAttribute("href");
        const targetId = decodeURIComponent(href.replace("#", ""));

        if (!targetId) return;

        /* Khusus menu kontak menuju footer */
        if (targetId === "kontak") {
            if (!footer) return;

            event.preventDefault();
            closeNavMenu();

            history.pushState(
                { page: "kontak" },
                "",
                "#kontak"
            );

            footer.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });

            return;
        }

        const targetPage = getPageById(targetId);

        /* Link anchor biasa tetap berjalan normal */
        if (!targetPage) return;

        event.preventDefault();

        showPage(targetPage, {
            updateHistory: true,
            animate: true
        });
    });

    /* Mendukung tombol Back dan Forward browser */
    window.addEventListener("popstate", () => {
        const target = getTargetFromUrl();

        if (target === "kontak" && footer) {
            footer.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });

            return;
        }

        showPage(target, {
            updateHistory: false,
            animate: true
        });
    });

    /* =========================================================
       3. NAVBAR DROPDOWN
       ========================================================= */

    window.toggleNavMenu = function () {
        const dropdown = document.getElementById("myNavDropdown");

        if (!dropdown) return;

        const isOpen = dropdown.classList.toggle("show-menu");
        const wrapper = dropdown.closest(".nav-dropdown-wrapper");
        const button = wrapper?.querySelector(".nav-dropdown-btn");
        const arrow = wrapper?.querySelector(".arrow-icon");

        if (button) {
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }

        if (arrow) {
            arrow.style.transform = isOpen
                ? "rotate(180deg)"
                : "rotate(0deg)";
        }
    };

    window.closeNavMenu = function () {
        const dropdown = document.getElementById("myNavDropdown");

        if (!dropdown) return;

        dropdown.classList.remove("show-menu");

        const wrapper = dropdown.closest(".nav-dropdown-wrapper");
        const button = wrapper?.querySelector(".nav-dropdown-btn");
        const arrow = wrapper?.querySelector(".arrow-icon");

        if (button) {
            button.setAttribute("aria-expanded", "false");
        }

        if (arrow) {
            arrow.style.transform = "rotate(0deg)";
        }
    };

    /* Menutup dropdown ketika klik di luar area menu */
    document.addEventListener("click", (event) => {
        const isInsideDropdown = event.target.closest(
            ".nav-dropdown-wrapper"
        );

        if (!isInsideDropdown) {
            closeNavMenu();
        }
    });

    /* Menutup dropdown dengan tombol Escape */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavMenu();
        }
    });
});