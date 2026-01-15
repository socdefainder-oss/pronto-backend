const fs = require('fs');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\r\[slug]\page.tsx`;

const content = `"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";

interface CartItem {
  productId: string;
  productName: string;
  priceCents: number;
  quantity: number;
}

export default function PublicRestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const url = \`\${API_URL}/api/public/restaurants/\${encodeURIComponent(slug)}\`;
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          setError("Restaurante não encontrado");
          return;
        }

        const data = await response.json();
        setRestaurant(data);
        setError(null);
      } catch (err: any) {
        setError("Erro de conexão com o servidor");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [slug]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        priceCents: product.priceCents,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      restaurantId: restaurant.id,
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email") || undefined,
      },
      address: formData.get("street") ? {
        street: formData.get("street"),
        number: formData.get("number"),
        complement: formData.get("complement") || undefined,
        district: formData.get("district"),
        city: formData.get("city"),
        state: formData.get("state"),
        zipCode: formData.get("zipCode") || undefined,
      } : undefined,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("notes") || undefined,
      deliveryFeeCents: 0,
    };

    try {
      const response = await fetch(\`\${API_URL}/api/orders\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Erro ao criar pedido");

      const order = await response.json();
      
      // Limpar carrinho e fechar modal
      setCart([]);
      setShowCheckout(false);

      // Redirecionar para WhatsApp
      const phone = String(restaurant?.phone || "").replace(/\\D/g, "");
      if (phone) {
        const message = encodeURIComponent(
          \`Olá! Acabei de fazer o pedido #\${order.orderNumber}\\n\\n\` +
          \`Total: R$ \${(order.totalCents / 100).toFixed(2).replace(".", ",")}\\n\\n\` +
          \`Obrigado!\`
        );
        window.open(\`https://wa.me/\${phone}?text=\${message}\`, "_blank");
      }

      alert(\`Pedido #\${order.orderNumber} criado com sucesso!\\nO restaurante receberá sua solicitação.\`);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      alert("Erro ao criar pedido. Tente novamente.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Cardápio não encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition">
            Voltar para página inicial
          </Link>
        </div>
      </div>
    );
  }

  const phone = String(restaurant?.phone || "").replace(/\\D/g, "");
  const hasCategoriesWithProducts = restaurant?.categories?.some((cat: any) => cat.products?.length > 0);
  const hasProductsWithoutCategory = restaurant?.productsWithoutCategory?.length > 0;
  const hasProducts = hasCategoriesWithProducts || hasProductsWithoutCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Link>
            <div className="h-8 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900 truncate">{restaurant?.name}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{restaurant?.name}</h1>
              {restaurant?.description && <p className="text-gray-600 mt-1">{restaurant.description}</p>}
            </div>
          </div>
          {restaurant?.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-700">{restaurant.address}</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Cardápio
          </h2>

          {!hasProducts ? (
            <div className="py-16 text-center">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Cardápio em preparação</h3>
              <p className="text-gray-600">O restaurante está organizando seus produtos.</p>
            </div>
          ) : (
            <>
              {restaurant?.categories?.map((category: any) => (
                category.products?.length > 0 && (
                  <div key={category.id} className="mb-12 last:mb-0">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                      {category.name}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {category.products.map((product: any) => (
                        <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                      ))}
                    </div>
                  </div>
                )
              ))}

              {restaurant?.productsWithoutCategory?.length > 0 && (
                <div className="mb-12 last:mb-0">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                    Outros itens
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {restaurant.productsWithoutCategory.map((product: any) => (
                      <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCheckout(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-600/50 transition-all hover:scale-105 flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div>
            <div className="font-bold text-lg">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</div>
            <div className="text-sm">R$ {(cartTotal / 100).toFixed(2).replace('.', ',')}</div>
          </div>
        </button>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
              <button onClick={() => setShowCheckout(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Cart Items */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">R$ {(item.priceCents / 100).toFixed(2).replace('.', ',')} cada</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">-</button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">+</button>
                      <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-red-600 hover:text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="font-bold text-gray-900 w-24 text-right">
                        R$ {((item.priceCents * item.quantity) / 100).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">R$ {(cartTotal / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome *</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp *</label>
                  <input type="tel" name="phone" required placeholder="(11) 99999-9999" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">Endereço de Entrega (opcional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <input type="text" name="street" placeholder="Rua" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="number" placeholder="Número" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="complement" placeholder="Complemento" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="district" placeholder="Bairro" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="city" placeholder="Cidade" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="state" placeholder="Estado" maxLength={2} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <input type="text" name="zipCode" placeholder="CEP" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Forma de Pagamento</label>
                  <select name="paymentMethod" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500">
                    <option value="cash">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="card">Cartão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Observações</label>
                  <textarea name="notes" rows={3} placeholder="Alguma observação sobre o pedido?" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"></textarea>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-lg disabled:opacity-50"
                >
                  {orderLoading ? "Enviando..." : \`Finalizar Pedido - R$ \${(cartTotal / 100).toFixed(2).replace('.', ',')}\`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: any; onAdd: () => void }) {
  const priceInReais = (product.priceCents / 100).toFixed(2).replace('.', ',');

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-300 transition bg-white flex flex-col">
      <div className="flex-1">
        <h4 className="font-bold text-xl text-gray-900 mb-3">{product.name}</h4>
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
        )}
        <div className="text-3xl font-bold text-emerald-600 mb-4">
          R$ {priceInReais}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Adicionar
      </button>
    </div>
  );
}
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log(' Sistema de carrinho implementado!');
