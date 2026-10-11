import { AlertTriangle, CreditCard, Megaphone, Package, ShoppingCart, Star, User } from 'lucide-react';

const TYPES = {
  order: { icon: ShoppingCart, className: 'bg-emerald-50 text-emerald-700' },
  order_status: { icon: Package, className: 'bg-gray-100 text-gray-900' },
  stock: { icon: AlertTriangle, className: 'bg-orange-50 text-orange-700' },
  payment: { icon: CreditCard, className: 'bg-emerald-50 text-emerald-700' },
  review: { icon: Star, className: 'bg-amber-50 text-amber-700' },
  account: { icon: User, className: 'bg-gray-100 text-gray-900' },
  general: { icon: Megaphone, className: 'bg-gray-100 text-gray-900' },
};

/** Pastille d'icône selon le type de notification (remplace les emojis). */
export default function NotificationTypeIcon({ type, size = 'md' }) {
  const { icon: Icon, className } = TYPES[type] || TYPES.general;
  const box = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  return (
    <span className={`${box} shrink-0 flex items-center justify-center ${className}`} aria-hidden="true">
      <Icon className="w-5 h-5" />
    </span>
  );
}
