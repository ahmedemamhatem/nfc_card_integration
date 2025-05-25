// Copyright (c) 2025, Ahmed Emam and contributors
// For license information, please see license.txt

// frappe.ui.form.on("NFC Card Lead", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('NFC Card Lead', {
    refresh(frm) {
        // Only show map if both lat and long are set.
        if (frm.doc.latitude && frm.doc.longitude) {
            // HTML for the map container
            frm.fields_dict.lead_map_html.$wrapper.html(`
                <div id="lead_map" style="width:100%;height:350px;border-radius:8px;box-shadow:0 2px 10px #0001"></div>
            `);

            // Wait for the DOM to render, then draw the map
            setTimeout(() => {
                // Remove existing Leaflet map if exists
                if (window.leadMapInstance) {
                    window.leadMapInstance.remove();
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
                    window.leadMapInstance = L.map('lead_map').setView([frm.doc.latitude, frm.doc.longitude], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(window.leadMapInstance);
                    L.marker([frm.doc.latitude, frm.doc.longitude])
                        .addTo(window.leadMapInstance)
                        .bindPopup(`<b>${frm.doc.customer_name || ""}</b><br>${frm.doc.customer_company || ""}`)
                        .openPopup();
                }
            }, 100);
        } else {
            // Hide map if no coordinates
            frm.fields_dict.lead_map_html.$wrapper.html(
                `<div style="color:#888;text-align:center;padding:1em;">No location set for this lead.</div>`
            );
        }
    }
});