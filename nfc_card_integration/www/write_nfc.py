import frappe

def get_context(context):
    # Get the card_id from the URL
    card_id = frappe.form_dict.get('card_id') or frappe.request.path.split('/')[-1]
    # Fetch NFC Card record
    card = frappe.get_doc("NFC Card", {"card_id": card_id})
    context.card = card
    context.no_cache = 1
    return context