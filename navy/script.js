const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
});
nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
        menu.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
    }),
);
const details = document.querySelector(".details");
details.addEventListener("click", () => {
    const open = details.getAttribute("aria-expanded") !== "true";
    details.setAttribute("aria-expanded", String(open));
    document.getElementById("project-details").hidden = !open;
    details.querySelector("span").textContent = open ? "−" : "＋";
});
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("copy-email").addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
        await navigator.clipboard.writeText("jasilvahirane@gmail.com");
        status.textContent =
            { en: "Email copied", pt: "E-mail copiado", es: "Correo copiado" }[
                document.documentElement.lang
            ] || "Email copied";
    } catch {
        status.textContent =
            { en: "Please copy: ", pt: "Copie: ", es: "Copia: " }[document.documentElement.lang] +
            "jasilvahirane@gmail.com";
    }
});

const languageSelect = document.getElementById("language-select");
languageSelect.addEventListener("change", () => {
    const pages = { en: "index.html", pt: "pt.html", es: "es.html" };
    location.href = "/navy/" + pages[languageSelect.value] + location.hash;
});
