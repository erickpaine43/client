"use client";
import { useAddMailboxesContext } from "@/context/AddMailboxesContext";
import { getDomainsData } from "@/lib/actions/domains";
import { useEffect, useState } from "react";
import AddMailboxDetails from "./AddMailboxDetails";
import MailboxSetting from "./MailboxSetting";
import SuccessStep from "./SuccessStep";

function AddMailboxesStep() {
  const { currentStep } = useAddMailboxesContext();
  const [domains, setDomains] = useState<Array<{
    id: number;
    domain: string;
    name: string;
    status: string;
  }>>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await getDomainsData();
        setDomains(data.domains);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      }
    };

    fetchDomains();
  }, []);

  switch (currentStep) {
    case 1:
      return <AddMailboxDetails domains={domains} />;
    case 2:
      return <MailboxSetting />;
    case 3:
      return <SuccessStep />;
    default:
      return <div>Unknown Step</div>;
  }
}
export default AddMailboxesStep;
