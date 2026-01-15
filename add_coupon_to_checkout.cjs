const fs = require('fs');
const path = require('path');

const filePath = String.raw`C:\Users\Capitani\Documents\pronto\pronto.frontend\app\r\[slug]\page.tsx`;

let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar estados para cupom após o orderLoading
const statesOld = `  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {`;

const statesNew = `  const [orderLoading, setOrderLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {`;

content = content.replace(statesOld, statesNew);

// 2. Adicionar função de validar cupom antes do handleCheckout
const beforeHandleCheckout = `  const cartTotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout`;

const addValidateFunction = `  const cartTotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount = appliedCoupon?.discountCents || 0;
  const finalTotal = cartTotal - discount;

  async function validateCoupon() {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch(\`\${API_URL}/api/coupons/validate\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          restaurantId: restaurant.id,
          orderValueCents: cartTotal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedCoupon(data);
        setCouponError("");
      } else {
        const error = await response.json();
        setCouponError(error.error || "Cupom inválido");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setCouponError("Erro ao validar cupom");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  const handleCheckout`;

content = content.replace(beforeHandleCheckout, addValidateFunction);

// 3. Adicionar couponCode no orderData
const orderDataOld = `        paymentMethod: formData.get("paymentMethod"),
        notes: formData.get("notes") || undefined,
        deliveryFeeCents: 0,
      };`;

const orderDataNew = `        paymentMethod: formData.get("paymentMethod"),
        notes: formData.get("notes") || undefined,
        deliveryFeeCents: 0,
        couponCode: appliedCoupon?.coupon?.code || undefined,
      };`;

content = content.replace(orderDataOld, orderDataNew);

// 4. Atualizar o display do total no modal para mostrar desconto
const totalDisplayOld = `                <div className="flex justify-between items-center pt-4 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">R$ {(cartTotal / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Form */}`;

const totalDisplayNew = `                <div className="flex justify-between items-center pt-4 text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">R$ {(cartTotal / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Cupom Section */}
              <div className="border-t border-b py-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Cupom de Desconto</h3>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite o código do cupom"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
                    >
                      {validatingCoupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-700 text-lg">{appliedCoupon.coupon.code}</div>
                      <div className="text-sm text-emerald-600">
                        Desconto: R$ {(appliedCoupon.discountCents / 100).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {couponError}
                  </div>
                )}
                {appliedCoupon && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>R$ {(cartTotal / 100).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto:</span>
                      <span>- R$ {(appliedCoupon.discountCents / 100).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Total Final:</span>
                      <span className="text-emerald-600">R$ {(finalTotal / 100).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form */}`;

content = content.replace(totalDisplayOld, totalDisplayNew);

// 5. Atualizar o botão final para mostrar o total correto
const buttonOld = `                  {orderLoading ? "Enviando..." : \`Finalizar Pedido - R$ \${(cartTotal / 100).toFixed(2).replace('.', ',')}\`}`;

const buttonNew = `                  {orderLoading ? "Enviando..." : \`Finalizar Pedido - R$ \${(finalTotal / 100).toFixed(2).replace('.', ',')}\`}`;

content = content.replace(buttonOld, buttonNew);

// Salvar arquivo
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Sistema de cupom adicionado ao checkout!');
