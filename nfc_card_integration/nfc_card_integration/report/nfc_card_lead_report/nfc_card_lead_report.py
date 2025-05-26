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
        {"fieldname": "name", "label": "Lead Name", "fieldtype": "Link", "options": "NFC Card Lead", "width": 150},
        {"fieldname": "nfc_card", "label": "NFC Card", "fieldtype": "Link", "options": "NFC Card", "width": 120},
        {"fieldname": "customer_name", "label": "Customer Name", "fieldtype": "Data", "width": 140},
        {"fieldname": "customer_phone", "label": "Customer Phone", "fieldtype": "Data", "width": 120},
        {"fieldname": "customer_email", "label": "Customer Email", "fieldtype": "Data", "width": 150},
        {"fieldname": "customer_company", "label": "Customer Company", "fieldtype": "Data", "width": 120},
        {"fieldname": "sent_email", "label": "Email Sent?", "fieldtype": "Check", "width": 70},
        {"fieldname": "scan_time", "label": "Scan Time", "fieldtype": "Datetime", "width": 160},
        {"fieldname": "latitude", "label": "Latitude", "fieldtype": "Float", "width": 110},
        {"fieldname": "longitude", "label": "Longitude", "fieldtype": "Float", "width": 110},
        {"fieldname": "address", "label": "Address", "fieldtype": "Data", "width": 200},
        {"fieldname": "road", "label": "Road", "fieldtype": "Data", "width": 150},
        {"fieldname": "city", "label": "City", "fieldtype": "Data", "width": 120},
        {"fieldname": "state", "label": "State", "fieldtype": "Data", "width": 120},
        {"fieldname": "country", "label": "Country", "fieldtype": "Data", "width": 100},
        {"fieldname": "postal_code", "label": "Postal Code", "fieldtype": "Data", "width": 100},
    ]

def get_data(filters):
    conditions = []
    values = {}

    if filters.get("nfc_card"):
        conditions.append("nfc_card LIKE %(nfc_card)s")
        values["nfc_card"] = "%" + filters.get("nfc_card") + "%"

    if filters.get("from_date"):
        conditions.append("creation >= %(from_date)s")
        values["from_date"] = filters.get("from_date")

    if filters.get("to_date"):
        conditions.append("creation <= %(to_date)s")
        values["to_date"] = filters.get("to_date")

    where = " AND ".join(conditions)
    if where:
        where = "WHERE " + where

    data = frappe.db.sql(f"""
        SELECT
            name, employee, nfc_card, customer_name, customer_phone, customer_email,
            customer_company, sent_email, creation AS scan_time,
            latitude, longitude, address, road, city, state, country, postal_code
        FROM `tabNFC Card Lead`
        {where}
        ORDER BY creation DESC
    """, values, as_dict=True)

    return data

def get_dashboard_chart(data):
    emp_counts = {}
    for d in data:
        emp = d.get('employee') or "-"
        emp_counts[emp] = emp_counts.get(emp, 0) + 1

    chart = {
        "data": {
            "labels": list(emp_counts.keys()),
            "datasets": [
                {"name": "Lead Count", "values": list(emp_counts.values())}
            ]
        },
        "type": "bar",
        "colors": ["#ffa00a"],
        "barOptions": {"stacked": False}
    }
    return chart

def get_report_summary(data):
    total_leads = len(data)
    unique_employees = len(set(d['employee'] for d in data if d.get('employee')))
    unique_companies = len(set(d['customer_company'] for d in data if d.get('customer_company')))
    return [
        {"label": "Total Leads", "value": total_leads, "indicator": "Blue"},
        {"label": "Unique Employees", "value": unique_employees, "indicator": "Green"},
        {"label": "Unique Companies", "value": unique_companies, "indicator": "Orange"},
    ]

def get_map_html(data):
    points = []
    for d in data:
        if d.get('latitude') and d.get('longitude'):
            label = (
                f"<b>{d.get('customer_name') or ''}</b><br>"
                f"<b>Employee:</b> {d.get('employee') or ''}<br>"
                f"<b>Company:</b> {d.get('customer_company') or ''}<br>"
                f"<b>Phone:</b> {d.get('customer_phone') or ''}<br>"
                f"<b>Email:</b> {d.get('customer_email') or ''}<br>"
                f"<b>Address:</b> {d.get('address') or ''}<br>"
                f"<b>Time:</b> {d.get('scan_time') or ''}"
            )
            points.append({"lat": float(d['latitude']), "lng": float(d['longitude']), "label": label})

    if not points:
        return "<div>No lead locations to map.</div>"

    map_points_json = json.dumps(points)
    return f"""
    <div id="nfc_lead_map" style="height:400px;width:100%;"></div>
    <script>
    (function() {{
        var points = {map_points_json};
        function showMap() {{
            function drawMap() {{
                if (window.nfcLeadMapInstance) window.nfcLeadMapInstance.remove();
                var center = points.length ? [points[0].lat, points[0].lng] : [24.7, 46.7];
                var map = L.map('nfc_lead_map').setView(center, 11);
                window.nfcLeadMapInstance = map;
                L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }}).addTo(map);

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
