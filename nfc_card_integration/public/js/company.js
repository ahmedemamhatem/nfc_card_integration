frappe.ui.form.on('Company', {
    refresh: function(frm) {
        if (frappe.user.has_role("System Manager")) {
            frm.add_custom_button(__('Insert NFC Demo Data'), function() {
                frappe.call({
                    method: "nfc_card_integration.api.insert_nfc_card_demo_data",
                    freeze: true,
                    freeze_message: __("Inserting NFC demo data in the background. This may take several minutes. Please refresh to see the new demo data."),
                    callback: function(r) {
                        frappe.msgprint({
                            title: __("Demo Data Insertion Started"),
                            message: __("Demo data insertion has started in the background.<br>It may take a few minutes to complete.<br>Please refresh or check again shortly."),
                            indicator: 'blue'
                        });
                    }
                });
            }, __("NFC"));
            frm.add_custom_button(__('Delete NFC Demo Data'), function() {
                frappe.call({
                    method: "nfc_card_integration.api.delete_nfc_card_demo_data",
                    freeze: true,
                    freeze_message: __("Deleting NFC demo data in the background. This may take several minutes. Please refresh to verify deletion."),
                    callback: function(r) {
                        frappe.msgprint({
                            title: __("Demo Data Deletion Started"),
                            message: __("Demo data deletion has started in the background.<br>It may take a few minutes to complete.<br>Please refresh or check again shortly."),
                            indicator: 'orange'
                        });
                    }
                });
            }, __("NFC"));
        }
    }
});