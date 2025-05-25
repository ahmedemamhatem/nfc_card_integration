# Copyright (c) 2025, Ahmed Emam and contributors
# For license information, please see license.txt

import frappe
import json

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    chart = get_dashboard_chart(data)
    report_summary = get_report_summary(data)
    map_html = get_map_html(data)
    return columns, data, map_html, chart, report_summary

def get_columns():
    return [
        {"fieldname": "name", "label": "Scan Name", "fieldtype": "Link", "options": "NFC Card Scan", "width": 150},
        {"fieldname": "nfc_card", "label": "NFC Card", "fieldtype": "Link", "options": "NFC Card", "width": 120},
        {"fieldname": "employee", "label": "Employee Name", "fieldtype": "Data", "width": 150},
        {"fieldname": "card_id", "label": "Card ID", "fieldtype": "Data", "width": 140},
        {"fieldname": "scan_time", "label": "Scan Time", "fieldtype": "Datetime", "width": 160},
        {"fieldname": "latitude", "label": "Latitude", "fieldtype": "Float", "width": 110},
        {"fieldname": "longitude", "label": "Longitude", "fieldtype": "Float", "width": 110},

    ]

def get_data(filters):
    conditions = []
    values = {}

    if filters.get("nfc_card"):
        conditions.append("nfc_card = %(nfc_card)s")
        values["nfc_card"] = filters.get("nfc_card")

    if filters.get("card_id"):
        conditions.append("card_id = %(card_id)s")
        values["card_id"] = filters.get("card_id")

    if filters.get("employee"):
        # Match both the field and linked employee
        conditions.append("(employee = %(employee)s OR employee = %(employee)s)")
        values["employee"] = filters.get("employee")

    if filters.get("from_date"):
        conditions.append("scan_time >= %(from_date)s")
        values["from_date"] = filters.get("from_date")

    if filters.get("to_date"):
        conditions.append("scan_time <= %(to_date)s")
        values["to_date"] = filters.get("to_date")

    where = " AND ".join(conditions)
    if where:
        where = "WHERE " + where

    # Assumes your doctype has employee as either a link or data field
    data = frappe.db.sql(f"""
        SELECT
            name, nfc_card,
            COALESCE(employee, employee) AS employee,
            card_id, scan_time, latitude, longitude, owner, creation
        FROM `tabNFC Card Scan`
        {where}
        ORDER BY scan_time DESC
        """, values, as_dict=True)
    return data

def get_dashboard_chart(data):
    # Count scans per employee
    emp_counts = {}
    for d in data:
        emp = d.get('employee') or d.get('nfc_card') or "-"
        emp_counts[emp] = emp_counts.get(emp, 0) + 1

    chart = {
        "data": {
            "labels": list(emp_counts.keys()),
            "datasets": [
                {"nfc_card": "Scan Count", "values": list(emp_counts.values())}
            ]
        },
        "type": "bar",
        "colors": ["#5e64ff"],
        "barOptions": {
            "stacked": False
        }
    }
    return chart

def get_report_summary(data):
    total_scans = len(data)
    unique_employees = len(set([d['employee'] for d in data if d.get('employee')]))
    unique_cards = len(set([d['card_id'] for d in data if d.get('card_id')]))
    return [
        {"label": "Total Scans", "value": total_scans, "indicator": "Blue"},
        {"label": "Unique Employees", "value": unique_employees, "indicator": "Green"},
        {"label": "Unique Cards Scanned", "value": unique_cards, "indicator": "Orange"},
    ]

def get_map_html(data):
    # Prepare scan points
    points = []
    for d in data:
        if d.get('latitude') and d.get('longitude'):
            points.append({
                "lat": float(d['latitude']),
                "lng": float(d['longitude']),
                "label": (
                    (d.get('employee') or d.get('nfc_card') or '') +
                    "<br><b>Card:</b> " + (d.get('card_id') or '') +
                    "<br><b>Time:</b> " + (str(d.get('scan_time')) or '')
                )
            })
    if not points:
        return "<div>No scan locations to map.</div>"

    map_points_json = json.dumps(points)
    # Dashboard HTML with in-place cluster map
    return f"""
    <div id="nfc_scan_map" style="height:400px;width:100%;"></div>
    <script>
    (function() {{
        var points = {map_points_json};
        function showMap() {{
            function drawMap() {{
                if (window.nfcScanMapInstance) {{ window.nfcScanMapInstance.remove(); }}
                var center = points.length ? [points[0].lat, points[0].lng] : [24.7, 46.7];
                var map = L.map('nfc_scan_map').setView(center, 11);
                window.nfcScanMapInstance = map;
                L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }}).addTo(map);
                // Always cluster if >1 point
                if (points.length > 1 && window.L && window.L.markerClusterGroup) {{
                    var markers = L.markerClusterGroup();
                    points.forEach(function(pt) {{
                        var marker = L.marker([pt.lat, pt.lng]).bindPopup(pt.label);
                        markers.addLayer(marker);
                    }});
                    map.addLayer(markers);
                    var bounds = markers.getBounds();
                    if (bounds.isValid()) map.fitBounds(bounds, {{padding: [30, 30]}});
                }} else {{
                    var bounds = [];
                    points.forEach(function(pt) {{
                        var marker = L.marker([pt.lat, pt.lng]).addTo(map).bindPopup(pt.label);
                        bounds.push([pt.lat, pt.lng]);
                    }});
                    if (bounds.length > 1) map.fitBounds(bounds, {{padding: [30, 30]}});
                }}
            }}
            // Load Leaflet & cluster plugin if not loaded
            function load_once(type, url, cb) {{
                let tag, already = false;
                if (type === 'css') {{
                    already = !!document.querySelector(`link[href="${{url}}"]`);
                    if (!already) {{
                        tag = document.createElement('link');
                        tag.rel = "stylesheet";
                        tag.href = url;
                        document.head.appendChild(tag);
                    }}
                    if (cb) cb();
                }} else {{
                    already = !!document.querySelector(`script[src="${{url}}"]`);
                    if (!already) {{
                        tag = document.createElement('script');
                        tag.src = url;
                        tag.onload = cb;
                        document.body.appendChild(tag);
                    }} else if (cb) cb();
                }}
            }}
            load_once('css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            load_once('css', 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css');
            load_once('css', 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css');
            load_once('js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', function() {{
                load_once('js', 'https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js', drawMap);
            }});
        }}
        setTimeout(showMap, 200);
    }})();
    </script>
    """