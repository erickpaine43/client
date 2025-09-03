import Stepper from "@/components/ui/Stepper";
import { AddDomainContext } from "@/context/AddDomainContext";

function NewDomainStepper() {
  return <Stepper context={AddDomainContext} />;
}
export default NewDomainStepper;
