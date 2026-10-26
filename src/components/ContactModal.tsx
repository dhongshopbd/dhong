import React from 'react';
import { X, MapPin, Phone, MessageCircle, Mail, Clock, ExternalLink, Navigation, ShieldCheck } from 'lucide-react';
import { CONTACT_INFO } from '../data/contactInfo';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'contact' | 'about';
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, initialTab = 'contact' }) => {
  const [activeTab, setActiveTab] = React.useState<'contact' | 'about'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl text-neutral-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-950 text-white p-6 relative border-b border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close Contact Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <img
              src="/assets/aistudio/dhong-logo_ce533da6.jpeg"
              onError={(e) => {
                e.currentTarget.src = '/dhong-logo.png';
              }}
              alt="Dhong Brand Logo"
              className="h-10 w-auto object-contain rounded-md"
            />
            <div>
              <h3 className="font-brand text-2xl font-bold tracking-wider text-white">DHONG</h3>
              <p className="text-xs text-red-400 uppercase tracking-widest font-semibold">{CONTACT_INFO.tagline}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Contact & Store Location
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              About Dhong
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'contact' ? (
            <div className="space-y-6">
              
              {/* Primary Address Card with Google Maps Direct Link */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Official Store & Dispatch Center
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Open Daily
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">
                      {CONTACT_INFO.address}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {CONTACT_INFO.complex}, {CONTACT_INFO.road}, {CONTACT_INFO.area}, {CONTACT_INFO.thana}, {CONTACT_INFO.city}-{CONTACT_INFO.postalCode}
                    </p>

                    <div className="flex items-center gap-2 pt-3 flex-wrap">
                      <a
                        href={CONTACT_INFO.googleMapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                      </a>
                      <a
                        href={CONTACT_INFO.googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors"
                        title="Get directions to store"
                      >
                        <Navigation className="w-3.5 h-3.5 text-red-600" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-inner">
                <iframe
                  title="Dhong Store Location - Asiatic Shopping Complex, Demra, Dhaka"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={CONTACT_INFO.googleMapsEmbedUrl}
                  className="w-full"
                />
              </div>

              {/* Action Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Phone Call Button */}
                <a
                  href={CONTACT_INFO.phoneTelLink}
                  className="p-4 rounded-2xl bg-neutral-50 hover:bg-red-50/60 border border-neutral-200 hover:border-red-300 transition-all group flex items-center gap-3.5"
                  title={`Call ${CONTACT_INFO.phoneFormatted}`}
                >
                  <div className="p-3 rounded-xl bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Direct Hotline</span>
                    <span className="text-base font-bold text-neutral-900 font-mono block">{CONTACT_INFO.phoneFormatted}</span>
                    <span className="text-[10px] text-neutral-500">Tap to call from phone</span>
                  </div>
                </a>

                {/* WhatsApp Chat Button */}
                <a
                  href={CONTACT_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-neutral-50 hover:bg-emerald-50/60 border border-neutral-200 hover:border-emerald-300 transition-all group flex items-center gap-3.5"
                  title={`Chat on WhatsApp (${CONTACT_INFO.whatsappInternational})`}
                >
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">WhatsApp Chat</span>
                    <span className="text-base font-bold text-neutral-900 font-mono block">{CONTACT_INFO.whatsappInternational}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Instant dress inquiries</span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-all group flex items-center gap-3.5"
                >
                  <div className="p-3 rounded-xl bg-neutral-200 text-neutral-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Customer Email</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{CONTACT_INFO.email}</span>
                    <span className="text-[10px] text-neutral-500">Invoices & order questions</span>
                  </div>
                </a>

                {/* Working Hours */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-neutral-200 text-neutral-700">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Working Hours</span>
                    <span className="text-xs font-semibold text-neutral-900 block">{CONTACT_INFO.workingHours}</span>
                    <span className="text-[10px] text-neutral-500">Dhaka & Nationwide Dispatch</span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="space-y-5 text-neutral-700 text-sm leading-relaxed">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <h4 className="font-brand text-lg font-bold text-neutral-900 mb-1">
                  Dhong (ঢং) — "Come meet the new you"
                </h4>
                <p className="text-xs text-neutral-600">
                  Dhong is Bangladesh’s premier designer dress house, handcrafting bespoke evening gowns, festive anarkalis, fluid mulberry silks, cocktail frocks, and festive kurti ensembles for discerning women nationwide.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block">Master Tailor Quality Audit:</strong>
                    Every dress is measured, hand-checked for stitching precision, and protected in luxury dust bags.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block">Official Atelier & Dispatch Location:</strong>
                    {CONTACT_INFO.address}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-900 block">Dedicated Helpline & WhatsApp Concierge:</strong>
                    Hotline: <a href={CONTACT_INFO.phoneTelLink} className="text-red-600 font-semibold underline">{CONTACT_INFO.phoneFormatted}</a> | WhatsApp: <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold underline">{CONTACT_INFO.whatsappInternational}</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>{CONTACT_INFO.address}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
