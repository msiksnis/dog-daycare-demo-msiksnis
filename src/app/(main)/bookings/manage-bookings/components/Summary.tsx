import VaulDrawer from "@/components/ui/drawer";

interface SummaryProps {
  canineId: string;
  canineName: string;
}

export default function Summary({ canineId, canineName }: SummaryProps) {
  return (
    <VaulDrawer>
      <div className="text-2xl">Summary for {canineName}</div>
    </VaulDrawer>
  );
}
