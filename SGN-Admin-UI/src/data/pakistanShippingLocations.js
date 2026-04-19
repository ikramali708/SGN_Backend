/** @type {const} */
export const DEFAULT_SHIPPING_COUNTRY = 'Pakistan';

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit Baltistan',
  'Islamabad Capital Territory',
];

/** City dropdown options per province; last option is always "Other" for free text. */
export const CITY_OTHER = '__other__';

export const CITIES_BY_PROVINCE = {
  Punjab: [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sheikhupura',
    'Jhang',
    'Gujrat',
    'Kasur',
    'Rahim Yar Khan',
    'Sahiwal',
    'Okara',
    'Wazirabad',
    'Mianwali',
    'Other',
  ],
  Sindh: [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Nawabshah',
    'Mirpur Khas',
    'Jacobabad',
    'Shikarpur',
    'Thatta',
    'Badin',
    'Other',
  ],
  KPK: [
    'Peshawar',
    'Mardan',
    'Abbottabad',
    'Swat (Mingora)',
    'Kohat',
    'Dera Ismail Khan',
    'Charsadda',
    'Mansehra',
    'Haripur',
    'Nowshera',
    'Bannu',
    'Other',
  ],
  Balochistan: [
    'Quetta',
    'Gwadar',
    'Turbat',
    'Khuzdar',
    'Chaman',
    'Hub',
    'Sibi',
    'Loralai',
    'Other',
  ],
  'Gilgit Baltistan': ['Gilgit', 'Skardu', 'Hunza', 'Chitral', 'Other'],
  'Islamabad Capital Territory': ['Islamabad', 'Other'],
};

export function citiesForProvince(province) {
  if (!province || !CITIES_BY_PROVINCE[province]) return [];
  return CITIES_BY_PROVINCE[province].map((c) =>
    c === 'Other' ? { value: CITY_OTHER, label: 'Other (type city)' } : { value: c, label: c }
  );
}
