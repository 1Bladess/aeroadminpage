const loginCard = document.getElementById('loginCard');
const adminCard = document.getElementById('adminCard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const devlogForm = document.getElementById('devlogForm');
const adminDevlogList = document.getElementById('adminDevlogList');
const manifestJson = document.getElementById('manifestJson');
const saveManifestBtn = document.getElementById('saveManifestBtn');
const adminMessage = document.getElementById('adminMessage');

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  let body = null;
  try { body = await res.json(); } catch (_e) {}

  if (!res.ok) {
    const msg = (body && body.error) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return body;
}

async function checkSession() {
  try {
    await api('/api/auth/me');
    showAdmin();
    await refreshDevlog();
    await loadManifest();
  } catch (_err) {
    showLogin();
  }
}

function showLogin() {
  loginCard.classList.remove('hidden');
  adminCard.classList.add('hidden');
}

function showAdmin() {
  loginCard.classList.add('hidden');
  adminCard.classList.remove('hidden');
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    showAdmin();
    await refreshDevlog();
    await loadManifest();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  showLogin();
});

devlogForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  adminMessage.textContent = '';
  try {
    const title = document.getElementById('postTitle').value.trim();
    const tag = document.getElementById('postTag').value.trim() || 'UPDATE';
    const content = document.getElementById('postContent').value.trim();

    await api('/api/admin/devlog', {
      method: 'POST',
      body: JSON.stringify({ title, tag, content })
    });

    devlogForm.reset();
    adminMessage.textContent = 'Devlog post published.';
    await refreshDevlog();
  } catch (err) {
    adminMessage.textContent = err.message;
  }
});

async function refreshDevlog() {
  const data = await api('/api/devlog?limit=100');
  adminDevlogList.innerHTML = '';

  for (const item of data.items || []) {
    const node = document.createElement('article');
    node.className = 'entry';
    node.innerHTML = `
      <h4>${escapeHtml(item.title || '')}</h4>
      <div class="meta">${escapeHtml(item.tag || 'UPDATE')} • ${formatDate(item.publishedAt)}</div>
      <div>${escapeHtml(item.content || '')}</div>
      <button class="inline-danger" data-id="${item.id}">Delete</button>
    `;
    adminDevlogList.appendChild(node);
  }

  for (const btn of adminDevlogList.querySelectorAll('button[data-id]')) {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      await api(`/api/admin/devlog/${id}`, { method: 'DELETE' });
      await refreshDevlog();
    });
  }
}

async function loadManifest() {
  const data = await api('/api/updates/manifest?platform=windows&channel=stable');
  manifestJson.value = JSON.stringify(data, null, 2);
}

saveManifestBtn.addEventListener('click', async () => {
  adminMessage.textContent = '';
  try {
    const parsed = JSON.parse(manifestJson.value);
    await api('/api/admin/updates/manifest', {
      method: 'PUT',
      body: JSON.stringify({
        channel: 'stable',
        platform: 'windows',
        manifest: parsed
      })
    });
    adminMessage.textContent = 'Manifest saved.';
  } catch (err) {
    adminMessage.textContent = err.message;
  }
});

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

checkSession();
