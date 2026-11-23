import DistroForm from "@/components/DistroForm";
import DeleteDistroButton from "@/components/DeleteDistroButton";
import { getDistros } from "@/lib/distros";

export default async function AdminPage() {
  const distros = await getDistros();

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Cadastrar distro</h1>
        <DistroForm />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Distros cadastradas ({distros.length})
        </h2>
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {distros.map((d) => (
            <li key={d._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{d.nome}</p>
                <p className="text-xs text-zinc-500">{d.foco.join(", ")}</p>
              </div>
              <DeleteDistroButton id={d._id} nome={d.nome} />
            </li>
          ))}
          {distros.length === 0 && (
            <li className="p-4 text-zinc-400">Nada cadastrado ainda.</li>
          )}
        </ul>
      </section>
    </div>
  );
}