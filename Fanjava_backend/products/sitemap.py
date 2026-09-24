# products/sitemap.py

from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from .models import Produit

# Pages publiques du frontend (chemin, fréquence de mise à jour, priorité)
PAGES_STATIQUES = [
    ('/', 'daily', '1.0'),
    ('/faq', 'monthly', '0.4'),
    ('/contact', 'yearly', '0.3'),
    ('/shipping', 'yearly', '0.3'),
    ('/terms', 'yearly', '0.2'),
    ('/privacy', 'yearly', '0.2'),
]


def _url(loc, changefreq, priority, lastmod=None):
    lignes = [f'  <url>\n    <loc>{escape(loc)}</loc>']
    if lastmod:
        lignes.append(f'    <lastmod>{lastmod}</lastmod>')
    lignes.append(f'    <changefreq>{changefreq}</changefreq>\n    <priority>{priority}</priority>\n  </url>')
    return '\n'.join(lignes)


@cache_page(60 * 60)
def sitemap_xml(request):
    """Sitemap XML des pages publiques et des produits visibles, pour les moteurs de recherche."""
    base = settings.FRONTEND_URL
    urls = [_url(f'{base}{chemin}', freq, prio) for chemin, freq, prio in PAGES_STATIQUES]

    produits = (
        Produit.objects.filter(status='active', actif=True)
        .only('slug', 'updated_at')
        .order_by('-updated_at')
    )
    for produit in produits.iterator():
        urls.append(
            _url(
                f'{base}/products/{produit.slug}',
                'weekly',
                '0.8',
                lastmod=produit.updated_at.date().isoformat() if produit.updated_at else None,
            )
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(urls)
        + '\n</urlset>\n'
    )
    return HttpResponse(xml, content_type='application/xml; charset=utf-8')
