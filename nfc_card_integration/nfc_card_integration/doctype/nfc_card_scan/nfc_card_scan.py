# Copyright (c) 2025, Ahmed Emam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class NFCCardScan(Document):
	def before_save(self):
		if self.latitude and self.longitude:
			from geopy.geocoders import Nominatim
			try:
				geolocator = Nominatim(user_agent="frappe_map")
				location = geolocator.reverse(f"{self.latitude}, {self.longitude}", language='en')
				addr = getattr(location, "raw", {}).get('address', {}) if location else {}

				# Extract fields
				road = addr.get('road') or ''
				neighborhood = addr.get('neighbourhood') or ''
				city = (
					addr.get('city') or
					addr.get('town') or
					addr.get('village') or
					addr.get('municipality') or
					addr.get('hamlet') or
					addr.get('county') or
					addr.get('state') or
					"Unknown"
				)
				state = addr.get('state') or ''
				country = addr.get('country') or ''
				postcode = addr.get('postcode') or ''

				# Assign to fields
				self.city = city
				self.state = state
				self.country = country
				self.postal_code = postcode
				self.road = road
				self.address_line = location.address if location else ""

				# Format clean, prioritized address
				address_parts = [road, neighborhood, city, state, postcode, country]
				formatted = ', '.join(filter(None, address_parts))
				self.address = formatted[:140]  # Trim to 140 chars max
				self.scan_date = frappe.utils.today()
				
			except Exception:
				frappe.log_error(frappe.get_traceback(), "NFC Scan Geocoding Failed")
