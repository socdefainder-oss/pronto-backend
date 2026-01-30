const fs = require('fs');
const path = require('path');

const content = `"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "../../../../lib/api";

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  priority: string;
  totalCents: number;
  notes: string;
  kitchenNotes: string;
  createdAt: string;
  prepStartedAt: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    neighborhood: string;
    street: string;
    number: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    notes: string;
    product: {
      category: string;
    };
  }>;
}

interface Stats {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  total: number;
  averagePrepTimeMinutes: number;
  todayTotal: number;
}

export default function KitchenPage() {
  const params = useParams();
  const restaurantId = params?.id as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const fetchKitchenData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        api<Order[]>(\`/api/kitchen/\${restaurantId}/orders?\${selectedCategory ? \`category=\${selectedCategory}\` : ""}\`),
        api<Stats>(\`/api/kitchen/\${restaurantId}/stats\`),
      ]);

      if (ordersData.length > lastOrderCount && lastOrderCount > 0) {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }

      setOrders(ordersData);
      setStats(statsData);
      setLastOrderCount(ordersData.length);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados da cozinha:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
    const interval = setInterval(fetchKitchenData, 30000);
    return () => clearInterval(interval);
  }, [restaurantId, selectedCategory]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api(\`/api/kitchen/orders/\${orderId}/status\`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchKitchenData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const togglePriority = async (orderId: string, currentPriority: string) => {
    try {
      const newPriority = currentPriority === "urgent" ? "normal" : "urgent";
      await api(\`/api/kitchen/orders/\${orderId}/priority\`, {
        method: "PATCH",
        body: JSON.stringify({ priority: newPriority }),
      });
      fetchKitchenData();
    } catch (error) {
      console.error("Erro ao atualizar prioridade:", error);
    }
  };

  const getElapsedTime = (createdAt: string, startedAt: string | null) => {
    const start = startedAt ? new Date(startedAt) : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 1000 / 60);
    return minutes;
  };

  const getTimerColor = (minutes: number) => {
    if (minutes < 10) return "text-green-600 bg-green-50";
    if (minutes < 20) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const categories = Array.from(
    new Set(
      orders.flatMap((order) =>
        order.items.map((item) => item.product.category)
      )
    )
  );

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status);
  };

  const pendingOrders = getOrdersByStatus("pending");
  const confirmedOrders = getOrdersByStatus("confirmed");
  const preparingOrders = getOrdersByStatus("preparing");
  const readyOrders = getOrdersByStatus("ready");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Carregando cozinha...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Cozinha</h1>
          <button
            onClick={fetchKitchenData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Novos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
              <div className="text-sm text-gray-600">Em Preparo</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-gray-600">Prontos</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.averagePrepTimeMinutes}min</div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={\`px-4 py-2 rounded-lg transition \${selectedCategory === null ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}\`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={\`px-4 py-2 rounded-lg transition \${selectedCategory === category ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}\`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Novos ({pendingOrders.length})
          </h2>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onTogglePriority={togglePriority}
                getElapsedTime={getElapsedTime}
                getTimerColor={getTimerColor}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Confirmados ({confirmedOrders.length})
          </h2>
          <div className="space-y-4">
            {confirmedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onTogglePriority={togglePriority}
                getElapsedTime={getElapsedTime}
                getTimerColor={getTimerColor}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
            Em Preparo ({preparingOrders.length})
          </h2>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onTogglePriority={togglePriority}
                getElapsedTime={getElapsedTime}
                getTimerColor={getTimerColor}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Prontos ({readyOrders.length})
          </h2>
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onTogglePriority={togglePriority}
                getElapsedTime={getElapsedTime}
                getTimerColor={getTimerColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
  onTogglePriority,
  getElapsedTime,
  getTimerColor,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: string) => void;
  onTogglePriority: (id: string, currentPriority: string) => void;
  getElapsedTime: (createdAt: string, startedAt: string | null) => number;
  getTimerColor: (minutes: number) => string;
}) {
  const elapsedMinutes = getElapsedTime(order.createdAt, order.prepStartedAt);
  const timerColor = getTimerColor(elapsedMinutes);

  return (
    <div className={\`bg-white rounded-lg shadow-md p-4 \${order.priority === "urgent" ? "border-2 border-red-500" : ""}\`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">#{order.orderNumber}</span>
          {order.priority === "urgent" && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
              URGENTE
            </span>
          )}
        </div>
        <button
          onClick={() => onTogglePriority(order.id, order.priority)}
          className="text-gray-400 hover:text-red-600 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a.75.75 0 01.75.75v8.5l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 011.06-1.06l3.22 3.22v-8.5A.75.75 0 0110 2z" />
          </svg>
        </button>
      </div>

      <div className={\`mb-3 px-3 py-2 rounded-lg font-semibold text-center \${timerColor}\`}>
        ⏱️ {elapsedMinutes} minutos
      </div>

      <div className="mb-3 text-sm">
        <div className="font-semibold text-gray-900">{order.customer.name}</div>
        <div className="text-gray-600">{order.address.neighborhood}</div>
        <div className="text-gray-500 text-xs">{order.customer.phone}</div>
      </div>

      <div className="mb-3 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">
                {item.quantity}x {item.productName}
              </span>
              <span className="text-xs text-gray-500">{item.product.category}</span>
            </div>
            {item.notes && (
              <div className="text-xs text-gray-600 italic mt-1">Obs: {item.notes}</div>
            )}
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
          <strong>Obs Cliente:</strong> {order.notes}
        </div>
      )}

      <div className="flex gap-2">
        {order.status === "pending" && (
          <button
            onClick={() => onUpdateStatus(order.id, "confirmed")}
            className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
          >
            Confirmar
          </button>
        )}
        {order.status === "confirmed" && (
          <button
            onClick={() => onUpdateStatus(order.id, "preparing")}
            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
          >
            Iniciar Preparo
          </button>
        )}
        {order.status === "preparing" && (
          <button
            onClick={() => onUpdateStatus(order.id, "ready")}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            Marcar Pronto
          </button>
        )}
        {order.status === "ready" && (
          <button
            onClick={() => onUpdateStatus(order.id, "delivering")}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Saiu p/ Entrega
          </button>
        )}
      </div>
    </div>
  );
}
`;

const frontendPath = path.resolve(__dirname, '../pronto.frontend/app/app/restaurant/[id]/kitchen');
const filePath = path.join(frontendPath, 'page.tsx');

// Criar diretório se não existir
if (!fs.existsSync(frontendPath)) {
  fs.mkdirSync(frontendPath, { recursive: true });
}

// Escrever arquivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Kitchen page created successfully at:', filePath);
