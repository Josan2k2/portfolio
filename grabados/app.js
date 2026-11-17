const products = [
    {
        id: "llavero",
        name: "Llaveros en madera",
        category: "Regalos",
        net: 2500,
        days: 3,
        img: "llavero.jpg",
        desc: "Un detalle personal para recuerdos, eventos o tu marca.",
    },
    {
        id: "galvano",
        name: "Galvanos personalizados",
        category: "Empresas",
        net: 18000,
        days: 5,
        img: "galvano.jpg",
        desc: "Reconocimientos con nombres y logotipos para ocasiones especiales.",
    },
    {
        id: "timbre",
        name: "Timbres de goma",
        category: "Empresas",
        net: 12000,
        days: 4,
        img: "timbre.jpg",
        desc: "Tu identidad en un sello personalizado para tu negocio.",
    },
    {
        id: "organizador",
        name: "Organizador de escritorio",
        category: "Empresas",
        net: 15000,
        days: 5,
        img: "organizador.jpg",
        desc: "Orden y personalidad para tu espacio de trabajo.",
    },
    {
        id: "alcancia",
        name: "Alcancías a medida",
        category: "Regalos",
        net: 14000,
        days: 5,
        img: "alcancia.jpg",
        desc: "Una pieza personal con cubierta de acrílico para tus metas.",
    },
    {
        id: "3d",
        name: "Llaveros en impresión 3D",
        category: "3D",
        net: 3500,
        days: 4,
        img: "3d.jpg",
        desc: "Formas y detalles para dar vida a tus ideas en tres dimensiones.",
    },
];
const $ = (id) => document.getElementById(id),
    money = (n) =>
        new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
        }).format(n),
    esc = (s) =>
        String(s).replace(
            /[&<>"']/g,
            (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
        );
let cart = [];
try {
    const saved = JSON.parse(localStorage.getItem("gam-cart") || "[]");
    if (Array.isArray(saved))
        cart = saved
            .filter(
                (x) =>
                    products.some((p) => p.id === x.id) &&
                    Number.isInteger(x.qty) &&
                    x.qty > 0 &&
                    x.qty <= 5000 &&
                    [0, 2500, 6000].includes(x.custom) &&
                    ["pickup", "santiago", "regions"].includes(x.delivery),
            )
            .map((x) => ({ ...x, details: String(x.details || "").slice(0, 500) }));
} catch {}
function renderProducts(filter = "Todos") {
    $("catalog").innerHTML = products
        .filter((p) => filter === "Todos" || p.category === filter)
        .map(
            (p) =>
                `<article class="product"><img src="assets/${p.img}" alt="${p.name}" loading="lazy"><div class="productcontent"><span class="tag">${p.category.toUpperCase()}</span><h3>${p.name}</h3><p>${p.desc}</p><div class="productbottom"><div class="price">${money(Math.round(p.net * 1.19))}<small>Desde · referencial · IVA incluido</small></div><button data-product="${p.id}">Personalizar ↗</button></div></div></article>`,
        )
        .join("");
    document.querySelectorAll("[data-product]").forEach(
        (b) =>
            (b.onclick = () => {
                $("product").value = b.dataset.product;
                updateEstimate();
                $("cotizar").scrollIntoView({ behavior: "smooth" });
            }),
    );
}
function compute(line) {
    const p = products.find((p) => p.id === line.id);
    const net = p.net * line.qty + line.custom,
        iva = Math.round(net * 0.19);
    return {
        net,
        iva,
        total: net + iva,
        days: p.days + Math.ceil(line.qty / 25) - 1 + (line.custom === 6000 ? 2 : 0),
    };
}
function current() {
    return {
        id: $("product").value,
        qty: Number($("qty").value),
        custom: Number($("custom").value),
        details: $("details").value.trim(),
        delivery: $("delivery").value,
    };
}
function breakdown(net, iva, total) {
    return `<div><span>Monto neto</span><span>${money(net)}</span></div><div><span>IVA 19%</span><span>${money(iva)}</span></div><div class="total"><span>Total productos</span><span>${money(total)}</span></div>`;
}
function updateEstimate() {
    let l = current();
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 5000) {
        $("estimate").textContent = "Ingresa una cantidad entera entre 1 y 5.000.";
        return;
    }
    let c = compute(l),
        transport =
            l.delivery === "pickup"
                ? "Retiro a coordinar."
                : l.delivery === "santiago"
                  ? "Transporte estimado: 1–3 días hábiles adicionales. Costo por confirmar."
                  : "Transporte estimado: 2–7 días hábiles adicionales. Envío por pagar.";
    $("estimate").innerHTML =
        breakdown(c.net, c.iva, c.total) +
        `<p><strong>Producción estimada: ${c.days}–${c.days + 2} días hábiles.</strong><br>${transport}<br>Personalización: cargo único por diseño. Plazo definitivo sujeto a confirmación.</p>`;
}
function totals() {
    return cart.reduce(
        (a, l) => {
            let c = compute(l);
            a.net += c.net;
            a.iva += c.iva;
            a.total += c.total;
            return a;
        },
        { net: 0, iva: 0, total: 0 },
    );
}
function save() {
    try {
        localStorage.setItem("gam-cart", JSON.stringify(cart));
    } catch {}
    renderCart();
}
function renderCart() {
    $("count").textContent = cart.reduce((n, l) => n + l.qty, 0);
    $("cartItems").innerHTML = cart.length
        ? cart
              .map((l, i) => {
                  const p = products.find((p) => p.id === l.id),
                      c = compute(l);
                  return `<div class="cartitem"><div><strong>${esc(p.name)}</strong><p>${l.qty} unidad(es) · ${money(c.total)} IVA incluido<br>${esc(l.details || "Sin indicaciones adicionales")}<br>${esc({ pickup: "Retiro coordinado", santiago: "Despacho Santiago", regions: "Regiones: envío por pagar" }[l.delivery])}<br>Producción: ${c.days}–${c.days + 2} días hábiles</p></div><button data-remove="${i}" aria-label="Quitar ${esc(p.name)}">Quitar</button></div>`;
              })
              .join("")
        : '<p class="empty">Tu pedido está vacío. Elige una pieza y personalízala en el cotizador.</p>';
    let t = totals();
    $("cartTotal").innerHTML =
        breakdown(t.net, t.iva, t.total) +
        "<p>Despacho no incluido. Se confirmará antes del pago.</p>";
    document.querySelectorAll("[data-remove]").forEach(
        (b) =>
            (b.onclick = () => {
                cart.splice(Number(b.dataset.remove), 1);
                save();
            }),
    );
    $("orderForm").hidden = !cart.length;
    $("download").hidden = !cart.length;
}
function textQuote() {
    let t = totals();
    return `GRABADOS A MEDIDA — COTIZACIÓN REFERENCIAL\nFecha: ${new Date().toLocaleDateString("es-CL")}\nCliente: ${$("name").value.trim() || "Por confirmar"}\n\n${cart
        .map((l) => {
            let p = products.find((p) => p.id === l.id),
                c = compute(l);
            return `${p.name} × ${l.qty}\nIndicaciones: ${l.details || "Por confirmar"}\nTotal con IVA: ${money(c.total)}\nProducción estimada: ${c.days}–${c.days + 2} días hábiles\nEntrega: ${{ pickup: "Retiro coordinado", santiago: "Despacho Santiago, costo por confirmar", regions: "Regiones, envío por pagar" }[l.delivery]}`;
        })
        .join(
            "\n\n",
        )}\n\nNeto: ${money(t.net)}\nIVA 19%: ${money(t.iva)}\nTotal productos: ${money(t.total)}\nDespacho no incluido.\nDocumento solicitado: ${$("doc").value}\nNotas: ${$("orderNotes").value.trim() || "Sin notas"}\n\nPrecios y plazos de muestra, sujetos a confirmación. Los plazos comienzan desde la aprobación del diseño y confirmación del pago. No es boleta ni factura. No constituye compra confirmada.\nContacto: +56 9 6413 8882`;
}
$("product").innerHTML = products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
document.querySelectorAll("[data-filter]").forEach(
    (b) =>
        (b.onclick = () => {
            document
                .querySelectorAll("[data-filter]")
                .forEach((x) => x.classList.toggle("active", x === b));
            renderProducts(b.dataset.filter);
        }),
);
["product", "qty", "custom", "delivery"].forEach((id) =>
    $(id).addEventListener("input", updateEstimate),
);
$("quoteForm").onsubmit = (e) => {
    e.preventDefault();
    let l = current();
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 5000) return;
    if (cart.length >= 30) {
        alert("Puedes agregar hasta 30 líneas por solicitud.");
        return;
    }
    cart.push(l);
    save();
    $("toast").textContent = "Producto agregado a tu pedido";
    $("toast").style.display = "block";
    setTimeout(() => ($("toast").style.display = "none"), 2500);
};
$("openCart").onclick = () => {
    $("cart").showModal();
};
$("closeCart").onclick = () => $("cart").close();
$("orderForm").onsubmit = (e) => {
    e.preventDefault();
    if (!cart.length) return;
    alert("Sitio de demostración: el envío de pedidos y mensajes está deshabilitado.");
};
$("download").onclick = () => {
    let u = URL.createObjectURL(new Blob([textQuote()], { type: "text/plain;charset=utf-8" })),
        a = document.createElement("a");
    a.href = u;
    a.download = "cotizacion-grabados-a-medida.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
};
$("year").textContent = new Date().getFullYear();
renderProducts();
updateEstimate();
renderCart();
let installPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    $("install").hidden = false;
});
$("install").onclick = async () => {
    if (installPrompt) {
        await installPrompt.prompt();
        installPrompt = null;
        $("install").hidden = true;
    }
};
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

// Demo safety: block all external navigation and outgoing form submissions.
document.addEventListener("click", (event) => {
    const a = event.target.closest("a[href]");
    if (a && (/^(https?:|mailto:|tel:|sms:|whatsapp:)/i.test(a.getAttribute("href")))) {
        event.preventDefault();
        alert("Enlace externo deshabilitado en esta demostración.");
    }
}, true);
