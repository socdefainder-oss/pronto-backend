const fs = require('fs');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\app\restaurant\[id]\page.tsx`;

const newContent = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "../../../lib/api";

type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isActive: boolean;
  sortOrder: number;
  categoryId: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";

  // Load data
  useEffect(() => {
    if (!restaurantId) return;
    loadData();
  }, [restaurantId]);

  async function loadData() {
    if (!restaurantId) return;

    setLoading(true);
    setError("");
    const token = getToken();

    if (!token) {
      router.push("/login");
      setLoading(false);
      return;
    }

    try {
      // Load products
      const productsRes = await fetch(\`\${API_URL}/api/catalog/products/\${restaurantId}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      } else {
        console.error("Erro ao carregar produtos:", productsRes.status);
      }

      // Load categories
      const categoriesRes = await fetch(\`\${API_URL}/api/catalog/categories/\${restaurantId}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

    } catch (err: any) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle form
  function handleEdit(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice((product.priceCents / 100).toString());
    setCategoryId(product.categoryId || "");
    setIsActive(product.isActive);
    setImageUrl(product.imageUrl || "");
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsActive(true);
    setImageUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Validation
    if (!name.trim()) {
      setError("Nome do produto é obrigatório");
      return;
    }

    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      setError("Preço inválido");
      return;
    }

    const productData = {
      restaurantId,
      name: name.trim(),
      description: description.trim() || null,
      priceCents,
      categoryId: categoryId || null,
      isActive,
      imageUrl: imageUrl.trim() || null,
    };

    setError("");
    setSuccess("");

    try {
      if (editingProduct) {
        // Update product
        const res = await fetch(\`\${API_URL}/api/catalog/products/\${editingProduct.id}\`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao atualizar produto");
        }

        setSuccess("Produto atualizado com sucesso!");
      } else {
        // Create product
        const res = await fetch(\`\${API_URL}/api/catalog/products\`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao criar produto");
        }

        setSuccess("Produto criado com sucesso!");
      }

      handleCancel();
      loadData();

    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(\`\${API_URL}/api/catalog/products/\${productId}\`, {
        method: "DELETE",
        headers: { Authorization: \`Bearer \${token}\` },
      });

      if (!res.ok) throw new Error("Erro ao excluir produto");

      setSuccess("Produto excluído com sucesso!");
      loadData();
      
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleToggleActive(productId: string, currentActive: boolean) {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(\`\${API_URL}/api/catalog/products/\${productId}\`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar produto");

      setSuccess(\`Produto \${!currentActive ? "ativado" : "desativado"} com sucesso!\`);
      loadData();

    } catch (err: any) {
      setError(err.message);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-emerald-400 opacity-20"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                Gerenciar Produtos
              </h1>
              <p className="mt-2 text-gray-600">
                Cadastre e organize os produtos do seu cardápio
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                href="/app"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Produto
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border-2 border-green-200 bg-green-50 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingProduct ? "✏️ Editar Produto" : "✨ Novo Produto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    placeholder="Ex: Açaí 500ml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                      placeholder="19.90"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Valor final: <span className="font-semibold text-emerald-600">R$ {price || "0,00"}</span>
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition resize-none"
                    placeholder="Ex: Açaí cremoso com granola, leite condensado e banana..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Crie categorias primeiro
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Produto ativo e disponível no cardápio
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
                >
                  {editingProduct ? "💾 Atualizar Produto" : "✨ Criar Produto"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Produtos Cadastrados</h2>
                <p className="mt-1 text-gray-600">
                  {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </p>
              </div>
              <Link
                href={\`/app/restaurant/\${restaurantId}/categories\`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categorias
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-600 mb-6">Clique em "Novo Produto" para começar a criar seu cardápio</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar primeiro produto
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <span
                          className={\`px-3 py-1 text-xs font-bold rounded-full \${
                            product.isActive
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }\`}
                        >
                          {product.isActive ? "✓ Ativo" : "✕ Inativo"}
                        </span>
                        {product.imageUrl && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-300">
                            📷 Foto
                          </span>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-gray-600 mb-3">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-emerald-600">
                          R$ {(product.priceCents / 100).toFixed(2).replace('.', ',')}
                        </span>

                        {product.categoryId && (
                          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
                            {categories.find(c => c.id === product.categoryId)?.name || "Categoria"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={\`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition \${
                          product.isActive
                            ? "bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                        }\`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {product.isActive ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-semibold border-2 border-red-200 hover:bg-red-100 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Próximos passos</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Crie categorias para organizar seus produtos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Adicione preços e descrições atrativas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Ative/desative produtos conforme estoque</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">4.</span>
                    <span>Teste o cardápio público</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">🔗 Link do cardápio</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Seu cardápio público ficará disponível em:
                </p>
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
                  <code className="block text-sm font-mono text-emerald-700 break-all font-semibold">
                    https://pronto-frontend-rust.vercel.app/r/SEU-SLUG-AQUI
                  </code>
                </div>
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  O slug é definido nas configurações do restaurante
                </p>
              </div>
            </div>
          </div>
        </div>
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
console.log('✅ Página de gerenciamento de produtos atualizada com design premium!');
console.log('');
console.log('🎨 Melhorias aplicadas:');
console.log('   ✓ Background com gradiente e blobs animados');
console.log('   ✓ Header com ícone e botões estilizados');
console.log('   ✓ Formulário moderno com inputs aprimorados');
console.log('   ✓ Cards de produtos com design premium');
console.log('   ✓ Botões de ação com ícones SVG');
console.log('   ✓ Empty state elegante');
console.log('   ✓ Info cards com gradientes');
console.log('   ✓ Mensagens de sucesso/erro estilizadas');
console.log('   ✓ Loading state com animação dupla');
console.log('   ✓ Badges coloridos para status');
console.log('   ✓ Hover effects e transições suaves');
console.log('   ✓ Layout responsivo e organizado');
