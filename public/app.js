// public/app.js
(async function () {
  const $ = id => document.getElementById(id);
  let page = 1;

  async function callJSON(url, options) {
    const r = await fetch(url, options);
    return r.json().catch(() => ({}));
  }

  async function loadContent(p = 1) {
    const r = await fetch(`/api/content?page=${p}`);
    const j = await r.json();
    $('content').innerHTML = j.content.map(c => `<div><strong>${escapeHtml(c.title)}</strong><p>${escapeHtml(c.body)}</p></div>`).join('\n');
    $('pager').innerHTML = `<button id=prev ${p<=1?'disabled':''}>Prev</button> <button id=next>Next</button>`;
    document.getElementById('prev').addEventListener('click', () => { if (p > 1) { page--; loadContent(page) } });
    document.getElementById('next').addEventListener('click', () => { page++; loadContent(page) });
  }
  await loadContent();

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function updateUIForUser(user) {
    if (user) {
      $('login').style.display = 'none';
      $('logout').style.display = 'inline-block';
      if (user.role === 'admin') {
        $('adminPanel').style.display = 'block';
      } else {
        $('adminPanel').style.display = 'none';
      }
      $('loginResp').innerText = `Signed in as ${user.username} (${user.role})`;
    } else {
      $('login').style.display = 'inline-block';
      $('logout').style.display = 'none';
      $('adminPanel').style.display = 'none';
      $('loginResp').innerText = '';
    }
  }

  $('login').addEventListener('click', async () => {
    const username = $('u').value; const password = $('p').value;
    const j = await callJSON('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (j.user) {
      updateUIForUser(j.user);
    } else {
      $('loginResp').innerText = j.error || 'Sign-in failed';
    }
  });

  $('logout').addEventListener('click', async () => {
    await callJSON('/api/logout', { method: 'POST' });
    updateUIForUser(null);
  });

  $('add').addEventListener('click', async () => {
    const title = $('ctitle').value; const body = $('cbody').value;
    const j = await callJSON('/api/admin/add-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) });
    if (j.ok) {
      $('addResp').innerText = 'Published (id=' + j.id + ')';
      loadContent();
    } else {
      $('addResp').innerText = j.error || 'Error publishing';
    }
  });

  $('listUsers').addEventListener('click', async () => {
    const j = await callJSON('/api/admin/users');
    if (j.users) {
      $('usersList').innerText = JSON.stringify(j.users, null, 2);
    } else {
      $('usersList').innerText = j.error || 'Error fetching users';
    }
  });

  $('doSearch').addEventListener('click', async () => {
    const q = $('q').value;
    // Uses the secure API by default — instructor may enable /insecure for demos
    const r = await fetch(`/insecure/search?q=${encodeURIComponent(q)}`); // intentionally points to insecure endpoint for labs if enabled
    const j = await r.json();
    $('searchResp').innerText = JSON.stringify(j, null, 2);
  });
})();
