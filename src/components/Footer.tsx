import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { toggleCategoryFilter } = useStore();
  const [emailSub, setEmailSub] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setIsSubscribed(true);
      setEmailSub('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 text-neutral-400 text-xs">
      {/* Upper Footer: Newsletter & Marketing Perks */}
      <div className="border-b border-neutral-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dhong (ঢং) VIP Member Perks</span>
            </div>
            <h3 className="font-brand text-2xl sm:text-3xl font-bold text-neutral-100">
              Get ৳500 Off Your First Eid & Party Order
            </h3>
            <p className="text-neutral-400 max-w-md font-light">
              Subscribe to receive exclusive early access to festive capsule releases, designer discounts, and VIP invitationals.
            </p>
          </div>

          <div className="lg:col-span-6">
            {isSubscribed ? (
              <div className="p-4 rounded-xl bg-neutral-800 border border-red-500/50 text-red-400 text-sm font-semibold">
                Welcome to Dhong family! Use promo code DHONG500 at checkout.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md ml-auto">
                <input
                  type="email"
                  required
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="Enter your phone or email..."
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-full px-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20 shrink-0"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://i.ibb.co.com/zVVGNSpd/bg.png"
                alt="Dhong Logo"
                className="h-10 w-auto object-contain brightness-110"
              />
              <div className="flex flex-col">
                <span className="font-brand text-xl font-bold tracking-widest text-neutral-100 leading-none">
                  DHONG
                </span>
                <span className="text-[11px] text-red-500 font-medium tracking-wider mt-0.5">ঢং এক্সক্লুসিভ ফ্যাশন</span>
              </div>
            </div>
            <p className="text-neutral-400 leading-relaxed font-light pr-6">
              Dhong is Bangladesh’s premier designer dress house, handcrafting evening gowns, festive anarkalis, fluid mulberry silks, and contemporary cocktail frocks for discerning women across Dhaka, Chittagong, Sylhet, and all 64 districts.
            </p>
            <div className="space-y-1.5 text-[11px] text-neutral-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Road 11, Banani & Dhanmondi 27, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Hotline: +880 1711-223344 (10 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>support@dhongfashion.com</span>
              </div>
            </div>
          </div>

          {/* Couture Collections */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-bold uppercase tracking-wider text-xs">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => toggleCategoryFilter('Party Gowns')}
                  className="hover:text-red-400 transition-colors"
                >
                  Party Gowns
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleCategoryFilter('Silk & Georgette')}
                  className="hover:text-red-400 transition-colors"
                >
                  Silk & Georgette
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleCategoryFilter('Festive Anarkalis')}
                  className="hover:text-red-400 transition-colors"
                >
                  Festive Anarkalis
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleCategoryFilter('Cocktail & Western')}
                  className="hover:text-red-400 transition-colors"
                >
                  Cocktail & Western
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleCategoryFilter('Casual Kurti Frocks')}
                  className="hover:text-red-400 transition-colors"
                >
                  Casual Kurti Frocks
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Concierge */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-bold uppercase tracking-wider text-xs">
              Customer Support
            </h4>
            <ul className="space-y-2">
              <li className="hover:text-neutral-200 cursor-pointer">Cash on Delivery Policy</li>
              <li className="hover:text-neutral-200 cursor-pointer">Nationwide Courier (Pathao / Steadfast)</li>
              <li className="hover:text-neutral-200 cursor-pointer">7-Day Size Exchange Guarantee</li>
              <li className="hover:text-neutral-200 cursor-pointer">Silk & Velvet Dry Clean Tips</li>
              <li className="hover:text-neutral-200 cursor-pointer">Track Your Order Status</li>
            </ul>
          </div>

          {/* Brand Assurance */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-bold uppercase tracking-wider text-xs">
              Trust & Quality
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Every dress passes our thorough master-tailor quality audit before being packed in our luxury dust protection bag.
            </p>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
              <span>100% Authentic Fabric & Quality Assurance</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Dhong (ঢং) Fashion Bangladesh. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Delivery & Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
