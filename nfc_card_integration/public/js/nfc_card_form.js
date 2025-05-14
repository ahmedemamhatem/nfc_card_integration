frappe.ui.form.on('NFC Card', {
    refresh: function(frm) {
        if (frm.doc.card_id) {
            frm.add_custom_button(__('Write to NFC Card'), function() {
                window.open('/write_nfc/' + frm.doc.card_id, '_blank');
            });
        }
    }
});