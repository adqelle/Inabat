/**
 * map.js
 * Leaflet map for picking a location in Aktau. Works for addresses
 * that aren't tied to a building (e.g. a spot in the middle of a street).
 * Reverse geocoding uses the free Nominatim API and fails gracefully
 * (user can always type the address manually).
 */

const AKTAU_CENTER = [43.6481, 51.1801];

const MapPicker = {
  map: null,
  marker: null,
  selected: null, // { lat, lng }

  init() {
    this.map = L.map('map').setView(AKTAU_CENTER, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e) => this.setLocation(e.latlng.lat, e.latlng.lng, true));
  },

  setLocation(lat, lng, reverseGeocode) {
    this.selected = { lat, lng };
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.setLocation(pos.lat, pos.lng, true);
      });
    }
    this.map.panTo([lat, lng]);

    if (reverseGeocode) this.reverseGeocode(lat, lng);
  },

  async reverseGeocode(lat, lng) {
    const addressInput = document.getElementById('addressText');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'ru' } }
      );
      if (!res.ok) throw new Error('reverse geocode failed');
      const data = await res.json();
      if (data && data.display_name) {
        addressInput.value = data.display_name;
      }
    } catch (e) {
      console.warn('Reverse geocoding unavailable, please type address manually', e);
    }
  },

  getSelected() {
    return this.selected;
  },

  reset() {
    this.selected = null;
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    this.map.setView(AKTAU_CENTER, 13);
  }
};
