import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { X } from 'lucide-react';

export default function WhatsAppFloat() {
  const { language } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('whatsapp_dismissed') === 'true';
  });

  useEffect(() => {
    if (isDismissed) return;
    // Show tooltip after 3 seconds, then hide after 9 seconds
    const timer1 = setTimeout(() => setShowTooltip(true), 3000);
    const timer2 = setTimeout(() => setShowTooltip(false), 9000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isDismissed]);

  const whatsappUrl = "https://wa.me/8801721929231";

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('whatsapp_dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end pointer-events-none select-none group">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="mb-2 bg-stone-900 text-white text-[11px] md:text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl flex items-center gap-1.5 border border-stone-800 pointer-events-auto cursor-pointer"
            onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {language === 'bn' ? 'হোয়াটসঅ্যাপে আমাদের সাথে কথা বলুন' : 'Chat with us on WhatsApp'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-1 -left-1 z-50 w-5.5 h-5.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-white rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110 active:scale-95 opacity-85 md:opacity-0 md:group-hover:opacity-100"
          title={language === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 text-white relative transition-all cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
        >
          {/* Animated outer pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping opacity-60"></span>
          
          {/* Notification badge / Online indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black leading-none text-white">
            1
          </span>

          {/* Brand SVG for WhatsApp */}
          <svg className="w-6.5 h-6.5 md:w-7.5 md:h-7.5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.885-6.963C16.588 1.91 14.116.885 11.488.885 6.05.885 1.625 5.309 1.622 10.75c-.001 1.748.461 3.454 1.336 4.975l-.97 3.546 3.636-.954zm11.41-5.111c-.302-.151-1.787-.881-2.062-.981-.275-.1-.475-.151-.675.151-.2.301-.775.981-.95 1.181-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.41-1.487-.89-.794-1.491-1.776-1.666-2.076-.175-.3-.02-.462.13-.612.135-.135.301-.351.451-.526.15-.175.2-.3.3-.5.1-.2.05-.376-.025-.526-.075-.15-.675-1.627-.925-2.228-.244-.588-.493-.508-.675-.517-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.376-.275.301-1.05 1.027-1.05 2.505 0 1.478 1.075 2.906 1.225 3.107.15.2 2.115 3.23 5.124 4.531.715.31 1.273.495 1.708.634.719.229 1.373.196 1.89.119.577-.086 1.787-.73 2.037-1.437.25-.706.25-1.313.175-1.437-.075-.125-.275-.201-.575-.352z" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
}
