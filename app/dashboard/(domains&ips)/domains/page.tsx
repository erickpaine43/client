import DomainsTab from "@/components/domains/components/domains-tab";
import { AddDomainProvider } from "@/context/AddDomainContext";
import { getDomainsData } from "@/lib/actions/domainsActions";

async function page() {
  const { domains, dnsRecords } = await getDomainsData();
  return (
    <AddDomainProvider>
      <DomainsTab domains={domains} dnsRecords={dnsRecords} />
    </AddDomainProvider>
  );
}
export default page;
