import frappe
import json
import base64


@frappe.whitelist()
def create_nfc_card_from_employee(employee):
    emp = frappe.get_doc("Employee", employee)

    # Generate a unique hash for card_id instead of using the employee's name or attendance_device_id
    card_id = frappe.generate_hash(length=20).lower()

    card_url = f"{frappe.utils.get_url()}/card/{card_id}"
    image = emp.image

    # Try to get User profile image, fallback to Employee image
    if getattr(emp, "user_id", None):
        try:
            user = frappe.get_doc("User", emp.user_id)
            image = emp.image
        except frappe.DoesNotExistError:
            pass

    values = {
        "card_id": card_id,
        "name_on_card": emp.employee_name,
        "designation": emp.designation,
        "company": emp.company,
        "email": emp.company_email or emp.personal_email,
        "phone": emp.cell_number,
        "image": image,
        "card_url": card_url,
    }

    existing_name = frappe.db.exists("NFC Card", {"employee": emp.name})

    if existing_name:
        # Update using db.set_value for all fields
        for field, val in values.items():
            frappe.db.set_value("NFC Card", existing_name, field, val)
        return existing_name
    else:
        # Create new card
        card = frappe.get_doc({
            "doctype": "NFC Card",
            "employee": emp.name,
            **values
        })
        card.insert(ignore_permissions=True)
        return card.name


@frappe.whitelist(allow_guest=True)
def create_nfc_card_lead_and_email(
    card_id=None,
    customer_name=None,
    customer_email=None,
    customer_phone=None,
    customer_company=None
):
    frappe.logger().info(f"Received: card_id={card_id}, name={customer_name}, email={customer_email}, phone={customer_phone}, company={customer_company}")
    if not (card_id and customer_name and customer_email and customer_phone):
        return {"error": f"Received: card_id={card_id}, name={customer_name}, email={customer_email}, phone={customer_phone}, company={customer_company}"}

    # Get NFC Card
    card = frappe.get_doc("NFC Card", {"card_id": card_id})
    employee = card.employee

    # Insert Lead
    lead = frappe.get_doc({
        "doctype": "NFC Card Lead",
        "employee": employee,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_phone": customer_phone,
        "customer_company": customer_company,
        "sent_email": 0
    })
    lead.insert(ignore_permissions=True)

    # Try to send email, but don't fail if not possible
    try:
        # Get employee email
        employee_doc = frappe.get_doc("Employee", employee)
        email_to = employee_doc.company_email or employee_doc.personal_email
        if not email_to:
            frappe.logger().warning(f"Employee {employee} has no valid email; skipping email send.")
            return {"message": "ok"}

        # Build vCard and encode as base64 for attachment
        vcard = f"""BEGIN:VCARD
        VERSION:3.0
        FN:{customer_name}
        ORG:{customer_company}
        EMAIL:{customer_email}
        TEL:{customer_phone}
        END:VCARD
        """
        vcard_bytes = vcard.encode('utf-8')
        vcard_b64 = base64.b64encode(vcard_bytes).decode('ascii')
        data_url = f"data:text/vcard;base64,{vcard_b64}"

        # Compose email HTML
        html = f"""
            <p>Hi {employee_doc.employee_name},</p>
            <p>A new customer lead was submitted from your NFC card page:</p>
            <ul>
                <li><b>Name:</b> {customer_name}</li>
                <li><b>Email:</b> {customer_email}</li>
                <li><b>Phone:</b> {customer_phone}</li>
                <li><b>Company:</b> {customer_company}</li>
            </ul>
            <p>
              <a href="{data_url}" download="{customer_name.replace(' ', '_')}.vcf"
                 style="background:#0097e6;color:#fff;border-radius:5px;padding:0.5em 1em;text-decoration:none;"
              >Add to Phonebook</a>
            </p>
        """

        # Send email
        frappe.sendmail(
            recipients=email_to,
            subject="New Customer Lead from NFC Card",
            message=html
        )

        # Mark lead as emailed
        lead.db_set("sent_email", 1)
    except Exception as e:
        # Log the error but don't fail
        frappe.logger().error(f"Could not send email for lead: {lead.name}, error: {e}")
        # Optionally, you can set a field or status on the lead to indicate email was not sent

    return {"message": "ok"}



@frappe.whitelist(allow_guest=True)
def insert_nfc_card_scan(card_id, latitude, longitude):
    try:
        # Generate a unique name for the scan record
        scan_name = frappe.generate_hash(length=20)

        # Create and insert the new NFC Card Scan document
        doc = frappe.get_doc({
            "doctype": "NFC Card Scan",
            "name": scan_name, 
            "nfc_card": card_id,
            "scan_time": frappe.utils.now_datetime(),
            "latitude": latitude,
            "longitude": longitude
        })

        doc.insert(ignore_permissions=True)  # Use ignore_permissions if needed for API or background job
        frappe.db.commit()  # Optional: usually handled by insert(), but can ensure it in some setups

        return {"status": "success", "scan_name": scan_name}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "NFC Card Scan Insert Error")
        return {"status": "error", "message": str(e)}
