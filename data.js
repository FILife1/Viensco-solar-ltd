/* Viensco Synergy Ltd – catalogue data.
   Prices are in Nigerian Naira (₦) and are STARTING ESTIMATES. Edit them in the Catalogue tab. */
const CATS = [
  ['inverter', 'Inverters'],
  ['battery', 'Batteries'],
  ['panel', 'Solar panels'],
  ['controller', 'Charge controllers'],
  ['surge', 'Surge protectors'],
  ['protection', 'Breakers, fuses & isolators'],
  ['dccon', 'DC contactors'],
  ['accon', 'AC contactors'],
  ['switch', 'Switching (ATS / changeover / meters)'],
  ['timer', 'Timers & relays'],
  ['terminal', 'Battery terminals & connectors'],
  ['cable', 'Cables & conduit'],
  ['earth', 'Earthing & lightning'],
  ['fire', 'Fire safety'],
  ['mount', 'Mounting & racks'],
  ['service', 'Services']
];

const CATALOG = [];
function add(id, cat, name, price, extra) { CATALOG.push(Object.assign({ id, cat, name, price, unit: 'pc' }, extra || {})); }

/* ---------- Inverters ---------- */
// kw = continuous AC rating, v = battery bank voltage, mppt = built-in solar charger, ph = phases
add('inv-og-1k', 'inverter', 'Off-grid inverter 1.2kW / 12V (pure sine, PWM)', 165000, { type: 'offgrid', kw: 1.2, v: 12, ph: 1, mppt: false });
add('inv-og-24', 'inverter', 'Off-grid inverter 2.4kW / 24V (pure sine, PWM)', 340000, { type: 'offgrid', kw: 2.4, v: 24, ph: 1, mppt: false });
add('inv-hy-35', 'inverter', 'Hybrid inverter 3.5kW / 24V with MPPT', 620000, { type: 'hybrid', kw: 3.5, v: 24, ph: 1, mppt: true });
add('inv-hy-5', 'inverter', 'Hybrid inverter 5kW / 48V with MPPT', 1050000, { type: 'hybrid', kw: 5, v: 48, ph: 1, mppt: true });
add('inv-hy-62', 'inverter', 'Hybrid inverter 6.2kW / 48V with MPPT', 1350000, { type: 'hybrid', kw: 6.2, v: 48, ph: 1, mppt: true });
add('inv-hy-8', 'inverter', 'Hybrid inverter 8kW / 48V with MPPT', 1950000, { type: 'hybrid', kw: 8, v: 48, ph: 1, mppt: true });
add('inv-hy-10', 'inverter', 'Hybrid inverter 10kW / 48V with MPPT', 2650000, { type: 'hybrid', kw: 10, v: 48, ph: 1, mppt: true });
add('inv-hy-12', 'inverter', 'Hybrid inverter 12kW / 48V with MPPT', 3400000, { type: 'hybrid', kw: 12, v: 48, ph: 1, mppt: true });
add('inv-hy-15-3', 'inverter', 'Hybrid inverter 15kW / 48V, 3-phase', 5200000, { type: 'hybrid', kw: 15, v: 48, ph: 3, mppt: true });
add('inv-hy-20-3', 'inverter', 'Hybrid inverter 20kW / 48V, 3-phase', 7200000, { type: 'hybrid', kw: 20, v: 48, ph: 3, mppt: true });
add('inv-gt-5', 'inverter', 'Grid-tie inverter 5kW, single phase', 780000, { type: 'ongrid', kw: 5, v: 0, ph: 1, mppt: true });
add('inv-gt-10', 'inverter', 'Grid-tie inverter 10kW, single phase', 1500000, { type: 'ongrid', kw: 10, v: 0, ph: 1, mppt: true });
add('inv-gt-15-3', 'inverter', 'Grid-tie inverter 15kW, 3-phase', 2300000, { type: 'ongrid', kw: 15, v: 0, ph: 3, mppt: true });
add('inv-gt-20-3', 'inverter', 'Grid-tie inverter 20kW, 3-phase', 2900000, { type: 'ongrid', kw: 20, v: 0, ph: 3, mppt: true });
add('inv-gt-30-3', 'inverter', 'Grid-tie inverter 30kW, 3-phase', 4300000, { type: 'ongrid', kw: 30, v: 0, ph: 3, mppt: true });

/* ---------- Batteries ---------- */
// kwh = nominal energy, v = bank voltage class (12/24/48), dod = recommended depth of discharge
add('bat-li-12-100', 'battery', 'LiFePO4 lithium 12V 100Ah (1.28kWh)', 420000, { chem: 'Lithium LiFePO4', kwh: 1.28, v: 12, dod: 0.85 });
add('bat-li-24-100', 'battery', 'LiFePO4 lithium 24V 100Ah (2.56kWh)', 780000, { chem: 'Lithium LiFePO4', kwh: 2.56, v: 24, dod: 0.85 });
add('bat-li-48-100', 'battery', 'LiFePO4 lithium 48V 100Ah (5.12kWh) rack/wall', 1650000, { chem: 'Lithium LiFePO4', kwh: 5.12, v: 48, dod: 0.85 });
add('bat-li-48-200', 'battery', 'LiFePO4 lithium 48V 200Ah (10.24kWh)', 3200000, { chem: 'Lithium LiFePO4', kwh: 10.24, v: 48, dod: 0.85 });
add('bat-li-48-314', 'battery', 'LiFePO4 lithium 51.2V 314Ah (16kWh)', 4700000, { chem: 'Lithium LiFePO4', kwh: 16.07, v: 48, dod: 0.85 });
add('bat-tub-200', 'battery', 'Tubular gel 12V 200Ah (2.4kWh)', 360000, { chem: 'Tubular / Gel', kwh: 2.4, v: 12, dod: 0.5 });
add('bat-tub-220', 'battery', 'Tubular gel 12V 220Ah (2.64kWh)', 400000, { chem: 'Tubular / Gel', kwh: 2.64, v: 12, dod: 0.5 });
add('bat-gel-100', 'battery', 'Gel deep-cycle 12V 100Ah (1.2kWh)', 230000, { chem: 'Tubular / Gel', kwh: 1.2, v: 12, dod: 0.5 });
add('bat-agm-100', 'battery', 'AGM deep-cycle 12V 100Ah (1.2kWh)', 205000, { chem: 'AGM', kwh: 1.2, v: 12, dod: 0.5 });
add('bat-agm-200', 'battery', 'AGM deep-cycle 12V 200Ah (2.4kWh)', 390000, { chem: 'AGM', kwh: 2.4, v: 12, dod: 0.5 });
add('bat-lc-200', 'battery', 'Lead-carbon 12V 200Ah (2.4kWh)', 470000, { chem: 'Lead-carbon', kwh: 2.4, v: 12, dod: 0.6 });

/* ---------- Solar panels ---------- */
[[400, 98000], [450, 112000], [500, 128000], [550, 142000], [600, 155000], [650, 170000]].forEach(([w, p]) =>
  add('pv-' + w, 'panel', `Mono PERC solar panel ${w}W`, p, { w }));

/* ---------- Charge controllers (only needed if inverter has no MPPT) ---------- */
add('mppt-40', 'controller', 'MPPT charge controller 40A (12/24V)', 95000, { amps: 40 });
add('mppt-60', 'controller', 'MPPT charge controller 60A (12-48V)', 170000, { amps: 60 });
add('mppt-80', 'controller', 'MPPT charge controller 80A (12-48V)', 260000, { amps: 80 });
add('mppt-100', 'controller', 'MPPT charge controller 100A (12-48V)', 340000, { amps: 100 });

/* ---------- Surge protectors ---------- */
add('spd-dc-1000', 'surge', 'DC surge protector (SPD) 1000V, 2-pole, Type II', 32000);
add('spd-dc-600', 'surge', 'DC surge protector (SPD) 600V, 2-pole, Type II', 26000);
add('spd-ac-1p', 'surge', 'AC surge protector 1P+N, Type II, 40kA', 22000, { ph: 1 });
add('spd-ac-3p', 'surge', 'AC surge protector 3P+N, Type II, 40kA', 45000, { ph: 3 });
add('spd-t12', 'surge', 'Combined Type I+II lightning surge protector', 85000);

/* ---------- Breakers, fuses & isolators ---------- */
[[63, 14000], [100, 22000], [125, 28000], [200, 45000], [250, 58000], [400, 95000]].forEach(([a, p]) =>
  add('dcb-' + a, 'protection', `DC circuit breaker 2P ${a}A (battery)`, p, { amps: a, kind: 'dcb' }));
add('pv-iso-32', 'protection', 'PV DC isolator switch 32A / 1000V', 18000);
add('pv-fuse', 'protection', 'PV string fuse 15A with holder', 6500);
add('bat-fuse', 'protection', 'Class-T battery fuse 200A with holder', 38000);
add('acb-2p-32', 'protection', 'AC MCB 2P 32A', 6500, { amps: 32, poles: 2, kind: 'acb' });
add('acb-2p-63', 'protection', 'AC MCB 2P 63A', 9500, { amps: 63, poles: 2, kind: 'acb' });
add('acb-4p-63', 'protection', 'AC MCB 4P 63A', 18000, { amps: 63, poles: 4, kind: 'acb' });
add('acb-4p-100', 'protection', 'AC MCCB 4P 100A', 26000, { amps: 100, poles: 4, kind: 'acb' });
add('pv-comb-2', 'protection', 'PV combiner box, 2-string (with SPD & fuses)', 55000);
add('pv-comb-4', 'protection', 'PV combiner box, 4-string (with SPD & fuses)', 95000);

/* ---------- DC contactors ---------- */
add('dcc-150', 'dccon', 'DC contactor 12-48V coil, 150A', 48000, { amps: 150 });
add('dcc-250', 'dccon', 'DC contactor 12-48V coil, 250A', 72000, { amps: 250 });
add('dcc-400', 'dccon', 'DC contactor 12-48V coil, 400A', 120000, { amps: 400 });
add('dcc-pre', 'dccon', 'Pre-charge resistor & relay kit', 24000);

/* ---------- AC contactors ---------- */
add('acc-2p-25', 'accon', 'AC contactor 2P 25A (230V coil)', 14000);
add('acc-2p-40', 'accon', 'AC contactor 2P 40A (230V coil)', 19000);
add('acc-4p-63', 'accon', 'AC contactor 4P 63A (230V coil)', 38000);
add('acc-4p-100', 'accon', 'AC contactor 4P 100A (230V coil)', 65000);

/* ---------- Switching devices ---------- */
add('co-2p-63', 'switch', 'Manual changeover switch 2P 63A', 18000, { poles: 2, amps: 63, kind: 'co' });
add('co-2p-100', 'switch', 'Manual changeover switch 2P 100A', 28000, { poles: 2, amps: 100, kind: 'co' });
add('co-4p-63', 'switch', 'Manual changeover switch 4P 63A', 38000, { poles: 4, amps: 63, kind: 'co' });
add('co-4p-100', 'switch', 'Manual changeover switch 4P 100A', 58000, { poles: 4, amps: 100, kind: 'co' });
add('ats-2p-63', 'switch', 'Automatic transfer switch (ATS) 2P 63A', 65000, { poles: 2, amps: 63, kind: 'ats' });
add('ats-2p-100', 'switch', 'Automatic transfer switch (ATS) 2P 100A', 95000, { poles: 2, amps: 100, kind: 'ats' });
add('ats-4p-63', 'switch', 'Automatic transfer switch (ATS) 4P 63A', 110000, { poles: 4, amps: 63, kind: 'ats' });
add('ats-4p-100', 'switch', 'Automatic transfer switch (ATS) 4P 100A', 140000, { poles: 4, amps: 100, kind: 'ats' });
add('sw-bypass', 'switch', 'Maintenance bypass switch (3-way)', 25000);
add('sw-gencon', 'switch', 'Generator auto-start / transfer controller', 85000);
add('meter-bidir', 'switch', 'Smart bi-directional energy meter (on-grid)', 95000);
add('meter-zero', 'switch', 'Zero-export CT limiter (on-grid)', 75000);
add('wifi-dongle', 'switch', 'Wi-Fi / GPRS monitoring dongle', 35000);

/* ---------- Timers & relays ---------- */
add('tm-24', 'timer', 'Digital programmable 24-hour timer 16A', 12000);
add('tm-7d', 'timer', 'Digital 7-day programmable timer 25A', 22000);
add('tm-din', 'timer', 'DIN-rail programmable timer 16A', 16000);
add('tm-delay', 'timer', 'Time-delay relay (adjustable)', 9500);

/* ---------- Terminals & connectors ---------- */
add('lug-35', 'terminal', 'Copper battery terminal lug 35mm² (M8)', 1200);
add('lug-50', 'terminal', 'Copper battery terminal lug 50mm² (M8)', 1800);
add('lug-70', 'terminal', 'Copper battery terminal lug 70mm² (M10)', 2500);
add('trm-clamp', 'terminal', 'Lead-acid battery post clamp (pair)', 6500);
add('trm-bus', 'terminal', 'Copper busbar 200A, 2-way', 18000);
add('trm-link', 'terminal', 'Battery link cable 35mm², 0.4m with lugs', 7000);
add('mc4', 'terminal', 'MC4 solar connector pair', 2500);
add('mc4-y', 'terminal', 'MC4 Y-branch connector pair', 6500);
add('trm-ferrule', 'terminal', 'Cable ferrules & heat-shrink kit', 8500);

/* ---------- Cables & conduit ---------- */
add('cab-pv4', 'cable', 'Solar PV cable 4mm² (per metre)', 1100, { unit: 'm' });
add('cab-pv6', 'cable', 'Solar PV cable 6mm² (per metre)', 1700, { unit: 'm' });
add('cab-dc35', 'cable', 'DC battery cable 35mm² (per metre)', 6500, { unit: 'm', mm: 35 });
add('cab-dc50', 'cable', 'DC battery cable 50mm² (per metre)', 9000, { unit: 'm', mm: 50 });
add('cab-dc70', 'cable', 'DC battery cable 70mm² (per metre)', 13000, { unit: 'm', mm: 70 });
add('cab-ac6', 'cable', 'AC cable 6mm² (per metre)', 2300, { unit: 'm' });
add('cab-ac10', 'cable', 'AC cable 10mm² (per metre)', 3800, { unit: 'm' });
add('cab-ac16', 'cable', 'AC cable 16mm² (per metre)', 5600, { unit: 'm' });
add('cab-conduit', 'cable', 'Conduit, trunking & clips (lot)', 45000, { unit: 'lot' });

/* ---------- Earthing & lightning ---------- */
add('ert-rod', 'earth', 'Copper-bonded earth rod 1.5m with clamp', 18000);
add('ert-kit', 'earth', 'Earthing pit kit (chamber, compound, bonding)', 45000);
add('ert-cab', 'earth', 'Earth cable 16mm² green/yellow (per metre)', 1900, { unit: 'm' });
add('ert-lightning', 'earth', 'Lightning rod (Franklin) with down-conductor', 65000);

/* ---------- Fire safety ---------- */
add('fire-dcp6', 'fire', 'Fire extinguisher, dry chemical powder 6kg', 38000);
add('fire-dcp9', 'fire', 'Fire extinguisher, dry chemical powder 9kg', 52000);
add('fire-co2', 'fire', 'Fire extinguisher, CO₂ 5kg (battery room)', 68000);
add('fire-blanket', 'fire', 'Fire blanket', 12500);
add('fire-smoke', 'fire', 'Smoke detector (battery room)', 9000);
add('fire-heat', 'fire', 'Heat detector with alarm', 12000);
add('fire-sand', 'fire', 'Fire bucket & sand set', 15000);
add('fire-sign', 'fire', 'Safety signage & labelling kit', 8500);

/* ---------- Mounting & racks ---------- */
add('mnt-roof', 'mount', 'Roof mounting rails & clamps (per panel)', 22000);
add('mnt-ground', 'mount', 'Ground-mount galvanised structure (per panel)', 45000);
add('mnt-rack', 'mount', 'Battery rack, 4-tier powder-coated', 160000);
add('mnt-cabinet', 'mount', 'Battery cabinet / enclosure', 280000);

/* ---------- Services ---------- */
add('srv-survey', 'service', 'Site survey & load audit', 25000, { unit: 'job' });
add('srv-design', 'service', 'System design & drawings', 50000, { unit: 'job' });
add('srv-maint', 'service', 'Annual maintenance visit', 60000, { unit: 'visit' });
add('srv-train', 'service', 'Client training & handover', 15000, { unit: 'job' });
add('srv-comm', 'service', 'Commissioning, testing & test report', 30000, { unit: 'job' });
add('srv-disco', 'service', 'DisCo grid-connection application & drawings (agency fees excluded)', 50000, { unit: 'job' });

/* ---------- Nigerian states: zone & approximate peak sun hours ---------- */
const STATES = {
  'Sokoto': ['NW', 5.9], 'Kebbi': ['NW', 5.8], 'Zamfara': ['NW', 5.8], 'Katsina': ['NW', 5.8], 'Kano': ['NW', 5.7], 'Jigawa': ['NW', 5.8], 'Kaduna': ['NW', 5.4],
  'Borno': ['NE', 5.8], 'Yobe': ['NE', 5.8], 'Bauchi': ['NE', 5.5], 'Gombe': ['NE', 5.5], 'Adamawa': ['NE', 5.4], 'Taraba': ['NE', 5.1],
  'FCT Abuja': ['NC', 5.1], 'Niger': ['NC', 5.2], 'Kogi': ['NC', 4.9], 'Kwara': ['NC', 5.0], 'Nasarawa': ['NC', 5.1], 'Plateau': ['NC', 5.2], 'Benue': ['NC', 4.9],
  'Lagos': ['SW', 4.3], 'Ogun': ['SW', 4.4], 'Oyo': ['SW', 4.6], 'Osun': ['SW', 4.5], 'Ondo': ['SW', 4.3], 'Ekiti': ['SW', 4.5],
  'Enugu': ['SE', 4.5], 'Anambra': ['SE', 4.3], 'Imo': ['SE', 4.2], 'Abia': ['SE', 4.2], 'Ebonyi': ['SE', 4.5],
  'Edo': ['SS', 4.3], 'Delta': ['SS', 4.1], 'Bayelsa': ['SS', 3.9], 'Rivers': ['SS', 4.0], 'Akwa Ibom': ['SS', 4.0], 'Cross River': ['SS', 4.2]
};
const ZONE_NAMES = { NW: 'North-West', NE: 'North-East', NC: 'North-Central', SW: 'South-West', SE: 'South-East', SS: 'South-South' };
// default delivery & logistics estimate per zone (editable on the quote)
const ZONE_TRANSPORT = { SW: 50000, SE: 80000, SS: 80000, NC: 100000, NW: 120000, NE: 150000 };

/* ---------- Appliance presets: name, watts, hours/day ---------- */
const APPLIANCES = [
  ['LED bulb 10W', 10, 6], ['Security light 30W', 30, 12], ['Ceiling fan', 75, 8], ['Standing fan', 60, 8],
  ['TV LED 43-55"', 100, 6], ['Decoder / receiver', 20, 6], ['Wi-Fi router', 12, 24], ['CCTV system', 60, 24],
  ['Laptop', 65, 6], ['Desktop computer', 200, 8], ['Printer', 300, 1], ['Phone charger', 10, 3],
  ['Refrigerator (medium) – compressor hrs', 150, 10], ['Deep freezer – compressor hrs', 250, 12],
  ['Air conditioner 1HP', 800, 6], ['Air conditioner 1.5HP', 1200, 6], ['Air conditioner 2HP', 1600, 6],
  ['Water pump 1HP', 750, 1], ['Washing machine', 500, 1], ['Water dispenser', 500, 4],
  ['Electric iron', 1000, 0.5], ['Microwave', 1200, 0.5], ['Electric kettle', 1500, 0.3], ['Electric hotplate', 2000, 1], ['Blender', 400, 0.2]
];


/* ---------- Field guide (installation stages, safety, etc.) ---------- */
const GUIDE = {
  stages: [
    { id: 's1', t: 'Stage 1 – Site survey', note: 'A great install fails on a bad survey. Even small shade can cut a whole string\'s output.',
      items: ['Measure usable roof area and tilt', 'Check shading across the day', 'Assess roof strength and condition', 'Review the electrical panel and 12 months of bills (add generator fuel use)'] },
    { id: 's2', t: 'Stage 2 – System design', note: 'Design before drilling. String voltage and current must stay inside inverter limits, including cold-weather voltage rise.',
      items: ['Lay out the panel array on the roof', 'Configure strings within inverter limits', 'Size cables to limit voltage drop', 'Produce single-line diagram and permits'] },
    { id: 's3', t: 'Stage 3 – Mounting structure', note: 'Structure failures are visible and expensive – check wind uplift and waterproofing.',
      items: ['Fix rails to rafters, not just roof sheeting', 'Seal every roof penetration', 'Design for local wind loads', 'Use corrosion-resistant hardware'] },
    { id: 's4', t: 'Stage 4 – Electrical work', note: 'Clear labelling saves hours in maintenance and protects future technicians.',
      items: ['Run DC cables with proper connectors', 'Install DC and AC isolators', 'Fit surge protection and earthing', 'Label every circuit clearly'] },
    { id: 's5', t: 'Stage 5 – Commissioning', note: 'Never skip commissioning. Baseline readings let you spot faults months later.',
      items: ['Check polarity and open-circuit voltage', 'Test insulation and earthing continuity', 'Power up and verify inverter output', 'Record baseline performance readings', 'Hand the client a test report'] }
  ],
  safety: { t: 'Safety first – no shortcuts', items: ['Panels produce voltage whenever they are lit', 'Use fall protection on every roof', 'Lock out and test before touching', 'Wear insulated PPE and use insulated tools'] },
  grid: ['Submit DisCo application and drawings', 'DisCo approves the system', 'Bi-directional meter is installed', 'Net metering credits exported energy'],
  gridNote: 'One approval is needed before switch-on. Confirm current NERC and DisCo requirements for the area and set client expectations on approval timelines.',
  types: [['On-grid', 'Lowest cost, no batteries. Cuts the bill but shuts down when the grid is off.'], ['Off-grid', 'Full independence from the grid; higher cost because of batteries.'], ['Hybrid', 'Grid plus battery backup – the usual choice where supply is unreliable.']],
  typeTip: 'Ask the client which problem matters most: high bills, outages, or no grid access. That points to the system type.',
  parts: ['Solar panels and mounting structure', 'Inverter (string, micro or hybrid)', 'DC/AC cables, breakers and surge protection', 'Meter, earthing and optional battery'],
  pitfalls: ['Ignoring shade during the survey', 'Undersized cables causing losses', 'Skipping permits or inspections', 'Cheap components, costly failures'],
  maint: ['Track output through the monitoring app', 'Clean panels when dust builds up (Harmattan dust cuts output)', 'Inspect connections and mounts yearly', 'Set alerts so faults are caught early'],
  sizing: ['Read 12 months of DisCo bills and add generator fuel use', 'Divide daily kWh by peak sun hours: about 6 in the north (Kano, Sokoto), 4 to 4.5 on the southern coast (Lagos, Port Harcourt)', 'Allow about 25% for real-world losses (divide by 0.75)', 'Example: 20 kWh/day at 5 sun hours = 4 kW; ÷ 0.75 = 5.3 kWp, roughly 10 panels of 550W']
};

/* ---------- Itel & market price list (compiled 31 Oct 2026 from online listings and a Facebook video) ----------
   Prices in ₦ change often and may be negotiable – confirm with the seller. auto:false = informal/unclear listing, never chosen by the calculator automatically. */
add("it-inv-15", "inverter", "Itel 1.5kW Off-Grid Inverter (1PV-1K512U)", 249550, {"type": "offgrid", "kw": 1.5, "v": 12, "ph": 1, "mppt": true, "brand": "Itel", "seller": "SLOT Systems Nigeria", "plat": "slot.ng", "where": "Online store; nationwide delivery", "note": "12V assumed from model code; built-in solar charger assumed - confirm", "list": "itel"});
add("it-inv-3", "inverter", "Itel 3kW Off-Grid Inverter (IPV3K24U)", 394800, {"type": "offgrid", "kw": 3, "v": 24, "ph": 1, "mppt": true, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "24V from model code; built-in solar charger assumed - confirm", "list": "itel"});
add("it-inv-36", "inverter", "Itel 3.6kW Hybrid Inverter (IPV-3K624S)", 386500, {"type": "hybrid", "kw": 3.6, "v": 24, "ph": 1, "mppt": true, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "Marked out of stock on one Zit page", "list": "itel"});
add("it-inv-6k", "inverter", "Itel 6kVA 48V Inverter", 600000, {"type": "offgrid", "kw": 4.8, "v": 48, "ph": 1, "mppt": false, "brand": "Itel", "auto": false, "seller": "Jiji seller (Ojo, Lagos)", "plat": "Jiji", "where": "Ojo, Lagos (contact via Jiji listing)", "note": "Fixed price; avoid paying in advance. Calculator uses 4.8kW (6kVA at 0.8 power factor)", "list": "itel"});
add("it-inv-6", "inverter", "Itel 6kW Hybrid Inverter (1PV-6K48U Pro WiFi)", 626750, {"type": "hybrid", "kw": 6, "v": 48, "ph": 1, "mppt": true, "brand": "Itel", "seller": "SLOT Systems Nigeria", "plat": "slot.ng", "where": "Online store; nationwide delivery", "list": "itel"});
add("it-inv-66", "inverter", "Itel 6.6kVA Hybrid Inverter System", 550000, {"type": "hybrid", "kw": 5.3, "v": 48, "ph": 1, "mppt": true, "brand": "Itel", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "Confirm what the 'system' price includes. Calculator uses 5.3kW (0.8 power factor)", "list": "itel"});
add("it-inv-8", "inverter", "Itel 8kVA Hybrid Inverter System", 770000, {"type": "hybrid", "kw": 6.4, "v": 48, "ph": 1, "mppt": true, "brand": "Itel", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "Confirm what the 'system' price includes. Calculator uses 6.4kW (0.8 power factor)", "list": "itel"});
add("it-inv-12", "inverter", "Itel 12kW Hybrid Inverter (1PV-12K48U WiFi)", 1299500, {"type": "hybrid", "kw": 12, "v": 48, "ph": 1, "mppt": true, "brand": "Itel", "seller": "SLOT Systems Nigeria", "plat": "slot.ng", "where": "Online store; nationwide delivery", "note": "3-year replacement warranty", "list": "itel"});
add("it-bat-25a", "battery", "Itel 2.5kWh Lithium Battery (IPW25100)", 598000, {"chem": "Lithium LiFePO4", "kwh": 2.5, "v": 24, "dod": 0.85, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "Listing says 51.2V 100Ah, but 2.5kWh at 100Ah is a 24V-class battery - confirm voltage before ordering", "list": "itel"});
add("it-bat-25b", "battery", "Itel 2.5kWh 24V Lithium Battery", 600000, {"chem": "Lithium LiFePO4", "kwh": 2.5, "v": 24, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Jiji seller (Ikeja, Lagos)", "plat": "Jiji", "where": "Ikeja, Lagos (contact via Jiji listing)", "note": "Negotiable; 5-year warranty stated", "list": "itel"});
add("it-bat-5a", "battery", "Itel 5.12kWh Lithium Battery (IPW-51100, wall-mounted)", 980000, {"chem": "Lithium LiFePO4", "kwh": 5.12, "v": 48, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Jiji seller (Ibadan)", "plat": "Jiji", "where": "Beside Lony Hotel, via Dugbe Road, Olugbode, Odo Ona Apata, Ibadan", "note": "Negotiable", "list": "itel"});
add("it-bat-5b", "battery", "Itel 5kWh Lithium Battery", 1037300, {"chem": "Lithium LiFePO4", "kwh": 5, "v": 48, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Jiji seller (Ikeja, Lagos)", "plat": "Jiji", "where": "Ikeja, Lagos (contact via Jiji listing)", "note": "48V assumed", "list": "itel"});
add("it-bat-5c", "battery", "Itel 5.12kWh Lithium Battery (IPW5120)", 1062500, {"chem": "Lithium LiFePO4", "kwh": 5.12, "v": 48, "dod": 0.85, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "Discounted from ₦1,409,000", "list": "itel"});
add("it-bat-5d", "battery", "Itel 5.12kWh Lithium Battery (IPL-51100)", 1166000, {"chem": "Lithium LiFePO4", "kwh": 5.12, "v": 48, "dod": 0.85, "brand": "Itel", "seller": "Itel Energy Nigeria Flagship Shop", "plat": "Jumia", "where": "Jumia online store", "note": "Jumia shows seller score of 50% with poor quality/cancellation ratings; check before paying", "list": "itel"});
add("it-bat-10a", "battery", "Itel 10kWh Lithium Battery 51.2V 200Ah", 1750000, {"chem": "Lithium LiFePO4", "kwh": 10.24, "v": 48, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Jiji seller (Ojo, Lagos)", "plat": "Jiji", "where": "Ojo, Lagos (contact via Jiji listing)", "note": "Negotiable", "list": "itel"});
add("it-bat-10b", "battery", "Itel 10kWh Lithium Battery (IPL-51200X)", 1903000, {"chem": "Lithium LiFePO4", "kwh": 10.24, "v": 48, "dod": 0.85, "brand": "Itel", "seller": "Tegra", "plat": "tegra.ng", "where": "Online store", "note": "Price excludes tax", "list": "itel"});
add("it-bat-10c", "battery", "Itel 10kWh Lithium Battery", 1900000, {"chem": "Lithium LiFePO4", "kwh": 10, "v": 48, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "list": "itel"});
add("it-bat-10d", "battery", "Itel 10kWh Lithium Battery LiFePO4 (IPL-51200)", 2282750, {"chem": "Lithium LiFePO4", "kwh": 10.24, "v": 48, "dod": 0.85, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "5-year warranty", "list": "itel"});
add("it-bat-16", "battery", "Itel 16kWh Lithium Battery", 2150000, {"chem": "Lithium LiFePO4", "kwh": 16.07, "v": 48, "dod": 0.85, "brand": "Itel", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "Unit in video labelled 51.2V 314Ah", "list": "itel"});
add("it-bat-15", "battery", "Itel 15kWh Lithium Battery (IPL51280)", 2826000, {"chem": "Lithium LiFePO4", "kwh": 14.34, "v": 48, "dod": 0.85, "brand": "Itel", "seller": "Zit Nigeria", "plat": "zit.ng", "where": "Online store", "note": "Listed as 15kWh; 51.2V x 280Ah = 14.3kWh nominal", "list": "itel"});
add("it-pv-550", "panel", "Itel 550W N-Type Mono Panel (ISP-550W)", 153725, {"w": 550, "brand": "Itel", "seller": "Itel Energy Nigeria Flagship Shop", "plat": "Jumia", "where": "Jumia online store; shipping from ₦5,600 to Lekki-Ajah", "note": "Discounted from ₦207,528; few units left", "list": "itel"});
add("ot-inv-fel8", "inverter", "Felicity 8kVA Hybrid Inverter System", 770000, {"type": "hybrid", "kw": 6.4, "v": 48, "ph": 1, "mppt": true, "brand": "Felicity", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "Calculator uses 6.4kW (0.8 power factor)", "list": "itel"});
add("ot-inv-hai15", "inverter", "Haisic 15kVA Hybrid Inverter System", 970000, {"type": "hybrid", "kw": 12, "v": 48, "ph": 1, "mppt": true, "brand": "Haisic", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "Phase and voltage not stated - 48V single-phase assumed; calculator uses 12kW (0.8 power factor)", "list": "itel"});
add("ot-bat-hai18", "battery", "Haisic 18kWh Lithium-Ion Battery", 1950000, {"chem": "Lithium LiFePO4", "kwh": 18, "v": 48, "dod": 0.85, "brand": "Haisic", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "48V assumed", "list": "itel"});
add("ot-bat-deye16", "battery", "Deye 16kWh Lithium-Ion Battery", 2500000, {"chem": "Lithium LiFePO4", "kwh": 16, "v": 48, "dod": 0.85, "brand": "Deye", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "48V assumed", "list": "itel"});
add("ot-bat-hai30", "battery", "Haisic 30kWh Lithium-Ion Battery", 3700000, {"chem": "Lithium LiFePO4", "kwh": 30, "v": 48, "dod": 0.85, "brand": "Haisic", "auto": false, "seller": "Onwini Electronics Showroom (Onwini Enterprises)", "plat": "Facebook video", "where": "WhatsApp 08148916253 / 08135452920 (address not shown in video)", "note": "48V assumed", "list": "itel"});
