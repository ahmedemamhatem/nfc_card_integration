frappe.query_reports["NFC Card Lead Report"] = {
    "filters": [
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.year_start(),  // First day of this year
            "reqd": 0
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.year_end(),  // Last day of this year
            "reqd": 0
        },
        {
            "fieldname": "nfc_card",
            "label": __("Card Name"),
            "fieldtype": "Data",
            "reqd": 0
        }
    ]
};
