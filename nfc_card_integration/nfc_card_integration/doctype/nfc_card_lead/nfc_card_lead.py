# Copyright (c) 2025, Ahmed Emam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class NFCCardLead(Document):
	def before_save(self):
		if self.latitude and self.longitude:
			from geopy.geocoders import Nominatim
			try:
				geolocator = Nominatim(user_agent="frappe_map")
				location = geolocator.reverse(f"{self.latitude}, {self.longitude}", language='en')
				addr = getattr(location, "raw", {}).get('address', {}) if location else {}

				# Extract components with fallbacks
				road = addr.get('road') or ''
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
				neighborhood = addr.get('neighbourhood') or ''

				# Save detailed fields
				self.city = city
				self.state = state
				self.country = country
				self.postal_code = postcode
				self.road = road
				self.address_line = location.address if location else ""

				# Format a compact, prioritized address string
				address_parts = [road, neighborhood, city, state, postcode, country]
				formatted = ', '.join([p for p in address_parts if p])

				# Truncate safely to 140 characters
				self.address = formatted[:140]
				self.scan_date = frappe.utils.today()

			except Exception:
				frappe.log_error(frappe.get_traceback(), "NFC Lead Geocoding Failed")
