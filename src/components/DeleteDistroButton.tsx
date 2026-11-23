"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDistroButton({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function handleDelete() {
    if (!confirm(`Apagar ${nome}?`)) return;

    setCarregando(true);
    const res = await fetch(`/api/distros/${id}`, { method: "DELETE" });
    setCarregando(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert("Erro ao apagar.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={carregando}
      className="text-sm text-red-400 hover:underline disabled:opacity-50"
    >
      {carregando ? "Apagando..." : "Apagar"}
    </button>
  );
}
