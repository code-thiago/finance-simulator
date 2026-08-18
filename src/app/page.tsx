import SimuladorJurosCompostos from "../components/SimuladorJurosCompostos";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-12">
      <SimuladorJurosCompostos />
    </div>
  );
}
