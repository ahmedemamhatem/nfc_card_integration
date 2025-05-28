# NFC Card Integration for Frappe

A secure and modern **digital business card system** built on Frappe/ERPNext. This app enables users to share dynamic NFC-powered card URLs. Visitors can view the card, add contact info via vCard, and submit their own contact details back to the card owner or company.

---

## 🚀 Features

- 🔗 **Unique Card URLs**  
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

## 📊 Dashboard & Analytics

Gain insights on card scans and leads with a rich, interactive dashboard.

**Key Metrics:**

- Total Card Scans (All Time)  
- Employees Scanned  
- Cities with Card Scans  
- Total NFC Card Leads  
- Employees Generated Leads  
- Cities with NFC Card Leads

**Charts:**

- **Scans Per Day** & **Leads Per Day**  
  _Time-series line charts_

- **Top 5 Cities by Card Scans / Leads**  
  _Horizontal bar charts_

- **Top 5 Employees by Scans / Leads**  
  _Horizontal bar charts_

- **Monthly Scans & Leads Volume**  
  _Stacked bar charts by month and employee_

- **City-wise Scan/Lead Distribution**  
  _Doughnut charts (all cities shown, scrollable legend)_

- **Employee-wise Scan/Lead Distribution**  
  _Doughnut charts (all employees shown, scrollable legend)_

- **Scans Heatmap (Hour × Day)**  
  _Stacked bar heatmap showing scan volumes by hour and weekday_

- **Monthly Employee Stacked Chart**  
  _Stacked bars showing scans by employee across each month_

- **Employee Scan vs Lead Bar Chart**  
  _Grouped bars showing both scans and leads by employee_

- **Top 5 Employees by Scan→Lead Conversion (%)**  
  _Bar chart showing conversion rates_

- **Top 5 Cities by Scan→Lead Conversion (%)**  
  _Bar chart showing conversion rates_

- **Employees/Cities with Scans but No Leads**  
  _Tabular lists highlighting missed opportunities_

**Maps:**

- **Scan Locations Map**  
- **Lead Locations Map**  
  _(Both are interactive, with marker clusters and fullscreen support.)_

**Filtering:**

- Filter all data by date range and employee. All charts, metrics, and maps update live.

**Legend Handling:**

- Legends beneath doughnut charts are scrollable and always fit the layout, even with many items.

**Responsive Design:**

- Dashboard adapts elegantly for desktop and mobile screens.

---

## 🧩 Installation

1. **Get the app:**

   ```bash
   cd /path/to/frappe-bench
   bench get-app https://github.com/ahmedemamhatem/nfc_card_integration.git 
   bench --site [your-site-name] install-app nfc_card_integration
   ```


## 🛠️ Usage

1. **Create a new NFC Card**

2. **Generate a unique NFC card URL:**

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
├── nfc_card_integration/           # Main app directory
│   ├── nfc_card_integration/       # Core app files
│   │   ├── doctype/               # Custom doctypes
│   │   │   ├── nfc_card/          # Main NFC Card doctype
│   │   │   ├── nfc_card_scan/     # Scan tracking
│   │   │   └── nfc_card_lead/     # Lead management
│   │   ├── api/                   # API endpoints
│   │   ├── utils/                 # Utility functions
│   │   ├── public/                # Static assets (CSS, JS, images)
│   │   └── templates/             # Email and web templates
│   ├── www/                       # Web pages
│   │   └── nfc-card/             # Card display pages
│   │       ├── [unique_id].py     # Web handler for card rendering
│   │       └── [unique_id].html   # Jinja2 template for card UI
│   ├── utils/
│   │   └── crypto.py              # Encryption utilities (Fernet-based)
│   ├── fixtures/                  # Initial data and configurations
│   ├── patches/                   # Database migration patches
│   └── config/                    # App configuration files
├── README.md                      # This documentation
├── license.txt                    # MIT License
├── pyproject.toml                # Python project configuration
├── package.json                   # Node.js dependencies
├── requirements.txt               # Python dependencies
└── hooks.py                       # Frappe framework hooks
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
