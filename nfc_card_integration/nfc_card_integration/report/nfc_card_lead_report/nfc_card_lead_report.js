frappe.query_reports["NFC Card Lead Report"] = {
    "filters": [
        {
            "fieldname": "employee",
            "label": __("NFC Card"),
            "fieldtype": "Link",
            "options": "NFC Card",
            "width": "120px"
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.month_start(),
            "reqd": 0
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 0
        }
    ],

    onload: function(report) {
        report.page.add_inner_button(__("Show All Leads on Map"), function() {
            let data = report.data || [];
            let points = data
                .filter(row => row.latitude && row.longitude)
                .map(row => ({
                    lat: parseFloat(row.latitude),
                    lng: parseFloat(row.longitude),
                    label: `<b>${frappe.utils.escape_html(row.customer_name || "")}</b><br>
                            <b>Employee:</b> ${frappe.utils.escape_html(row.employee || "")}<br>
                            <b>Company:</b> ${frappe.utils.escape_html(row.customer_company || "")}<br>
                            <b>Phone:</b> ${frappe.utils.escape_html(row.customer_phone || "")}<br>
                            <b>Email:</b> ${frappe.utils.escape_html(row.customer_email || "")}<br>
                            <b>Time:</b> ${frappe.utils.escape_html(row.scan_time || row.creation || "")}`
                }));

            if (points.length) {
                frappe.msgprint({
                    title: __("All Lead Locations"),
                    indicator: "blue",
                    message: `<div id="nfc_lead_map_popup" style="height:60vh;min-height:360px;width:100%;border-radius:7px;"></div>`,
                    wide: true
                });

                function load_once(type, url, callback) {
                    let tag, already = false;
                    if (type === 'css') {
                        already = !!document.querySelector(`link[href="${url}"]`);
                        if (!already) {
                            tag = document.createElement('link');
                            tag.rel = "stylesheet";
                            tag.href = url;
                            document.head.appendChild(tag);
                        }
                        if (callback) callback();
                    } else {
                        already = !!document.querySelector(`script[src="${url}"]`);
                        if (!already) {
                            tag = document.createElement('script');
                            tag.src = url;
                            tag.onload = callback;
                            document.body.appendChild(tag);
                        } else if (callback) callback();
                    }
                }

                function drawMap() {
                    if (window.nfcLeadMapPopupInstance) window.nfcLeadMapPopupInstance.remove();
                    let center = points[0] ? [points[0].lat, points[0].lng] : [24.7, 46.7];
                    let map = L.map('nfc_lead_map_popup').setView(center, 11);
                    window.nfcLeadMapPopupInstance = map;

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(map);

                    if (points.length > 1 && window.L && window.L.markerClusterGroup) {
                        let markers = window.L.markerClusterGroup();
                        points.forEach(pt => {
                            let marker = L.marker([pt.lat, pt.lng]).bindPopup(pt.label);
                            markers.addLayer(marker);
                        });
                        map.addLayer(markers);
                        let bounds = markers.getBounds();
                        if (bounds.isValid()) map.fitBounds(bounds, {padding: [30, 30]});
                    } else {
                        let bounds = [];
                        points.forEach(pt => {
                            let marker = L.marker([pt.lat, pt.lng]).addTo(map).bindPopup(pt.label);
                            bounds.push([pt.lat, pt.lng]);
                        });
                        if (bounds.length > 1) map.fitBounds(bounds, {padding: [30, 30]});
                    }
                }

                load_once('css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
                load_once('css', 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css');
                load_once('css', 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css');
                load_once('js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', function() {
                    load_once('js', 'https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js', drawMap);
                });

            } else {
                frappe.msgprint(__("No locations available to show on the map."));
            }
        });
    }
};