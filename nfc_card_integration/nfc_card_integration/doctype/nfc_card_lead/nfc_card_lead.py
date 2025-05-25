# Copyright (c) 2025, Ahmed Emam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class NFCCardLead(Document):
	def before_save(self):
		if self.latitude and self.longitude:
			from geopy.geocoders import Nominatim
			try:
				geolocator = Nominatim(user_agent="frappe_map")
				location = geolocator.reverse(f"{self.latitude}, {self.longitude}", language='en')
				addr = getattr(location, "raw", {}).get('address', {}) if location else {}

				self.city = (
					addr.get('city') or
					addr.get('town') or
					addr.get('village') or
					addr.get('municipality') or
					addr.get('hamlet') or
					addr.get('county') or
					addr.get('state') or
					"Unknown"
				)

				self.state = addr.get('state') or ""
				self.country = addr.get('country') or ""
				self.postal_code = addr.get('postcode') or ""
				self.road = addr.get('road') or ""
				self.address_line = location.address if location else ""

			except Exception as e:
				frappe.log_error(frappe.get_traceback(), "NFC Lead Geocoding Failed")

