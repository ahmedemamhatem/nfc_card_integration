# nfc_card_integration/www/card.py

import frappe

def get_context(context):
    card_id = frappe.request.path.rstrip('/').split('/')[-1]
    try:
        card = frappe.get_doc("NFC Card", {"card_id": card_id})
        context.card = card
    except frappe.DoesNotExistError:
        context.card = None
    return context