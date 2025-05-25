// Copyright (c) 2025, Ahmed Emam and contributors
// For license information, please see license.txt

// frappe.ui.form.on("NFC Card Scan", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('NFC Card Scan', {
    refresh(frm) {
        // Only show map if both lat and long are set.
        if (frm.doc.latitude && frm.doc.longitude) {
            // HTML for the map container
            frm.fields_dict.scan_map_html.$wrapper.html(`
                <div id="scan_map" style="width:100%;height:350px;border-radius:8px;box-shadow:0 2px 10px #0001"></div>
            `);

            // Wait for the DOM to render, then draw the map
            setTimeout(() => {
                // Remove existing Leaflet map if exists
                if (window.scanMapInstance) {
                    window.scanMapInstance.remove();
                }

                // Add Leaflet CSS/JS if not present
                if (!$('link[href*="leaflet.css"]').length) {
                    $("<link>", {
                        rel: "stylesheet",
                        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    }).appendTo("head");
                }
                if (!$('script[src*="leaflet.js"]').length) {
                    $.getScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", drawMap);
                } else {
                    drawMap();
                }

                function drawMap() {
                    window.scanMapInstance = L.map('scan_map').setView([frm.doc.latitude, frm.doc.longitude], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(window.scanMapInstance);
                    L.marker([frm.doc.latitude, frm.doc.longitude])
                        .addTo(window.scanMapInstance)
                        .bindPopup(`<b>${frm.doc.name || ""}</b>`)
                        .openPopup();
                }
            }, 100);
        } else {
            // Hide map if no coordinates
            frm.fields_dict.scan_map_html.$wrapper.html(
                `<div style="color:#888;text-align:center;padding:1em;">No location set for this scan.</div>`
            );
        }
    }
});