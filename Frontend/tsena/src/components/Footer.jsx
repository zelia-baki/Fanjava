import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ShoppingBag,
  Heart,
  Shield,
  Truck
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* 🎨 BACKGROUND ANIMÉ TECH */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/backgrounds/footer_tech_animated.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Overlay pour meilleure lisibilité - Tons chauds */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-emerald-950/20 to-gray-950/98 backdrop-blur-sm z-0"></div>

      {/* Contenu du footer */}
      <div className="relative z-10">
        {/* Section principale */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Colonne 1 - À propos */}
            <div>
              <Link to="/" className="inline-block mb-4">
                <img 
                  src="/Fanja.png" 
                  alt="FanJava.mg" 
                  className="h-16 w-auto hover:scale-105 transition-transform"
                />
              </Link>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Votre marketplace multi-vendeurs de confiance à Madagascar. 
                Achetez et vendez en toute sécurité.
              </p>
              
              {/* Réseaux sociaux */}
              <div className="flex space-x-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500 hover:bg-gray-800 transition-all hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500 hover:bg-gray-800 transition-all hover:scale-110"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500 hover:bg-gray-800 transition-all hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500 hover:bg-gray-800 transition-all hover:scale-110"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Colonne 2 - Liens rapides */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2 text-emerald-400" />
                Liens rapides
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/products" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Produits
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    À propos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register/entreprise" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Devenir vendeur
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 3 - Informations */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-emerald-400" />
                Informations
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/terms" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shipping" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Livraison
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/returns" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Retours et remboursements
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/faq" 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4 - Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-emerald-400" />
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start text-sm">
                  <Mail className="w-4 h-4 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Email</p>
                    <a 
                      href="mailto:contact@fanjava.mg" 
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      contact@fanjava.mg
                    </a>
                  </div>
                </li>
                <li className="flex items-start text-sm">
                  <Phone className="w-4 h-4 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Téléphone</p>
                    <a 
                      href="tel:+261000000000" 
                      className="text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      +261 XX XX XXX XX
                    </a>
                  </div>
                </li>
                <li className="flex items-start text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs mb-0.5">Adresse</p>
                    <p className="text-gray-300">
                      Antananarivo, Madagascar
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Section avantages */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Avantage 1 */}
              <div className="flex items-start space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm mb-1">Livraison rapide</h5>
                  <p className="text-gray-400 text-xs">Partout à Madagascar</p>
                </div>
              </div>

              {/* Avantage 2 */}
              <div className="flex items-start space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm mb-1">Paiement sécurisé</h5>
                  <p className="text-gray-400 text-xs">Transactions protégées</p>
                </div>
              </div>

              {/* Avantage 3 */}
              <div className="flex items-start space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm mb-1">Support 24/7</h5>
                  <p className="text-gray-400 text-xs">Assistance disponible</p>
                </div>
              </div>

              {/* Avantage 4 */}
              <div className="flex items-start space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all hover:scale-105">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm mb-1">Produits variés</h5>
                  <p className="text-gray-400 text-xs">Large sélection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de séparation avec effet lumineux */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent h-px"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent h-px blur-sm"></div>
        </div>

        {/* Section copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm text-center sm:text-left flex items-center space-x-2">
              <span>© {currentYear}</span>
              <img 
                src="/Fanja.png" 
                alt="FanJava.mg" 
                className="h-6 w-auto inline-block"
              />
              <span>Tous droits réservés.</span>
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
              >
                Mentions légales
              </Link>
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
              >
                Confidentialité
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>

          {/* Badge "Made in Madagascar" */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/10 via-green-500/10 to-white/10 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
              <span className="text-xl">🇲🇬</span>
              <span className="text-gray-300 text-xs font-medium">
                Fièrement créé à Madagascar
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
