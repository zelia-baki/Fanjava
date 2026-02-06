import { motion } from 'framer-motion';

export default function InfoSection({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="ml-3 text-xl font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="text-gray-600 leading-relaxed space-y-3">
        {children}
      </div>
    </motion.div>
  );
}
