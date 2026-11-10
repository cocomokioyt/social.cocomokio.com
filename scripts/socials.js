(() => {
    const root = new URL("../", document.currentScript.src);
    const url = (path) => new URL(path, root).href;
    const platforms = {
        youtube: { title: "YouTube", image: "Images/YouTube logo.svg" },
        twitch: { title: "Twitch", image: "Images/Twitch logo.svg" },
        tiktok: { title: "TikTok", image: "Images/TikTok logo.svg" },
    };
    const ownerProfiles = [{
        name: "CoCoMokio",
        channels: [
            { platform: "youtube", handle: "@CoCoMokio", href: "https://www.youtube.com/@CoCoMokio" },
            { platform: "twitch", handle: "@CoCoMokio", href: "https://www.twitch.tv/cocomokio", liveUsername: "cocomokio" },
            { platform: "tiktok", handle: "@cocomokio", href: "https://www.tiktok.com/@cocomokio" },
        ],
    }];
    const mediaProfiles = [
        { name: "Media Creator 1", channels: ["youtube", "tiktok"].map((platform) => ({ platform, handle: "", href: "" })) },
        { name: "Media Creator 2", channels: ["twitch", "youtube"].map((platform) => ({ platform, handle: "", href: "" })) },
        { name: "Media Creator 3", channels: ["youtube", "tiktok"].map((platform) => ({ platform, handle: "", href: "" })) },
        { name: "Media Creator 4", channels: ["twitch", "youtube"].map((platform) => ({ platform, handle: "", href: "" })) },
    ];
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
    const renderChannel = (channel) => {
        const platform = platforms[channel.platform];
        if (!platform) return "";
        const image = `<img src="${url(platform.image)}" alt="">`;
        const label = `${platform.title}${channel.handle ? ` ${channel.handle}` : ""}`;
        const href = channel.href ? new URL(channel.href, location.href) : null;
        const safeHref = href && ["http:", "https:"].includes(href.protocol) ? href.href : "";
        return safeHref
            ? `<a class="social-platform" href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${image}<span>${escapeHtml(label)}</span></a>`
            : `<span class="social-platform social-platform-unset" title="Add this profile link in scripts/socials.js">${image}<span>${escapeHtml(platform.title)} link not set</span></span>`;
    };
    const renderProfile = (profile) => `
        <article class="social-card">
            <h3>${escapeHtml(profile.name)}</h3>
            <div class="social-platforms">${profile.channels.map(renderChannel).join("")}</div>
            ${profile.channels.filter((channel) => channel.liveUsername).map((channel) =>
                `<span class="live-status" data-live-status aria-live="polite">Checking ${escapeHtml(platforms[channel.platform]?.title || "stream")} status…</span>`).join("")}
        </article>`;

    document.querySelectorAll("[data-social-profiles]").forEach((section) => {
        const profiles = section.dataset.socialProfiles === "owner" ? ownerProfiles : mediaProfiles;
        section.innerHTML = profiles.map(renderProfile).join("");
    });

    const liveBadges = [...document.querySelectorAll("[data-live-status]")];
    const liveChannels = [...ownerProfiles, ...mediaProfiles].flatMap((profile) => profile.channels)
        .filter((channel) => channel.liveUsername);
    const refreshLiveStatus = async () => {
        await Promise.all(liveChannels.map(async (channel, index) => {
            const badge = liveBadges[index];
            if (!badge) return;
            try {
                const response = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(channel.liveUsername)}`, { cache: "no-store" });
                if (!response.ok) throw new Error(`Twitch status request failed (${response.status}).`);
                const status = (await response.text()).trim();
                if (!status) throw new Error("Twitch status returned an empty response.");
                const unavailable = /not found|does not exist|invalid|error/i.test(status);
                const offline = status.toLowerCase() === `${channel.liveUsername.toLowerCase()} is offline`;
                badge.textContent = unavailable
                    ? `${platforms[channel.platform]?.title || "Stream"} status unavailable`
                    : offline
                        ? "Offline"
                        : `Online on ${platforms[channel.platform]?.title || "stream"}`;
                badge.classList.toggle("is-live", !unavailable && !offline);
                badge.classList.toggle("is-offline", offline);
                badge.classList.toggle("is-unavailable", unavailable);
            } catch {
                badge.textContent = `${platforms[channel.platform]?.title || "Stream"} status unavailable`;
                badge.classList.remove("is-live", "is-offline");
                badge.classList.add("is-unavailable");
            }
        }));
    };
    if (liveChannels.length) {
        refreshLiveStatus();
        window.setInterval(refreshLiveStatus, 60_000);
    }
})();
