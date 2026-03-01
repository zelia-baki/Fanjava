import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { User, Mail, Phone, MapPin, Loader2, Save } from 'lucide-react';

export default function ProfileEdit() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        adresse_livraison: '',
        ville: '',
        code_postal: '',
        pays: 'Madagascar',
        newsletter: false
    });

    useEffect(() => {
        console.log('User data:', user); 
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                adresse_livraison: user.client?.adresse_livraison || '',
                ville: user.client?.ville || '',
                code_postal: user.client?.code_postal || '',
                pays: user.client?.pays || 'Madagascar',
                newsletter: user.client?.newsletter || false
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const userData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                client: {
                    adresse_livraison: formData.adresse_livraison,
                    ville: formData.ville,
                    code_postal: formData.code_postal,
                    pays: formData.pays,
                    newsletter: formData.newsletter
                }
            };

            const response = await api.patch('/users/profile/', userData);

            if (updateUser) {
                updateUser(response.data);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/client');
            }, 2000);

        } catch (err) {
            console.error('Erreur mise à jour profil:', err);
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Modifier mon profil</h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">Mettez à jour vos informations personnelles</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            Profil mis à jour avec succès ! Redirection...
                        </div>
                    )}

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">

                        {/* Informations personnelles */}
                        <div className="mb-8">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                                    <User className="w-4 h-4 text-emerald-600" />
                                </div>
                                Informations personnelles
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mb-8">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                                    <Mail className="w-4 h-4 text-emerald-600" />
                                </div>
                                Contact
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+261 34 00 000 00"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Adresse de livraison */}
                        <div className="mb-8">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                Adresse de livraison
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse complète
                                    </label>
                                    <textarea
                                        name="adresse_livraison"
                                        value={formData.adresse_livraison}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Lot, rue, quartier..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ville
                                        </label>
                                        <input
                                            type="text"
                                            name="ville"
                                            value={formData.ville}
                                            onChange={handleChange}
                                            placeholder="Antananarivo"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Code postal
                                        </label>
                                        <input
                                            type="text"
                                            name="code_postal"
                                            value={formData.code_postal}
                                            onChange={handleChange}
                                            placeholder="101"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pays
                                        </label>
                                        <input
                                            type="text"
                                            name="pays"
                                            value={formData.pays}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Préférences */}
                        <div className="mb-8">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                                Préférences
                            </h3>

                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="newsletter"
                                    checked={formData.newsletter}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    S'abonner à la newsletter
                                </span>
                            </label>
                        </div>

                        {/* Boutons */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/client')}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
