import frappe
from frappe.model.document import Document
import json

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
                suburb = addr.get('suburb') or ''
                county = addr.get('county') or ''
                municipality = addr.get('municipality') or ''

                # Save detailed fields
                self.city = city
                self.state = state
                self.country = country
                self.postal_code = postcode
                self.road = road
                self.neighborhood = neighborhood
                self.suburb = suburb
                self.county = county
                self.municipality = municipality
                self.address_line = location.address if location else ""

                # Format a compact, prioritized address string
                address_parts = [road, neighborhood, suburb, city, state, postcode, country]
                formatted = ', '.join([p for p in address_parts if p])
                self.address = formatted[:140]

                # Store the full raw response as JSON
                if location and hasattr(self, "geocoding_raw_json"):
                    self.geocoding_raw_json = json.dumps(location.raw, ensure_ascii=False)

                # Store display_name from Nominatim
                self.display_name = location.raw.get('display_name') if location and location.raw else location.address if location else ''

                # Ensure scan_date is set
                if not self.scan_date:
                    self.scan_date = frappe.utils.today()

            except Exception:
                frappe.log_error(frappe.get_traceback(), "NFC Lead Geocoding Failed")