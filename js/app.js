let currentCat = 'all';
let searchTerm = '';
let favorites = new Set(JSON.parse(localStorage.getItem('pk-favs') || '[]'));

function saveFavs() {
  localStorage.setItem('pk-favs', JSON.stringify([...favorites]));
}

function render() {
  const grid = document.getElementById('prompt-grid');
  const stats = document.getElementById('stats');
  if (!grid) return;

  let list = PROMPTS;

  if (currentCat !== 'all') {
    list = list.filter(p => p.cat === currentCat);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.desc.toLowerCase().includes(term) ||
      p.prompt.toLowerCase().includes(term) ||
      p.cat.toLowerCase().includes(term)
    );
  }

  if (stats) stats.textContent = list.length + ' prompt' + (list.length !== 1 ? 's' : '');

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div>🔍</div><div style="font-size:16px; font-weight:700; margin-bottom:4px;">No prompts found</div><div>Try a different search or category</div></div>`;
    return;
  }

  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label.replace(/^\S+\s/, '')]));

  grid.innerHTML = list.map(p => `
    <div class="prompt-card" id="card-${p.id}">
      <div class="card-top">
        <span class="card-category">${catMap[p.cat] || p.cat}</span>
        <button class="fav-btn ${favorites.has(p.id) ? 'active' : ''}" onclick="toggleFav(${p.id})" title="Save">★</button>
      </div>
      <div class="card-title">${esc(p.title)}</div>
      <div class="card-desc">${esc(p.desc)}</div>
      <div class="prompt-box" id="box-${p.id}">
        <div class="prompt-text">${esc(p.prompt)}</div>
      </div>
      <button class="expand-btn" onclick="toggleExpand(${p.id})" id="exp-${p.id}">Show full prompt ↓</button>
      <div class="card-actions">
        <button class="copy-btn" onclick="copyPrompt(${p.id})" id="copy-${p.id}">📋 Copy Prompt</button>
      </div>
    </div>`).join('');
}

function setCategory(cat) {
  currentCat = cat;
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === cat);
  });
  render();
}

function onSearch(val) {
  searchTerm = val.trim();
  render();
}

function toggleExpand(id) {
  const box = document.getElementById('box-' + id);
  const btn = document.getElementById('exp-' + id);
  const isOpen = box.classList.toggle('expanded');
  btn.textContent = isOpen ? 'Show less ↑' : 'Show full prompt ↓';
}

async function copyPrompt(id) {
  const p = PROMPTS.find(x => x.id === id);
  if (!p) return;
  const btn = document.getElementById('copy-' + id);
  try {
    await navigator.clipboard.writeText(p.prompt);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = p.prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  btn.textContent = '✅ Copied!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = '📋 Copy Prompt';
    btn.classList.remove('copied');
  }, 2000);
}

function toggleFav(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  saveFavs();
  const btn = document.querySelector(`#card-${id} .fav-btn`);
  if (btn) btn.classList.toggle('active', favorites.has(id));
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// Init chips
function initChips() {
  const wrap = document.getElementById('filter-chips');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(c =>
    `<button class="chip ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}" onclick="setCategory('${c.id}')">${c.label}</button>`
  ).join('');
}

initChips();
render();
