import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GROCERY_CATEGORIES,
  getGroceryCategoryLabel,
  type GroceryCategory,
  type NewGroceryItemInput,
} from "../types/grocery";

const defaultCategory: GroceryCategory = "other";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.enum(GROCERY_CATEGORIES as [GroceryCategory, ...GroceryCategory[]]),
});

type FormValues = z.infer<typeof schema>;

type AddGroceryFormProps = {
  onAdd: (input: NewGroceryItemInput) => void | Promise<void>;
};

export function AddGroceryForm({ onAdd }: AddGroceryFormProps) {
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: defaultCategory },
    mode: "onSubmit",
  });

  async function onSubmit(values: FormValues) {
    try {
      await onAdd({ name: values.name.trim(), category: values.category });
      form.reset({ name: "", category: defaultCategory });
      nameInputRef.current?.focus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add this item");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label="Add grocery item"
        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end sm:gap-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={(el) => {
                    field.ref(el);
                    nameInputRef.current = el;
                  }}
                  autoComplete="off"
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GROCERY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {getGroceryCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="h-11 sm:self-end">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>
    </Form>
  );
}
