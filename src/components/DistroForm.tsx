"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FOCOS, FOCO_LABELS, type Foco } from "@/types";

const inicial = {
  nome: "",
  descricao: "",
  versao: "",
  downloadUrl: "",
  siteUrl: "",
};

const inputClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 p-2";

export default function DistroForm() {
  const router = useRouter();
  const [form, setForm] = useState(inicial);
  const [foco, setFoco] = useState<Foco[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function campo(name: keyof typeof inicial) {
    return {
      value: form[name],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => setForm({ ...form, [name]: e.target.value }),
    };
  }

  function toggleFoco(f: Foco) {
    setFoco((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    const res = await fetch("/api/distros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, foco }),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.erro ?? "Erro ao salvar.");
      return;
    }

    setForm(inicial);
    setFoco([]);
    setSucesso("Distro cadastrada!");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <input
        className={inputClass}
        placeholder="Nome (ex: Arch Linux)"
        required
        {...campo("nome")}
      />
      <textarea
        className={inputClass}
        rows={3}
        placeholder="Descrição"
        required
        {...campo("descricao")}
      />
      <input
        className={inputClass}
        placeholder="Versão (ex: rolling, 24.04)"
        {...campo("versao")}
      />
      <input
        className={inputClass}
        type="url"
        placeholder="Link de download (https://...)"
        required
        {...campo("downloadUrl")}
      />
      <input
        className={inputClass}
        type="url"
        placeholder="Site oficial (https://...)"
        {...campo("siteUrl")}
      />

      <fieldset>
        <legend className="mb-2 text-sm text-zinc-400">Focos</legend>
        <div className="flex flex-wrap gap-4">
          {FOCOS.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={foco.includes(f)}
                onChange={() => toggleFoco(f)}
              />
              {FOCO_LABELS[f]}
            </label>
          ))}
        </div>
      </fieldset>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {sucesso && <p className="text-sm text-emerald-400">{sucesso}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="rounded-md bg-emerald-600 px-5 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
      >
        {carregando ? "Salvando..." : "Cadastrar distro"}
      </button>
    </form>
  );
}