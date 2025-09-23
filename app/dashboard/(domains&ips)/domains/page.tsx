import DomainsTab from "@/components/domains/components/domains-tab";
import { getDomainsData } from "@/lib/actions/domains";

async function page() {
  const { domains, dnsRecords } = await getDomainsData();

  // Transform domains to match DomainsTab expected interface
  const transformedDomains = domains.map((domain) => ({
    id: domain.id,
    domain: domain.domain,
    status: domain.status,
    mailboxes: domain.emailAccounts,
    records: {
      spf: domain.records?.spf || "pending",
      dkim: domain.records?.dkim || "pending",
      dmarc: domain.records?.dmarc || "pending",
      mx: domain.records?.mx || "pending",
    },
    addedDate: domain.createdAt,
  }));

  return <DomainsTab domains={transformedDomains} dnsRecords={dnsRecords} />;
}
export default page;
