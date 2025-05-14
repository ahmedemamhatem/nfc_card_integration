# NFC Card Integration for Frappe

A secure and modern **digital business card system** built on Frappe/ERPNext. This app enables users to share dynamic NFC-powered card URLs. Visitors can view the card, add contact info via vCard, and submit their own contact details back to the card owner or company.

---

## 🚀 Features

- 🔗 **Unique Encrypted URLs**  
  Share your card without exposing internal IDs or sensitive data.

- 👤 **Business Card Webpage**  
  Showcases name, role, email, phone, company, and profile photo.

- 📇 **vCard Download Support**  
  Allows users to download your details in `.vcf` format for easy contact import.

- 📨 **Lead Capture Form**  
  Visitors can fill out a form to share their contact details directly with you.

- ❌ **Invalid/Expired Card Handling**  
  Displays a friendly error message for broken or expired links.

---

## 🧩 Installation

1. **Get the app:**

   ```bash
   cd /path/to/frappe-bench
   bench get-app https://github.com/ahmedemamhatem/nfc_card_integration.git --branch develop
   bench --site [your-site-name] install-app nfc_card_integration
   ```

2. **Install required Python packages:**

   > 📦 **Install required Python packages:**

   ```bash
   pip install cryptography
   ```

3. **Set up Fernet encryption key:**

   Generate a secure key:

   ```python
   from cryptography.fernet import Fernet
   print(Fernet.generate_key())
   ```

   Copy the output and paste it into `nfc_card_integration/utils/crypto.py`:

   ```python
   FERNET_KEY = b'YOUR_GENERATED_KEY_HERE=='
   ```

   > 🔐 **Important:** Keep this key secret. You must use the same key to decode encrypted card URLs across sessions.

---

## 🛠️ Usage

1. **Create a new NFC Card**  

2. **Generate a unique NFC card URL**:

   ```python
   from nfc_card_integration.utils.crypto import encrypt_card_id
   unique_id = encrypt_card_id(card_id)
   url = f"/nfc-card/{unique_id}"
   ```

3. **Share the generated link**  
   This link opens a secure digital business card page.

---

## 🌐 Webpage Features

Each NFC card page provides:

- A responsive display of card details  
- A "Download vCard" button  
- A form to submit contact info, stored or emailed via a backend API

---

## 📁 File Structure Overview

```
nfc_card_integration/
├── www/
│   └── nfc-card/
│       ├── [unique_id].py        # Web handler to fetch and render NFC card
│       └── [unique_id].html      # Jinja template for the card UI
├── utils/
│   └── crypto.py                 # Fernet utility (encrypt/decrypt card IDs)
├── nfc_card_integration/         # Frappe app core files
├── README.md
├── license.txt
├── pyproject.toml
└── ...
```

---

## 💡 Developer Notes

- **API Endpoint:**  
  Create the following method to process leads submitted from the NFC card form:

  ```
  /api/method/nfc_card_integration.api.create_nfc_card_lead_and_email
  ```

  This can store the lead in ERPNext or send it via email.

- **Optional: Legacy Route Redirect:**  
  To support old routes like `/card/<card_id>`, add a redirect handler that converts it to the new encrypted `/nfc-card/<unique_id>` format.

---

## 📝 License

MIT

---

## 🤝 Contributors

- **Ahmed Emam**  
  GitHub: [@ahmedemamhatem](https://github.com/ahmedemamhatem)