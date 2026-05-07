import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppButtonProps {
  phone?: string;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <AnimatePresence>
      <motion.a
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform md:bottom-8 md:right-8"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </motion.a>
    </AnimatePresence>
  );
}
