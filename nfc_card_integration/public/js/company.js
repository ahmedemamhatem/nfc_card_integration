frappe.ui.form.on('Company', {
    refresh: function(frm) {
        if (frappe.user.has_role("System Manager")) {
            frm.add_custom_button(__('Insert NFC Demo Data'), function() {
                frappe.call({
                    method: "nfc_card_integration.api.insert_nfc_card_demo_data",
                    freeze: true,
                    freeze_message: __("Inserting NFC demo data, please wait..."),
                    callback: function(r) {
                        frappe.msgprint(__("Demo data inserted."));
                    }
                });
            }, __("NFC"));
            frm.add_custom_button(__('Delete NFC Demo Data'), function() {
                frappe.call({
                    method: "nfc_card_integration.api.delete_nfc_card_demo_data",
                    freeze: true,
                    freeze_message: __("Deleting NFC demo data, please wait..."),
                    callback: function(r) {
                        frappe.msgprint(__("Demo data deleted."));
                    }
                });
            }, __("NFC"));
        }
    }
});