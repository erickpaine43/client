import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadList } from "@/lib/data/leads";
import { Pencil, Save } from "lucide-react";
import { useForm } from "react-hook-form";

// Mock data
type FormData = {
  name: string;
  description: string;
  tags: string;
  status: string;
  campaign: string;
};

function EditLeadListButton({ list }: { list: LeadList }) {
  console.log(list);

  const form = useForm<FormData>({
    defaultValues: {
      name: list.name,
      description: list.name,
      tags: list.tags?.join(", "),
      status: list.status,
      campaign: list.campaign || "",
    },
  });

  const { register, handleSubmit, reset } = form;

  const onSubmit = (data: FormData) => {
    console.log("Saving lead list:", data);
    // Handle save logic here
  };

  const handleCancel = () => {
    reset(); // Reset form to default values
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Edit Lead List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* List Name */}
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter list name"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" {...register("tags")} placeholder="Enter tags" />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default EditLeadListButton;
