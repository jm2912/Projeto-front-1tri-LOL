/* ─────────────────────────────────────────
   DADOS
───────────────────────────────────────── */
const PECAS = [
  { id: 1,  nome: 'Camisa',           preco: 15 },
  { id: 2,  nome: 'Calça',            preco: 20 },
  { id: 3,  nome: 'Vestido',          preco: 28 },
  { id: 4,  nome: 'Blazer / Terno',   preco: 38 },
  { id: 5,  nome: 'Casaco / Jaqueta', preco: 32 },
  { id: 6,  nome: 'Short / Bermuda',  preco: 16 },
  { id: 7,  nome: 'Cueca / Calcinha', preco: 8  },
  { id: 8,  nome: 'Meia (par)',        preco: 5  },
  { id: 9,  nome: 'Lençol',           preco: 42 },
  { id: 10, nome: 'Toalha',           preco: 18 },
  { id: 11, nome: 'Moletom',          preco: 25 },
  { id: 12, nome: 'Saia',             preco: 22 },
];

const STATUS = {
  ABERTO:       { label: 'Aberto',       bg: '#2563eb', color: '#fff' },
  EM_ANDAMENTO: { label: 'Em andamento', bg: '#d97706', color: '#fff' },
  CONCLUIDO:    { label: 'Concluído',    bg: '#16a34a', color: '#fff' },
  CANCELADO:    { label: 'Cancelado',    bg: '#6b7280', color: '#fff' },
};

let pedidos = [
  {
    id: 2405,
    data: '2025-04-24T10:30:00',
    status: 'ABERTO',
    itens: [{ id: 1, nome: 'Camisa', quantidade: 3, preco: 15 }],
    total: 45,
  },
  {
    id: 2391,
    data: '2025-04-18T14:20:00',
    status: 'CONCLUIDO',
    itens: [
      { id: 2,  nome: 'Calça',  quantidade: 2, preco: 20 },
      { id: 10, nome: 'Toalha', quantidade: 1, preco: 18 },
    ],
    total: 58,
  },
  {
    id: 2376,
    data: '2025-04-10T09:15:00',
    status: 'CANCELADO',
    itens: [{ id: 4, nome: 'Blazer / Terno', quantidade: 1, preco: 38 }],
    total: 38,
  },
  {
    id: 2350,
    data: '2025-03-28T11:00:00',
    status: 'EM_ANDAMENTO',
    itens: [{ id: 9, nome: 'Lençol', quantidade: 2, preco: 42 }],
    total: 84,
  },
];

/* Estado da tela */
let selecao        = {};   /* { pecaId: quantidade } */
let pedidoAtivoId  = null;
let cancelarAlvoId = null;

/* ─────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────── */
function gerarId() {
  return Math.floor(1000 + Math.random() * 9000);
}

function moeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataHora(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pt-BR') + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

function badge(status) {
  const s = STATUS[status] || { label: status, bg: '#888', color: '#fff' };
  return `<span class="badge" style="background:${s.bg};color:${s.color}">${s.label}</span>`;
}

/* ─────────────────────────────────────────
   NAVEGAÇÃO
───────────────────────────────────────── */
function irPara(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('page-' + pagina).classList.add('active');

  const navEl = document.getElementById('nav-' + pagina);
  if (navEl) navEl.classList.add('active');

  /* Quando volta para pedidos, garante que nav-pedidos fique ativo */
  if (pagina === 'detalhe') {
    document.getElementById('nav-pedidos').classList.add('active');
  }

  if (pagina === 'pedidos') renderPedidos();
  if (pagina === 'novo')    renderPecas();

  window.scrollTo(0, 0);
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
let toastTimer;

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─────────────────────────────────────────
   LISTA DE PEDIDOS
───────────────────────────────────────── */
function renderPedidos() {
  const filtro = document.getElementById('filtro-status').value;

  const lista = [...pedidos]
    .filter(p => filtro === 'TODOS' || p.status === filtro)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const container = document.getElementById('lista-pedidos');

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="vazio">
        <div class="vazio-icon">🧺</div>
        <div class="vazio-text">Nenhum pedido encontrado.</div>
      </div>`;
    return;
  }

  container.innerHTML = lista.map(p => {
    const itensText = p.itens
      .map(it => `• ${it.nome} (${it.quantidade}×)`)
      .join('  ');

    return `
      <div class="pedido-card" onclick="verDetalhe(${p.id})">
        <div class="pedido-header">
          <div class="pedido-id">PEDIDO <span>#${p.id}</span></div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="pedido-total">${moeda(p.total)}</div>
            ${badge(p.status)}
          </div>
        </div>
        <div class="pedido-body">
          <div class="pedido-data">📅 ${dataHora(p.data)}</div>
          <div class="pedido-itens">${itensText}</div>
        </div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────
   DETALHE DO PEDIDO
───────────────────────────────────────── */
function verDetalhe(id) {
  const p = pedidos.find(x => x.id === id);
  if (!p) return;

  pedidoAtivoId = id;

  /* Cabeçalho */
  document.querySelector('#det-id span').textContent = '#' + p.id;
  document.getElementById('det-data').textContent = '📅 ' + dataHora(p.data);

  /* Badge de status */
  const s = STATUS[p.status] || { label: p.status, bg: '#888', color: '#fff' };
  const badgeEl = document.getElementById('det-badge');
  badgeEl.textContent     = s.label;
  badgeEl.style.background = s.bg;
  badgeEl.style.color      = s.color;

  /* Botão cancelar — só aparece se ABERTO */
  document.getElementById('det-btn-cancelar').style.display =
    p.status === 'ABERTO' ? 'inline-flex' : 'none';

  /* Tabela de itens */
  document.getElementById('det-itens').innerHTML = p.itens.map(it => `
    <tr>
      <td>${it.nome}</td>
      <td>${it.quantidade}×</td>
      <td>${moeda(it.preco)}</td>
      <td>${moeda(it.preco * it.quantidade)}</td>
    </tr>`).join('');

  document.getElementById('det-total').textContent = moeda(p.total);

  /* Stats */
  const totalPecas = p.itens.reduce((a, it) => a + it.quantidade, 0);
  document.getElementById('det-stats').innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Status atual</div>
      <div class="stat-value">${s.label}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Total de peças</div>
      <div class="stat-value">${totalPecas} peça${totalPecas !== 1 ? 's' : ''}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Data do pedido</div>
      <div class="stat-value">${dataHora(p.data)}</div>
    </div>`;

  irPara('detalhe');
}

/* ─────────────────────────────────────────
   CRIAR PEDIDO
───────────────────────────────────────── */
function renderPecas() {
  const grid = document.getElementById('peca-grid');

  grid.innerHTML = PECAS.map(p => {
    const qty = selecao[p.id] || 0;
    const sel = qty > 0;

    return `
      <div class="peca-item ${sel ? 'selected' : ''}"
           id="peca-item-${p.id}"
           onclick="togglePeca(${p.id})">
        <div class="peca-nome">${p.nome}</div>
        <div class="peca-preco">${moeda(p.preco)} / unid.</div>
        ${sel ? `
        <div class="peca-qty" onclick="event.stopPropagation()">
          <button class="qty-btn" onclick="ajustarQty(${p.id}, -1)">−</button>
          <div class="qty-value" id="qty-${p.id}">${qty}</div>
          <button class="qty-btn" onclick="ajustarQty(${p.id}, +1)">+</button>
        </div>` : ''}
      </div>`;
  }).join('');

  renderResumo();
}

function togglePeca(id) {
  if ((selecao[id] || 0) === 0) {
    selecao[id] = 1;
    renderPecas();
  }
}

function ajustarQty(id, delta) {
  const novo = Math.max(0, (selecao[id] || 0) + delta);
  if (novo === 0) delete selecao[id];
  else selecao[id] = novo;
  renderPecas();
}

function limparSelecao() {
  selecao = {};
}

function renderResumo() {
  const itens = Object.entries(selecao)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const p = PECAS.find(x => x.id === Number(id));
      return { ...p, quantidade: qty, subtotal: p.preco * qty };
    });

  const total = itens.reduce((a, it) => a + it.subtotal, 0);
  const box   = document.getElementById('resumo-box');

  if (itens.length === 0) {
    box.innerHTML = '<p class="empty-msg">Nenhuma peça selecionada ainda.</p>';
    return;
  }

  box.innerHTML =
    itens.map(it => `
      <div class="resumo-linha">
        <span>${it.nome} × ${it.quantidade}</span>
        <span>${moeda(it.subtotal)}</span>
      </div>`).join('') +
    `<div class="resumo-linha resumo-total-row">
      <span class="resumo-total-label">TOTAL</span>
      <span class="resumo-total">${moeda(total)}</span>
    </div>`;
}

function confirmarPedido() {
  const itens = Object.entries(selecao)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const p = PECAS.find(x => x.id === Number(id));
      return { id: p.id, nome: p.nome, quantidade: qty, preco: p.preco };
    });

  if (itens.length === 0) {
    showToast('⚠ Selecione ao menos uma peça.');
    return;
  }

  const total = itens.reduce((a, it) => a + it.preco * it.quantidade, 0);

  const novo = {
    id: gerarId(),
    data: new Date().toISOString(),
    status: 'ABERTO',
    itens,
    total,
  };

  pedidos.unshift(novo);
  limparSelecao();
  irPara('pedidos');
  showToast('✓ Pedido criado com sucesso!');
}

/* ─────────────────────────────────────────
   CANCELAMENTO
───────────────────────────────────────── */
function abrirModalCancelar() {
  cancelarAlvoId = pedidoAtivoId;
  document.getElementById('modal-text').innerHTML =
    `Tem certeza que deseja cancelar o pedido <strong style="color:#fbbf24">#${cancelarAlvoId}</strong>? Esta ação não pode ser desfeita.`;
  document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
  cancelarAlvoId = null;
}

function executarCancelamento() {
  if (!cancelarAlvoId) return;

  const p = pedidos.find(x => x.id === cancelarAlvoId);
  if (p) p.status = 'CANCELADO';

  fecharModal();
  verDetalhe(cancelarAlvoId);
  showToast('Pedido cancelado.');
}

/* ─────────────────────────────────────────
   INICIALIZAÇÃO
───────────────────────────────────────── */
renderPedidos();