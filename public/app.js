const form = document.getElementById("shortenForm");
const input = document.getElementById("urlInput");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");
const result = document.getElementById("result");
const shortUrl = document.getElementById("shortUrl");
const copyButton = document.getElementById("copyButton");
const linksList = document.getElementById("linksList");
const refreshButton = document.getElementById("refreshButton");

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

async function loadLinks() {
  try {
    const response = await fetch("/api/links");
    const links = await response.json();

    if (!links.length) {
      linksList.innerHTML = '<div class="empty">Nenhum link criado ainda.</div>';
      return;
    }

    linksList.innerHTML = links.map(link => `
      <article class="link-card">
        <div>
          <a class="short" href="${escapeHtml(link.shortUrl)}" target="_blank" rel="noopener">
            ${escapeHtml(link.shortUrl)}
          </a>
          <div class="original">${escapeHtml(link.originalUrl)}</div>
        </div>
        <div class="clicks">${link.clicks} clique${link.clicks === 1 ? "" : "s"}</div>
      </article>
    `).join("");
  } catch {
    linksList.innerHTML = '<div class="empty">Não foi possível carregar os links.</div>';
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  hideMessage();

  submitButton.disabled = true;
  submitButton.textContent = "Encurtando...";

  try {
    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: input.value.trim() })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Erro ao criar o link.");

    shortUrl.href = data.shortUrl;
    shortUrl.textContent = data.shortUrl;
    result.classList.remove("hidden");

    await navigator.clipboard?.writeText(data.shortUrl).catch(() => {});
    input.value = "";
    await loadLinks();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Encurtar";
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(shortUrl.textContent);
  copyButton.textContent = "Copiado!";
  setTimeout(() => copyButton.textContent = "Copiar", 1500);
});

refreshButton.addEventListener("click", loadLinks);

loadLinks();