/* =========================================================
   CoCoMokio — shared site script
   Renders header + footer.
   Same-site links stay relative (no extra redirect).
   Cross-site links use the real domains.
   ========================================================= */
(() => {
    const PROD_MAIN   = "https://www.cocomokio.com";
    const PROD_STORE  = "https://store.cocomokio.com";
    const PROD_SOCIAL = "https://social.cocomokio.com";

    const host = (location.hostname || "").toLowerCase();
    const onMain   = host === "www.cocomokio.com" || host === "cocomokio.com";
    const onStore  = host === "store.cocomokio.com";
    const onSocial = host === "social.cocomokio.com";
    const isProd   = onMain || onStore || onSocial;

    // Build a URL for a given site. Same-origin → path only (no redirect hop).
    // Other origin / unknown host → absolute production URL.
    function siteUrl(which, path) {
        const p = path.startsWith("/") ? path : "/" + path;
        if (which === "main") {
            if (onMain) return p === "/" ? "/" : p;
            return PROD_MAIN + (p === "/" ? "/" : p);
        }
        if (which === "store") {
            if (onStore) return p === "/" ? "/" : p;
            return PROD_STORE + (p === "/" ? "/" : p);
        }
        if (which === "social") {
            if (onSocial) return p === "/" ? "/" : p;
            return PROD_SOCIAL + (p === "/" ? "/" : p);
        }
        return p;
    }

    const MAIN   = isProd ? PROD_MAIN   : PROD_MAIN;
    const STORE  = isProd ? PROD_STORE  : PROD_STORE;
    const SOCIAL = isProd ? PROD_SOCIAL : PROD_SOCIAL;

    // Local asset root (scripts/ → site root)
    const root = new URL("../", document.currentScript.src);
    const asset = (path) => new URL(path, root).href;

    const CATEGORIES = {
        ranks: {
            title: "Ranks",
            icon: "⛏️",
            blurb: "Ranks with special benefits",
            page: siteUrl("store", "/pages/ranks.html"),
        },
        items: {
            title: "Items",
            icon: "🛍️",
            blurb: "Keys, tools and kits.",
            page: siteUrl("store", "/pages/items.html"),
        },
    };

    const USER_KEY = "cocomokio-user";
    const user = {
        get() { try { return localStorage.getItem(USER_KEY) || ""; } catch { return ""; } },
        set(name) {
            try { name ? localStorage.setItem(USER_KEY, name) : localStorage.removeItem(USER_KEY); } catch { /* storage blocked */ }
        },
    };

    window.Mokio = {
        url: asset,
        CATEGORIES,
        user,
        MAIN: PROD_MAIN,
        STORE: PROD_STORE,
        SOCIAL: PROD_SOCIAL,
        siteUrl,
    };

    const link = (href, text, cls = "") => {
        let current = false;
        try {
            const u = new URL(href, location.href);
            current = u.pathname === location.pathname && u.origin === location.origin;
        } catch { /* ignore */ }
        return `<a${cls ? ` class="${cls}"` : ""} href="${href}"${current ? ' aria-current="page"' : ""}>${text}</a>`;
    };

    function accountLink() {
        const name = user.get();
        const inner = name
            ? `<span class="avatar" aria-hidden="true">${name[0].toUpperCase()}</span><span class="username">${name}</span>`
            : `<img class="icon" src="${asset("Images/Profile.svg")}" alt="">`;
        return `<a class="profile" href="${siteUrl("main", "/pages/signin.html")}" aria-label="${name ? `Signed in as ${name}` : "Sign in"}">${inner}</a>`;
    }

    function renderHeader(el) {
        const { title = "", titleClass = "page-title", titleHref = "" } = el.dataset;
        const has = (name) => name in el.dataset;
        const goesBack = has("historyLink");

        let storeMenu = "";
        if (has("storeNavigation")) {
            // Spaces between links so "Home Ranks Items" does not run together
            storeMenu = `
                <nav class="store-nav" aria-label="Store categories">
                    ${link(siteUrl("store", "/"), "Home")}
                    ${link(CATEGORIES.ranks.page, "Ranks")}
                    ${link(CATEGORIES.items.page, "Items")}
                </nav>`;
        }

        const cart = has("shoppingCart") ? `
            <a class="cart" href="${siteUrl("store", "/pages/checkout.html")}" aria-label="Shopping cart">
                <img class="icon" src="${asset("Images/Shopping cart.svg")}" alt="">
                <span class="cart-count"></span>
            </a>` : "";

        let titleLink = titleHref;
        if (!titleLink) {
            if (title === "Home") titleLink = siteUrl("main", "/");
            else if (title === "Store") titleLink = siteUrl("store", "/");
            else if (title === "Social") titleLink = siteUrl("social", "/");
            else titleLink = "#";
        }

        const header = document.createElement("header");
        header.innerHTML = `
            <div class="header-top">
                <a class="logo" href="${siteUrl("main", "/")}"><img src="${asset("Images/CMC logo.svg")}" alt="CoCoMokio home"></a>
                <h1 class="${titleClass}${title === "Home" ? " home-title" : ""}"><a href="${goesBack ? "#" : titleLink}">${title}</a></h1>
                <nav class="main-nav" aria-label="Main">
                    ${link(siteUrl("store", "/"), "Store")}
                    ${link(siteUrl("social", "/"), "Social")}
                    ${link(siteUrl("main", "/pages/server.html"), "Server")}
                    ${has("accountLinks") ? accountLink() : ""}
                </nav>
            </div>
            <div class="header-bottom">
                <div class="brand-group">
                    <span class="brand gradient">Mokio</span>
                    ${has("checkoutTitle") ? '<span class="checkout-title">Checkout</span>' : ""}
                </div>
                ${storeMenu}
                ${cart}
            </div>`;

        if (goesBack) {
            header.querySelector(`.${titleClass} a`).addEventListener("click", (event) => {
                event.preventDefault();
                history.back();
            });
        }
        if (title) document.title = `${title} | CoCoMokio`;
        el.replaceWith(header);
    }

    function renderFooter(el) {
        const footer = document.createElement("footer");
        footer.innerHTML = `
            <div class="footer-left">
                <h2>${link(siteUrl("main", "/pages/contributors.html"), "See contributors here!", "grey")}</h2>
                <h3>${link(siteUrl("main", "/pages/apply.html"), "Want to help? Apply now!", "grey")}</h3>
            </div>
            <span class="brand gradient">Mokio</span>
            <div class="footer-right">
                <h2 class="grey">Contact</h2>
                <p class="grey">Email: support@cocomokio.com</p>
            </div>`;
        el.replaceWith(footer);
    }

    const headerEl = document.querySelector("[data-shared-header]");
    if (headerEl) renderHeader(headerEl);
    const footerEl = document.querySelector("[data-shared-footer]");
    if (footerEl) renderFooter(footerEl);
})();
