import DomainsTab from "@/components/domains/components/domains-tab";
import { getDomainsData } from "@/lib/actions/domainsActions";

async function page() {
  const { domains, dnsRecords } = await getDomainsData();
  return <DomainsTab domains={domains} dnsRecords={dnsRecords} />;
}
export default page;
