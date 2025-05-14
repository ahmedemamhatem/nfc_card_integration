import frappe
from frappe.model.document import Document

class NFCCard(Document):
    pass

def autoname(doc, method=None):
    if not doc.card_id:
        doc.card_id = (doc.name_on_card or doc.employee or "").lower().replace(" ", "")
    doc.card_url = f"{frappe.utils.get_url()}/card/{doc.card_id}"

def validate(doc, method=None):
    doc.card_url = f"{frappe.utils.get_url()}/card/{doc.card_id}"