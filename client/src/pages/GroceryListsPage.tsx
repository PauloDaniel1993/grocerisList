import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ListTodo, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createGroceryList,
  deleteGroceryList,
  getGroceryLists,
} from "../api/client";
import type { GroceryList } from "../types/groceryList";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
});
type FormValues = z.infer<typeof schema>;

export function GroceryListsPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<GroceryList | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
    mode: "onSubmit",
  });

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setLists(await getGroceryLists());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(values: FormValues) {
    try {
      const list = await createGroceryList(values.name.trim());
      setLists((prev) => [list, ...prev]);
      form.reset({ name: "" });
      toast.success("List created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create list");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteGroceryList(target.id);
      setLists((prev) => prev.filter((l) => l.id !== target.id));
      toast.success("List deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete list");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My lists</h1>
        {!loading && !loadError ? (
          <Badge variant="secondary" aria-label="List count">
            {lists.length}
          </Badge>
        ) : null}
      </div>

      <Card className="mt-4">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              noValidate
              aria-label="Create grocery list"
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="sr-only">New list name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="List name"
                        maxLength={200}
                        autoComplete="off"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="h-11 sm:self-end"
                disabled={form.formState.isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Create list
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loadError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !loadError && lists.length === 0 ? (
        <Card className="mt-6">
          <CardContent
            role="status"
            className="flex flex-col items-center gap-3 px-6 py-10 text-center text-muted-foreground"
          >
            <ListTodo className="h-8 w-8 opacity-60" aria-hidden="true" />
            <p className="text-sm">
              You have no lists yet. Add a name and create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul
          aria-label="Your grocery lists"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {lists.map((list) => (
            <li key={list.id} className="relative">
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardContent className="flex items-start gap-2 p-4">
                  <Link
                    to={`/grocery-lists/${list.id}`}
                    className="block flex-1 truncate pr-2 text-base font-medium hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    {list.name}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-1 -mt-1 h-8 w-8 shrink-0"
                        aria-label={`Actions for ${list.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => setPendingDelete(list)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this list and all of its items? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
