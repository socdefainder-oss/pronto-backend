"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
export default function ProductsPage() {
    const params = useParams();
    const router = useRouter();
    const restaurantId = params?.id;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [imageUrl, setImageUrl] = useState("");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";
    // Token function
    function getToken() {
        if (typeof window === "undefined")
            return "";
        return (localStorage.getItem("pronto_token") ||
            localStorage.getItem("token") ||
            "");
    }
    // Load data
    useEffect(() => {
        if (!restaurantId) {
            console.error("Restaurant ID não encontrado");
            return;
        }
        console.log("Carregando dados para restaurante:", restaurantId);
        loadData();
    }, [restaurantId]);
    async function loadData() {
        if (!restaurantId)
            return;
        setLoading(true);
        setError("");
        const token = getToken();
        if (!token) {
            setError("Você não está logado. Faça login novamente.");
            setLoading(false);
            return;
        }
        try {
            console.log("Carregando produtos...");
            // Load products
            const productsRes = await fetch(`${API_URL}/api/catalog/products/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            console.log("Status produtos:", productsRes.status);
            if (productsRes.ok) {
                const data = await productsRes.json();
                console.log("Produtos recebidos:", data.products?.length || 0);
                setProducts(data.products || []);
            }
            else {
                const errorText = await productsRes.text();
                console.error("Erro ao carregar produtos:", productsRes.status, errorText);
                setError(`Erro ${productsRes.status} ao carregar produtos`);
            }
            // Load categories
            console.log("Carregando categorias...");
            const categoriesRes = await fetch(`${API_URL}/api/catalog/categories/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            console.log("Status categorias:", categoriesRes.status);
            if (categoriesRes.ok) {
                const data = await categoriesRes.json();
                console.log("Categorias recebidas:", data.categories?.length || 0);
                setCategories(data.categories || []);
            }
            else {
                console.error("Erro ao carregar categorias:", categoriesRes.status);
            }
        }
        catch (err) {
            console.error("Erro ao carregar dados:", err);
            setError("Erro de conexão ao carregar dados. Verifique sua internet.");
        }
        finally {
            setLoading(false);
        }
    }
    // Handle form
    function handleEdit(product) {
        console.log("Editando produto:", product);
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
        console.log("Cancelando formulário");
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
    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Enviando formulário...");
        const token = getToken();
        if (!token) {
            setError("Você não está logado");
            return;
        }
        // Validation
        if (!name.trim()) {
            setError("Nome do produto é obrigatório");
            return;
        }
        const priceFloat = parseFloat(price);
        if (isNaN(priceFloat) || priceFloat < 0) {
            setError("Preço inválido. Use números positivos.");
            return;
        }
        const priceCents = Math.round(priceFloat * 100);
        const productData = {
            restaurantId,
            name: name.trim(),
            description: description.trim() || null,
            priceCents,
            categoryId: categoryId || null,
            isActive,
            imageUrl: imageUrl.trim() || null,
        };
        console.log("Dados do produto:", productData);
        setError("");
        setSuccess("");
        try {
            if (editingProduct) {
                // Update product
                console.log("Atualizando produto:", editingProduct.id);
                const res = await fetch(`${API_URL}/api/catalog/products/${editingProduct.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData),
                });
                console.log("Status update:", res.status);
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Erro update:", errorText);
                    throw new Error(errorText || "Erro ao atualizar produto");
                }
                setSuccess("✅ Produto atualizado com sucesso!");
            }
            else {
                // Create product
                console.log("Criando novo produto");
                const res = await fetch(`${API_URL}/api/catalog/products`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(productData),
                });
                console.log("Status create:", res.status);
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Erro create:", errorText);
                    throw new Error(errorText || "Erro ao criar produto");
                }
                setSuccess("✅ Produto criado com sucesso!");
            }
            handleCancel();
            loadData(); // Recarrega a lista
        }
        catch (err) {
            console.error("Erro completo:", err);
            setError("❌ " + (err.message || "Erro ao salvar produto"));
        }
    }
    async function handleDelete(productId) {
        console.log("Tentando excluir produto:", productId);
        if (!confirm("Tem certeza que deseja excluir este produto?"))
            return;
        const token = getToken();
        if (!token) {
            setError("Você não está logado");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/catalog/products/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            console.log("Status delete:", res.status);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Erro ao excluir produto");
            }
            setSuccess("✅ Produto excluído com sucesso!");
            loadData();
        }
        catch (err) {
            console.error("Erro delete:", err);
            setError("❌ " + err.message);
        }
    }
    async function handleToggleActive(productId, currentActive) {
        console.log("Alternando ativo:", productId, "de", currentActive, "para", !currentActive);
        const token = getToken();
        if (!token)
            return;
        try {
            const res = await fetch(`${API_URL}/api/catalog/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !currentActive }),
            });
            console.log("Status toggle:", res.status);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Erro ao atualizar produto");
            }
            setSuccess(`✅ Produto ${!currentActive ? "ativado" : "desativado"} com sucesso!`);
            loadData();
        }
        catch (err) {
            console.error("Erro toggle:", err);
            setError("❌ " + err.message);
        }
    }
    function handleBack() {
        console.log("Voltando para gerenciar restaurante");
        const id = restaurantId || params?.id;
        if (!id) {
            console.error("Restaurant ID não encontrado");
            router.push('/app/restaurants');
            return;
        }
        router.push(`/app/restaurant/${id}`);
    }
    // Loading state
    if (loading) {
        return (<main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
          <span className="ml-3">Carregando produtos...</span>
        </div>
        <div className="text-center text-sm text-zinc-500">
          Restaurante ID: {restaurantId}
        </div>
      </main>);
    }
    return (<main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <p className="mt-1 text-zinc-600">
            Cadastre e organize os produtos do seu cardápio
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition">
            ← Voltar ao restaurante
          </button>
          <button onClick={() => {
            console.log("Abrindo formulário novo produto");
            setShowForm(true);
        }} className="px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition">
            + Novo Produto
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (<div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="font-semibold">Erro</div>
          <div className="mt-1">{error}</div>
        </div>)}
      
      {success && (<div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <div className="font-semibold">Sucesso</div>
          <div className="mt-1">{success}</div>
        </div>)}

      {/* Product Form */}
      {showForm && (<div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do produto *
                </label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-800" placeholder="Ex: Açaí 500ml"/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Preço (R$) *
                </label>
                <input type="number" step="0.01" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-800" placeholder="Ex: 19.90"/>
                <p className="mt-1 text-xs text-zinc-500">
                  Será salvo como: R$ {price || "0.00"}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-800" placeholder="Ex: Açaí cremoso com granola, leite condensado..." rows={2}/>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria
                </label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-800">
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>))}
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  {categories.length === 0 && "Crie categorias primeiro em 'Gerenciar categorias'"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  URL da imagem (opcional)
                </label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-800" placeholder="https://exemplo.com/foto.jpg"/>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-zinc-300"/>
                  <span className="text-sm font-medium">Produto ativo no cardápio</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="px-5 py-3 rounded-xl bg-zinc-900 font-semibold text-white hover:bg-zinc-800 transition">
                {editingProduct ? "Atualizar" : "Criar"}
              </button>
              <button type="button" onClick={handleCancel} className="px-5 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>)}

      {/* Products List */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <div className="border-b border-zinc-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Produtos ({products.length})
              {restaurantId && (<span className="ml-2 text-sm font-normal text-zinc-500">
                  ID: {restaurantId}
                </span>)}
            </h2>
            <button onClick={() => router.push(`/app/restaurant/${restaurantId}/categories`)} className="text-sm text-zinc-600 hover:text-zinc-900 transition">
              Gerenciar categorias →
            </button>
          </div>
          
          {products.length === 0 && (<div className="mt-2 p-4 bg-zinc-50 rounded-lg">
              <p className="text-zinc-600">
                Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Ou primeiro crie categorias para organizar seus produtos.
              </p>
            </div>)}
        </div>

        <div className="divide-y divide-zinc-100">
          {products.map((product) => (<div key={product.id} className="p-6 hover:bg-zinc-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"}`}>
                      {product.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  
                  {product.description && (<p className="mt-1 text-zinc-600 text-sm">
                      {product.description}
                    </p>)}

                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="font-bold">
                      R$ {(product.priceCents / 100).toFixed(2).replace('.', ',')}
                    </span>
                    
                    {product.category && (<span className="px-2 py-1 bg-zinc-100 rounded text-zinc-700">
                        {product.category.name}
                      </span>)}
                    
                    {product.imageUrl && (<span className="text-blue-600">📷 Tem foto</span>)}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(product)} className="px-3 py-1 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-sm transition">
                    Editar
                  </button>
                  <button onClick={() => handleToggleActive(product.id, product.isActive)} className={`px-3 py-1 rounded-lg text-sm transition ${product.isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                    {product.isActive ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm transition">
                    Excluir
                  </button>
                </div>
              </div>
            </div>))}
        </div>
      </div>

      {/* Debug info (só aparece se houver problemas) */}
      {(error || process.env.NODE_ENV === 'development') && (<div className="mt-8 rounded-xl border border-zinc-300 bg-zinc-50 p-4">
          <h3 className="font-semibold text-sm mb-2">🔍 Informações de debug:</h3>
          <div className="text-xs font-mono space-y-1">
            <div>Restaurante ID: {restaurantId || "não encontrado"}</div>
            <div>Total produtos: {products.length}</div>
            <div>Total categorias: {categories.length}</div>
            <div>Token: {getToken() ? "✅ Presente" : "❌ Ausente"}</div>
            <div>API URL: {API_URL}</div>
          </div>
        </div>)}
    </main>);
}
