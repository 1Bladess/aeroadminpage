async function fetchOnlineCount() {
  const res = await fetch('/api/presence/count');
  if (!res.ok) return;
  const data = await res.json();
  const el = document.getElementById('onlineCount');
  if (el) el.textContent = String(data.online || 0);
}

async function fetchDevlog() {
  const res = await fetch('/api/devlog?limit=20');
  if (!res.ok) return;
  const data = await res.json();
  const list = document.getElementById('devlogList');
  if (!list) return;

  list.innerHTML = '';
  const items = Array.isArray(data.items) ? data.items : [];
  for (const item of items) {
    const node = document.createElement('article');
    node.className = 'entry';
    node.innerHTML = `
      <h4>${escapeHtml(item.title || '')}</h4>
      <div class="meta">${escapeHtml(item.tag || 'UPDATE')} • ${formatDate(item.publishedAt)}</div>
      <div>${escapeHtml(item.content || '')}</div>
    `;
    list.appendChild(node);
  }
}

function formatDate(iso) {
  if (!iso) return 'Unknown date';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'Unknown date' : d.toLocaleString();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

fetchOnlineCount();
fetchDevlog();
setInterval(fetchOnlineCount, 10000);
setInterval(fetchDevlog, 30000);
