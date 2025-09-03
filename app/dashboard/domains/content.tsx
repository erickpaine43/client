import { DomainsHeader } from "@/components/domains/components/header";
import OverviewCards from "@/components/domains/components/overview-cards";
import { DomainsTable } from "@/components/domains/domains-table";
import { type Domain } from "@/types/domain";

type DomainsContentProps = {
  domains: Domain[];
};

export default function DomainsContent({ domains }: DomainsContentProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <DomainsHeader />
      <OverviewCards />
      <DomainsTable domains={domains} />
    </div>
  );
}

export type { Domain };
