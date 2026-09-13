/**
 * app.js
 * View routing, form wiring, and rendering for tracker/admin lists.
 */

const App = {
  currentView: 'home',
  mapInitialized: false,
  lastAssessment: null,

  init() {
    Storage.seedDemoDataIfEmpty();
    Camera.init();

    this.wireNav();
    this.wireReportForm();
    this.wireTracker();
    this.wireAdmin();

    this.showView('home');
    this.refreshHomeStats();
  },

  // ---------------- NAVIGATION ----------------
  wireNav() {
    document.querySelectorAll('[data-view-link]').forEach(el => {
      el.addEventListener('click', () => this.showView(el.dataset.viewLink));
    });

    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  },

  showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.viewLink === name));
    document.getElementById('navMenu').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    this.currentView = name;

    if (name === 'report') {
      setTimeout(() => {
        if (!this.mapInitialized) {
          MapPicker.init();
          this.mapInitialized = true;
        }
        MapPicker.map.invalidateSize();
      }, 50);
    }
    if (name === 'admin') this.renderAdmin();
    if (name === 'home') this.refreshHomeStats();
  },

  // ---------------- HOME ----------------
  refreshHomeStats() {
    const reports = Storage.getReports();
    document.getElementById('statTotal').textContent = reports.length;
    document.getElementById('statConfirmed').textContent = reports.filter(r => r.ai.leakProbability >= 50).length;
    document.getElementById('statDone').textContent = reports.filter(r => r.status === 'done').length;
  },

  // ---------------- REPORT FORM ----------------
  wireReportForm() {
    const form = document.getElementById('reportForm');
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');

    description.addEventListener('input', () => {
      charCount.textContent = description.value.length;
      clearTimeout(this._descDebounce);
      this._descDebounce = setTimeout(() => {
        if (Camera.photoDataUrl) this.runAI();
      }, 600);
    });

    document.addEventListener('photo-changed', () => this.runAI());
    document.getElementById('btnRunAI').addEventListener('click', () => this.runAI(true));

    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async runAI(manual) {
    const photo = Camera.photoDataUrl;
    const description = document.getElementById('description').value;

    if (!photo && !manual) return;
    if (!photo && manual) {
      Toast.show('Сначала добавьте фото утечки.', 'error');
      return;
    }

    const btn = document.getElementById('btnRunAI');
    const original = btn.textContent;
    btn.textContent = '⏳ Анализирую...';
    btn.disabled = true;

    const assessment = await AI.assess(photo, description);
    this.lastAssessment = assessment;

    document.getElementById('aiResult').hidden = false;
    document.getElementById('aiProbFill').style.width = assessment.leakProbability + '%';
    document.getElementById('aiProbValue').textContent = assessment.leakProbability + '%';

    const badge = document.getElementById('aiSeverityBadge');
    badge.textContent = assessment.severity;
    badge.className = 'badge ' + severityBadgeClass(assessment.severityKey);

    document.getElementById('aiSummary').textContent = assessment.summary;

    btn.textContent = original;
    btn.disabled = false;
  },

  async handleSubmit(e) {
    e.preventDefault();

    const photo = Camera.photoDataUrl;
    const location = MapPicker.getSelected();
    const address = document.getElementById('addressText').value.trim();
    const description = document.getElementById('description').value.trim();
    const fio = document.getElementById('fio').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!photo) { Toast.show('Пожалуйста, добавьте фото утечки.', 'error'); return; }
    if (!location) { Toast.show('Отметьте место на карте.', 'error'); return; }
    if (!address) { Toast.show('Укажите адрес.', 'error'); return; }
    if (!description) { Toast.show('Опишите проблему.', 'error'); return; }
    if (!fio || !phone) { Toast.show('Укажите ФИО и номер телефона.', 'error'); return; }

    const submitBtn = e.target.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Отправляю...';

    // Always recompute at submit time so the saved assessment reflects the
    // final photo + description, even if the user edited the description
    // after the auto-run (which fires on photo upload, before typing).
    const assessment = await AI.assess(photo, description);

    const report = {
      id: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photo,
      lat: location.lat,
      lng: location.lng,
      address,
      description,
      fio,
      phone,
      status: 'new',
      ai: {
        leakProbability: assessment.leakProbability,
        severity: assessment.severity,
        severityKey: assessment.severityKey,
        summary: assessment.summary
      }
    };
    report.id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now();

    Storage.addReport(report);

    Toast.show('✅ Заявка отправлена ответственным службам!', 'success');
    this.resetForm();
    submitBtn.disabled = false;
    submitBtn.textContent = '📨 Отправить заявку';

    document.getElementById('trackerPhone').value = phone;
    this.showView('tracker');
    this.lookupTracker(phone);
  },

  resetForm() {
    document.getElementById('reportForm').reset();
    document.getElementById('charCount').textContent = '0';
    Camera.reset();
    MapPicker.reset();
    document.getElementById('aiResult').hidden = true;
    this.lastAssessment = null;
  },

  // ---------------- TRACKER ----------------
  wireTracker() {
    document.getElementById('btnLookup').addEventListener('click', () => {
      this.lookupTracker(document.getElementById('trackerPhone').value);
    });
    document.getElementById('trackerPhone').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.lookupTracker(document.getElementById('trackerPhone').value);
    });
  },

  lookupTracker(phone) {
    const list = document.getElementById('trackerList');
    const bonusBox = document.getElementById('bonusBox');

    if (!phone || !phone.trim()) {
      list.innerHTML = '<div class="empty-state">Введите номер телефона, чтобы увидеть заявки.</div>';
      bonusBox.hidden = true;
      return;
    }

    const reports = Storage.getReportsByPhone(phone);
    const { percent } = Storage.getMonthlyDiscount(phone);

    bonusBox.hidden = false;
    document.getElementById('bonusFill').style.width = (percent / 5 * 100) + '%';
    document.getElementById('bonusValue').textContent = percent;

    if (reports.length === 0) {
      list.innerHTML = '<div class="empty-state">Заявок с этим номером пока не найдено.</div>';
      return;
    }

    list.innerHTML = reports.map(r => reportCardHtml(r)).join('');
  },

  // ---------------- ADMIN ----------------
  wireAdmin() {
    document.getElementById('filterStatus').addEventListener('change', () => this.renderAdmin());
    document.getElementById('filterSort').addEventListener('change', () => this.renderAdmin());
  },

  renderAdmin() {
    const reports = Storage.getReports();

    document.getElementById('adminTotal').textContent = reports.length;
    document.getElementById('adminHard').textContent = reports.filter(r => r.ai.severityKey === 'hard' || r.ai.severity === 'сложная').length;
    document.getElementById('adminMedium').textContent = reports.filter(r => r.ai.severityKey === 'medium' || r.ai.severity === 'средняя').length;
    document.getElementById('adminLight').textContent = reports.filter(r => r.ai.severityKey === 'light' || r.ai.severity === 'лёгкая').length;

    const statusFilter = document.getElementById('filterStatus').value;
    const sortMode = document.getElementById('filterSort').value;

    let filtered = statusFilter === 'all' ? reports : reports.filter(r => r.status === statusFilter);

    const severityRank = { hard: 3, medium: 2, light: 1 };
    if (sortMode === 'severity') {
      filtered = filtered.slice().sort((a, b) => {
        const rb = severityRank[b.ai.severityKey] || 0;
        const ra = severityRank[a.ai.severityKey] || 0;
        if (rb !== ra) return rb - ra;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const list = document.getElementById('adminList');
    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state">Заявок по выбранным фильтрам нет.</div>';
      return;
    }

    list.innerHTML = filtered.map(r => adminRowHtml(r)).join('');

    list.querySelectorAll('select[data-report-id]').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.dataset.reportId;
        Storage.updateReportStatus(id, sel.value);
        Toast.show('Статус заявки обновлён. Уведомление отправлено жителю.', 'success');
        this.renderAdmin();
      });
    });
  }
};

// ---------------- RENDER HELPERS ----------------

function severityBadgeClass(key) {
  if (key === 'hard') return 'badge-hard';
  if (key === 'medium') return 'badge-medium';
  return 'badge-light';
}

function statusLabel(status) {
  return { new: 'На рассмотрении', in_progress: 'В процессе', done: 'Завершено' }[status] || status;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function reportCardHtml(r) {
  const photo = r.photo || placeholderImg();
  const sevClass = severityBadgeClass(r.ai.severityKey || 'light');
  return `
  <div class="report-card">
    <img src="${photo}" alt="Фото утечки" />
    <div class="rc-body">
      <div class="rc-top">
        <span class="rc-address">${escapeHtml(r.address)}</span>
        <span class="badge badge-status-${r.status}">${statusLabel(r.status)}</span>
      </div>
      <p class="rc-desc">${escapeHtml(r.description)}</p>
      <div class="rc-meta">
        <span>🕒 ${formatDate(r.createdAt)}</span>
        <span class="badge ${sevClass}">${r.ai.severity}</span>
        <span>ИИ уверен на ${r.ai.leakProbability}%</span>
      </div>
    </div>
  </div>`;
}

function adminRowHtml(r) {
  const photo = r.photo || placeholderImg();
  const sevClass = severityBadgeClass(r.ai.severityKey || 'light');
  const mapUrl = `https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=18/${r.lat}/${r.lng}`;
  return `
  <div class="admin-row">
    <img src="${photo}" alt="Фото утечки" />
    <div>
      <div class="ar-top">
        <span class="ar-address">${escapeHtml(r.address)}</span>
        <span class="badge ${sevClass}">${r.ai.severity}</span>
        <span class="badge badge-status-${r.status}">${statusLabel(r.status)}</span>
      </div>
      <p class="ar-desc">${escapeHtml(r.description)}</p>
      <p class="ar-desc" style="font-style:italic;">🤖 ${escapeHtml(r.ai.summary || '')}</p>
      <div class="ar-contact">👤 ${escapeHtml(r.fio)} · 📞 ${escapeHtml(r.phone)}</div>
      <div class="ar-meta">
        <span>🕒 ${formatDate(r.createdAt)}</span>
        <span>Вероятность утечки: ${r.ai.leakProbability}%</span>
        <a class="ar-map-link" href="${mapUrl}" target="_blank" rel="noopener">📍 Открыть на карте</a>
      </div>
    </div>
    <div class="ar-actions">
      <select data-report-id="${r.id}">
        <option value="new" ${r.status === 'new' ? 'selected' : ''}>На рассмотрении</option>
        <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>В процессе</option>
        <option value="done" ${r.status === 'done' ? 'selected' : ''}>Завершено</option>
      </select>
    </div>
  </div>`;
}

function placeholderImg() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"><rect width="100%" height="100%" fill="%23d9dee8"/><text x="50%" y="50%" font-size="30" text-anchor="middle" dominant-baseline="middle">💧</text></svg>`
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ---------------- TOASTS ----------------
const Toast = {
  show(message, type) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
