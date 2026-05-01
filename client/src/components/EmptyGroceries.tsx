import { ShoppingBasket } from "lucide-react";

type EmptyGroceriesProps = {
  message?: string;
};

const defaultMessage = "Your list is empty.";

export function EmptyGroceries({ message = defaultMessage }: EmptyGroceriesProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center text-muted-foreground"
    >
      <ShoppingBasket className="h-8 w-8 opacity-60" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
