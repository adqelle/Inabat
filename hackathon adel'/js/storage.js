/**
 * storage.js
 * Localstorage-backed "database" for the AquaDozor prototype.
 * In a real product this would be replaced by API calls to a backend.
 */

const STORAGE_KEY = 'aquadozor_reports_v1';
const CONFIRM_THRESHOLD = 50; // leakProbability >= this counts as "confirmed" for bonuses
const MAX_DISCOUNT_PERCENT = 5;
const POINTS_PER_CONFIRMED_REPORT = 1; // 1 confirmed report = 1% discount, capped at MAX_DISCOUNT_PERCENT

const Storage = {
  getReports() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to read reports from storage', e);
      return [];
    }
  },

  saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  },

  addReport(report) {
    const reports = this.getReports();
    reports.unshift(report);
    this.saveReports(reports);
    return report;
  },

  updateReportStatus(id, status) {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reports[idx].status = status;
    reports[idx].updatedAt = new Date().toISOString();
    this.saveReports(reports);
    return reports[idx];
  },

  getReportsByPhone(phone) {
    const normalized = normalizePhone(phone);
    return this.getReports().filter(r => normalizePhone(r.phone) === normalized);
  },

  /**
   * Discount resets every calendar month and only counts confirmed
   * reports submitted in the current month for this phone number.
   * It cannot be accumulated across months.
   */
  getMonthlyDiscount(phone) {
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const reports = this.getReportsByPhone(phone).filter(r =>
      r.createdAt.slice(0, 7) === monthKey && r.ai.leakProbability >= CONFIRM_THRESHOLD
    );
    const percent = Math.min(reports.length * POINTS_PER_CONFIRMED_REPORT, MAX_DISCOUNT_PERCENT);
    return { percent, confirmedThisMonth: reports.length };
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  },

  seedDemoDataIfEmpty() {
    if (this.getReports().length > 0) return;

    const demo = [
      {
        id: cryptoId(),
        createdAt: daysAgoIso(2),
        updatedAt: daysAgoIso(2),
        photo: null,
        lat: 43.6540, lng: 51.1990,
        address: 'мкр 5, между домами 12 и 14',
        description: 'Из-под асфальта уже неделю бьёт вода, образовалась большая лужа, дорогу размывает.',
        fio: 'Айгерим Сатпаева',
        phone: '+7 701 123 45 67',
        status: 'in_progress',
        ai: { leakProbability: 82, severity: 'сложная', summary: 'Демо-заявка: высокая вероятность утечки, признаки длительного повреждения.' }
      },
      {
        id: cryptoId(),
        createdAt: daysAgoIso(1),
        updatedAt: daysAgoIso(1),
        photo: null,
        lat: 43.6460, lng: 51.1720,
        address: 'мкр 3, во дворе дома 27',
        description: 'Небольшая лужа у подъезда, капает из трубы в подвале, запах сырости.',
        fio: 'Нурлан Кенжебаев',
        phone: '+7 702 555 11 22',
        status: 'new',
        ai: { leakProbability: 61, severity: 'средняя', summary: 'Демо-заявка: умеренные признаки утечки, требуется проверка.' }
      },
      {
        id: cryptoId(),
        createdAt: daysAgoIso(5),
        updatedAt: daysAgoIso(0),
        photo: null,
        lat: 43.6600, lng: 51.1850,
        address: 'мкр 1, тротуар у поликлиники',
        description: 'Чуть влажный асфальт, возможно уже высохло.',
        fio: 'Динара Ахметова',
        phone: '+7 705 999 88 77',
        status: 'done',
        ai: { leakProbability: 28, severity: 'лёгкая', summary: 'Демо-заявка: низкая вероятность активной утечки на момент осмотра.' }
      }
    ];
    this.saveReports(demo);
  }
};

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '');
}

function cryptoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
