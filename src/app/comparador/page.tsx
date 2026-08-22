import ComparadorInvestimentos from "../../components/ComparadorInvestimentos";
import Navegacao from "../../components/Navegacao";
import CotacaoWidget from "../../components/CotacaoWidget";

export default function ComparadorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-12">
      <Navegacao />
      <CotacaoWidget />
      <ComparadorInvestimentos />
    </div>
  );
}
