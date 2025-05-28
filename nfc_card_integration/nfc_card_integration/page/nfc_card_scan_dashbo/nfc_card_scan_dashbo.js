frappe.pages['nfc_card_scan_dashbo'].on_page_load = async function(wrapper) {
    // --- Page setup ---
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'NFC Card Scan & Lead Analytics Dashboard',
        single_column: true
    });
    const $wrapper = $(wrapper).css("padding", "0");

    // --- STYLES ---
    $(`
    <style>
        /* =================== CARD & TABLE =================== */
        .nfc-zero-table-card {
        background: linear-gradient(110deg, #f7fcff 0%, #eaf6ff 100%);
        border-radius: 18px;
        box-shadow: 0 4px 20px 0 rgba(80,163,255,0.10);
        border: 1.5px solid #d3e7fa;
        padding: 0 !important;
        margin-bottom: 1.6rem;
        min-height: 180px;
        max-height: 320px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        }
        .nfc-zero-table-summary {
        font-weight: 700;
        color: #007cf0;
        background: #eaf4fe;
        padding: 0.7em 1.1em 0.5em 1.1em;
        border-radius: 18px 18px 0 0;
        letter-spacing: 0.01em;
        font-size: 1.08em;
        border-bottom: 1.5px solid #d3e7fa;
        position: sticky;
        top: 0;
        z-index: 2;
        }
        .nfc-zero-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: none;
        }
        .nfc-zero-table th {
        background: linear-gradient(90deg, #50a3ff 0%, #36d1c4 100%);
        color: #fff;
        font-weight: 700;
        font-size: 1.07em;
        border: none;
        padding: 0.7em 1.1em;
        text-align: left;
        position: sticky;
        top: 44px;
        z-index: 2;
        letter-spacing: 0.04em;
        }
        .nfc-zero-table tr:nth-child(even) td { background: #f4faff; }
        .nfc-zero-table td {
        padding: 0.65em 1.1em;
        border-bottom: 1.5px solid #e6f2fa;
        color: #2c3e4f;
        font-weight: 500;
        vertical-align: middle;
        background: none;
        }
        .nfc-zero-table tr:last-child td { border-bottom: none; }
        .nfc-zero-table tbody tr:hover td {
        background: #eaf6ff !important;
        color: #007cf0 !important;
        transition: background 0.13s, color 0.13s;
        }
        /* =================== PILLS & BADGES =================== */
        .nfc-emp-pill, .nfc-city-pill {
        display: inline-block;
        font-weight: 700;
        padding: 5px 18px 5px 16px;
        border-radius: 1.3em;
        font-size: 1em;
        letter-spacing: 0.03em;
        box-shadow: 0 2px 10px #50a3ff16;
        }
        .nfc-emp-pill {
        background: linear-gradient(90deg, #007cf0 0%, #36d1c4 100%);
        color: #fff;
        }
        .nfc-city-pill {
        background: linear-gradient(90deg, #36d1c4 0%, #50a3ff 100%);
        color: #fff;
        }
        .nfc-zero-badge {
        display: inline-flex;
        align-items: center;
        background: #eaf4fe;
        color: #36d1c4;
        padding: 4px 13px 4px 10px;
        border-radius: 1em;
        font-weight: 700;
        box-shadow: 0 1.5px 6px #36d1c416;
        font-size: 1em;
        gap: 0.45em;
        }
        .nfc-zero-badge svg {
        width: 1.1em; height: 1.1em; fill: #36d1c4; margin-right: 0.1em;
        }
        .nfc-zero-none {
        color: #38b000;
        font-size: 1.23em;
        text-align: center;
        padding: 2.8em 0 2.2em 0;
        display: block;
        background: none;
        font-weight: 600;
        letter-spacing: 0.04em;
        }
        /* =================== SCROLLBAR =================== */
        .nfc-zero-table-card::-webkit-scrollbar { width: 8px; }
        .nfc-zero-table-card::-webkit-scrollbar-thumb {
        background: #dfefff;
        border-radius: 8px;
        }
        /* =================== DASHBOARD LAYOUT =================== */
        body, .layout-main-section, .page-content {
        background: #f7f9fb !important;
        }
        .nfc-dashboard-fw {
        width: 100vw;
        max-width: 100vw;
        margin-left: calc(-50vw + 50%);
        background: #f7f9fb;
        padding: 0 2vw 2vw 2vw;
        box-sizing: border-box;
        }
        .nfc-dashboard-card {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 3px 13px 0 rgba(80,163,255,0.09);
        padding: 1.1rem 1.1rem 1.2rem 1.1rem;
        margin-bottom: 1.4rem;
        width: 100%;
        }
        .nfc-dashboard-card#filters-container {
        background: linear-gradient(90deg, #eaf4fe 0%, #f7f9fb 100%);
        box-shadow: 0 3px 11px 0 rgba(80,163,255,0.07);
        border-radius: 16px;
        padding: 0.17rem 0.7rem 0.17rem 0.7rem;
        margin-bottom: 1.2rem;
        }
        /* =================== FILTER ROWS =================== */
        .nfc-filter-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
        margin: 0;
        background: #e3eeff;
        border-radius: 12px;
        padding: 0.12rem 0.4rem 0.12rem 0.4rem;
        box-shadow: 0 1px 5px 0 rgba(80,163,255,0.07);
        min-height: 0;
        }
        .nfc-filter-row .frappe-control {
        min-width: 135px;
        max-width: 200px;
        margin-bottom: 0;
        }
        .nfc-filter-row .frappe-control input,
        .nfc-filter-row .frappe-control select {
        border: 1.5px solid #d3e7fa !important;
        border-radius: 8px !important;
        background: #fafdff !important;
        min-height: 30px !important;
        font-size: 0.96rem;
        padding: 0.15rem 0.67rem;
        }
        .nfc-filter-row .frappe-control input:focus,
        .nfc-filter-row .frappe-control select:focus {
        border: 1.5px solid #50a3ff !important;
        outline: none !important;
        box-shadow: 0 0 2px 0 #50a3ff22;
        }
        .nfc-filter-row .frappe-control input:hover,
        .nfc-filter-row .frappe-control select:hover {
        border-color: #007cf0 !important;
        }
        .nfc-filter-row .nfc-filter-btn-wrap {
        margin-left: auto;
        display: flex;
        align-items: center;
        height: 100%;
        gap: 8px;
        }
        .nfc-filter-row .btn.nfc-refresh-btn {
        border-radius: 7px;
        font-weight: 700;
        font-size: 0.98rem;
        background: linear-gradient(90deg, #50a3ff 25%, #36d1c4 100%);
        border: none;
        box-shadow: 0 1.5px 6px #50a3ff16;
        padding: 0.37rem 1.1rem 0.37rem 1.05rem;
        display: flex;
        align-items: center;
        gap: 0.38em;
        color: #fff;
        transition: background 0.13s, box-shadow 0.13s;
        }
        .nfc-filter-row .btn.nfc-refresh-btn svg {
        width: 1.15em;
        height: 1.15em;
        fill: #fff;
        margin-left: 0.05em;
        }
        .nfc-filter-row .btn.nfc-clear-btn {
        border-radius: 7px;
        font-weight: 700;
        font-size: 0.98rem;
        background: linear-gradient(90deg, #e0e1e3 15%, #f7f9fb 100%);
        border: none;
        color: #007cf0;
        box-shadow: 0 1.5px 6px #a2a9b516;
        padding: 0.37rem 1.15rem 0.37rem 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.34em;
        transition: background 0.13s, box-shadow 0.13s;
        }
        .nfc-filter-row .btn.nfc-clear-btn svg {
        width: 1.13em;
        height: 1.13em;
        fill: #007cf0;
        margin-left: 0.05em;
        }
        .nfc-filter-row .btn.nfc-refresh-btn:hover,
        .nfc-filter-row .btn.nfc-refresh-btn:focus {
        background: linear-gradient(90deg, #007cf0 20%, #36d1c4 100%);
        color: #fff;
        }
        .nfc-filter-row .btn.nfc-clear-btn:hover,
        .nfc-filter-row .btn.nfc-clear-btn:focus {
        background: #eaf6ff;
        color: #007cf0;
        }
        /* =================== RESPONSIVENESS =================== */
        @media (max-width: 900px) {
        .nfc-zero-table-card { max-height: 180px; }
        .nfc-zero-table th,
        .nfc-zero-table td { font-size: .97em; }
        .nfc-metrics-row { flex-direction: column; gap: 0.8rem; }
        .chart-container { height: 200px; }
        .nfc-mapbox { height: 160px; }
        .nfc-dashboard-fw { padding: 0.8vw 0.6vw 1.5vw 0.6vw; }
        .nfc-filter-row { flex-direction: column; gap: 7px; align-items: stretch; }
        .nfc-filter-row .nfc-filter-btn-wrap { margin-left: 0; margin-top: .4rem; justify-content: flex-end; }
        .nfc-filter-row .btn { width: 100%; justify-content: center; }
        }
        @media (max-width: 1100px) {
        .nfc-maps-row, .chart-row { flex-direction: column; gap: 1.1rem; }
        .nfc-mapbox { height: 220px; }
        .nfc-dashboard-fw { padding-left: 1vw; padding-right: 1vw; }
        }
        @media (max-width: 700px) {
        .nfc-fs-inner { max-width: 100vw; width: 100vw; border-radius:0; }
        .nfc-fs-map { width: 99vw !important; height: 68vh !important; }
        }
        /* =================== FULLSCREEN =================== */
        .nfc-card-container { position: relative; }
        .nfc-fs-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 2;
        background: rgba(255,255,255,0.96);
        border-radius: 7px;
        border: 1.5px solid #bde3ff;
        box-shadow: 0 1.5px 6px #50a3ff16;
        padding: 4px 11px 4px 8px;
        color: #007cf0;
        font-weight: bold;
        font-size: 0.92em;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.28em;
        transition: background 0.15s, box-shadow 0.15s;
        }
        .nfc-fs-btn:hover { background: #eaf6ff; box-shadow: 0 6px 16px #bde3ff33; }
        .nfc-fs-btn svg { width: 1.1em; height: 1.1em; fill: #007cf0; }
        .nfc-fs-overlay {
        display: none;
        position: fixed;
        z-index: 999999;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: #fff;
        align-items: center;
        justify-content: center;
        }
        .nfc-fs-overlay.active { display: flex !important; }
        .nfc-fs-inner {
        width: 100vw; height: 100vh;
        max-width: 100vw; max-height: 100vh;
        background: #fff;
        border-radius: 0;
        box-shadow: none;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        }
        .nfc-fs-title {
        font-size: 1.21em;
        font-weight: bold;
        margin-bottom: 0.7em;
        color: #007cf0;
        letter-spacing: 0.02em;
        }
        .nfc-fs-close-btn {
        position: absolute;
        top: 12px; right: 22px;
        z-index: 10;
        border: none;
        background: #eaf6ff;
        color: #007cf0;
        border-radius: 50%;
        width: 44px; height: 44px;
        font-size: 2em;
        cursor: pointer;
        box-shadow: 0 2px 9px #bde3ff44;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.14s;
        }
        .nfc-fs-close-btn:hover { background: #bde3ff; }
        .nfc-fs-map { width: 98vw !important; height: 85vh !important; border-radius:14px; }
        /* =================== METRICS & CHARTS =================== */
        .nfc-metrics-row {
        display: flex; gap: 1.2rem;
        flex-wrap: wrap; margin-bottom: 1.5rem;
        }
        .nfc-metric-card {
        flex: 1 1 180px;
        color: #fff;
        text-align: center;
        padding: 1.2em 0.5em;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        border: 0.5px solid #f0f8ff;
        box-shadow: 0 3px 18px 0 rgba(0,124,240,0.09);
        font-weight: 600;
        }
        .scan { background: linear-gradient(135deg, #50a3ff 0%, #007cf0 100%); box-shadow: 0 6px 24px #50a3ff30; }
        .lead { background: linear-gradient(135deg, #ff6b6b 0%, #ee0979 100%); box-shadow: 0 6px 24px #ff6b6b30; }
        .city-metric { background: linear-gradient(135deg,#36d1c4 0%,#4ecdc4 100%); box-shadow:0 6px 24px #4ecdc430; }
        .nfc-metric-card h4 {
        font-size: 1.07rem;
        letter-spacing: 0.01em;
        opacity: 0.92;
        font-weight: 500;
        }
        .nfc-metric-card h1 {
        font-size: 2.5rem;
        margin: 0.2em 0 0 0;
        font-weight: 800;
        letter-spacing: 0.01em;
        }
        .chart-row {
        display: flex;
        gap: 2vw;
        margin-bottom: 1.9rem;
        width: 100%;
        }
        .nfc-chart-col { flex: 1 1 50%; display: flex; flex-direction: column; }
        .chart-container {
        width: 100%;
        height: 360px;
        margin-bottom: 0.6rem;
        background: linear-gradient(120deg,#e0f7fa 0%,#f0f8ff 100%);
        border-radius: 12px;
        box-shadow: 0 2.5px 12px 0 rgba(68,68,68,0.06);
        }
        .chart-title {
        font-size: 1.08rem;
        font-weight: 600;
        color: #222;
        margin-bottom: .5rem;
        letter-spacing: 0.02em;
        }
        /* =================== MAPS =================== */
        .nfc-maps-row { display: flex; gap: 2vw; margin-bottom: 1.9rem; }
        .nfc-map-card {
        flex: 1 1 50%;
        background: linear-gradient(120deg,#50a3ff11 0%,#4ecdc433 100%);
        box-shadow: 0 6px 32px 0 rgba(80,163,255,0.12);
        border-radius:18px;
        padding:1.1rem 1.1rem 0.7rem 1.1rem;
        display: flex;
        flex-direction:column;
        }
        .nfc-map-title {
        font-size: 1.08rem;
        color: #007cf0;
        font-weight: 700;
        letter-spacing: 0.03em;
        margin-bottom: .5rem;
        }
        .nfc-mapbox {
        width: 100%;
        height: 370px;
        border-radius: 12px;
        box-shadow: 0 4px 20px 0 rgba(80,163,255,0.13);
        border: 1.5px solid #e8f4ff;
        background: #eaf6ff;
        }
        /* =================== MISC =================== */
        .leaflet-control { filter: drop-shadow(0 2px 5px #007cf033); }
    </style>
    `).appendTo('head');

    // --- HTML ---
    $wrapper.find('.layout-main-section').empty().append(`
    <div class="nfc-dashboard-fw">

        <!-- Filters -->
        <div class="nfc-dashboard-card" id="filters-container">
        <form id="filter-form" autocomplete="off">
            <div class="nfc-filter-row" id="nfc-filters"></div>
        </form>
        </div>

        <!-- Metrics -->
        <div class="nfc-metrics-row" id="metrics-row">
        <div class="nfc-metric-card scan" id="scan-total">
            <h4>Total Card Scans (All Time)</h4>
            <h1 class="metric-value">0</h1>
        </div>
        <div class="nfc-metric-card scan" id="scan-employees">
            <h4>Employees Scanned</h4>
            <h1 class="metric-value">0</h1>
        </div>
        <div class="nfc-metric-card scan city-metric" id="scan-cities">
            <h4>Cities with Card Scans</h4>
            <h1 class="metric-value">0</h1>
        </div>
        <div class="nfc-metric-card lead" id="lead-total">
            <h4>Total NFC Card Leads</h4>
            <h1 class="metric-value">0</h1>
        </div>
        <div class="nfc-metric-card lead" id="lead-employees">
            <h4>Employees Generated Leads</h4>
            <h1 class="metric-value">0</h1>
        </div>
        <div class="nfc-metric-card lead city-metric" id="lead-cities">
            <h4>Cities with NFC Card Leads</h4>
            <h1 class="metric-value">0</h1>
        </div>
        </div>

        <!-- Maps -->
        <div class="nfc-maps-row">
        <div class="nfc-map-card nfc-card-container">
            <button class="nfc-fs-btn" data-fsid="nfc-scan-map">
            <svg viewBox="0 0 20 20"><path d="M7 2a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V4h2v2a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1H7zm6 6a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-3a1 1 0 0 0-1-1h-3zm-8 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 1 0 0-2H5v-2a1 1 0 0 0-1-1zm7 7a1 1 0 0 0-1 1v-2h-2a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 1 0-2 0v2z"/></svg>
            Fullscreen
            </button>
            <div class="nfc-map-title">Scan Locations Map</div>
            <div id="nfc-scan-map" class="nfc-mapbox"></div>
        </div>
        <div class="nfc-map-card nfc-card-container">
            <button class="nfc-fs-btn" data-fsid="nfc-lead-map">
            <svg viewBox="0 0 20 20"><path d="M7 2a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V4h2v2a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1H7zm6 6a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-3a1 1 0 0 0-1-1h-3zm-8 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 1 0 0-2H5v-2a1 1 0 0 0-1-1zm7 7a1 1 0 0 0-1 1v-2h-2a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 1 0-2 0v2z"/></svg>
            Fullscreen
            </button>
            <div class="nfc-map-title">Lead Locations Map</div>
            <div id="nfc-lead-map" class="nfc-mapbox"></div>
        </div>
        </div>

        <!-- Charts: Timeline -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Scans Per Day</div>
            <div class="chart-container"><canvas id="scansTimeline"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Leads Per Day</div>
            <div class="chart-container"><canvas id="leadsTimeline"></canvas></div>
        </div>
        </div>

        <!-- Charts: Top Cities -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Cities by Card Scans</div>
            <div class="chart-container"><canvas id="topScanCities"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Cities by NFC Card Leads</div>
            <div class="chart-container"><canvas id="topLeadCities"></canvas></div>
        </div>
        </div>

        <!-- Charts: Top Employees -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Employees by Card Scans</div>
            <div class="chart-container"><canvas id="topEmployeesScans"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Employees by NFC Card Leads</div>
            <div class="chart-container"><canvas id="topEmployeesLeads"></canvas></div>
        </div>
        </div>

        <!-- Charts: Monthly Volumes -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Monthly Scans Volume</div>
            <div class="chart-container"><canvas id="scansByMonth"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Monthly Leads Volume</div>
            <div class="chart-container"><canvas id="leadsByMonth"></canvas></div>
        </div>
        </div>

        <!-- Charts: Distributions -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">City-wise Scan Distribution</div>
            <div class="chart-container"><canvas id="scanDistribution"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">City-wise Lead Distribution</div>
            <div class="chart-container"><canvas id="leadDistribution"></canvas></div>
        </div>
        </div>
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Employee-wise Scan Distribution</div>
            <div class="chart-container"><canvas id="scanEmployeePie"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Employee-wise Lead Distribution</div>
            <div class="chart-container"><canvas id="leadEmployeePie"></canvas></div>
        </div>
        </div>

        <!-- Charts: Conversion -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Employees by Scan→Lead Conversion (%)</div>
            <div class="chart-container"><canvas id="top5EmployeeConversion"></canvas></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Top 5 Cities by Scan→Lead Conversion (%)</div>
            <div class="chart-container"><canvas id="top5CityConversion"></canvas></div>
        </div>
        </div>

        <!-- Zero Lists -->
        <div class="chart-row">
        <div class="nfc-chart-col">
            <div class="chart-title">Employees with Scans but No Leads</div>
            <div class="nfc-dashboard-card nfc-zero-table-card" id="zero-emp-list"></div>
        </div>
        <div class="nfc-chart-col">
            <div class="chart-title">Cities with Scans but No Leads</div>
            <div class="nfc-dashboard-card nfc-zero-table-card" id="zero-city-list"></div>
        </div>
        </div>

        <!-- Special Charts -->
        <div class="nfc-dashboard-card">
        <div class="chart-title">Scans Heatmap (Hour × Day)</div>
        <div class="chart-container"><canvas id="scanHeatmapBar"></canvas></div>
        </div>
        <div class="nfc-dashboard-card">
        <div class="chart-title">Monthly Scans by Employee (Stacked)</div>
        <div class="chart-container"><canvas id="monthlyEmpStacked"></canvas></div>
        </div>
        <div class="nfc-dashboard-card">
        <div class="chart-title">Employee Conversion (Scans vs Leads)</div>
        <div class="chart-container"><canvas id="empConversionBar"></canvas></div>
        </div>

        <!-- Fullscreen Overlay -->
        <div id="nfc-fs-overlay" class="nfc-fs-overlay" tabindex="0">
        <div class="nfc-fs-inner">
            <button class="nfc-fs-close-btn" id="nfc-fs-close-btn" title="Close">
            <svg viewBox="0 0 18 18"><path d="M6.17 6.17a.75.75 0 0 1 1.06 0L10 8.94l2.77-2.77a.75.75 0 1 1 1.06 1.06L11.06 10l2.77 2.77a.75.75 0 1 1-1.06 1.06L10 11.06l-2.77 2.77a.75.75 0 1 1-1.06-1.06L8.94 10l-2.77-2.77a.75.75 0 0 1 0-1.06z"/></svg>
            </button>
            <div id="nfc-fs-title" class="nfc-fs-title"></div>
            <div id="nfc-fs-body"></div>
        </div>
        </div>
        
    </div>
    `);

    // (JS logic is as in my previous answer: analytics, filter, metrics, charts, maps, and fullscreen only for maps)
    // --- Dependencies ---
    function loadScript(src) {
        return new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            document.head.appendChild(s);
        });
    }
    function loadCSS(href) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const l = document.createElement('link');
        l.rel = "stylesheet";
        l.href = href;
        document.head.appendChild(l);
    }
    
    loadCSS('https://unpkg.com/leaflet/dist/leaflet.css');
    loadCSS('https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css');
    loadCSS('https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css');
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    await loadScript('https://unpkg.com/leaflet/dist/leaflet.js');
    await loadScript('https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js');
    await loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2');
    if (typeof Chart !== "undefined" && typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
    }   

    

    // --- Frappe Filter Controls ---
    let filter_controls = {};
    let employee_options = [];
    function unique(arr) { return Array.from(new Set(arr.filter(Boolean))).sort(); }
    function setMetric(selector, value) { $(selector + ' .metric-value').text(value); }
    function getYearBoundaries() {
        const curYear = frappe.datetime.str_to_obj(frappe.datetime.get_today()).getFullYear();
        return { start: `${curYear}-01-01`, end: `${curYear}-12-31` };
    }
    async function fetchFilterOptions() {
        return new Promise(resolve => {
            frappe.call({
                method: "frappe.client.get_list",
                args: { doctype: "NFC Card Scan", fields: ["employee"], limit_page_length: 1000 },
                callback: function(res) {
                    employee_options = unique(res.message.map(d => d.employee));
                    resolve();
                }
            });
        });
    }
    async function setupFrappeControls() {
        await fetchFilterOptions();
        const $row = $('#nfc-filters').empty();
        filter_controls.from_date = frappe.ui.form.make_control({
            df: { fieldtype: "Date", fieldname: "from_date", placeholder: "From Date", reqd: 0, default: getYearBoundaries().start },
            parent: $row[0], render_input: true
        });
        filter_controls.to_date = frappe.ui.form.make_control({
            df: { fieldtype: "Date", fieldname: "to_date", placeholder: "To Date", reqd: 0, default: getYearBoundaries().end },
            parent: $row[0], render_input: true
        });
        filter_controls.employee = frappe.ui.form.make_control({
            df: { fieldtype: "Select", fieldname: "employee", placeholder: "Employee", options: ["All"].concat(employee_options) },
            parent: $row[0], render_input: true
        });
        $row.append(`
          <div class="nfc-filter-btn-wrap">
            <button type="submit" class="btn nfc-refresh-btn" id="nfc-refresh-btn" title="Refresh">
              <span>Refresh</span>
              <svg viewBox="0 0 20 20"><path d="M10 4V1L5 6l5 5V7c2.76 0 5 2.24 5 5a5 5 0 1 1-6.93-4.59.75.75 0 0 0-.67-1.34A6.5 6.5 0 1 0 16.5 12c0-3.31-2.69-6-6-6z"/></svg>
            </button>
            <button type="button" class="btn nfc-clear-btn" id="nfc-clear-btn" title="Clear Filters">
              <span>Clear</span>
              <svg viewBox="0 0 20 20"><path d="M6.17 6.17a.75.75 0 0 1 1.06 0L10 8.94l2.77-2.77a.75.75 0 1 1 1.06 1.06L11.06 10l2.77 2.77a.75.75 0 1 1-1.06 1.06L10 11.06l-2.77 2.77a.75.75 0 1 1-1.06-1.06L8.94 10l-2.77-2.77a.75.75 0 0 1 0-1.06z"/></svg>
            </button>
          </div>
        `);
        filter_controls.from_date.set_value(getYearBoundaries().start);
        filter_controls.to_date.set_value(getYearBoundaries().end);
        filter_controls.employee.set_value("All");
    }

    // --- Data Fetch, Analytics, Charts, and Maps ---
    let chartInstances = {}, mapInstances = {};
    function timelineData(records, dateField) {
        let data = {};
        records.forEach(r=>{
            let dt = r[dateField];
            if(dt) {
                data[dt] = (data[dt]||0)+1;
            }
        });
        let labels = Object.keys(data).sort();
        return {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: labels.map(l=>data[l]),
                borderColor: dateField==='scan_date'?'#2ed573':'#ee0979',
                backgroundColor: dateField==='scan_date'?'rgba(46,213,115,0.11)':'rgba(238,9,121,0.08)',
                tension: 0.4,
                fill: true
            }]
        };
    }
    function barChartData(records, key) {
        let data = {};
        records.forEach(r=>{ if(r[key]) data[r[key]]=(data[r[key]]||0)+1; });
        return data;
    }
    function byMonth(records, dateField) {
        let data = {};
        records.forEach(r=>{
            let dt = r[dateField];
            if(dt) { let m = dt.slice(0,7); data[m]=(data[m]||0)+1; }
        });
        let months = Object.keys(data).sort();
        if(records.length && months.length) {
            let y = (records[0][dateField]||'').slice(0,4);
            if (y) { months = []; for(let m=1;m<=12;m++) months.push(`${y}-${String(m).padStart(2,'0')}`); }
        }
        return { labels: months, values: months.map(m=>data[m]||0) };
    }
    async function fetchDataForBoth(filters, callback) {
        let scan_filters = [];
        let lead_filters = [];

        // Apply filters to both
        if (filters.from_date) {
            scan_filters.push(['scan_date', '>=', filters.from_date]);
            lead_filters.push(['scan_date', '>=', filters.from_date]);
        }
        if (filters.to_date) {
            scan_filters.push(['scan_date', '<=', filters.to_date]);
            lead_filters.push(['scan_date', '<=', filters.to_date]);
        }
        if (filters.employee) {
            scan_filters.push(['employee', '=', filters.employee]);
            lead_filters.push(['employee', '=', filters.employee]);
        }

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "NFC Card Scan",
                fields: ["*"],
                filters: scan_filters,
                order_by: "scan_date asc, scan_date asc",
                limit_page_length: 1000
            },
            callback: function(scanRes) {
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "NFC Card Lead",
                        fields: ["*"],
                        filters: lead_filters,
                        order_by: "scan_date asc, scan_date asc",
                        limit_page_length: 1000
                    },
                    callback: function(leadRes) {
                        callback(scanRes.message || [], leadRes.message || []);
                    }
                });
            }
        });
    }
    function handleAllAnalytics(scanData, leadData) {
        setMetric('#scan-total', scanData.length);
        setMetric('#scan-employees', unique(scanData.map(d=>d.employee)).length);
        setMetric('#scan-cities', unique(scanData.map(d=>d.city)).length);
        setMetric('#lead-total', leadData.length);
        setMetric('#lead-employees', unique(leadData.map(d=>d.employee)).length);
        setMetric('#lead-cities', unique(leadData.map(d=>d.city)).length);
		
        // Maps
    function drawMap(mapId, records, isLeadMap = false) {
    setTimeout(() => {
        const mapDiv = document.getElementById(mapId);
        if (!mapDiv) return;
        if (mapInstances[mapId]) { mapInstances[mapId].remove(); mapInstances[mapId] = null; }
        let map = L.map(mapDiv, { zoomControl: false }).setView([24.7136, 46.6753], 6);
        mapInstances[mapId] = map;

        // --- 1. Define base layers ---
        let baseLayers = {
            "Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap, &copy; CartoDB'
            }),
            "Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap, &copy; CartoDB'
            }),
            "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }),
            "Toner Lite": L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by Stamen Design'
            }),
            "OSM": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            })
        };

        // --- 2. Set default base layer ---
        baseLayers["OSM"].addTo(map);

        // --- 3. Add map controls ---
        L.control.zoom({ position: 'topright' }).addTo(map);
        L.control.scale({ position: 'bottomleft' }).addTo(map);

        // --- 4. Add base layer switcher UI ---
        L.control.layers(baseLayers, null, { position: 'topright' }).addTo(map);

        // --- 5. Add marker cluster and markers as before ---
        let cluster = L.markerClusterGroup();
        let bounds = [];

        records.forEach(rec => {
            if (rec.latitude && rec.longitude) {
                let popupHtml = isLeadMap
                    ? `<b>Employee:</b> ${rec.employee || '-'}<br>
                       <b>Customer:</b> ${rec.customer_name || '-'}<br>
                       <b>Phone:</b> ${rec.customer_phone || '-'}<br>
                       <b>City:</b> ${rec.city || '-'}<br>
                       <b>Date:</b> ${rec.scan_date || '-'}<br>
                       <b>Address:</b> ${rec.address || '-'}`
                    : `<b>Employee:</b> ${rec.employee || '-'}<br>
                       <b>City:</b> ${rec.city || '-'}<br>
                       <b>Date:</b> ${rec.scan_date || '-'}<br>
                       <b>Address:</b> ${rec.address || '-'}`;
                let marker = L.marker([rec.latitude, rec.longitude]).bindPopup(popupHtml);
                cluster.addLayer(marker);
                bounds.push([rec.latitude, rec.longitude]);
            }
        });
        map.addLayer(cluster);
        if (bounds.length) map.fitBounds(bounds, { padding: [35, 35] });

        // --- 6. Responsive resize (optional) ---
        function resizeMap() { map.invalidateSize(); }
        window.addEventListener('resize', resizeMap);

    }, 80);
}

        // Usage:
        drawMap('nfc-scan-map', scanData, false);
        drawMap('nfc-lead-map', leadData, true);


        // Charts
        function makeChart(id, config) {
            if (chartInstances[id]) chartInstances[id].destroy();
            chartInstances[id] = new Chart(document.getElementById(id).getContext('2d'), config);
        }
        makeChart('scansTimeline', {
            type: 'line',
            data: timelineData(scanData, 'scan_date'),
            options: {responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}}
        });
        makeChart('leadsTimeline', {
            type: 'line',
            data: timelineData(leadData, 'scan_date'),
            options: {responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}}
        });

        let scanCityData = barChartData(scanData, 'city');
        let topScanCities = Object.entries(scanCityData).sort((a,b)=>b[1]-a[1]).slice(0,5);
        makeChart('topScanCities', {
            type:'bar', data:{
                labels: topScanCities.map(x=>x[0]),
                datasets: [{ label:'Scan Count', data: topScanCities.map(x=>x[1]),
                    backgroundColor: ['#007cf0','#36d1c4','#ff6b6b','#ffc93c','#6c63ff']
                }]
            }, options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{beginAtZero:true}} }
        });
        let leadCityData = barChartData(leadData, 'city');
        let topLeadCities = Object.entries(leadCityData).sort((a,b)=>b[1]-a[1]).slice(0,5);
        makeChart('topLeadCities', {
            type:'bar', data:{
                labels: topLeadCities.map(x=>x[0]),
                datasets: [{ label:'Lead Count', data: topLeadCities.map(x=>x[1]),
                    backgroundColor: ['#ee0979','#007cf0','#ffc93c','#ff6b6b','#4ecdc4']
                }]
            }, options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{beginAtZero:true}} }
        });

        let scanEmpData = barChartData(scanData, 'employee');
        let topEmpScans = Object.entries(scanEmpData).sort((a,b)=>b[1]-a[1]).slice(0,5);
        makeChart('topEmployeesScans', {
            type:'bar', data:{
                labels: topEmpScans.map(x=>x[0]),
                datasets: [{ label:'Scan Count', data: topEmpScans.map(x=>x[1]),
                    backgroundColor:['#50a3ff','#4ecdc4','#ff6b6b','#ffc93c','#6c63ff']
                }]
            }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{beginAtZero:true}} }
        });
        let leadEmpData = barChartData(leadData, 'employee');
        let topEmpLeads = Object.entries(leadEmpData).sort((a,b)=>b[1]-a[1]).slice(0,5);
        makeChart('topEmployeesLeads', {
            type:'bar', data:{
                labels: topEmpLeads.map(x=>x[0]), datasets:[{
                    label:'Lead Count', data:topEmpLeads.map(x=>x[1]),
                    backgroundColor:['#ee0979','#007cf0','#ffc93c','#ff6b6b','#4ecdc4']
                }]
            }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{beginAtZero:true}} }
        });

        let scanMonth = byMonth(scanData, 'scan_date');
        makeChart('scansByMonth', {
            type:'bar', data:{labels:scanMonth.labels, datasets:[{label:'Monthly Scans',data:scanMonth.values,backgroundColor:'#50a3ff'}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
        });
        let leadMonth = byMonth(leadData, 'scan_date');
        makeChart('leadsByMonth', {
            type:'bar', data:{labels:leadMonth.labels, datasets:[{label:'Monthly Leads',data:leadMonth.values,backgroundColor:'#ee0979'}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
        });

        makeChart('scanDistribution', {
            type:'doughnut', data:{
                labels: Object.keys(scanCityData),
                datasets: [{ data:Object.values(scanCityData), backgroundColor:[
                    '#ff6b6b', '#4ecdc4', '#50a3ff', '#ffc93c', '#6c63ff',
                    '#36d1c4', '#ee0979', '#f9d423', '#e17055', '#5f27cd'
                ] }]
            },
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right'},datalabels: { display: false }, tooltip:{callbacks:{
                label: (ctx) => `${ctx.label}: ${ctx.raw} (${((ctx.raw * 100) / scanData.length).toFixed(1)}%)`
            }}}}
        });
        makeChart('leadDistribution', {
            type:'doughnut', data:{
                labels: Object.keys(leadCityData),
                datasets: [{ data:Object.values(leadCityData), backgroundColor:[
                    '#ee0979', '#007cf0', '#ffc93c', '#ff6b6b', '#4ecdc4',
                    '#36d1c4', '#f9d423', '#e17055', '#5f27cd','#50a3ff'
                ] }]
            },
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'right'},datalabels: { display: false }, tooltip:{callbacks:{
                label: (ctx) => `${ctx.label}: ${ctx.raw} (${((ctx.raw * 100) / leadData.length).toFixed(1)}%)`
            }}}}
        });

        let empScanPie = barChartData(scanData, 'employee');
        makeChart('scanEmployeePie', {
            type:'doughnut', data:{
                labels: Object.keys(empScanPie),
                datasets: [{
                    data: Object.values(empScanPie),
                    backgroundColor: [
                        '#50a3ff','#ee0979','#4ecdc4','#ffc93c','#6c63ff',
                        '#36d1c4','#ff6b6b','#f9d423','#e17055','#5f27cd'
                    ]
                }]
            }, options:{
                responsive:true, maintainAspectRatio:false,
                plugins:{legend:{position:'right'},datalabels: { display: false }, tooltip:{callbacks:{
                    label: (ctx) => `${ctx.label}: ${ctx.raw} (${((ctx.raw * 100) / scanData.length).toFixed(1)}%)`
                }}}
            }
        });
        let empLeadPie = barChartData(leadData, 'employee');
        makeChart('leadEmployeePie', {
            type:'doughnut', data:{
                labels: Object.keys(empLeadPie),
                datasets: [{
                    data: Object.values(empLeadPie),
                    backgroundColor: [
                        '#ee0979','#50a3ff','#4ecdc4','#ffc93c','#6c63ff',
                        '#36d1c4','#ff6b6b','#f9d423','#e17055','#5f27cd'
                    ]
                }]
            }, options:{
                responsive:true, maintainAspectRatio:false,
                plugins:{legend:{position:'right'},datalabels: { display: false }, tooltip:{callbacks:{
                    label: (ctx) => `${ctx.label}: ${ctx.raw} (${((ctx.raw * 100) / leadData.length).toFixed(1)}%)`
                }}}
            }
        });

        // --- EMPLOYEE CONVERSION ---
        let scanEmpCounts = barChartData(scanData, 'employee');
        let leadEmpCounts = barChartData(leadData, 'employee');
        let employeeNames = unique(Object.keys({...scanEmpCounts, ...leadEmpCounts}));
        let empConversion = employeeNames.map(emp => {
            let scans = scanEmpCounts[emp] || 0;
            let leads = leadEmpCounts[emp] || 0;
            return scans > 0 ? (leads / scans) * 100 : 0;
        });


        // --- CITY CONVERSION ---
        let scanCityCounts = barChartData(scanData, 'city');
        let leadCityCounts = barChartData(leadData, 'city');
        let cityNames = unique(Object.keys({...scanCityCounts, ...leadCityCounts}));
        let cityConversion = cityNames.map(city => {
            let scans = scanCityCounts[city] || 0;
            let leads = leadCityCounts[city] || 0;
            return scans > 0 ? (leads / scans) * 100 : 0;
        });

        // Top 5 Employees by Scan→Lead Conversion (%)
        const allEmployees = unique([...Object.keys(scanEmpCounts), ...Object.keys(leadEmpCounts)]);
        const employeeConversions = allEmployees
        .map(emp => ({
            emp,
            scans: scanEmpCounts[emp] || 0,
            leads: leadEmpCounts[emp] || 0,
            conv: (scanEmpCounts[emp] ? ((leadEmpCounts[emp] || 0) / scanEmpCounts[emp] * 100) : 0)
        }))
        .filter(e => e.scans > 0)
        .sort((a, b) => b.conv - a.conv)
        .slice(0, 5);

        makeChart('top5EmployeeConversion', {
        type: 'bar',
        data: {
            labels: employeeConversions.map(e => e.emp),
            datasets: [{
            label: 'Conversion Rate (%)',
            data: employeeConversions.map(e => +e.conv.toFixed(2)),
            backgroundColor: [
                '#007cf0', '#36d1c4', '#ff6b6b', '#ffc93c', '#6c63ff'
            ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
            },
            scales: {
            x: { min: 0, max: 100, title: { display: true, text: '%' } }
            }
        }
        });

        // Get all unique cities with either scans or leads
        const allCities = unique([...Object.keys(scanCityCounts), ...Object.keys(leadCityCounts)]);

        // Calculate conversion rate for each city
        const cityConversions = allCities
        .map(city => ({
            city,
            scans: scanCityCounts[city] || 0,
            leads: leadCityCounts[city] || 0,
            conv: (scanCityCounts[city] ? ((leadCityCounts[city] || 0) / scanCityCounts[city] * 100) : 0)
        }))
        .filter(c => c.scans > 0) // Only show cities with at least 1 scan
        .sort((a, b) => b.conv - a.conv) // Sort by conversion rate descending
        .slice(0, 5); // Top 5

        makeChart('top5CityConversion', {
        type: 'bar',
        data: {
            labels: cityConversions.map(c => c.city),
            datasets: [{
            label: 'Conversion Rate (%)',
            data: cityConversions.map(c => +c.conv.toFixed(2)),
            backgroundColor: [
                '#ee0979', '#007cf0', '#ffc93c', '#ff6b6b', '#4ecdc4'
            ]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
            },
            scales: {
            x: { min: 0, max: 100, title: { display: true, text: '%' } }
            }
        }
        });

        const zeroEmp = allEmployees
        .filter(emp => (scanEmpCounts[emp] || 0) > 0 && !(leadEmpCounts[emp] > 0))
        .sort((a, b) => (scanEmpCounts[b]||0)-(scanEmpCounts[a]||0));
        $('#zero-emp-list').html(
        zeroEmp.length
            ? `
            <div class="nfc-zero-table-summary">
                <span><b>${zeroEmp.length}</b> employee${zeroEmp.length>1?'s':''} with scans but no leads</span>
            </div>
            <table class="nfc-zero-table nfc-zero-table-emp">
                <thead>
                <tr>
                    <th style="width:70%;">Employee</th>
                    <th style="width:30%;text-align:right;">Scans</th>
                </tr>
                </thead>
                <tbody>
                ${zeroEmp.map(emp => `
                    <tr>
                    <td><span class="nfc-emp-pill">${frappe.utils.escape_html(emp)}</span></td>
                    <td style="text-align:right;">
                        <span class="nfc-zero-badge">
                        <svg viewBox="0 0 20 20"><path d="M16.707 7.293a1 1 0 00-1.414 0L9 13.586l-2.793-2.793a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"/></svg>
                        ${scanEmpCounts[emp] || 0}
                        </span>
                    </td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
            `
            : `<div class="nfc-zero-none"><span style="font-size:2em;">✅</span><br>None</div>`
        );

        const zeroCity = allCities
        .filter(city => (scanCityCounts[city] || 0) > 0 && !(leadCityCounts[city] > 0))
        .sort((a, b) => (scanCityCounts[b]||0)-(scanCityCounts[a]||0));
        $('#zero-city-list').html(
        zeroCity.length
            ? `
            <div class="nfc-zero-table-summary">
                <span><b>${zeroCity.length}</b> cit${zeroCity.length===1?'y':'ies'} with scans but no leads</span>
            </div>
            <table class="nfc-zero-table nfc-zero-table-city">
                <thead>
                <tr>
                    <th style="width:70%;">City</th>
                    <th style="width:30%;text-align:right;">Scans</th>
                </tr>
                </thead>
                <tbody>
                ${zeroCity.map(city => `
                    <tr>
                    <td><span class="nfc-city-pill">${frappe.utils.escape_html(city)}</span></td>
                    <td style="text-align:right;">
                        <span class="nfc-zero-badge">
                        <svg viewBox="0 0 20 20"><path d="M16.707 7.293a1 1 0 00-1.414 0L9 13.586l-2.793-2.793a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"/></svg>
                        ${scanCityCounts[city] || 0}
                        </span>
                    </td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
            `
            : `<div class="nfc-zero-none"><span style="font-size:2em;">✅</span><br>None</div>`
        );

        // Days and colors
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const dayColors = ['#007cf0','#36d1c4','#ffc93c','#ee0979','#ff6b6b','#a2a9b5','#6c63ff'];

        const hourColors = [
            '#007cf0', '#36d1c4', '#ffc93c', '#ee0979', '#ff6b6b',
            '#a2a9b5', '#6c63ff', '#19cd5b', '#ff8c42', '#4ecdc4', '#22223b'
            ];
        const hourRange = Array.from({length: 11}, (_, i) => i + 8); // [8, 9, ..., 18]

        // Count scans: dayHourCounts[day][hour]
        const dayHourCounts = Array.from({length: 7}, () => Array(24).fill(0));
        scanData.forEach(r => {
            if (r.scan_date && r.scan_time) {
                let dt = frappe.datetime.str_to_obj(`${r.scan_date} ${r.scan_time}`);
                let day = dt.getDay();     // 0 (Sunday) to 6 (Saturday)
                let hour = dt.getHours();  // 0-23
                if (hour >= 8 && hour <= 18) {
                    dayHourCounts[day][hour]++;
                }
            }
        });

        // Datasets: one per hour, with datalabels config
        const datasets = hourRange.map((hour, i) => ({
            label: hour.toString().padStart(2,'0') + ":00",
            data: days.map((_, dayIdx) => dayHourCounts[dayIdx][hour]),
            backgroundColor: hourColors[i % hourColors.length],
            datalabels: {
                color: '#fff',
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 10
                },
                display: function(context) {
                    return context.dataset.data[context.dataIndex] > 0;
                },
                formatter: function(value, context) {
                    return context.dataset.label;
                }
            }
        }));

        const labels = days;

        // Register datalabels plugin if using Chart.js 3+
        if (typeof Chart !== "undefined" && typeof ChartDataLabels !== "undefined") {
            Chart.register(ChartDataLabels);
        }

        makeChart('scanHeatmapBar', {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', maxHeight: 400 },
                    datalabels: {
                        // These are global defaults; per dataset above will override
                        anchor: 'center',
                        align: 'center',
                        font: {
                            weight: 'bold',
                            size: 10
                        },
                        color: '#fff'
                    }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            },
            plugins: [typeof ChartDataLabels !== "undefined" ? ChartDataLabels : undefined].filter(Boolean)
        });

        function unique(arr) { return [...new Set(arr)]; }
        const monthSet = unique(scanData.map(x=>(x.scan_date||'').slice(0,7))).sort();
        const empSet = unique(scanData.map(x=>x.employee));
        const empMonth = {};
        empSet.forEach(emp => empMonth[emp] = monthSet.map(m =>
        scanData.filter(x => x.employee===emp && (x.scan_date||'').slice(0,7)===m).length
        ));
        const empColors = ['#007cf0','#36d1c4','#ffc93c','#6c63ff','#ee0979','#ff6b6b','#a2a9b5','#19cd5b'];
        makeChart('monthlyEmpStacked', {
        type: 'bar',
        data: {
            labels: monthSet,
            datasets: empSet.map((emp, i) => ({
            label: emp,
            data: empMonth[emp],
            backgroundColor: empColors[i % empColors.length]
            }))
        },
        options: {
            responsive:true, maintainAspectRatio:false,
            plugins:{legend:{display:true,position:'top'},datalabels: { display: false }},
            scales: { x: {stacked:true}, y: {stacked:true, beginAtZero:true}}
        }
        });

        const employees = unique([...scanData.map(x=>x.employee), ...leadData.map(x=>x.employee)]);
        const scanCounts = employees.map(emp => scanData.filter(x=>x.employee===emp).length);
        const leadCounts = employees.map(emp => leadData.filter(x=>x.employee===emp).length);
        makeChart('empConversionBar', {
        type: 'bar',
        data: {
            labels: employees,
            datasets: [
            { label: 'Scans', data: scanCounts, backgroundColor: '#007cf0' },
            { label: 'Leads', data: leadCounts, backgroundColor: '#36d1c4' }
            ]
        },
        options: {
            responsive:true, maintainAspectRatio:false,
            plugins:{legend:{position:'top'},datalabels: { display: false }},
            scales: { x: { stacked:false }, y: { beginAtZero:true } }
        }
        });



    }

    function getFilterValues() {
        return {
            from_date: filter_controls.from_date.get_value(),
            to_date: filter_controls.to_date.get_value(),
            employee: filter_controls.employee.get_value() != "All" ? filter_controls.employee.get_value() : ""
        };
    }

    await setupFrappeControls();
    fetchDataForBoth(getFilterValues(), handleAllAnalytics);

    $wrapper.on('submit', '#filter-form', function(e){
        e.preventDefault();
        fetchDataForBoth(getFilterValues(), handleAllAnalytics);
    });
    $wrapper.on('click', '#nfc-clear-btn', function(e){
        e.preventDefault();
        filter_controls.from_date.set_value(getYearBoundaries().start);
        filter_controls.to_date.set_value(getYearBoundaries().end);
        filter_controls.employee.set_value("All");
        fetchDataForBoth(getFilterValues(), handleAllAnalytics);
    });

    // --- Fullscreen logic for all charts/maps ---
    let fsChart = null;
    function getCardTitleById(id) {
        let map = {
            'nfc-scan-map': 'Scan Locations Map ',
            'nfc-lead-map': 'Lead Locations Map ',
            'scansTimeline': 'Scans Per Day ',
            'leadsTimeline': 'Leads Per Day ',
            'topScanCities': 'Top 5 Cities by Card Scans',
            'topLeadCities': 'Top 5 Cities by NFC Card Leads',
            'topEmployeesScans': 'Top 5 Employees by Card Scans',
            'topEmployeesLeads': 'Top 5 Employees by NFC Card Leads',
            'scansByMonth': 'Monthly Scans Volume ',
            'leadsByMonth': 'Monthly Leads Volume ',
            'scanDistribution': 'City-wise Scan Distribution',
            'leadDistribution': 'City-wise Lead Distribution',
            'scanEmployeePie': 'Employee-wise Scan Distribution',
            'leadEmployeePie': 'Employee-wise Lead Distribution'
        };
        return map[id] || id;
    }

    $wrapper.on('click', '.nfc-fs-btn', function(e){
            e.preventDefault();
            let id = $(this).data('fsid');
            let $overlay = $('#nfc-fs-overlay');
            let $body = $('#nfc-fs-body').empty();
            $('#nfc-fs-title').text(getCardTitleById(id));
            $overlay.addClass('active').focus();
            $body.append('<div class="nfc-fs-map"></div>');

            setTimeout(() => {
                // --- 1. Prepare base layers ---
                let baseLayers = {
                    "Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; OpenStreetMap, &copy; CartoDB'
                    }),
                    "Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; OpenStreetMap, &copy; CartoDB'
                    }),
                    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Tiles &copy; Esri'
                    }),
                    "Toner Lite": L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
                        attribution: 'Map tiles by Stamen Design'
                    }),
                    "OSM": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    })
                };

                // --- 2. Create fullscreen map ---
                let origMap = mapInstances[id];
                let center = [24.7136, 46.6753], zoom = 6;
                if (origMap) {
                    center = origMap.getCenter();
                    zoom = origMap.getZoom();
                }
                let fsMap = L.map($body.find('.nfc-fs-map')[0], { zoomControl: false }).setView(center, zoom);
                baseLayers["OSM"].addTo(fsMap);

                // --- 3. Add controls ---
                L.control.zoom({ position: 'topright' }).addTo(fsMap);
                L.control.scale({ position: 'bottomleft' }).addTo(fsMap);
                // Add the base layer switcher (this is the important part!)
                L.control.layers(baseLayers, null, { position: 'topright' }).addTo(fsMap);

                // --- 4. (Optional) Add markers/clusters from your original map ---
                if (origMap && origMap._layers) {
                    let allMarkers = [];
                    for (let k in origMap._layers) {
                        let layer = origMap._layers[k];
                        if (layer instanceof L.MarkerClusterGroup) {
                            layer.eachLayer(function(marker){
                                let latlng = marker.getLatLng();
                                let popupContent = marker.getPopup() ? marker.getPopup().getContent() : "";
                                let m = L.marker(latlng).bindPopup(popupContent);
                                allMarkers.push(m);
                            });
                        }
                    }
                    let fsCluster = L.markerClusterGroup();
                    allMarkers.forEach(m => fsCluster.addLayer(m));
                    fsMap.addLayer(fsCluster);
                    if (allMarkers.length) {
                        let group = L.featureGroup(allMarkers);
                        fsMap.fitBounds(group.getBounds(), {padding: [35,35]});
                    }
                }

                // Resize fix for fullscreen
                setTimeout(() => fsMap.invalidateSize(), 200);

            }, 60);
        });
    $wrapper.on('click', '#nfc-fs-close-btn', function(e){
        e.preventDefault();
        $('#nfc-fs-overlay').removeClass('active');
        $('#nfc-fs-body').empty();
        if (fsChart && fsChart.destroy) { fsChart.destroy(); fsChart = null; }
    });
    $(document).on('keydown', function(e){
        if(e.key === "Escape") {
            $('#nfc-fs-overlay').removeClass('active');
            $('#nfc-fs-body').empty();
            if (fsChart && fsChart.destroy) { fsChart.destroy(); fsChart = null; }
        }
    });
};