// Canonical Contact Configuration for Dhong Bangladesh (ঢং)
// Official Store & Dispatch Center: Asiatic Shopping Complex, Konapara, Al-Amin Road, Demra, Dhaka-1362

export interface ContactDetails {
  brandName: string;
  brandNameBangla: string;
  tagline: string;
  taglineBangla: string;
  address: string;
  streetAddress: string;
  complex: string;
  road: string;
  area: string;
  thana: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string;
  phone: string;
  phoneFormatted: string;
  phoneTelLink: string;
  whatsappNumber: string;
  whatsappInternational: string;
  whatsappUrl: string;
  email: string;
  emailAdmin: string;
  workingHours: string;
  googleMapsSearchUrl: string;
  googleMapsDirectionsUrl: string;
  googleMapsEmbedUrl: string;
}

export const CONTACT_INFO: ContactDetails = {
  brandName: 'Dhong',
  brandNameBangla: 'ঢং ফ্যাশন',
  tagline: 'Come meet the new you',
  taglineBangla: 'কাম মিট দ্য নিউ ইউ',
  address: 'Asiatic Shopping Complex, Konapara, Al-Amin Road, Demra, Dhaka-1362',
  streetAddress: 'Asiatic Shopping Complex, Konapara, Al-Amin Road, Demra',
  complex: 'Asiatic Shopping Complex',
  road: 'Al-Amin Road',
  area: 'Konapara',
  thana: 'Demra',
  city: 'Dhaka',
  postalCode: '1362',
  country: 'Bangladesh',
  countryCode: 'BD',
  phone: '01790141399',
  phoneFormatted: '01790141399',
  phoneTelLink: 'tel:01790141399',
  whatsappNumber: '8801790141399',
  whatsappInternational: '+8801790141399',
  whatsappUrl: 'https://wa.me/8801790141399',
  email: 'dhong.shop.bd@gmail.com',
  emailAdmin: 'dhong.shop.bd@gmail.com',
  workingHours: '10:00 AM - 10:00 PM (Everyday)',
  // Official Google Maps direct search query for Asiatic Shopping Complex, Konapara, Demra
  googleMapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Asiatic+Shopping+Complex+Konapara+Al-Amin+Road+Demra+Dhaka+1362',
  googleMapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Asiatic+Shopping+Complex+Konapara+Demra+Dhaka',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=Asiatic%20Shopping%20Complex%2C%20Konapara%2C%20Al-Amin%20Road%2C%20Demra%2C%20Dhaka-1362&t=&z=15&ie=UTF8&iwloc=&output=embed',
};
