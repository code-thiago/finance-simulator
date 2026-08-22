import SimuladorJurosCompostos from "../components/SimuladorJurosCompostos";
import Navegacao from "../components/Navegacao";
import CotacaoWidget from "../components/CotacaoWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12">
      <Navegacao />
      <CotacaoWidget />
      <SimuladorJurosCompostos />
    </div>
  );
}
