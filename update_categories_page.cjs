const fs = require('fs');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\app\restaurant\[id]\categories\page.tsx`;

const newContent = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "../../../../lib/api";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  productCount?: number;
};

type Product = {
  id: string;
  name: string;
  categoryId: string | null;
  isActive: boolean;
};

export default function CategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

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
      console.log("Carregando categorias...");
      // Load categories
      const categoriesRes = await fetch(\`\${API_URL}/api/catalog/categories/\${restaurantId}\`, {
        headers: {
          Authorization: \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
      });

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        console.log("Categorias recebidas:", data.categories?.length || 0);
        setCategories(data.categories || []);
      } else {
        console.error("Erro ao carregar categorias:", categoriesRes.status);
      }

      // Load products to count per category
      console.log("Carregando produtos...");
      const productsRes = await fetch(\`\${API_URL}/api/catalog/products/\${restaurantId}\`, {
        headers: {
          Authorization: \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
      });

      if (productsRes.ok) {
        const data = await productsRes.json();
        console.log("Produtos recebidos:", data.products?.length || 0);
        setProducts(data.products || []);

        // Count products per category
        if (data.products && categories.length > 0) {
          const updatedCategories = categories.map(cat => ({
            ...cat,
            productCount: data.products.filter((p: Product) => p.categoryId === cat.id).length
          }));
          setCategories(updatedCategories);
        }
      }

    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle form
  function handleEdit(category: Category) {
    console.log("Editando categoria:", category);
    setEditingCategory(category);
    setName(category.name);
    setSortOrder(category.sortOrder.toString());
    setIsActive(category.isActive);
    setShowForm(true);
  }

  function handleCancel() {
    console.log("Cancelando formulário");
    setShowForm(false);
    setEditingCategory(null);
    resetForm();
  }

  function resetForm() {
    setName("");
    setSortOrder("0");
    setIsActive(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Enviando formulário de categoria...");

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Validation
    if (!name.trim()) {
      setError("Nome da categoria é obrigatório");
      return;
    }

    const orderNum = parseInt(sortOrder) || 0;

    const categoryData = {
      restaurantId,
      name: name.trim(),
      sortOrder: orderNum,
      isActive,
    };

    console.log("Dados da categoria:", categoryData);

    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        // Update category
        console.log("Atualizando categoria:", editingCategory.id);
        const res = await fetch(\`\${API_URL}/api/catalog/categories\`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify({
            ...categoryData,
            id: editingCategory.id
          }),
        });

        console.log("Status update:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Erro update:", errorText);
          throw new Error(errorText || "Erro ao atualizar categoria");
        }

        setSuccess("Categoria atualizada com sucesso!");
      } else {
        // Create category
        console.log("Criando nova categoria");
        const res = await fetch(\`\${API_URL}/api/catalog/categories\`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify(categoryData),
        });

        console.log("Status create:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Erro create:", errorText);
          throw new Error(errorText || "Erro ao criar categoria");
        }

        setSuccess("Categoria criada com sucesso!");
      }

      handleCancel();
      loadData();

    } catch (err: any) {
      console.error("Erro completo:", err);
      setError((err.message || "Erro ao salvar categoria"));
    }
  }

  async function handleDelete(categoryId: string) {
    console.log("Tentando excluir categoria:", categoryId);
    // Check if category has products
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    if (categoryProducts.length > 0) {
      setError(\`Não é possível excluir: Esta categoria tem \${categoryProducts.length} produto(s). Mova os produtos para outra categoria primeiro.\`);
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(\`\${API_URL}/api/catalog/categories\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          restaurantId,
          id: categoryId,
          isActive: false
        }),
      });

      console.log("Status delete:", res.status);

      if (!res.ok) throw new Error("Erro ao excluir categoria");

      setSuccess("Categoria excluída com sucesso!");
      loadData();
      
    } catch (err: any) {
      console.error("Erro delete:", err);
      setError(err.message);
    }
  }

  async function handleToggleActive(categoryId: string, currentActive: boolean) {
    console.log("Alternando ativo:", categoryId, "de", currentActive, "para", !currentActive);
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(\`\${API_URL}/api/catalog/categories\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          restaurantId,
          id: categoryId,
          isActive: !currentActive
        }),
      });

      console.log("Status toggle:", res.status);

      if (!res.ok) throw new Error("Erro ao atualizar categoria");

      setSuccess(\`Categoria \${!currentActive ? "ativada" : "desativada"} com sucesso!\`);
      loadData();

    } catch (err: any) {
      console.error("Erro toggle:", err);
      setError(err.message);
    }
  }

  // Move products between categories
  async function handleMoveProducts(fromCategoryId: string, toCategoryId: string) {
    if (!confirm(\`Mover todos os produtos desta categoria para "\${categories.find(c => c.id === toCategoryId)?.name}"?\`)) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const productsToMove = products.filter(p => p.categoryId === fromCategoryId);

      // Update each product
      const updatePromises = productsToMove.map(product =>
        fetch(\`\${API_URL}/api/catalog/products/\${product.id}\`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify({ categoryId: toCategoryId }),
        })
      );

      await Promise.all(updatePromises);
      setSuccess(\`\${productsToMove.length} produto(s) movidos com sucesso!\`);
      loadData();

    } catch (err: any) {
      console.error("Erro ao mover produtos:", err);
      setError("Erro ao mover produtos: " + err.message);
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
          <p className="mt-6 text-lg font-medium text-gray-700">Carregando categorias...</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Gerenciar Categorias
              </h1>
              <p className="mt-2 text-gray-600">
                Organize seus produtos em categorias no cardápio
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                href={\`/app/restaurant/\${restaurantId}/products\`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar aos produtos
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Categoria
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

        {/* Category Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingCategory ? "✏️ Editar Categoria" : "✨ Nova Categoria"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    placeholder="Ex: Bebidas, Sobremesas, Pratos Principais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ordem de exibição
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                    placeholder="0"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Menor número aparece primeiro
                  </p>
                </div>

                <div className="md:col-span-3 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="categoryActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="categoryActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Categoria ativa e visível no cardápio
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
                >
                  {editingCategory ? "💾 Atualizar Categoria" : "✨ Criar Categoria"}
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

        {/* Categories List */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-xl mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Categorias Cadastradas</h2>
                <p className="mt-1 text-gray-600">
                  {categories.length} {categories.length === 1 ? "categoria encontrada" : "categorias encontradas"}
                </p>
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma categoria cadastrada</h3>
              <p className="text-gray-600 mb-6">Crie categorias para organizar melhor seus produtos</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-600/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar primeira categoria
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((category) => {
                const categoryProducts = products.filter(p => p.categoryId === category.id);
                const activeProducts = categoryProducts.filter(p => p.isActive);

                return (
                  <div key={category.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                          <span
                            className={\`px-3 py-1 text-xs font-bold rounded-full \${
                              category.isActive
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }\`}
                          >
                            {category.isActive ? "✓ Ativa" : "✕ Inativa"}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-300">
                            📊 Ordem: {category.sortOrder}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="text-sm text-gray-700 font-medium">
                              {categoryProducts.length} produto(s) total
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-green-600 font-medium">
                              {activeProducts.length} ativo(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              {new Date(category.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Move products dropdown */}
                        {categoryProducts.length > 0 && categories.length > 1 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <label className="text-sm font-semibold text-blue-900">Mover produtos para:</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleMoveProducts(category.id, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="flex-1 text-sm border-2 border-blue-200 rounded-lg px-3 py-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                              >
                                <option value="">Selecione uma categoria</option>
                                {categories
                                  .filter(c => c.id !== category.id)
                                  .map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.name} ({products.filter(p => p.categoryId === c.id).length} produtos)
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <p className="mt-2 text-xs text-blue-700 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Todos os produtos desta categoria serão movidos
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(category.id, category.isActive)}
                          className={\`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition \${
                            category.isActive
                              ? "bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100"
                              : "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                          }\`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          {category.isActive ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={categoryProducts.length > 0}
                          className={\`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition \${
                            categoryProducts.length > 0
                              ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                              : "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100"
                          }\`}
                          title={categoryProducts.length > 0 ? "Não é possível excluir categorias com produtos" : "Excluir categoria"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Dicas de organização</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Use ordens numéricas para controlar a sequência no cardápio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Crie categorias como "Entradas", "Principais", "Sobremesas", "Bebidas"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Desative categorias temporariamente sem excluir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mova produtos entre categorias quando necessário</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Próximos passos</h3>
                <div className="space-y-3">
                  <Link
                    href={\`/app/restaurant/\${restaurantId}/products\`}
                    className="block p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition">📝 Atribuir produtos às categorias</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Volte à lista de produtos e edite cada um
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/app"
                    className="block p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition">👁️ Visualizar cardápio público</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Veja como está ficando para os clientes
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            📊 Resumo do seu cardápio
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200">
              <div className="text-3xl font-bold text-emerald-700">{categories.length}</div>
              <div className="text-sm text-emerald-600 font-medium mt-1">Categorias</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-700">{products.length}</div>
              <div className="text-sm text-blue-600 font-medium mt-1">Produtos totais</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <div className="text-3xl font-bold text-green-700">
                {products.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-green-600 font-medium mt-1">Produtos ativos</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
              <div className="text-3xl font-bold text-purple-700">
                {categories.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-purple-600 font-medium mt-1">Categorias ativas</div>
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
console.log('✅ Página de gerenciamento de categorias atualizada com design premium!');
console.log('');
console.log('🎨 Melhorias aplicadas:');
console.log('   ✓ Background com gradiente e blobs animados');
console.log('   ✓ Header com ícone de tag e botões estilizados');
console.log('   ✓ Formulário moderno com inputs melhorados');
console.log('   ✓ Cards de categoria com informações detalhadas');
console.log('   ✓ Mover produtos com destaque visual (card azul)');
console.log('   ✓ Botões de ação com ícones SVG');
console.log('   ✓ Empty state elegante');
console.log('   ✓ Cards de dicas com ícones e checkmarks');
console.log('   ✓ Próximos passos com links estilizados');
console.log('   ✓ Stats com gradientes coloridos');
console.log('   ✓ Loading state com animação dupla');
console.log('   ✓ Todas as badges e tags coloridas');
