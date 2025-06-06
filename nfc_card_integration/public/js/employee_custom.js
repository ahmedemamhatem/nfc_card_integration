frappe.ui.form.on("Employee", {
    refresh: function (frm) {
        // Only show the button if the document is NOT new (saved)
        if (!frm.is_new()) {
            frm.add_custom_button(__('Create/Update NFC Card'), function () {
                frappe.dom.freeze(__('Creating or updating NFC Card. Please wait…'));
                frappe.call({
                    method: "nfc_card_integration.api.create_nfc_card_from_employee",
                    args: {
                        employee: frm.doc.name
                    },
                    callback: function (r) {
                        frappe.dom.unfreeze();
                        if (r.message) {
                            frappe.set_route('Form', 'NFC Card', r.message);
                        }
                    },
                    error: function() {
                        frappe.dom.unfreeze();
                        frappe.msgprint(__('An error occurred while creating/updating the NFC Card.'));
                    }
                });
            });
        }
    },

    after_save: function(frm) {
        frappe.call({
            method: "nfc_card_integration.api.create_nfc_card_from_employee",
            args: { employee: frm.doc.name }
        });
    }
});