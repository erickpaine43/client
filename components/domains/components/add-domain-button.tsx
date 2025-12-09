"use client";
import { Button } from "@/components/ui/button/button";
import { useAddDomainContext } from "@/context/AddDomainContext";
import { Plus } from "lucide-react";

function AddDomainButton() {
  const { setOpen } = useAddDomainContext();
  const handleClick = () => {
    setOpen(true);
  };
  return (
    <Button onClick={handleClick} className="flex items-center gap-2">
      <Plus className="w-4 h-4 " />
      Add Domain
    </Button>
  );
}
export default AddDomainButton;
