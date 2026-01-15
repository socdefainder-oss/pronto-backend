const fs = require('fs');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\r\[slug]\page.tsx`;

const newContent = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PublicRestaurantPage({ params }: { params: { slug: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";

  useEffect(() => {
    async function loadRestaurant() {
      try {
        console.log(\`📄 Buscando restaurante: \${params.slug}\`);
        console.log(\`🔗 URL da API: \${API_URL}\`);

        const url = \`\${API_URL}/api/public/restaurants/\${encodeURIComponent(params.slug)}\`;
        console.log(\`🚀 Fazendo requisição para: \${url}\`);

        const response = await fetch(url, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(\`📊 Status: \${response.status}, OK: \${response.ok}\`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(\`❌ Erro da API: \${errorText}\`);
          
          if (response.status === 404) {
            setError("Restaurante não encontrado");
          } else {
            setError(\`Erro \${response.status} ao carregar o cardápio\`);
          }
          return;
        }

        const data = await response.json();
        console.log("✅ Dados recebidos:", data);

        setRestaurant(data);
        setError(null);

      } catch (err: any) {
        console.error("💥 Erro na requisição:", err);
        setError("Erro de conexão com o servidor");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [params.slug, API_URL]);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-emerald-400 opacity-20"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Carregando cardápio...</p>
          <p className="mt-2 text-sm text-gray-500 font-mono">{params.slug}</p>
        </div>
      </div>
    );
  }

  // Estado de erro (restaurante não encontrado)
  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Cardápio não encontrado</h1>
              <p className="text-gray-600 mb-2">
                O restaurante <span className="font-semibold text-red-600">{params.slug}</span> não foi encontrado.
              </p>

              <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  <strong>Detalhes:</strong> {error}
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Voltar para página inicial
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tentar novamente
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-800">
                  <strong>💡 Dica:</strong> Verifique se o link está correto ou entre em contato com o restaurante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de sucesso (restaurante encontrado)
  const phone = String(restaurant?.phone || "").replace(/\\D/g, "");
  const whatsappText = encodeURIComponent(
    \`Olá \${restaurant?.name}! Gostaria de fazer um pedido.\`
  );
  const whatsappLink = phone ? \`https://wa.me/\${phone}?text=\${whatsappText}\` : null;

  // Verifica se há produtos
  const hasCategoriesWithProducts = restaurant?.categories?.some(
    (cat: any) => cat.products && cat.products.length > 0
  );
  const hasProductsWithoutCategory = restaurant?.productsWithoutCategory?.length > 0;
  const hasProducts = hasCategoriesWithProducts || hasProductsWithoutCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Cabeçalho fixo */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Voltar</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900 truncate">{restaurant?.name}</h1>
            </div>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Informações do restaurante */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">{restaurant?.name}</h1>
              </div>

              {restaurant?.description && (
                <p className="text-gray-600 text-lg mb-4">{restaurant.description}</p>
              )}

              {restaurant?.address && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-700">{restaurant.address}</p>
                </div>
              )}
            </div>

            <div className="md:text-right">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-5 rounded-2xl transition shadow-xl shadow-green-600/30"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-lg">Fazer pedido</div>
                    <div className="text-sm opacity-90">Via WhatsApp</div>
                  </div>
                </a>
              ) : (
                <div className="px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-600">
                  <div className="font-medium">WhatsApp não configurado</div>
                  <div className="text-sm mt-1">Entre em contato com o restaurante</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cardápio */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Cardápio
            </h2>

            {!hasProducts && (
              <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-full border border-amber-300">
                Em construção
              </span>
            )}
          </div>

          {!hasProducts ? (
            <div className="py-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Cardápio em preparação
              </h3>
              <p className="text-gray-600 max-w-lg mx-auto mb-8">
                O restaurante está organizando seus produtos para oferecer a melhor experiência.
                Volte em breve para conferir o cardápio completo!
              </p>

              {whatsappLink && (
                <div className="inline-block p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                  <p className="text-sm text-gray-700 mb-3">
                    Enquanto isso, você pode entrar em contato diretamente:
                  </p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Falar com {restaurant?.name} no WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Produtos por categoria */}
              {restaurant?.categories?.map((category: any) => (
                category.products?.length > 0 && (
                  <div key={category.id} className="mb-12 last:mb-0">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                      {category.name}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {category.products.map((product: any) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          restaurantName={restaurant.name}
                          phone={phone}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* Produtos sem categoria */}
              {restaurant?.productsWithoutCategory?.length > 0 && (
                <div className="mb-12 last:mb-0">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
                    Outros itens
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {restaurant.productsWithoutCategory.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        restaurantName={restaurant.name}
                        phone={phone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="mt-8 text-center">
          <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              🚀 Cardápio digital por <span className="font-bold text-emerald-600">pronto</span>
            </p>
            <p className="text-xs text-gray-500">
              Compartilhe este cardápio:{' '}
              <code className="bg-gray-100 px-3 py-1 rounded text-emerald-700 font-mono font-semibold">
                pronto.com/r/{restaurant?.slug}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de produto (reutilizável)
function ProductCard({ product, restaurantName, phone }: {
  product: any;
  restaurantName: string;
  phone: string;
}) {
  const priceInReais = (product.priceCents / 100).toFixed(2).replace('.', ',');

  const handleOrderClick = () => {
    if (!phone) return;

    const message = encodeURIComponent(
      \`Olá \${restaurantName}! Gostaria de pedir:\\n\\n\` +
      \`• \${product.name}\\n\` +
      \`• Quantidade: 1\\n\` +
      \`• Total: R$ \${priceInReais}\\n\\n\` +
      \`Valor: R$ \${priceInReais}\`
    );

    window.open(\`https://wa.me/\${phone}?text=\${message}\`, '_blank');
  };

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-300 transition-all duration-200 bg-white">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h4 className="font-bold text-xl text-gray-900 mb-3">{product.name}</h4>

          {product.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
          )}

          <div className="mt-auto">
            <div className="text-3xl font-bold text-emerald-600">
              R$ {priceInReais}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {phone ? (
            <button
              onClick={handleOrderClick}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Pedir este item
            </button>
          ) : (
            <div className="w-full text-center text-gray-500 text-sm py-3 border-2 border-gray-200 rounded-xl">
              WhatsApp não disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Página pública do cardápio atualizada com design premium!');
console.log('');
console.log('🎨 Melhorias aplicadas:');
console.log('   ✓ Background com gradiente e blobs');
console.log('   ✓ Header fixo com backdrop blur');
console.log('   ✓ Card de informações do restaurante redesenhado');
console.log('   ✓ Seção de cardápio com ícone');
console.log('   ✓ Cards de produtos premium com hover');
console.log('   ✓ Botão WhatsApp com gradiente');
console.log('   ✓ Erro 404 melhorado com design consistente');
console.log('   ✓ Loading state com animação dupla');
console.log('   ✓ Empty state quando não há produtos');
console.log('   ✓ Rodapé informativo estilizado');
console.log('   ✓ Logs detalhados para debug');
