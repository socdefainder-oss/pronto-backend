const fs = require('fs');
const path = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Adicionar state para isClient após os outros states
const oldStates = `const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";`;

const newStates = `const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isClient, setIsClient] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pronto-backend-j48e.onrender.com";`;

content = content.replace(oldStates, newStates);

// Melhorar o useEffect para esperar o client ser montado
const oldUseEffect = `useEffect(() => {
    if (!restaurantId) {
      console.error("Restaurant ID não encontrado");
      return;
    }
    console.log("Carregando dados para restaurante:", restaurantId);
    // Pequeno delay para garantir que o token está disponível
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    return () => clearTimeout(timer);
  }, [restaurantId]);`;

const newUseEffect = `useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !restaurantId) {
      if (!restaurantId) {
        console.error("Restaurant ID não encontrado");
      }
      return;
    }
    console.log("Carregando dados para restaurante:", restaurantId);
    loadData();
  }, [restaurantId, isClient]);`;

content = content.replace(oldUseEffect, newUseEffect);

// Melhorar a função loadData para garantir que pega o token certo
const oldLoadDataStart = `async function loadData() {
    if (!restaurantId) return;

    setLoading(true);
    setError("");
    const token = getToken() || "";

    if (!token) {
      setError("Você não está logado. Faça login novamente.");
      setLoading(false);
      return;
    }`;

const newLoadDataStart = `async function loadData() {
    if (!restaurantId || !isClient) return;

    setLoading(true);
    setError("");
    const token = getToken();
    console.log("Token recuperado:", token ? "✓ Existe" : "✗ Não existe");

    if (!token) {
      console.error("Token não encontrado no localStorage");
      setError("Você não está logado. Faça login novamente.");
      setLoading(false);
      return;
    }`;

content = content.replace(oldLoadDataStart, newLoadDataStart);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Arquivo atualizado com melhor tratamento de client-side e token!');
