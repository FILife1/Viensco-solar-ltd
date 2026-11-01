'use strict';
/* Viensco Synergy Ltd – Solar Design & Quote (offline PWA) */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const num = v => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '₦' + Math.round(n).toLocaleString('en-NG');
const f1 = (n, d = 2) => (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString('en-NG', { maximumFractionDigits: d });
const LS = 'viensco.v1.';
const load = (k, d) => { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { } };
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
const fmtDate = iso => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };

/* ---------- state ---------- */
const DEFAULT_SETTINGS = {
  company: 'Viensco Synergy Ltd', address: '', email: 'vienscosynergyltd@gmail.com', phone: '+2349153591818', whatsapp: '09153591818',
  bank: '',
  payment: '70% mobilisation before procurement of equipment; 30% balance on completion and commissioning.',
  terms: 'Prices are in Nigerian Naira and are valid for the period stated above; equipment prices may change after that.\nEquipment carries the manufacturer\'s warranty. Workmanship warranty as agreed in writing.\nSite conditions that differ from the survey (extra cable runs, roof or civil works) may attract additional charges.',
  invPayment: 'Payment is due by the date shown. Pay by bank transfer and send proof of payment quoting the invoice number.',
  invTerms: 'Please quote the invoice number when making payment.\nEquipment carries the manufacturer\'s warranty. Workmanship warranty as agreed in writing.\nQueries on this invoice must be raised within 7 days of receipt.',
  labour: 10, vatPct: 7.5, valid: 14, sign: '1'
};
const DEFAULT_CALC = { type: 'hybrid', state: 'Lagos', psh: 4.3, derate: 0.75, invf: 1.25, days: 1, mode: 'direct', peak: 7, daily: 40, apps: [], simul: 100, inv: 'auto', bat: 'bat-li-48-314', pv: 'pv-500', run: 30, dod: '', brand: 'generic', kwhCost: 200, cover: 80, esc: 5, cost: '' };
const S = {
  settings: Object.assign({}, DEFAULT_SETTINGS, load('settings', {})),
  prices: load('prices', {}),
  custom: load('custom', []),
  calc: Object.assign({}, DEFAULT_CALC, load('calc', {})),
  saved: load('saved', []),
  quote: null
};
function items() { return CATALOG.concat(S.custom).map(i => Object.assign({}, i, { price: S.prices[i.id] != null ? S.prices[i.id] : i.price })); }
const getItem = id => items().find(i => i.id === id);
const catName = c => (CATS.find(x => x[0] === c) || [c, 'Other'])[1];
const catIdx = c => { const i = CATS.findIndex(x => x[0] === c); return i < 0 ? 99 : i; };

function newQuote() {
  return { ref: '', date: new Date().toISOString().slice(0, 10), client: { name: '', phone: '', email: '', state: S.calc.state || 'Lagos', addr: '' }, title: '', lines: [], labour: S.settings.labour, transport: 0, disc: 0, vat: 1, valid: S.settings.valid, notes: '', design: '',
    docType: 'quote', invRef: '', invDate: '', lpo: '', due: 14, paid: 0 };
}
S.quote = Object.assign(newQuote(), load('quote', {}));
S.quote.client = Object.assign(newQuote().client, S.quote.client || {});
const isoToday = () => new Date().toISOString().slice(0, 10);
const docNo = q => (q.docType === 'invoice' ? q.invRef : q.ref) || '';
function ensureRef() {
  const q = S.quote, inv = q.docType === 'invoice';
  if (docNo(q)) return;
  const key = inv ? 'invcounter' : 'counter', n = load(key, 0) + 1; save(key, n);
  const no = (inv ? 'INV/' : 'VSL/') + new Date().getFullYear() + '/' + String(n).padStart(4, '0');
  if (inv) { q.invRef = no; if (!q.invDate) q.invDate = isoToday(); } else q.ref = no;
  save('quote', q);
}
function fileBase() {
  const q = S.quote, c = q.client.name ? '-' + q.client.name.replace(/[^\w]+/g, '_') : '';
  return (q.docType === 'invoice' ? 'Invoice-' : 'Quotation-') + docNo(q).replace(/\//g, '-') + c;
}

/* ---------- tabs ---------- */
function showTab(t) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'v-' + t));
  $$('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  window.scrollTo(0, 0);
  if (t === 'quote') renderQuote();
  if (t === 'more') renderSaved();
  if (t === 'cat') renderCatalog();
  if (t === 'guide') renderGuide();
}
$$('nav.tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));

/* ======================================================================
   CALCULATOR
   Method (same as the Viensco field notes):
   1. Inverter  = peak load × 1.25
   2. Battery   = daily kWh ÷ DoD × days of autonomy, then ÷ battery kWh
   3. PV array  = daily kWh ÷ (peak sun hours × 0.75), then ÷ panel watts
   ====================================================================== */
const TYPE_HINT = {
  offgrid: 'Solar + battery only. No utility grid connection (generator can be added through a changeover).',
  hybrid: 'Solar + battery + utility grid / generator through an automatic transfer. Best for most homes and offices in Nigeria.',
  ongrid: 'Grid-tie only – no batteries. Cuts the electricity bill but shuts down when the grid is off.'
};
const pickMin = (list, attr, val) => { const s = list.slice().sort((a, b) => a[attr] - b[attr]); return s.find(x => x[attr] >= val) || s[s.length - 1]; };

const brandOf = i => i.brand || 'Generic';
const brandOk = (i, pref) => pref === 'any' || (pref === 'itel' ? brandOf(i) === 'Itel' : brandOf(i) === 'Generic');
function compute(c) {
  const R = { warn: [], bom: [] };
  let peakW, daily;
  if (c.mode === 'list') {
    let w = 0, e = 0; c.apps.forEach(a => { w += num(a.w) * num(a.q); e += num(a.w) * num(a.q) * num(a.h) / 1000; });
    R.listW = w; R.listE = e;
    peakW = w * (num(c.simul) || 100) / 100; daily = e;
  } else { peakW = num(c.peak) * 1000; daily = num(c.daily); }
  if (peakW <= 0 || daily <= 0 || num(c.psh) <= 0) { R.empty = true; return R; }
  const ongrid = c.type === 'ongrid';
  const der = num(c.derate) || 0.75, psh = num(c.psh);
  Object.assign(R, { peakW, daily, psh, der, ongrid });

  // PV (needed first for on-grid inverter size)
  R.effPsh = psh * der;
  R.pvKw = daily / R.effPsh;

  // Inverter
  const types = ongrid ? ['ongrid'] : c.type === 'hybrid' ? ['hybrid'] : ['offgrid', 'hybrid'];
  const invs = items().filter(i => i.cat === 'inverter' && types.includes(i.type)).sort((a, b) => a.kw - b.kw || a.price - b.price);
  R.invReq = ongrid ? R.pvKw / 1.2 : peakW / 1000 * (num(c.invf) || 1.25);
  let inv = invs.find(i => i.id === c.inv);
  if (!inv) {                                   // automatic pick: honours the brand preference, skips unclear/informal listings
    const pool = invs.filter(i => brandOk(i, c.brand) && i.auto !== false), list = pool.length ? pool : invs;
    inv = list.find(i => i.kw >= R.invReq) || list[list.length - 1];
  }
  R.inv = inv; R.invQty = Math.max(1, Math.ceil(R.invReq / inv.kw - 1e-9));
  R.invKw = inv.kw * R.invQty;
  if (R.invQty > 1) R.warn.push(`No single ${inv.kw}kW unit covers ${f1(R.invReq)}kW – ${R.invQty} units are paralleled. Check that the model supports parallel operation, or pick a bigger / 3-phase inverter.`);

  // Panels
  let pv = getItem(c.pv) || getItem('pv-500');
  if (c.brand === 'itel' && !brandOk(pv, 'itel')) { const pp = items().filter(i => i.cat === 'panel' && brandOk(i, 'itel')); if (pp.length) pv = pp.sort((a, b) => Math.abs(a.w - pv.w) - Math.abs(b.w - pv.w))[0]; }
  R.pv = pv; R.pvCount = Math.ceil(R.pvKw * 1000 / pv.w - 1e-9); R.pvKwp = R.pvCount * pv.w / 1000;
  R.strings = Math.max(1, Math.ceil(R.pvCount / 6));
  if (!ongrid && R.pvKwp > R.invKw * 1.5) R.warn.push(`Array (${f1(R.pvKwp)}kWp) is more than 1.5× the inverter rating (${f1(R.invKw)}kW). Most hybrid inverters limit PV input – use a bigger inverter or a second MPPT charger.`);
  if (ongrid && R.pvKwp > R.invKw * 1.35) R.warn.push('Array is well above the inverter rating – expect clipping. Choose a larger grid-tie inverter.');

  // Battery
  if (!ongrid) {
    const bats = items().filter(i => i.cat === 'battery');
    let bat = bats.find(b => b.id === c.bat);
    const brandMiss = bat && c.brand === 'itel' && !brandOk(bat, 'itel');
    if (!bat || inv.v % bat.v !== 0 || brandMiss) {
      const old = bat, li = bats.filter(b => b.v === inv.v && /Lithium/.test(b.chem));
      if (c.brand === 'generic') bat = li.filter(b => brandOk(b, 'generic')).sort((a, b) => b.kwh - a.kwh)[0] || li.sort((a, b) => b.kwh - a.kwh)[0] || bats.find(b => b.v === inv.v);
      else {                                    // Itel / best-price: cheapest ₦ per kWh among clear, compatible listings
        let pool = li.filter(b => brandOk(b, c.brand) && b.auto !== false); if (!pool.length) pool = li.filter(b => brandOk(b, c.brand)); if (!pool.length) pool = li;
        bat = pool.sort((a, b) => a.price / a.kwh - b.price / b.kwh)[0] || bats.find(b => b.v === inv.v);
      }
      R.batChanged = old ? (brandMiss && inv.v % old.v === 0 ? `Brand preference: using ${bat.name} (lowest ₦ per kWh).` : `${old.name} does not match the ${inv.v}V inverter – switched to ${bat.name}.`) : '';
    }
    R.bat = bat;
    R.dod = num(c.dod) > 0 ? num(c.dod) : bat.dod;
    R.days = num(c.days) || 1;
    R.battReq = daily / R.dod * R.days;
    R.perString = inv.v / bat.v;
    R.battStrings = Math.max(1, Math.ceil(R.battReq / (bat.kwh * R.perString) - 1e-9));
    R.battCount = R.perString * R.battStrings;
    R.battKwh = R.battCount * bat.kwh;
    R.battUsable = R.battKwh * R.dod;
    R.lead = !/Lithium/.test(bat.chem);
    if (R.battReq / R.days > 0 && R.battCount > 24) R.warn.push('Battery count is very high – consider higher-capacity lithium batteries or reducing the load / autonomy.');
    if (!inv.mppt) {
      R.ctrlAmps = R.pvKwp * 1000 / inv.v * 1.25;
      const ctrls = items().filter(i => i.cat === 'controller');
      R.ctrl = pickMin(ctrls, 'amps', R.ctrlAmps);
      R.ctrlQty = Math.max(1, Math.ceil(R.ctrlAmps / R.ctrl.amps - 1e-9));
    }
  }

  buildBOM(R, c);
  R.equipTotal = R.bom.reduce((s, l) => s + l.qty * l.price, 0);
  return R;
}

function buildBOM(R, c) {
  const L = [];
  const put = (id, qty, force) => { const it = getItem(id); if (it && qty > 0) L.push({ id: it.id, cat: it.cat, name: it.name, unit: it.unit, price: it.price, qty: Math.ceil(qty - 1e-9) }); };
  const putItem = (it, qty) => it && put(it.id, qty);
  const inv = R.inv, all = items();
  const run = num(c.run) || 30;

  putItem(R.pv, R.pvCount);
  putItem(inv, R.invQty);
  if (!R.ongrid) { putItem(R.bat, R.battCount); if (R.ctrl) putItem(R.ctrl, R.ctrlQty); }

  // PV side
  put('mnt-roof', R.pvCount);
  put('cab-pv6', 2 * run * Math.min(2, R.strings) + R.strings * 6);
  put('mc4', R.strings * 2 + 2);
  if (R.strings > 1) put(R.strings <= 2 ? 'pv-comb-2' : 'pv-comb-4', R.strings <= 4 ? 1 : Math.ceil(R.strings / 4));
  put('pv-iso-32', Math.ceil(R.strings / 2));
  put('spd-dc-1000', R.invQty);

  // AC side
  const poles = inv.ph === 1 ? 2 : 4;
  const acA = inv.kw * 1000 / (inv.ph === 1 ? 230 : 1.732 * 400);
  const acTotal = acA * R.invQty * 1.25;
  putItem(pickMin(all.filter(i => i.kind === 'acb' && i.poles === poles), 'amps', acA * 1.25), R.invQty);
  putItem(all.find(i => i.cat === 'surge' && i.ph === inv.ph), 1);
  const acCab = acA <= 40 ? 'cab-ac6' : acA <= 63 ? 'cab-ac10' : 'cab-ac16';
  put(acCab, 15 * (inv.ph === 1 ? 1 : 1.5));
  if (R.ongrid) {
    put('meter-bidir', 1); put('wifi-dongle', 1);
  } else {
    const kind = c.type === 'hybrid' ? 'ats' : 'co';
    putItem(pickMin(all.filter(i => i.kind === kind && i.poles === poles), 'amps', acTotal), 1);
    // DC side
    const dcA = inv.kw * 1000 / inv.v;
    putItem(pickMin(all.filter(i => i.kind === 'dcb'), 'amps', dcA * 1.25), R.invQty);
    put('bat-fuse', R.invQty);
    const mm = dcA <= 110 ? 35 : dcA <= 150 ? 50 : 70;
    put('cab-dc' + mm, 6 * R.invQty + (R.lead ? 0 : R.battCount * 3));
    const lug = 'lug-' + mm;
    put(lug, 4 * R.invQty + R.battCount * 2);
    if (R.lead) {
      put('trm-clamp', R.battCount);
      if (R.perString > 1) put('trm-link', (R.perString - 1) * R.battStrings);
      put('mnt-rack', Math.ceil(R.battCount / 6));
    }
    if (R.battStrings > 1 || (!R.lead && R.battCount > 1)) put('trm-bus', 2);
    // Battery-room fire safety
    if (R.battKwh > 10) { put('fire-co2', 1); put('fire-smoke', 1); }
  }

  // Earthing, fire, general
  put('ert-rod', 2); put('ert-kit', 1); put('ert-cab', 20);
  put('fire-dcp6', 1);
  put('fire-sign', 1);
  put('cab-conduit', Math.max(1, Math.ceil(R.pvKwp / 10)));
  put('trm-ferrule', 1);
  put('srv-survey', 1); put('srv-design', 1); put('srv-comm', 1); put('srv-train', 1);
  if (R.ongrid) put('srv-disco', 1);
  R.bom = L;
}

/* ---------- calculator UI ---------- */
function fillCalcSelects() {
  const st = $('#c-state'); st.innerHTML = Object.keys(STATES).map(s => `<option>${esc(s)}</option>`).join('');
  $('#c-preset').innerHTML = '<option value="">Add an appliance…</option>' + APPLIANCES.map((a, i) => `<option value="${i}">${esc(a[0])} – ${a[1]}W</option>`).join('');
  $('#n-cat').innerHTML = CATS.map(c => `<option value="${c[0]}">${esc(c[1])}</option>`).join('');
  $('#q-state').innerHTML = $('#c-state').innerHTML;
}
function fillEquipSelects() {
  const c = S.calc;
  const types = c.type === 'ongrid' ? ['ongrid'] : c.type === 'hybrid' ? ['hybrid'] : ['offgrid', 'hybrid'];
  const its = items();
  const invs = its.filter(i => i.cat === 'inverter' && types.includes(i.type)).sort((a, b) => a.kw - b.kw || a.price - b.price);
  $('#c-inv').innerHTML = '<option value="auto">Auto – best fit for the load</option>' + invs.map(i => `<option value="${i.id}">${esc(i.name)} – ${money(i.price)}</option>`).join('');
  $('#c-inv').value = invs.find(i => i.id === c.inv) ? c.inv : 'auto';
  $('#c-bat').innerHTML = its.filter(i => i.cat === 'battery').map(i => `<option value="${i.id}">${esc(i.name)} – ${money(i.price)}</option>`).join('');
  $('#c-bat').value = c.bat;
  $('#c-pv').innerHTML = its.filter(i => i.cat === 'panel').map(i => `<option value="${i.id}">${esc(i.name)} – ${money(i.price)}</option>`).join('');
  $('#c-pv').value = c.pv;
  $('#c-brand').value = c.brand || 'generic';
}
function syncCalcInputs() {
  const c = S.calc;
  $$('#c-type button').forEach(b => b.classList.toggle('on', b.dataset.v === c.type));
  $$('#c-mode button').forEach(b => b.classList.toggle('on', b.dataset.v === c.mode));
  $('#c-typehint').textContent = TYPE_HINT[c.type];
  $('#c-state').value = c.state; $('#c-psh').value = c.psh; $('#c-derate').value = c.derate; $('#c-invf').value = c.invf; $('#c-days').value = c.days;
  $('#c-peak').value = c.peak; $('#c-daily').value = c.daily; $('#c-simul').value = c.simul; $('#c-run').value = c.run; $('#c-dod').value = c.dod;
  $('#c-kwhcost').value = c.kwhCost; $('#c-cover').value = c.cover; $('#c-esc').value = c.esc; $('#c-cost').value = c.cost;
  $('#c-direct').hidden = c.mode !== 'direct'; $('#c-listbox').hidden = c.mode !== 'list';
  const og = c.type === 'ongrid';
  $('#c-daysW').hidden = og; $('#c-bat').closest('.f').hidden = og; $('#c-dod').closest('.f').hidden = og;
  fillEquipSelects();
  renderApps();
}
function renderApps() {
  const a = S.calc.apps;
  $('#c-apps').innerHTML = a.length
    ? '<tr><th>Appliance</th><th>Watts</th><th>Qty</th><th>Hrs/day</th><th></th></tr>' + a.map((x, i) => `<tr>
      <td>${esc(x.n)}</td>
      <td style="width:78px"><input type="number" data-i="${i}" data-f="w" value="${esc(x.w)}" inputmode="numeric"></td>
      <td style="width:60px"><input type="number" data-i="${i}" data-f="q" value="${esc(x.q)}" inputmode="numeric"></td>
      <td style="width:68px"><input type="number" step="0.1" data-i="${i}" data-f="h" value="${esc(x.h)}" inputmode="decimal"></td>
      <td style="width:34px"><button class="btn sm ghost danger" data-del="${i}" aria-label="Remove">✕</button></td></tr>`).join('')
    : '<tr><td class="hint">No appliances yet – pick one above.</td></tr>';
}
function renderCalc() {
  const c = S.calc, R = compute(c), box = $('#c-result');
  save('calc', c);
  if (c.mode === 'list') $('#c-listsum').textContent = `${f1((R.listW || 0) / 1000)} kW · ${f1(R.listE || 0)} kWh/day`;
  $('#c-pbcard').hidden = !!R.empty;
  if (R.empty) { box.innerHTML = '<h2>Results</h2><p class="hint">Enter a peak load, daily energy and peak sun hours to see the sizing.</p>'; window._R = null; return; }
  window._R = R;
  renderPayback(R);
  const inv = R.inv;
  $('#c-bathint').textContent = R.batChanged || (R.bat ? `Bank voltage ${inv.v}V · ${R.bat.chem} · DoD ${Math.round(R.dod * 100)}%` : '');
  const steps = [];
  if (R.ongrid) {
    steps.push(`<li><div class="t">1. PV array</div><div class="fx">Daily ${f1(R.daily)} kWh ÷ (${f1(R.psh, 1)} PSH × ${f1(R.der)}) = ${f1(R.pvKw)} kW</div>
      <div class="big">${f1(R.pvKwp)} kWp · ${R.pvCount} × ${R.pv.w}W panels</div></li>`);
    steps.push(`<li><div class="t">2. Grid-tie inverter</div><div class="fx">${f1(R.pvKwp)} kWp ÷ 1.2 (DC/AC ratio) = ${f1(R.invReq)} kW</div>
      <div class="big">${R.invQty > 1 ? R.invQty + ' × ' : ''}${esc(inv.name)}</div></li>`);
  } else {
    steps.push(`<li><div class="t">1. Inverter</div><div class="fx">Peak load ${f1(R.peakW, 0)} W = ${f1(R.peakW / 1000)} kW × ${f1(num(c.invf) || 1.25)} = ${f1(R.invReq)} kW</div>
      <div class="big">${R.invQty > 1 ? R.invQty + ' × ' : ''}${esc(inv.name)}</div></li>`);
    steps.push(`<li><div class="t">2. Battery bank</div><div class="fx">Daily ${f1(R.daily)} kWh ÷ ${f1(R.dod)} DoD × ${f1(R.days, 1)} day(s) = ${f1(R.battReq)} kWh needed<br>
      ${f1(R.battReq)} ÷ ${f1(R.bat.kwh)} kWh per battery = ${f1(R.battReq / R.bat.kwh)} → ${R.battCount} batteries${R.perString > 1 ? ` (${R.battStrings} string(s) of ${R.perString} in series)` : ''}</div>
      <div class="big">${R.battCount} × ${esc(R.bat.name)}</div><div class="fx">Installed ${f1(R.battKwh)} kWh · usable ${f1(R.battUsable)} kWh</div></li>`);
    steps.push(`<li><div class="t">3. PV array</div><div class="fx">PSH ${f1(R.psh, 1)} × ${f1(R.der)} = ${f1(R.effPsh, 3)} → ${f1(R.daily)} kWh ÷ ${f1(R.effPsh, 3)} = ${f1(R.pvKw)} kW<br>
      ${f1(R.pvKw * 1000, 0)} W ÷ ${R.pv.w} W per panel = ${f1(R.pvKw * 1000 / R.pv.w)} → ${R.pvCount} panels</div>
      <div class="big">${f1(R.pvKwp)} kWp · ${R.pvCount} × ${R.pv.w}W</div></li>`);
    if (R.ctrl) steps.push(`<li><div class="t">4. Solar charge controller</div><div class="fx">${f1(R.pvKwp * 1000, 0)} W ÷ ${inv.v} V × 1.25 = ${f1(R.ctrlAmps, 0)} A (this inverter has no built-in MPPT)</div>
      <div class="big">${R.ctrlQty} × ${esc(R.ctrl.name)}</div></li>`);
  }
  const ex = R.bom.map(l => `<tr><td>${esc(l.name)}</td><td class="n">${l.qty}</td><td class="n">${money(l.qty * l.price)}</td></tr>`).join('');
  box.innerHTML = `<h2>Recommended system</h2>
    <div class="kpis">
      <div class="kpi"><small>Inverter</small><b>${f1(R.invKw)} kW</b></div>
      <div class="kpi"><small>Solar array</small><b>${f1(R.pvKwp)} kWp</b></div>
      <div class="kpi"><small>${R.ongrid ? 'Batteries' : 'Battery bank'}</small><b>${R.ongrid ? 'None' : f1(R.battKwh) + ' kWh'}</b></div>
      <div class="kpi"><small>Equipment estimate</small><b>${money(R.equipTotal)}</b></div>
    </div>
    <ul class="steps">${steps.join('')}</ul>
    ${R.warn.map(w => `<div class="warn">⚠ ${esc(w)}</div>`).join('')}
    <details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">Full component list (${R.bom.length} lines)</summary>
      <div style="overflow-x:auto"><table class="tbl" style="margin-top:6px"><tr><th>Item</th><th class="n">Qty</th><th class="n">Amount</th></tr>${ex}</table></div></details>
    <div class="btns"><button class="btn pri" id="c-mkquote">Create quote from this design</button></div>
    <div class="hint">Labour, transport, VAT and discount are added on the quote. Contactors, timers, extra switching devices etc. can be added from the catalogue.</div>`;
}
function designSummary(R) {
  const p = [];
  p.push(`${f1(R.pvKwp)}kWp solar (${R.pvCount} × ${R.pv.w}W)`);
  p.push(`${f1(R.invKw)}kW ${R.ongrid ? 'grid-tie' : S.calc.type}  inverter`.replace('  ', ' '));
  if (!R.ongrid) p.push(`${f1(R.battKwh)}kWh ${R.bat.chem.toLowerCase()} battery bank`);
  return p.join(' · ');
}
function quoteFromCalc() {
  const R = window._R; if (!R) return;
  if (S.quote.lines.length && !confirm('Replace the items on the current quote with this design?')) return;
  const keep = S.quote.client;
  const q = newQuote(); q.client = Object.assign(q.client, keep, { state: S.calc.state });
  q.lines = R.bom.map(l => Object.assign({}, l));
  q.design = designSummary(R);
  q.title = q.title || `${f1(R.pvKwp)}kWp ${R.ongrid ? 'grid-tie' : S.calc.type} solar system`;
  q.transport = ZONE_TRANSPORT[STATES[S.calc.state][0]] || 0;
  S.quote = q; save('quote', q);
  showTab('quote'); toast('Quote created – review items and add client details');
}
function bindCalc() {
  const c = S.calc;
  const upd = () => { renderCalc(); };
  $$('#c-type button').forEach(b => b.onclick = () => { c.type = b.dataset.v; c.inv = 'auto'; syncCalcInputs(); upd(); });
  $$('#c-mode button').forEach(b => b.onclick = () => { c.mode = b.dataset.v; syncCalcInputs(); upd(); });
  $('#c-state').onchange = e => { c.state = e.target.value; c.psh = STATES[c.state][1]; $('#c-psh').value = c.psh; upd(); };
  [['c-psh', 'psh'], ['c-derate', 'derate'], ['c-invf', 'invf'], ['c-days', 'days'], ['c-peak', 'peak'], ['c-daily', 'daily'], ['c-simul', 'simul'], ['c-run', 'run'], ['c-dod', 'dod'], ['c-kwhcost', 'kwhCost'], ['c-cover', 'cover'], ['c-esc', 'esc'], ['c-cost', 'cost']]
    .forEach(([id, k]) => $('#' + id).oninput = e => { c[k] = e.target.value; upd(); });
  $('#c-brand').onchange = e => { c.brand = e.target.value; c.inv = 'auto'; syncCalcInputs(); upd(); };
  $('#c-inv').onchange = e => { c.inv = e.target.value; upd(); };
  $('#c-bat').onchange = e => { c.bat = e.target.value; upd(); };
  $('#c-pv').onchange = e => { c.pv = e.target.value; upd(); };
  $('#c-addapp').onclick = () => {
    const v = $('#c-preset').value; if (v === '') return;
    const a = APPLIANCES[+v]; const ex = c.apps.find(x => x.n === a[0]);
    if (ex) ex.q = num(ex.q) + 1; else c.apps.push({ n: a[0], w: a[1], q: 1, h: a[2] });
    renderApps(); upd();
  };
  $('#c-apps').oninput = e => { const i = e.target.dataset.i; if (i == null) return; c.apps[i][e.target.dataset.f] = e.target.value; upd(); };
  $('#c-apps').onclick = e => { const b = e.target.closest('[data-del]'); if (!b) return; c.apps.splice(+b.dataset.del, 1); renderApps(); upd(); };
  $('#c-result').onclick = e => { if (e.target.id === 'c-mkquote') quoteFromCalc(); };
  $('#c-pb').onclick = e => { if (e.target.id === 'c-pbnote') addPaybackNote(); };
}

/* ---------- payback estimate ---------- */
function paybackCalc(R, c) {
  let cost = num(c.cost);
  if (!(cost > 0)) cost = totals({ lines: R.bom, labour: S.settings.labour, transport: ZONE_TRANSPORT[STATES[c.state][0]] || 0, disc: 0, vat: 1 }).total;
  const s0 = R.daily * num(c.kwhCost) * 365 * (num(c.cover) / 100), g = num(c.esc) / 100;
  const pts = [-cost]; let cum = -cost, be = null;
  for (let y = 1; y <= 15; y++) {
    const s = s0 * Math.pow(1 + g, y - 1), prev = cum; cum += s; pts.push(cum);
    if (be === null && cum >= 0 && s > 0) be = y - 1 + (-prev / s);
  }
  return { cost, s0, pts, be };
}
function pbChart(pts) {
  const W = 320, H = 160, p = { l: 6, r: 6, t: 14, b: 22 };
  const lo = Math.min(0, ...pts), hi = Math.max(0, ...pts), span = (hi - lo) || 1;
  const x = i => p.l + i * (W - p.l - p.r) / (pts.length - 1), y = v => p.t + (hi - v) * (H - p.t - p.b) / span;
  const d = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');
  const m = v => (v < 0 ? '-' : '+') + '₦' + f1(Math.abs(v) / 1e6, 1) + 'm';
  const ticks = [0, 5, 10, 15].map(i => `<text x="${x(i).toFixed(1)}" y="${H - 6}" font-size="10" fill="#777" text-anchor="${i === 0 ? 'start' : i === 15 ? 'end' : 'middle'}">Yr ${i}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Cumulative cash position over 15 years">
    <line x1="${p.l}" x2="${W - p.r}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="#999" stroke-dasharray="4 3"/>
    <path d="${d}" fill="none" stroke="#C98200" stroke-width="2.5"/>
    <text x="${p.l}" y="${p.t - 3}" font-size="10" fill="#777">${m(pts[0])} at start</text>
    <text x="${W - p.r}" y="${p.t - 3}" font-size="10" fill="#777" text-anchor="end">${m(pts[15])} at year 15</text>${ticks}</svg>`;
}
function renderPayback(R) {
  const c = S.calc, P = paybackCalc(R, c); R.pb = P;
  const be = P.be == null ? 'Not within 15 years' : '~' + f1(P.be, 1) + ' years';
  $('#c-pb').innerHTML = `<div class="kpis">
      <div class="kpi"><small>System cost${num(c.cost) > 0 ? '' : ' (auto)'}</small><b>${money(P.cost)}</b></div>
      <div class="kpi"><small>Year-1 saving</small><b>${money(P.s0)}</b></div>
      <div class="kpi" style="grid-column:1/-1"><small>Break-even</small><b>${be}</b></div></div>
    ${pbChart(P.pts)}
    <div class="hint">Illustrative only: assumes savings = daily kWh × cost per kWh × share covered, growing each year with tariffs. Excludes battery replacement and maintenance. Give clients a range, not a promise.</div>
    <div class="btns"><button class="btn sm dark" id="c-pbnote">Add payback to quote notes</button></div>`;
}
function addPaybackNote() {
  const R = window._R; if (!R || !R.pb) return;
  const P = R.pb, c = S.calc;
  const line = `Estimated payback: ${P.be == null ? 'longer than 15 years' : 'about ' + f1(P.be, 1) + ' years'} (illustrative – assumes ${money(num(c.kwhCost))}/kWh, ${num(c.cover)}% of load covered, tariffs rising ${num(c.esc)}% a year). Actual savings depend on tariff, usage and incentives.`;
  S.quote.notes = (S.quote.notes ? S.quote.notes + '\n' : '') + line; save('quote', S.quote); toast('Added to quote notes');
}

/* ---------- field guide ---------- */
function renderGuide() {
  const ck = load('checks', {});
  const list = (items, key) => items.map((t, i) => `<label class="chk"><input type="checkbox" data-k="${key}-${i}" ${ck[key + '-' + i] ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('');
  const bul = a => '<ul class="bl">' + a.map(t => `<li>${esc(t)}</li>`).join('') + '</ul>';
  let h = '<div class="card"><h2>Installation checklist</h2><div class="hint" style="margin-bottom:6px">Tick items as you complete them on site. Ticks are saved on this phone.</div>';
  GUIDE.stages.forEach(s => { h += `<h3>${esc(s.t)}</h3>${list(s.items, s.id)}<div class="hint">${esc(s.note)}</div>`; });
  h += '<h3>Grid connection &amp; metering (DisCo)</h3>' + list(GUIDE.grid, 'grid') + `<div class="hint">${esc(GUIDE.gridNote)}</div>`;
  h += '<div class="btns"><button class="btn sm ghost danger" id="g-reset">Clear all ticks</button></div></div>';
  h += `<div class="card" style="border-left:5px solid #c0392b"><h2>${esc(GUIDE.safety.t)}</h2>${list(GUIDE.safety.items, 'safe')}</div>`;
  h += '<div class="card"><h2>Choose the system type</h2>' + GUIDE.types.map(t => `<p style="margin:0 0 8px"><b>${esc(t[0])}:</b> ${esc(t[1])}</p>`).join('') + `<div class="hint">${esc(GUIDE.typeTip)}</div></div>`;
  h += `<div class="card"><h2>Sizing quick reference</h2>${bul(GUIDE.sizing)}<div class="btns"><button class="btn sm dark" data-go="calc">Open calculator</button></div></div>`;
  h += `<div class="card"><h2>Core components</h2>${bul(GUIDE.parts)}</div>`;
  h += `<div class="card"><h2>Monitoring &amp; maintenance</h2>${bul(GUIDE.maint)}</div>`;
  h += `<div class="card"><h2>Common pitfalls</h2>${bul(GUIDE.pitfalls)}</div>`;
  $('#g-body').innerHTML = h;
}
function bindGuide() {
  $('#g-body').onchange = e => { const k = e.target.dataset.k; if (!k) return; const ck = load('checks', {}); if (e.target.checked) ck[k] = 1; else delete ck[k]; save('checks', ck); };
  $('#g-body').onclick = e => {
    if (e.target.id === 'g-reset' && confirm('Clear all checklist ticks?')) { save('checks', {}); renderGuide(); }
    const g = e.target.closest('[data-go]'); if (g) showTab(g.dataset.go);
  };
}

/* ======================================================================
   CATALOGUE
   ====================================================================== */
const K = { cat: 'all', q: '' };
function renderCatalog() {
  $('#k-chips').innerHTML = [['all', 'All'], ['__itel', 'Itel & market list']].concat(CATS).map(c => `<button class="chip ${K.cat === c[0] ? 'on' : ''}" data-c="${c[0]}">${esc(c[1])}</button>`).join('');
  const q = K.q.toLowerCase();
  const list = items().filter(i => (K.cat === 'all' || (K.cat === '__itel' ? i.list === 'itel' : i.cat === K.cat)) && (!q || (i.name + ' ' + (i.brand || '')).toLowerCase().includes(q)));
  let html = K.cat === '__itel' ? '<div class="banner" style="margin-bottom:6px">Prices compiled 31 Oct 2026 from online listings and a Facebook video. They change often and may be negotiable – confirm with the seller before paying. Edit any price to your own.</div>' : '', last = '';
  list.sort((a, b) => catIdx(a.cat) - catIdx(b.cat));
  list.forEach(i => {
    if (i.cat !== last) { html += `<div class="cathead">${esc(catName(i.cat))}</div>`; last = i.cat; }
    const custom = S.custom.some(x => x.id === i.id);
    html += `<div class="item"><div class="nm">${esc(i.name)}<small>per ${esc(i.unit)}${S.prices[i.id] != null ? ' · edited' : ''}${custom ? ' · custom' : ''}</small>${i.list === 'itel' ? `<small>${esc([i.brand, i.seller, i.plat].filter(Boolean).join(' · '))}</small>${(i.where || i.note) ? `<small class="nt">${esc([i.where, i.note].filter(Boolean).join(' – '))}</small>` : ''}` : ''}</div>
      <input type="number" inputmode="numeric" data-p="${i.id}" value="${Math.round(i.price)}" aria-label="Price">
      <button class="btn sm dark" data-add="${i.id}" aria-label="Add to quote">+</button>
      ${custom ? `<button class="btn sm ghost danger" data-rm="${i.id}" aria-label="Delete">✕</button>` : ''}</div>`;
  });
  $('#k-list').innerHTML = html || '<p class="hint">Nothing matches your search.</p>';
}
function addLine(it) {
  const ex = S.quote.lines.find(l => l.id === it.id);
  if (ex) ex.qty = num(ex.qty) + 1; else S.quote.lines.push({ id: it.id, cat: it.cat, name: it.name, unit: it.unit, price: it.price, qty: 1 });
  save('quote', S.quote); toast('Added to quote');
}
function bindCatalog() {
  $('#k-search').oninput = e => { K.q = e.target.value; renderCatalog(); };
  $('#k-chips').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; K.cat = b.dataset.c; renderCatalog(); };
  $('#k-list').onchange = e => {
    const id = e.target.dataset.p; if (!id) return;
    const base = CATALOG.concat(S.custom).find(i => i.id === id);
    const v = num(e.target.value);
    if (S.custom.some(x => x.id === id)) { S.custom.find(x => x.id === id).price = v; save('custom', S.custom); }
    else { if (v === base.price) delete S.prices[id]; else S.prices[id] = v; save('prices', S.prices); }
    toast('Price saved');
  };
  $('#k-list').onclick = e => {
    const a = e.target.closest('[data-add]'); if (a) { addLine(getItem(a.dataset.add)); return; }
    const r = e.target.closest('[data-rm]'); if (r && confirm('Delete this custom item?')) { S.custom = S.custom.filter(x => x.id !== r.dataset.rm); save('custom', S.custom); renderCatalog(); }
  };
  $('#n-add').onclick = () => {
    const name = $('#n-name').value.trim(), price = num($('#n-price').value);
    if (!name) { toast('Enter a description'); return; }
    S.custom.push({ id: 'x' + Date.now(), cat: $('#n-cat').value, name, price, unit: $('#n-unit').value.trim() || 'pc' });
    save('custom', S.custom); $('#n-name').value = ''; $('#n-price').value = '';
    fillEquipSelects(); renderCatalog(); toast('Item saved');
  };
}

/* ======================================================================
   QUOTE
   ====================================================================== */
const QF = [['q-name', 'client.name'], ['q-phone', 'client.phone'], ['q-email', 'client.email'], ['q-state', 'client.state'], ['q-addr', 'client.addr'], ['q-title', 'title'],
['q-lpo', 'lpo'], ['q-idate', 'invDate'], ['q-due', 'due'], ['q-paid', 'paid'], ['q-lab', 'labour'], ['q-trans', 'transport'], ['q-disc', 'disc'], ['q-vat', 'vat'], ['q-valid', 'valid'], ['q-notes', 'notes']];
function totals(q) {
  let equip = 0, serv = 0;
  q.lines.forEach(l => { const a = num(l.qty) * num(l.price); if (l.cat === 'service') serv += a; else equip += a; });
  const lab = equip * num(q.labour) / 100, trans = num(q.transport);
  const sub = equip + serv + lab + trans, disc = sub * num(q.disc) / 100, net = sub - disc;
  const vat = num(q.vat) ? net * num(S.settings.vatPct) / 100 : 0;
  return { equip, serv, lab, trans, sub, disc, net, vat, total: net + vat };
}
function renderLines() {
  const q = S.quote;
  $('#q-design').textContent = q.design ? 'Design: ' + q.design : '';
  $('#q-lines').innerHTML = q.lines.length ? q.lines.map((l, i) => `<div class="ln">
      <input class="nm" data-i="${i}" data-f="name" value="${esc(l.name)}" aria-label="Item">
      <div class="r2">
        <div><label>Qty</label><input type="number" step="any" data-i="${i}" data-f="qty" value="${esc(l.qty)}" inputmode="decimal"></div>
        <div><label>Unit price ₦</label><input type="number" data-i="${i}" data-f="price" value="${esc(l.price)}" inputmode="numeric"></div>
        <div class="am"><label>Amount</label><b id="q-amt-${i}">${money(num(l.qty) * num(l.price))}</b></div>
        <button class="btn sm ghost danger" data-del="${i}" aria-label="Remove">✕</button>
      </div></div>`).join('')
    : '<p class="hint">No items yet. Build one in the Calculator tab or add from the catalogue.</p>';
}
function syncQuoteForm() {
  QF.forEach(([id, p]) => { $('#' + id).value = getPath(S.quote, p); });
}
function renderPickerResults() {
  const q = $('#q-psearch').value.toLowerCase();
  const list = items().filter(i => !q || i.name.toLowerCase().includes(q) || catName(i.cat).toLowerCase().includes(q)).slice(0, 40);
  $('#q-presults').innerHTML = list.map(i => `<div class="item" style="cursor:pointer" data-padd="${i.id}"><div class="nm">${esc(i.name)}<small>${esc(catName(i.cat))}</small></div><b style="font-size:13px">${money(i.price)}</b><button class="btn sm dark">+</button></div>`).join('') || '<p class="hint">No match.</p>';
}
const W1 = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const W2 = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function words(n) {
  const h = x => { let s = ''; if (x >= 100) { s += W1[Math.floor(x / 100)] + ' Hundred'; x %= 100; if (x) s += ' and '; } if (x >= 20) s += W2[Math.floor(x / 10)] + (x % 10 ? '-' + W1[x % 10] : ''); else if (x > 0) s += W1[x]; return s; };
  if (n === 0) return 'Zero'; const u = ['', ' Thousand', ' Million', ' Billion'], out = []; let i = 0;
  while (n > 0) { const c = n % 1000; if (c) out.unshift(h(c) + u[i]); n = Math.floor(n / 1000); i++; } return out.join(', ');
}
function amountWords(v) { v = Math.round(v * 100) / 100; const i = Math.floor(v), k = Math.round((v - i) * 100); return words(i) + ' Naira' + (k ? ' and ' + words(k) + ' Kobo' : '') + ' Only'; }
function sheetHTML() {
  const q = S.quote, s = S.settings, t = totals(q), c = q.client, inv = q.docType === 'invoice';
  const base = inv ? (q.invDate || isoToday()) : q.date;
  const until = new Date(base); until.setDate(until.getDate() + (inv ? num(q.due) : (num(q.valid) || 14)));
  const sorted = q.lines.map((l, i) => Object.assign({ i }, l)).sort((a, b) => catIdx(a.cat) - catIdx(b.cat) || a.i - b.i);
  let rows = '', last = null, n = 0;
  sorted.forEach(l => {
    if (l.cat !== last) { rows += `<tr class="grp"><td colspan="5">${esc(catName(l.cat))}</td></tr>`; last = l.cat; }
    n++;
    rows += `<tr><td>${n}</td><td>${esc(l.name)}</td><td class="r">${esc(f1(num(l.qty), 2))} ${esc(l.unit || '')}</td><td class="r">${money(num(l.price))}</td><td class="r">${money(num(l.qty) * num(l.price))}</td></tr>`;
  });
  if (!rows) rows = '<tr><td colspan="5" style="text-align:center;color:#888;padding:16px">No items added yet</td></tr>';
  const nl = x => esc(x).replace(/\n/g, '<br>');
  const tl = (lab, v, cls) => v ? `<div class="${cls || ''}"><span>${lab}</span><span>${money(v)}</span></div>` : '';
  const paid = num(q.paid), bal = Math.max(0, t.total - paid);
  const status = !inv ? '' : (t.total > 0 && paid >= t.total - 0.005 ? 'PAID' : paid > 0 ? 'PART PAID' : 'UNPAID');
  const meta = inv
    ? `<b>Invoice No:</b> ${esc(q.invRef || 'Draft')}<br><b>Date:</b> ${fmtDate(base)}<br><b>Due date:</b> ${fmtDate(until.toISOString().slice(0, 10))}${q.ref ? '<br><b>Quotation ref:</b> ' + esc(q.ref) : ''}${q.lpo ? '<br><b>LPO / PO No:</b> ' + esc(q.lpo) : ''}<br><span class="stamp st-${status.replace(' ', '')}">${status}</span>`
    : `<b>Ref:</b> ${esc(q.ref || 'Draft')}<br><b>Date:</b> ${fmtDate(q.date)}<br><b>Valid until:</b> ${fmtDate(until.toISOString().slice(0, 10))}`;
  const payTxt = inv ? s.invPayment : s.payment, termTxt = inv ? s.invTerms : s.terms;
  return `
  <div class="lh"><img src="${IMG.logo}" alt="Viensco Synergy Ltd">
    <div class="co"><h1>${esc(s.company)}</h1><div class="tag">GREAT WITH QUALITY</div><div style="margin-top:4px;color:#555">Solar &amp; energy solutions</div>${s.address ? `<div style="color:#555">${esc(s.address)}</div>` : ''}</div>
    <div class="ct">✉ ${esc(s.email)}<br>☎ ${esc(s.phone)}<br>WhatsApp ${esc(s.whatsapp)}</div></div>
  <div class="ttl"><h2>${inv ? 'INVOICE' : 'QUOTATION'}</h2><div class="meta">${meta}</div></div>
  <div class="two">
    <div><b>${inv ? 'Bill to' : 'Prepared for'}</b>${esc(c.name || '—')}${c.phone ? '<br>' + esc(c.phone) : ''}${c.email ? '<br>' + esc(c.email) : ''}${c.addr ? '<br>' + esc(c.addr) : ''}${c.state ? '<br>' + esc(c.state) + ' State' : ''}</div>
    <div><b>Project</b>${esc(q.title || 'Solar power system')}${q.design ? '<br><span style="color:#555">' + esc(q.design) + '</span>' : ''}</div>
  </div>
  <table><tr><th style="width:26px">#</th><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr>${rows}</table>
  <div class="tot">
    ${tl('Equipment &amp; materials', t.equip)}${tl('Services (survey, design, training)', t.serv)}${tl('Installation labour (' + f1(num(q.labour), 1) + '%)', t.lab)}${tl('Transport &amp; logistics', t.trans)}
    ${tl('Sub-total', t.sub)}${t.disc ? tl('Discount (' + f1(num(q.disc), 1) + '%)', -t.disc).replace('₦-', '-₦') : ''}${num(q.vat) ? tl('VAT (' + f1(num(s.vatPct), 1) + '%)', t.vat) : ''}
    <div class="gt"><span>TOTAL</span><span>${money(t.total)}</span></div>
    ${inv && paid > 0 ? `<div><span>Amount paid</span><span>${money(paid)}</span></div><div class="gt bal"><span>BALANCE DUE</span><span>${money(bal)}</span></div>` : ''}
  </div>
  ${inv ? `<div class="words"><b>Amount in words:</b> ${esc(amountWords(paid > 0 ? bal : t.total))}</div>` : ''}
  <div class="terms">
    ${payTxt ? `<h4>Payment terms</h4>${nl(payTxt)}` : ''}
    ${s.bank ? `<h4>${inv ? 'Pay to (bank details)' : 'Bank details'}</h4>${nl(s.bank)}` : ''}
    ${termTxt ? `<h4>Terms &amp; conditions</h4>${nl(termTxt)}` : ''}
    ${q.notes ? `<h4>Notes</h4>${nl(q.notes)}` : ''}
  </div>
  <div class="sign">
    <div>${s.sign === '1' ? `<img src="${IMG.sign}" alt="">` : '<div style="height:52px"></div>'}<div class="ln">${inv ? 'Authorised signature – ' : 'For '}${esc(s.company)}</div></div>
    <div><div style="height:52px"></div><div class="ln">${inv ? 'Customer acknowledgement (sign &amp; date)' : 'Client acceptance (sign &amp; date)'}</div></div>
  </div>
  <div class="foot">${esc(s.company)} · ${esc(s.email)} · ${esc(s.phone)} · Great with Quality</div>`;
}
function renderSheet() { $('#sheet').innerHTML = sheetHTML(); }
function syncType() {
  const inv = S.quote.docType === 'invoice';
  $$('#q-type button').forEach(b => b.classList.toggle('on', b.dataset.v === S.quote.docType));
  $('#q-formtitle').textContent = inv ? 'Client & invoice' : 'Client & quotation';
  $('#q-inv').hidden = !inv; $('#q-valid').closest('.f').hidden = inv;
  $('#q-no').textContent = docNo(S.quote) ? (inv ? 'Invoice ' : 'Quotation ') + docNo(S.quote) : '';
}
function renderQuote() { syncType(); syncQuoteForm(); renderLines(); renderSheet(); }
function changed() { save('quote', S.quote); renderSheet(); }
function bindQuote() {
  QF.forEach(([id, p]) => {
    const el = $('#' + id);
    el.oninput = el.onchange = e => {
      let v = e.target.value; if (p === 'vat') v = +v;
      if (p === 'client.state') {
        const oldDef = ZONE_TRANSPORT[(STATES[S.quote.client.state] || [])[0]] || 0, nw = ZONE_TRANSPORT[(STATES[v] || [])[0]] || 0;
        if (!num(S.quote.transport) || num(S.quote.transport) === oldDef) { S.quote.transport = nw; $('#q-trans').value = nw; }
      }
      setPath(S.quote, p, v); changed();
    };
  });
  $('#q-lines').oninput = e => {
    const i = e.target.dataset.i; if (i == null) return;
    S.quote.lines[i][e.target.dataset.f] = e.target.dataset.f === 'name' ? e.target.value : e.target.value;
    const l = S.quote.lines[i]; const a = $('#q-amt-' + i); if (a) a.textContent = money(num(l.qty) * num(l.price));
    changed();
  };
  $('#q-lines').onclick = e => { const b = e.target.closest('[data-del]'); if (!b) return; S.quote.lines.splice(+b.dataset.del, 1); renderLines(); changed(); };
  $('#q-pick').onclick = () => { const p = $('#q-picker'); p.hidden = !p.hidden; if (!p.hidden) { renderPickerResults(); $('#q-psearch').focus(); } };
  $('#q-psearch').oninput = renderPickerResults;
  $('#q-presults').onclick = e => { const r = e.target.closest('[data-padd]'); if (!r) return; addLine(getItem(r.dataset.padd)); renderLines(); changed(); };
  $('#q-custom').onclick = () => { S.quote.lines.push({ id: 'c' + Date.now(), cat: 'other', name: 'Custom item', unit: 'pc', qty: 1, price: 0 }); renderLines(); changed(); };
  $$('#q-type button').forEach(b => b.onclick = () => {
    S.quote.docType = b.dataset.v; if (b.dataset.v === 'invoice' && !S.quote.invDate) S.quote.invDate = isoToday();
    save('quote', S.quote); renderQuote();
  });
  $('#q-print').onclick = () => {
    ensureRef(); renderQuote();
    const old = document.title; document.title = fileBase();
    window.onafterprint = () => { document.title = old; window.onafterprint = null; };
    setTimeout(() => window.print(), 150);
  };
  async function exportDoc(kind) {
    ensureRef(); renderQuote();
    const btns = $$('#q-pdf,#q-img,#q-share'); btns.forEach(b => b.disabled = true);
    toast('Preparing ' + (kind === 'png' ? 'image' : 'PDF') + '…');
    try {
      const el = $('#sheet'), name = fileBase() + (kind === 'png' ? '.png' : '.pdf');
      const blob = kind === 'png' ? await VExport.png(el) : await VExport.pdf(el);
      if (kind === 'share') return;
      VExport.save(blob, name); toast('Saved ' + name);
    } catch (e) { toast('Export is not supported here – use Print, then Save as PDF'); }
    finally { btns.forEach(b => b.disabled = false); }
  }
  $('#q-pdf').onclick = () => exportDoc('pdf');
  $('#q-img').onclick = () => exportDoc('png');
  $('#q-share').onclick = async () => {
    ensureRef(); renderQuote(); const btns = $$('#q-pdf,#q-img,#q-share'); btns.forEach(b => b.disabled = true); toast('Preparing PDF…');
    try { const name = fileBase() + '.pdf', blob = await VExport.pdf($('#sheet')); const shared = await VExport.share(blob, name, name); if (!shared) toast('Sharing not available – PDF downloaded instead'); }
    catch (e) { toast('Could not share – use Download PDF'); } finally { btns.forEach(b => b.disabled = false); }
  };
  $('#q-save').onclick = () => {
    ensureRef();
    const copy = JSON.parse(JSON.stringify(S.quote)); copy.saved = Date.now();
    const key = x => (x.docType || 'quote') + '|' + docNo(x);
    const i = S.saved.findIndex(x => key(x) === key(copy));
    if (i >= 0) S.saved[i] = copy; else S.saved.unshift(copy);
    save('saved', S.saved); renderQuote(); toast('Saved as ' + docNo(copy));
  };
  $('#q-wa').onclick = () => {
    ensureRef(); renderQuote();
    const t = totals(S.quote), c = S.quote.client, inv = S.quote.docType === 'invoice', bal = Math.max(0, t.total - num(S.quote.paid));
    let p = (c.phone || '').replace(/[^\d]/g, ''); if (p.startsWith('0')) p = '234' + p.slice(1);
    const msg = `Hello ${c.name || ''},\n\n${inv ? 'Invoice' : 'Quotation'} ${docNo(S.quote)} from ${S.settings.company}\n${S.quote.title || 'Solar power system'}${S.quote.design ? '\n' + S.quote.design : ''}\n${inv ? 'Amount due: ' + money(bal) : 'Total: ' + money(t.total) + (num(S.quote.vat) ? ' (VAT incl.)' : '')}\n\nGreat with Quality.`;
    window.open('https://wa.me/' + p + '?text=' + encodeURIComponent(msg), '_blank');
    toast('Tip: tap Share to send the PDF itself');
  };
  $('#q-new').onclick = () => { if (!confirm('Start a new blank document? Unsaved changes will be lost.')) return; S.quote = newQuote(); save('quote', S.quote); renderQuote(); window.scrollTo(0, 0); };
}

/* ======================================================================
   MORE: saved quotes, settings, price tools
   ====================================================================== */
function renderSaved() {
  $('#m-saved').innerHTML = S.saved.length ? S.saved.map((x, i) => `<div class="item"><div class="nm"><b>${esc(docNo(x))}</b> <span class="tag">${x.docType === 'invoice' ? 'Invoice' : 'Quote'}</span> – ${esc(x.client.name || 'No name')}<small>${fmtDate(x.date)} · ${money(totals(x).total)}</small></div>
    <button class="btn sm dark" data-open="${i}">Open</button><button class="btn sm ghost danger" data-rm="${i}" aria-label="Delete">✕</button></div>`).join('')
    : '<p class="hint">Nothing saved yet. Tap "Save" on the Quote tab.</p>';
}
function bindMore() {
  $$('[data-s]').forEach(el => {
    el.value = S.settings[el.dataset.s];
    el.oninput = el.onchange = () => { S.settings[el.dataset.s] = el.type === 'number' ? num(el.value) : el.value; save('settings', S.settings); };
  });
  $('#m-saved').onclick = e => {
    const o = e.target.closest('[data-open]'), r = e.target.closest('[data-rm]');
    if (o) { S.quote = Object.assign(newQuote(), JSON.parse(JSON.stringify(S.saved[+o.dataset.open]))); save('quote', S.quote); showTab('quote'); toast((S.quote.docType === 'invoice' ? 'Invoice' : 'Quote') + ' opened'); }
    if (r && confirm('Delete this saved quote?')) { S.saved.splice(+r.dataset.rm, 1); save('saved', S.saved); renderSaved(); }
  };
  $('#m-apply').onclick = () => {
    const p = num($('#m-pct').value); if (!p) { toast('Enter a percentage'); return; }
    if (!confirm(`Change every price by ${p}%?`)) return;
    items().forEach(i => { const v = Math.round(i.price * (1 + p / 100) / 50) * 50; if (S.custom.some(x => x.id === i.id)) S.custom.find(x => x.id === i.id).price = v; else S.prices[i.id] = v; });
    save('prices', S.prices); save('custom', S.custom); fillEquipSelects(); renderCalc(); $('#m-pct').value = ''; toast('All prices updated');
  };
  $('#m-reset').onclick = () => { if (!confirm('Reset all catalogue prices to the built-in defaults?')) return; S.prices = {}; save('prices', S.prices); fillEquipSelects(); renderCalc(); toast('Prices reset'); };
}

/* ======================================================================
   OFFLINE + INSTALL
   ====================================================================== */
let deferred = null;
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);
function installHelp() {
  const m = $('#m-install'), b = $('#m-installBtn');
  if (standalone()) { m.textContent = 'Viensco Solar is installed on this device and works offline.'; b.hidden = true; }
  else if (location.protocol === 'file:') { m.textContent = 'This copy was opened from a file, so it cannot be installed. Open the app from its https:// web link (for example your GitHub Pages address), then install it.'; b.hidden = true; }
  else if (isIOS) { m.textContent = 'On iPhone/iPad: open this page in Safari, tap the Share icon, then "Add to Home Screen".'; b.hidden = true; }
  else if (deferred) { m.textContent = 'Install the app for one-tap access, its own window and full offline use.'; b.hidden = false; }
  else { b.hidden = true; m.textContent = isAndroid ? 'Open the browser menu (⋮) and choose "Install app" or "Add to Home screen".' : 'On a PC: in Chrome or Edge click the install icon (⊕) at the right end of the address bar, or open the menu and choose "Install Viensco Solar". On a Mac with Safari: File → Add to Dock.'; }
  diag();
}
async function diag() {
  const box = $('#m-diag'); if (!box) return;
  const ok = (v, t, tip) => `<div>${v ? '✔' : '✘'} ${t}${!v && tip ? ` <span style="color:#c0392b">– ${tip}</span>` : ''}</div>`;
  const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  let man = false, sw = false, cached = false;
  try { const l = document.querySelector('link[rel=manifest]'); man = !!l && (await fetch(l.href)).ok; } catch (e) { }
  try { const r = await navigator.serviceWorker.getRegistration(); sw = !!(r && (r.active || r.waiting || r.installing)); } catch (e) { }
  try { cached = (await caches.keys()).length > 0; } catch (e) { }
  box.innerHTML = '<b>Install check</b>' + ok(secure, 'Opened from a secure (https) link', 'use your https:// GitHub Pages link') + ok(man, 'App manifest found', 'upload manifest.webmanifest') +
    ok(sw, 'Offline service worker running', 'upload sw.js, then reload the page') + ok(cached, 'Files saved for offline use', 'open once while online and wait a few seconds') + ok(standalone(), 'Running as an installed app', '');
}
function showInstallBar() {
  if (standalone()) return;
  const dismissed = load('installDismissed', 0);
  if (Date.now() - dismissed < 3 * 864e5) return;
  if (location.protocol === 'file:') return;
  if (isIOS) { $('#installMsg').textContent = 'Install on iPhone: tap Share, then "Add to Home Screen".'; $('#installBtn').hidden = true; }
  else if (!deferred) return;
  $('#installBar').hidden = false;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; showInstallBar(); installHelp(); });
window.addEventListener('appinstalled', () => { $('#installBar').hidden = true; deferred = null; toast('Viensco Solar installed ✔'); installHelp(); });
async function doInstall() { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; $('#installBar').hidden = true; installHelp(); }
$('#installBtn').onclick = doInstall; $('#m-installBtn').onclick = doInstall;
$('#installX').onclick = () => { $('#installBar').hidden = true; save('installDismissed', Date.now()); };

function netState() { const d = $('#netdot'); const on = navigator.onLine; d.textContent = on ? 'Online' : 'Offline'; d.classList.toggle('off', !on); }
window.addEventListener('online', () => { netState(); toast('Back online'); });
window.addEventListener('offline', () => { netState(); toast('Offline – the app keeps working'); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(() => setTimeout(diag, 1500)).catch(() => { }));
}

/* ---------- boot ---------- */
fillCalcSelects();
syncCalcInputs();
bindCalc(); bindGuide(); bindCatalog(); bindQuote(); bindMore();
renderCalc(); renderCatalog(); renderQuote(); renderSaved();
netState(); installHelp(); setTimeout(showInstallBar, 1500);
setTimeout(() => $('#splash').classList.add('gone'), 1100);
{ const h = location.hash.slice(1); if (['calc', 'cat', 'quote', 'guide', 'more'].includes(h)) showTab(h); }
