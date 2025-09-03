import Stepper from "@/components/common/Stepper";
import { AddTemplateContext } from "@/context/AddTemplateContext";

function NewTemplateStepper() {
  return <Stepper context={AddTemplateContext} />;
}

export default NewTemplateStepper;
