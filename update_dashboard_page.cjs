const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\page.tsx';

const newContent = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, clearToken } from "../lib/api";

type Restaurant = { id: string; name: string; slug: string; phone: string };

export default function AppHome() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Usuário");

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await api("/api/restaurants/mine");
      console.log("DEBUG - Dados recebidos:", data);
      console.log("DEBUG - Restaurantes:", data?.restaurants);

      if (data?.restaurants && data.restaurants.length > 0) {
        console.log("DEBUG - Primeiro restaurante:", data.restaurants[0]);
        console.log("DEBUG - ID do primeiro:", data.restaurants[0].id);
        console.log("DEBUG - Slug do primeiro:", data.restaurants[0].slug);
      }

      setRestaurants(data?.restaurants || []);
    } catch (e: any) {
      console.error("DEBUG - Erro ao carregar:", e);
      setErr(e.message || "Erro ao carregar restaurantes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    
    // Pegar nome do usuário do localStorage
    try {
      const userStr = localStorage.getItem("pronto_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email?.split("@")[0] || "Usuário");
      }
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel pronto</h1>
                <p className="text-sm text-gray-600">Olá, {userName}! 👋</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition shadow-sm"
                href="/app/restaurant/new"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Restaurante
              </Link>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold hover:from-gray-800 hover:to-gray-900 transition shadow-lg"
                onClick={() => { clearToken(); window.location.href = "/"; }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
              <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-emerald-400 opacity-20"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Carregando seus restaurantes...</p>
            <p className="mt-2 text-sm text-gray-500">Aguarde um momento</p>
          </div>
        )}

        {/* Error State */}
        {err && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">Erro ao carregar</h3>
                <p className="mt-1 text-red-700">{err}</p>
                <button
                  onClick={load}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && !err && (
          <>
            {restaurants.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Meus Restaurantes</h2>
                    <p className="mt-1 text-gray-600">
                      {restaurants.length} {restaurants.length === 1 ? "restaurante cadastrado" : "restaurantes cadastrados"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {restaurants.map(r => (
                    <div key={r.id} className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg hover:shadow-2xl hover:border-emerald-300 transition-all duration-300">
                      {/* Decorative gradient */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="relative">
                        {/* Restaurant icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>

                        {/* Restaurant info */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{r.name}</h3>
                        
                        <div className="space-y-2 mb-5">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="font-mono text-gray-700 font-medium">{r.slug}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span className="font-mono text-gray-700">{r.phone}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 mb-5 font-mono border-t border-gray-100 pt-3">
                          ID: {r.id}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Link
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                            href={\`/r/\${r.slug}\`}
                            target="_blank"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </Link>
                          <Link
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
                            href={\`/app/restaurant/\${r.id}\`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Gerenciar
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum restaurante cadastrado</h3>
                <p className="text-gray-600 text-center max-w-md mb-8">
                  Comece criando seu primeiro restaurante e configure seu cardápio para começar a receber pedidos online!
                </p>
                <Link
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-lg font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition shadow-xl shadow-emerald-600/30"
                  href="/app/restaurant/new"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar meu primeiro restaurante
                </Link>
                
                {/* Benefits */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                  <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Rápido e fácil</h4>
                    <p className="text-sm text-gray-600">Configure em minutos</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Gestão completa</h4>
                    <p className="text-sm text-gray-600">Produtos e categorias</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Online na hora</h4>
                    <p className="text-sm text-gray-600">Compartilhe seu link</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{\`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Painel principal atualizado com design profissional!');
console.log('');
console.log('🎨 Melhorias aplicadas:');
console.log('   ✓ Header moderno com logo e saudação personalizada');
console.log('   ✓ Background animado com gradiente');
console.log('   ✓ Cards de restaurante com design premium');
console.log('   ✓ Ícones SVG para todas as ações');
console.log('   ✓ Loading state elegante com animação');
console.log('   ✓ Estado vazio com benefícios destacados');
console.log('   ✓ Botões com gradientes e sombras');
console.log('   ✓ Grid responsivo (1/2/3 colunas)');
console.log('   ✓ Informações organizadas com ícones');
console.log('   ✓ Hover effects e transições suaves');
console.log('   ✓ WhatsApp icon e link para visualizar cardápio');
