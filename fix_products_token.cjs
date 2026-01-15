const fs = require('fs');
const path = 'C:\\Users\\Capitani\\Documents\\pronto\\pronto.frontend\\app\\app\\restaurant\\[id]\\products\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

// Step 1: Add import for getToken from lib/api
const oldImport = `import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";`;

const newImport = `import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "../../lib/api";`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✅ Import adicionado');
}

// Step 2: Remove the custom getToken function
const customGetToken = `// Token function
  function getToken() {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("pronto_token") ||
      localStorage.getItem("token") ||
      ""
    );
  }`;

if (content.includes(customGetToken)) {
  content = content.replace(customGetToken, '');
  console.log('✅ Função getToken customizada removida');
}

// Step 3: Fix the loadData function to handle token properly
const oldLoadData = `async function loadData() {
    if (!restaurantId) return;

    setLoading(true);
    setError("");
    const token = getToken();

    if (!token) {
      setError("Você não está logado. Faça login novamente.");
      setLoading(false);
      return;
    }`;

const newLoadData = `async function loadData() {
    if (!restaurantId) return;

    setLoading(true);
    setError("");
    const token = getToken() || "";

    if (!token) {
      setError("Você não está logado. Faça login novamente.");
      setLoading(false);
      return;
    }`;

if (content.includes(oldLoadData)) {
  content = content.replace(oldLoadData, newLoadData);
  console.log('✅ loadData corrigido');
}

// Step 4: Make sure useEffect has restaurantId as dependency
const oldUseEffect = `useEffect(() => {
    if (!restaurantId) {
      console.error("Restaurant ID não encontrado");
      return;
    }
    console.log("Carregando dados para restaurante:", restaurantId);
    loadData();
  }, [restaurantId]);`;

const newUseEffect = `useEffect(() => {
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

if (content.includes(oldUseEffect)) {
  content = content.replace(oldUseEffect, newUseEffect);
  console.log('✅ useEffect melhorado com delay');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Arquivo atualizado com sucesso!');
