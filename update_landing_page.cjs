const fs = require('fs');

const filePath = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\page.tsx';

const newContent = `import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Nav */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">pronto</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 font-medium transition">Como funciona</a>
            <a href="#recursos" className="text-gray-600 hover:text-gray-900 font-medium transition">Recursos</a>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30"
            >
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-white to-white opacity-60"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-emerald-700">Usado por +100 restaurantes</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Seu delivery no
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  automático
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Cardápio digital profissional + pedidos direto no WhatsApp. 
                Comece a vender em minutos, sem comissões e sem complicação.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/30 text-center"
                >
                  Criar conta grátis
                </Link>
                <a
                  href="#como-funciona"
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-300 transition text-center"
                >
                  Ver demonstração
                </a>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 font-medium">Sem mensalidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 font-medium">Sem comissão</span>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl"></div>
                    <div>
                      <div className="font-bold text-lg">Seu Restaurante</div>
                      <div className="text-emerald-100 text-sm">Aberto • Entrega em 30-40min</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition cursor-pointer">
                    <div>
                      <div className="font-semibold text-gray-900">Hambúrguer Artesanal</div>
                      <div className="text-sm text-gray-500 mt-1">Pão brioche, carne 180g, queijo...</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">R$ 29,90</div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition cursor-pointer">
                    <div>
                      <div className="font-semibold text-gray-900">Açaí 500ml</div>
                      <div className="text-sm text-gray-500 mt-1">Açaí cremoso com granola</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">R$ 19,90</div>
                  </div>
                  <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Pedir no WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xl text-gray-600">
              Ferramenta completa para gerenciar seu delivery sem complicação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cardápio Digital</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Link personalizado para compartilhar ou transformar em QR Code. Seus clientes acessam de qualquer lugar.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <span>Ver exemplo</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pedidos no WhatsApp</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cliente monta o pedido e envia tudo formatado com 1 clique direto no seu WhatsApp. Sem app, sem complicação.
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-semibold">
                <span>Como funciona</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestão Simples</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cadastre produtos, organize categorias, ative/desative itens. Painel intuitivo para gerenciar tudo.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span>Acessar painel</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comece a vender em 3 passos
            </h2>
            <p className="text-xl text-gray-600">
              Configure em minutos e compartilhe seu cardápio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-blue-200"></div>
            
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30 relative z-10">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Crie sua conta</h3>
              <p className="text-gray-600 leading-relaxed">
                Cadastro rápido e grátis. Em menos de 1 minuto você já tem acesso ao painel.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-600/30 relative z-10">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Configure o cardápio</h3>
              <p className="text-gray-600 leading-relaxed">
                Adicione produtos, preços, fotos e organize em categorias. Interface simples e intuitiva.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30 relative z-10">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Compartilhe e venda</h3>
              <p className="text-gray-600 leading-relaxed">
                Envie o link para seus clientes ou use QR Code. Pedidos chegam direto no WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/30"
            >
              Criar minha conta grátis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para aumentar suas vendas?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Junte-se a centenas de restaurantes que já vendem mais com o pronto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-emerald-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition shadow-2xl"
            >
              Começar agora — É grátis
            </Link>
            <a
              href="#recursos"
              className="px-8 py-4 bg-emerald-700 text-white text-lg font-semibold rounded-xl hover:bg-emerald-800 transition border border-emerald-500"
            >
              Conhecer recursos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-white font-bold text-xl">pronto</span>
            </div>
            <p className="text-center md:text-left">
              © 2026 pronto — Delivery simples, direto e funcional
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Termos</a>
              <a href="#" className="hover:text-white transition">Privacidade</a>
              <a href="#" className="hover:text-white transition">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Landing page atualizada com design profissional!');
console.log('');
console.log('🎨 Melhorias aplicadas:');
console.log('   ✓ Design moderno estilo iFood/Brendi');
console.log('   ✓ Gradientes e sombras profissionais');
console.log('   ✓ Tipografia hierárquica e espaçamentos corretos');
console.log('   ✓ Cards interativos com hover effects');
console.log('   ✓ CTAs destacados e persuasivos');
console.log('   ✓ Preview do produto em destaque');
console.log('   ✓ Seção "Como funciona" visual');
console.log('   ✓ Footer profissional');
console.log('   ✓ Responsive design');
