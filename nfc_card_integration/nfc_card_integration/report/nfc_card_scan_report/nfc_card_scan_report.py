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
        {"fieldname": "address_line", "label": "Address Line", "fieldtype": "Data", "width": 250},
        {"fieldname": "city", "label": "City", "fieldtype": "Data", "width": 130},
        {"fieldname": "state", "label": "State", "fieldtype": "Data", "width": 130},
        {"fieldname": "postal_code", "label": "postal_code", "fieldtype": "Data", "width": 130},
    ]

def get_data(filters):
    conditions = []
    values = {}

    if filters.get("nfc_card"):
        conditions.append("nfc_card LIKE %(nfc_card)s")
        values["nfc_card"] = f"%{filters['nfc_card']}%"

    if filters.get("card_id"):
        conditions.append("card_id LIKE %(card_id)s")
        values["card_id"] = f"%{filters['card_id']}%"

    if filters.get("employee"):
        conditions.append("(employee LIKE %(employee)s OR employee LIKE %(employee)s)")
        values["employee"] = f"%{filters['employee']}%"

    if filters.get("from_date"):
        conditions.append("scan_time >= %(from_date)s")
        values["from_date"] = filters["from_date"]

    if filters.get("to_date"):
        conditions.append("scan_time <= %(to_date)s")
        values["to_date"] = filters["to_date"]

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

    return frappe.db.sql(f"""
        SELECT
            name, nfc_card,
            COALESCE(employee, employee) AS employee,
            card_id, scan_time,
            address_line, city, state, postal_code,
            latitude, longitude, owner, creation
        FROM `tabNFC Card Scan`
        {where_clause}
        ORDER BY scan_time DESC
    """, values, as_dict=True)

def get_dashboard_chart(data):
    counts = {}
    for row in data:
        key = row.get("employee") or row.get("nfc_card") or "-"
        counts[key] = counts.get(key, 0) + 1

    return {
        "data": {
            "labels": list(counts.keys()),
            "datasets": [{"name": "Scan Count", "values": list(counts.values())}]
        },
        "type": "bar",
        "colors": ["#5e64ff"],
        "barOptions": {"stacked": False}
    }

def get_report_summary(data):
    return [
        {"label": "Total Scans", "value": len(data), "indicator": "Blue"},
        {"label": "Unique Employees", "value": len(set(d["employee"] for d in data if d.get("employee"))), "indicator": "Green"},
        {"label": "Unique Cards Scanned", "value": len(set(d["card_id"] for d in data if d.get("card_id"))), "indicator": "Orange"},
    ]

def get_map_html(data):
    points = []
    for d in data:
        if d.get("latitude") and d.get("longitude"):
            label = (
                f"{d.get('employee') or d.get('nfc_card') or ''}"
                f"<br><b>Card:</b> {d.get('card_id') or ''}"
                f"<br><b>Time:</b> {d.get('scan_time') or ''}"
                f"<br><b>Address:</b> {d.get('address_line') or ''}"
            )
            points.append({
                "lat": float(d["latitude"]),
                "lng": float(d["longitude"]),
                "label": label
            })

    if not points:
        return "<div>No scan locations to map.</div>"

    map_json = json.dumps(points)
    return f"""
    <div id="nfc_scan_map" style="height:400px;width:100%;"></div>
    <script>
    (function() {{
        var points = {map_json};
        function showMap() {{
            function drawMap() {{
                if (window.nfcScanMapInstance) window.nfcScanMapInstance.remove();
                var center = points.length ? [points[0].lat, points[0].lng] : [24.7, 46.7];
                var map = L.map('nfc_scan_map').setView(center, 11);
                window.nfcScanMapInstance = map;
                L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }}).addTo(map);
                var markers = (points.length > 1 && L.markerClusterGroup) ? L.markerClusterGroup() : null;
                points.forEach(function(pt) {{
                    var marker = L.marker([pt.lat, pt.lng]).bindPopup(pt.label);
                    if (markers) {{
                        markers.addLayer(marker);
                    }} else {{
                        marker.addTo(map);
                    }}
                }});
                if (markers) {{
                    map.addLayer(markers);
                    var bounds = markers.getBounds();
                    if (bounds.isValid()) map.fitBounds(bounds, {{padding: [30, 30]}});
                }}
            }}
            function load_once(type, url, cb) {{
                if (type === 'css') {{
                    if (!document.querySelector(`link[href="${{url}}"]`)) {{
                        var link = document.createElement('link');
                        link.rel = "stylesheet"; link.href = url;
                        document.head.appendChild(link);
                    }}
                    cb && cb();
                }} else {{
                    if (!document.querySelector(`script[src="${{url}}"]`)) {{
                        var script = document.createElement('script');
                        script.src = url; script.onload = cb;
                        document.body.appendChild(script);
                    }} else cb && cb();
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
