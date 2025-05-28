
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
- **Top 5 Cities by Card Scans / Leads**  
- **Top 5 Employees by Scans / Leads**  
- **Monthly Scans & Leads Volume**  
- **City-wise Scan/Lead Distribution**  
- **Employee-wise Scan/Lead Distribution**  
- **Scans Heatmap (Hour × Day)**  
- **Monthly Employee Stacked Chart**  
- **Employee Scan vs Lead Bar Chart**  
- **Top 5 Employees by Scan→Lead Conversion (%)**  
- **Top 5 Cities by Scan→Lead Conversion (%)**  
- **Employees/Cities with Scans but No Leads**

**Maps:**

- Scan Locations Map  
- Lead Locations Map

**Filtering:**

- Filter all data by date range and employee.

**Responsive Design:**

- Mobile and desktop-friendly layout.

---

## 🧩 Installation

```bash
cd /path/to/frappe-bench
bench get-app https://github.com/ahmedemamhatem/nfc_card_integration.git 
bench --site [your-site-name] install-app nfc_card_integration
```

---

## 🛠️ Usage

### 1. Create a new NFC Card

### 2. Generate a unique NFC card URL

```python
from frappe.utils import random_string

unique_id = random_string(20)
url = f"/nfc-card/{unique_id}"
```

### 3. Share the generated link  
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
├── nfc_card_integration/           
│   ├── doctype/                   
│   │   ├── nfc_card/              
│   │   ├── nfc_card_scan/         
│   │   └── nfc_card_lead/         
│   ├── api/                       
│   ├── utils/                     
│   ├── public/                    
│   └── templates/                 
├── www/                           
│   └── nfc-card/                 
│       ├── [unique_id].py        
│       └── [unique_id].html      
├── fixtures/                      
├── patches/                       
├── config/                        
├── README.md                      
├── license.txt                    
├── pyproject.toml                 
├── package.json                   
├── requirements.txt               
└── hooks.py                       
```

---

## 📦 Required Python Packages

Install any required Python dependencies:

```bash
pip install -r requirements.txt
```


---

## 💡 Developer Notes

- **API Endpoint:**  
  To capture leads from the card form:

  ```
  /api/method/nfc_card_integration.api.create_nfc_card_lead_and_email
  ```

  This can store the lead in ERPNext or send it via email.

- **Legacy Route Redirect (optional):**  
  Redirect `/card/<card_id>` to `/nfc-card/<unique_id>`.

---

## 📝 License

MIT

---

## 🤝 Contributors

- **Ahmed Emam**  
  GitHub: [@ahmedemamhatem](https://github.com/ahmedemamhatem)
