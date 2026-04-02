/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import ScrollToTop from '@/src/components/layout/ScrollToTop';
import { Home } from '@/src/pages/Home';
import { Catalog } from '@/src/pages/Catalog';
import { Contact } from '@/src/pages/Contact';
import { About } from '@/src/pages/About';
import { ProductDetail } from '@/src/pages/ProductDetail';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-jrs-cream font-sans text-jrs-black">
        <Header />
        <main className="flex-grow pt-[72px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre-nos" element={<About />} />
            <Route path="/produtos" element={<Catalog />} />
            <Route path="/contactos" element={<Contact />} />
            <Route path="/produtos/:categoryId/:subcategoryId" element={<ProductDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
