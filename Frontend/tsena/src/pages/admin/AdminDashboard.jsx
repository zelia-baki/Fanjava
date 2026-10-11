// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Package,
  ShoppingBag,
  Wallet,
  AlertCircle,
  Star,
  FolderTree,
  Bell,
  UserPlus,
  Clock
} from 'lucide-react';
import { statsService } from '@/services/statsService';
import BlobImage from '@/components/ui/BlobImage';
import PageLoader from '@/components/ui/PageLoader';
import { FormAlert } from '@/components/ui/Form';
import { formatPrix } from '@/utils/format';
import { DashboardHeader, StatCard, Badge, Growth, ActionTile, Panel } from '@/components/dashboard/DashboardUI';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [globalStats, chartData, products] = await Promise.all([
        statsService.getGlobalStats(),
        statsService.getSalesChartData(),
        statsService.getTopProducts(5)
      ]);

      setStats(globalStats);
      setSalesData(chartData);
      setTopProducts(products);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FormAlert title={error}>
            <button type="button" onClick={fetchDashboardData} className="font-semibold underline underline-offset-2 cursor-pointer">
              Réessayer
            </button>
          </FormAlert>
        </div>
      </MainLayout>
    );
  }

  const alertesStock = (stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0);
  const maxRevenue = Math.max(0, ...salesData.map((d) => d.revenue));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <DashboardHeader
          kicker="Administration"
          title="Tableau de bord"
          subtitle={`Bonjour ${user?.first_name || user?.username || ''}, voici l'état de la plateforme.`}
        />

        {/* Indicateurs principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Utilisateurs" value={stats?.totalUsers || 0} icon={Users} footer={<Growth value={stats?.usersGrowth} />}>
            <Badge>{stats?.totalClients || 0} clients</Badge>
            <Badge>{stats?.totalEntreprises || 0} vendeurs</Badge>
          </StatCard>
          <StatCard label="Produits" value={stats?.totalProducts || 0} icon={Package}>
            <Badge tone="emerald">{stats?.activeProducts || 0} actifs</Badge>
            {stats?.lowStockProducts > 0 && <Badge tone="orange">{stats.lowStockProducts} stock faible</Badge>}
          </StatCard>
          <StatCard label="Commandes" value={stats?.totalOrders || 0} icon={ShoppingBag} footer={<Growth value={stats?.ordersGrowth} />}>
            {stats?.pendingOrders > 0 && <Badge tone="orange">{stats.pendingOrders} en attente</Badge>}
            <Badge tone="emerald">{stats?.completedOrders || 0} livrées</Badge>
          </StatCard>
          <StatCard
            label="Chiffre d'affaires"
            value={formatPrix(stats?.totalRevenue || 0)}
            icon={Wallet}
            tone="emerald"
            footer={<Growth value={stats?.revenueGrowth} />}
          >
            <Badge>Ce mois : {formatPrix(stats?.monthlyRevenue || 0)}</Badge>
          </StatCard>
        </div>

        {/* Indicateurs secondaires */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Inscrits ce mois" value={stats?.newUsersThisMonth || 0} icon={UserPlus} />
          <StatCard label="Avis à modérer" value={stats?.pendingReviews || 0} icon={Clock} tone={stats?.pendingReviews > 0 ? 'amber' : 'neutral'} />
          <StatCard label="Note moyenne" value={`${stats?.averageRating || 0}/5`} icon={Star} tone="amber" />
          <StatCard label="Alertes stock" value={alertesStock} icon={AlertCircle} tone={alertesStock > 0 ? 'red' : 'neutral'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Panel title="Actions rapides" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ActionTile to="/admin/users" icon={Users} title="Utilisateurs" text={`${stats?.totalUsers || 0} inscrits`} />
              <ActionTile to="/admin/products" icon={Package} title="Produits" text={`${stats?.totalProducts || 0} au total`} />
              <ActionTile to="/admin/orders" icon={ShoppingBag} title="Commandes" text={`${stats?.pendingOrders || 0} à traiter`} />
              <ActionTile to="/admin/reviews" icon={Star} title="Avis" text={`${stats?.pendingReviews || 0} à modérer`} />
              <ActionTile to="/admin/categories" icon={FolderTree} title="Catégories" text="Organiser le catalogue" />
              <ActionTile to="/admin/notifications" icon={Bell} title="Notifications" text="Envoyer un message" />
            </div>
          </Panel>

          <Panel title="Meilleures ventes">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
                <p className="text-gray-600">Aucune vente pour le moment</p>
              </div>
            ) : (
              <ol className="-my-3 divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <span className="w-6 font-display font-extrabold text-gray-400 tabular-nums">{index + 1}</span>
                    <div className="w-12 h-12 bg-gray-100 shrink-0 overflow-hidden">
                      {product.image_principale_id ? (
                        <BlobImage imageId={product.image_principale_id} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-950 text-sm truncate">{product.nom}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {product.nombre_ventes} ventes · {product.nombre_vues} vues
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        {salesData.length > 0 && (
          <Panel title="Ventes des 12 derniers mois">
            <div className="h-56 flex items-end gap-1.5 sm:gap-2" role="list" aria-label="Chiffre d'affaires par mois">
              {salesData.map((data) => {
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                const mois = new Date(data.month + '-01').toLocaleDateString('fr-FR', { month: 'short' });
                return (
                  <div key={data.month} role="listitem" className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                    <div
                      className="w-full max-w-10 min-h-0.5 bg-emerald-600 hover:bg-gray-950 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${mois} : ${formatPrix(data.revenue)} – ${data.orders} commande(s)`}
                    />
                    <span className="text-[11px] text-gray-600">{mois}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </div>
    </MainLayout>
  );
}
