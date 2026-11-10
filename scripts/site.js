/* =========================================================
   CoCoMokio — shared site script
   Renders header + footer. Uses absolute domain URLs so the
   three sites (www / store / social) stay connected.
   ========================================================= */
(() => {
    const MAIN   = "https://www.cocomokio.com";
    const STORE  = "https://store.cocomokio.com";
    const SOCIAL = "https://social.cocomokio.com";

    // Local asset root (relative to this script's location: scripts/ -> site root)
    const root = new URL("../", document.currentScript.src);
    const asset = (path) => new URL(path, root).href;

    const CATEGORIES = {
        ranks: { title: "Ranks", icon: "⛏️", blurb: "Ranks with special benefits", page: STORE + "/pages/ranks.html" },
        items: { title: "Items", icon: "🛍️", blurb: "Keys, tools and kits.", page: STORE + "/pages/items.html" },
    };

    const USER_KEY = "cocomokio-user";
    const user = {
        get() { try { return localStorage.getItem(USER_KEY) || ""; } catch { return ""; } },
        set(name) {
            try { name ? localStorage.setItem(USER_KEY, name) : localStorage.removeItem(USER_KEY); } catch { /* storage blocked */ }
        },
    };

    window.Mokio = { url: asset, CATEGORIES, user, MAIN, STORE, SOCIAL };

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
        return `<a class="profile" href="${MAIN}/pages/signin.html" aria-label="${name ? `Signed in as ${name}` : "Sign in"}">${inner}</a>`;
    }

    function renderHeader(el) {
        const { title = "", titleClass = "page-title", titleHref = "" } = el.dataset;
        const has = (name) => name in el.dataset;
        const goesBack = has("historyLink");

        let storeMenu = "";
        if (has("storeNavigation")) {
            storeMenu = `
                <nav class="store-nav" aria-label="Store categories">
                    ${link(STORE + "/", "Home")}
                    ${Object.values(CATEGORIES).map(c => link(c.page, c.title)).join("")}
                </nav>`;
        }

        const cart = has("shoppingCart") ? `
            <a class="cart" href="${STORE}/pages/checkout.html" aria-label="Shopping cart">
                <img class="icon" src="${asset("Images/Shopping cart.svg")}" alt="">
                <span class="cart-count"></span>
            </a>` : "";

        // Resolve title link
        let titleLink = titleHref;
        if (!titleLink) {
            if (title === "Home") titleLink = MAIN + "/";
            else if (title === "Store") titleLink = STORE + "/";
            else if (title === "Social") titleLink = SOCIAL + "/";
            else titleLink = "#";
        }

        const header = document.createElement("header");
        header.innerHTML = `
            <div class="header-top">
                <a class="logo" href="${MAIN}/"><img src="${asset("Images/CMC logo.svg")}" alt="CoCoMokio home"></a>
                <h1 class="${titleClass}${title === "Home" ? " home-title" : ""}"><a href="${goesBack ? "#" : titleLink}">${title}</a></h1>
                <nav class="main-nav" aria-label="Main">
                    ${link(STORE + "/", "Store")}
                    ${link(SOCIAL + "/", "Social")}
                    ${link(MAIN + "/pages/server.html", "Server")}
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
                <h2>${link(MAIN + "/pages/contributors.html", "See contributors here!", "grey")}</h2>
                <h3>${link(MAIN + "/pages/apply.html", "Want to help? Apply now!", "grey")}</h3>
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
