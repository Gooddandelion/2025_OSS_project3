// shared.js — 메일 모델 + localStorage 유틸 + 시드 데이터
const LS_KEY = 'nmail_emails';

// 메일 데이터 모델 예시
// {
//   id: 'm-xxxx',
//   from: '쿠팡 알림',
//   subject: '배송 출발 안내',
//   snippet: '자동 발송 메일입니다...',
//   date: ISOString,
//   unread: boolean,
//   starred: boolean,
//   hasAttachment: boolean,
//   folder: '받은편지함'|'중요'|'보낸편지함'|'임시보관'|'스팸메일함'|'휴지통',
//   labels: string[]
// }

function loadData() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; } }
function saveData(rows) { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }
function generateId() { return 'm-' + Math.random().toString(36).slice(2, 9); }
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[m])); }
function formatKST(iso) { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); }
function findById(id) { return loadData().find(x => x.id === id); }
function upsert(item) { const rows = loadData(); const i = rows.findIndex(r => r.id === item.id); if (i >= 0) rows[i] = item; else rows.unshift(item); saveData(rows); }
function removeById(id) { saveData(loadData().filter(x => x.id !== id)); }
function moveToFolder(id, folder) { const rows = loadData(); const i = rows.findIndex(r => r.id === id); if (i >= 0) { rows[i].folder = folder; saveData(rows); } }
function seedIfEmpty() {
  const rows = loadData(); if (rows.length) return;
  const froms = ['네이버', '쿠팡', 'Github', '인프런', '학교 공지', 'Toss', 'Slack', '배민'];
  const subs = ['[안내] 보안 알림', '배송 출발 안내', 'New sign‑in from Chrome', '강의 업데이트', '과제 공지', '결제 내역', '주간 요약', '쿠폰 도착'];
  const labels = ['업무', '프로모션', '개인'];
  const folders = ['받은편지함', '중요', '보낸편지함', '임시보관', '스팸메일함'];
  const base = Array.from({ length: 30 }).map((_, i) => ({
    id: `m-${i + 1}`,
    from: froms[i % froms.length],
    subject: subs[i % subs.length] + ' #' + (i + 1),
    snippet: '이것은 데모용 본문 미리보기입니다. 실제 내용은 view 페이지에서 확인하세요.',
    date: new Date(Date.now() - i * 3.6e6).toISOString(),
    unread: i % 4 === 0,
    starred: i % 5 === 0,
    hasAttachment: i % 6 === 0,
    folder: i % 11 === 0 ? '스팸메일함' : folders[i % folders.length],
    labels: (i % 3 === 0 ? [labels[i % labels.length]] : [])
  }));
  saveData(base);
}
function getParam(name) {
  try { const qs = typeof window !== 'undefined' ? (window.location.search || '') : ''; const usp = new URLSearchParams(qs.startsWith('?') ? qs : `?${qs}`); return usp.get(name); } catch (e) { return null; }
}
function isValidId(id) { return typeof id === 'string' && /^m-[a-z0-9_-]{3,}$/i.test(id); }
function countUnreadByFolder() { const rows = loadData(); const map = {}; rows.forEach(m => { if (m.unread) { map[m.folder] = (map[m.folder] || 0) + 1; } }); return map; }
function markActiveByPageOrFolder() {
  const file = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.sidebar a[data-page]').forEach(a => { a.classList.toggle('active', a.getAttribute('data-page') === file); });
  const folder = getParam('folder') || '받은편지함';
  document.querySelectorAll('.sidebar a[data-folder]').forEach(a => { a.classList.toggle('active', a.getAttribute('data-folder') === folder); });
}