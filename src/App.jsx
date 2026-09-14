import { useEffect, useMemo, useState } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturesBand } from './components/FeaturesBand';
import { CollectionSection } from './components/CollectionSection';
import { Lookbook } from './components/Lookbook';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartToast } from './components/CartToast';
import { AdminStudio } from './components/admin/AdminStudio';
import { useProducts } from './context/ProductsContext';

const getSearchKey = (product) =>
  `${product.name} ${product.enName} ${product.fabric} ${product.category}`.toLowerCase();

const getRoute = () => (window.location.hash === '#/admin' || window.location.hash === '#admin' ? 'admin' : 'home');

export default function App() {
  const { products: allProducts } = useProducts();
  const [route, setRoute] = useState(getRoute);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fabric, setFabric] = useState('همه');
  const [color, setColor] = useState(null);
  const [category, setCategory] = useState('همه');
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute());
      if (getRoute() === 'admin') setQuickView(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === 'admin') return <AdminStudio />;

  const products = useMemo(() => {
    let list = [...allProducts];

    if (category !== 'همه') list = list.filter((p) => p.category === category);
    if (fabric !== 'همه') list = list.filter((p) => p.fabric === fabric);
    if (color) list = list.filter((p) => p.colors.some((c) => c.hex === color));

    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => getSearchKey(p).includes(q));

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => Number(Boolean(b.badges.length)) - Number(Boolean(a.badges.length)));
    }
    return list;
  }, [allProducts, category, fabric, color, sort, search]);

  const handleSearchSelect = (product) => {
    setSearch(product.name);
    setCategory('همه');
    setFabric('همه');
    setColor(null);
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <AnnouncementBar />
      <Header onOpenCart={() => setCartOpen(true)} onOpenSearch={() => setSearchOpen(true)} />

      <main>
        <Hero />
        <FeaturesBand />
        <CollectionSection
          products={products}
          category={category}
          setCategory={setCategory}
          fabric={fabric}
          setFabric={setFabric}
          color={color}
          setColor={setColor}
          sort={sort}
          setSort={setSort}
          onQuickView={setQuickView}
        />
        <Lookbook />
        <Newsletter />
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
      <FloatingWhatsApp />
      <ProductQuickViewModal product={quickView} onClose={() => setQuickView(null)} />
      <CartToast />
    </div>
  );
}