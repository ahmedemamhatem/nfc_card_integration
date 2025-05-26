import frappe
import json
import base64
from frappe import _
import random
from datetime import datetime, timedelta
import re
from datetime import datetime, timedelta
@frappe.whitelist()
def create_nfc_card_from_employee(employee):
    emp = frappe.get_doc("Employee", employee)

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

    # Get company logo
    company_logo = None
    if emp.company:
        company = frappe.get_doc("Company", emp.company)
        company_logo = company.company_logo  
    values = {
        "name_on_card": emp.employee_name,
        "designation": emp.designation,
        "company": emp.company,
        "email": emp.company_email or emp.personal_email,
        "phone": emp.cell_number,
        "image": image,
        "company_logo": company_logo  
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
            "card_id": card_id,
            "card_url": card_url,
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
    customer_company=None,
    latitude=None,
    longitude=None
):
    if not (card_id and customer_name and customer_email and customer_phone):
        return {
            "error": f"Received: card_id={card_id}, name={customer_name}, email={customer_email}, phone={customer_phone}, company={customer_company}, latitude={latitude}, longitude={longitude}"
        }

    # Get NFC Card
    card = frappe.get_doc("NFC Card", {"card_id": card_id})
    employee = card.employee
    nfc_card = card.name

    # Insert Lead with latitude/longitude
    lead = frappe.get_doc({
        "doctype": "NFC Card Lead",
        "employee": employee,
        "scan_date": frappe.utils.today(),
        "nfc_card": nfc_card,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "customer_phone": customer_phone,
        "customer_company": customer_company,
        "latitude": latitude,
        "longitude": longitude,
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
        """
        # Only show if both present
        if latitude and longitude:
            html += f'<li><b>Location:</b> <a href="https://maps.google.com/?q={latitude},{longitude}" target="_blank">{latitude}, {longitude}</a></li>'
        html += """
            </ul>
            <p>
              <a href="{data_url}" download="{customer_name}.vcf"
                 style="background:#0097e6;color:#fff;border-radius:5px;padding:0.5em 1em;text-decoration:none;"
              >Add to Phonebook</a>
            </p>
        """.format(
            data_url=data_url,
            customer_name=customer_name.replace(' ', '_')
        )

        # Send email
        frappe.sendmail(
            recipients=email_to,
            subject="New Customer Lead from NFC Card",
            message=html
        )

        # Mark lead as emailed
        lead.db_set("sent_email", 1)
        return {"message": "ok"}
    except Exception as e:
        frappe.logger().error(f"Could not send email for lead: {lead.name}, error: {e}")

    return {"message": "ok"}


@frappe.whitelist(allow_guest=True)
def insert_nfc_card_scan(card_id, latitude=None, longitude=None):
    try:
        if not card_id:
            return {"message": "ok"}

        # Round coordinates to prevent float precision mismatch
        rounded_lat = round(float(latitude or 0), 5)
        rounded_long = round(float(longitude or 0), 5)

        # Time threshold: 30 minutes ago, no microseconds
        time_threshold = (frappe.utils.now_datetime() - timedelta(minutes=30)).replace(microsecond=0)
        formatted_threshold = time_threshold.strftime("%Y-%m-%d %H:%M:%S")
        nfc_card = frappe.get_doc("NFC Card", {"card_id": card_id})
        employee = nfc_card.employee
        nfc_card_name = nfc_card.name
        # Check for existing scan
        existing_scan = frappe.db.sql("""
            SELECT name FROM `tabNFC Card Scan`
            WHERE card_id = %s
              AND ROUND(latitude, 5) = %s
              AND ROUND(longitude, 5) = %s
              AND scan_time > %s
            LIMIT 1
        """, (card_id, rounded_lat, rounded_long, formatted_threshold), as_dict=True)

        if existing_scan:
            return {"message": "ok"}

        # Generate a unique name and insert
        scan_name = frappe.generate_hash(length=20)

        doc = frappe.get_doc({
            "doctype": "NFC Card Scan",
            "name": scan_name,
            "employee": employee,
            "nfc_card": nfc_card_name,
            "card_id": card_id,
            "scan_time": frappe.utils.now_datetime(),
            "scan_date": frappe.utils.today(),
            "latitude": rounded_lat,
            "longitude": rounded_long
        })

        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return {"message": "ok"}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "NFC Card Scan Insert Error")
        return {"message": "ok"}


@frappe.whitelist()
def insert_nfc_card_demo_data():
    # Enqueue the actual function
    frappe.enqueue(
        "nfc_card_integration.api._insert_nfc_card_demo_data",
        queue='default',
        timeout=2400,  # 40 minutes
        now=False
    )
    return {"enqueued": True}

@frappe.whitelist()
def delete_nfc_card_demo_data():
    frappe.enqueue(
        "nfc_card_integration.api._delete_nfc_card_demo_data",
        queue='default',
        timeout=2400,  # 40 minutes
        now=False
    )
    return {"enqueued": True}

def _insert_nfc_card_demo_data():
    NUM_EMPLOYEES = 40
    NUM_SCANS = 166
    NUM_LEADS = 78

    saudi_first_names = [
        "Abdullah", "Mohammed", "Fahad", "Saad", "Turki", "Nasser", "Ali", "Ahmed", "Sultan", "Mansour",
        "Khalid", "Salman", "Faisal", "Omar", "Yousef", "Majed", "Ibrahim", "Hassan", "Abdulaziz", "Saeed"
    ]
    saudi_last_names = [
        "Al Saud", "Al Rashid", "Al Harbi", "Al Otaibi", "Al Mutairi", "Al Qahtani", "Al Shamrani", "Al Ghamdi",
        "Al Zahrani", "Al Dossari", "Al Subaie", "Al Shehri", "Al Shammari", "Al Anazi", "Al Amri", "Al Juhani",
        "Al Hazmi", "Al Suwailem", "Al Tami"
    ]
    saudi_locations = [
        ("Riyadh", "Olaya", 24.7136, 46.6753),
        # ... (other locations as before)
        ("Hafr Al Batin", "Central", 28.4295, 45.9706)
    ]

    def random_saudi_location():
        city, district, base_lat, base_lng = random.choice(saudi_locations)
        lat_offset = random.uniform(-0.045, 0.045)
        lng_offset = random.uniform(-0.045, 0.045)
        lat = round(base_lat + lat_offset, 6)
        lng = round(base_lng + lng_offset, 6)
        return city, district, lat, lng

    def random_date_in_2025():
        start = datetime(2025, 1, 1)
        end = datetime(2025, 12, 31, 23, 59, 59)
        delta = end - start
        random_seconds = random.randint(0, int(delta.total_seconds()))
        return start + timedelta(seconds=random_seconds)

    # --- Create NFC Card (employee) records ---
    employee_names = []
    used_names = set()
    for i in range(1, NUM_EMPLOYEES + 1):
        while True:
            first_name = random.choice(saudi_first_names)
            last_name = random.choice(saudi_last_names)
            full_name = f"{first_name} {last_name}"
            if full_name not in used_names:
                used_names.add(full_name)
                break
        card_id = frappe.generate_hash(length=20)
        emp_doc = frappe.get_doc({
            "doctype": "NFC Card",
            "name": full_name,
            "employee": full_name,
            "name_on_card": full_name,
            "card_id": card_id,
            "company": "NFC (Demo)",
            "email": f"{first_name.lower()}.{last_name.lower().replace(' ', '')}{i}@demo.com",
            "phone": f"05{random.randint(10000000,99999999)}",
            "demo": 1
        })
        try:
            emp_doc.insert(ignore_permissions=True)
            frappe.db.commit()
            print(f"Inserted NFC Card: {full_name}")
        except frappe.DuplicateEntryError:
            print(f"NFC Card {full_name} already exists.")
        employee_names.append((full_name, card_id, full_name))

    # --- Create NFC Card Scan records ---
    for i in range(NUM_SCANS):
        emp, card, full_name = random.choice(employee_names)
        city, district, lat, lng = random_saudi_location()
        scan_time = random_date_in_2025()
        scan_date = scan_time.date().isoformat()
        doc = frappe.get_doc({
            "doctype": "NFC Card Scan",
            "nfc_card": emp,
            "employee": emp,
            "card_id": card,
            "city": city,
            "district": district,
            "latitude": lat,
            "longitude": lng,
            "scan_date": scan_date,
            "scan_time": scan_time.strftime("%Y-%m-%d %H:%M:%S"),
            "owner": "Guest",
            "demo": 1
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()

    # --- Create NFC Card Lead records ---
    for i in range(NUM_LEADS):
        emp, card, full_name = random.choice(employee_names)
        city, district, lat, lng = random_saudi_location()
        creation = random_date_in_2025()
        scan_date = creation.date().isoformat()
        customer_name = f"Customer {random.randint(1000,9999)}"
        customer_phone = f"+9665{random.randint(10000000,99999999)}"
        customer_email = f"customer{random.randint(1000,9999)}@example.com"
        customer_company = f"Company {random.randint(1,50)}"
        doc = frappe.get_doc({
            "doctype": "NFC Card Lead",
            "nfc_card": emp,
            "employee": emp,
            "card_id": card,
            "city": city,
            "district": district,
            "latitude": lat,
            "longitude": lng,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "customer_email": customer_email,
            "customer_company": customer_company,
            "creation": creation.strftime("%Y-%m-%d %H:%M:%S"),
            "scan_date": scan_date,
            "owner": "Guest",
            "demo": 1
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        print(f"Inserted Lead {i+1}/{NUM_LEADS}")
        

def _delete_nfc_card_demo_data():
    for doctype in ["NFC Card", "NFC Card Scan", "NFC Card Lead"]:
        frappe.db.sql(f"DELETE FROM `tab{doctype}` WHERE demo=1")
    frappe.db.commit()
    return {"deleted": True}