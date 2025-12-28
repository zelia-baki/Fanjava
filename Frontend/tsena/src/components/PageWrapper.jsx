import { motion } from 'framer-motion';

export default function PageWrapper({ title, icon: Icon, children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-8"
      >
        {Icon && (
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center shadow">
            <Icon className="w-7 h-7 text-blue-600" />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {title}
        </h1>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10 space-y-8 text-gray-700"
      >
        {children}
      </motion.div>
    </div>
  );
}
