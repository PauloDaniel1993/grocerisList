import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, FileQuestion, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createGroceryItemForList,
  endGrocery,
  getGroceryItems,
  getGroceryList,
  updateGroceryItemInList,
} from "../api/client";
import { AddGroceryForm } from "../components/AddGroceryForm";
import { GroceryFilter } from "../components/GroceryFilter";
import { GroceryList } from "../components/GroceryList";
import { filterGroceries } from "../lib/filterGroceries";
import type { GroceryItem } from "../types/grocery";
import type { GroceryFilter as GroceryFilterValue } from "../types/grocery";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ok" };

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl">{children}</div>;
}

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/grocery-lists">
        <ChevronLeft className="h-4 w-4" />
        My lists
      </Link>
    </Button>
  );
}

function StatusCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <Card className="mt-6 text-center">
      <CardHeader className="items-center gap-2">
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
        <CardTitle>
          <h1 className="text-base font-semibold">{title}</h1>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild>
          <Link to="/grocery-lists">
            <ChevronLeft className="h-4 w-4" />
            Back to my lists
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function GroceriesPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [listName, setListName] = useState("");
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [filter, setFilter] = useState<GroceryFilterValue>("all");
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [endingGrocery, setEndingGrocery] = useState(false);
  const [endLocation, setEndLocation] = useState("");
  const visibleItems = filterGroceries(items, filter);
  const boughtCount = items.filter((item) => item.bought).length;

  useEffect(() => {
    if (!listId) {
      setLoad({ status: "notFound" });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoad({ status: "loading" });
      setItems([]);
      try {
        const [list, itemList] = await Promise.all([
          getGroceryList(listId),
          getGroceryItems(listId),
        ]);
        if (cancelled) return;
        setListName(list.name);
        setItems(itemList);
        setLoad({ status: "ok" });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load list";
        if (msg === "List not found" || /not found/i.test(msg)) {
          setLoad({ status: "notFound" });
        } else {
          setLoad({ status: "error", message: msg });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listId]);

  if (!listId || load.status === "notFound") {
    return (
      <PageShell>
        <StatusCard
          icon={<FileQuestion className="h-8 w-8" />}
          title="List not found"
          description="The list you’re looking for doesn’t exist or was removed."
        />
      </PageShell>
    );
  }

  if (load.status === "loading") {
    return (
      <PageShell>
        <BackLink />
        <Skeleton className="mt-3 h-8 w-48" />
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="mt-4 h-9 w-full sm:w-64" />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </PageShell>
    );
  }

  if (load.status === "error") {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle className="h-8 w-8" />}
          title="Couldn’t load this list"
          description={load.message}
        />
      </PageShell>
    );
  }

  async function handleToggleBought(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = await updateGroceryItemInList(listId!, id, {
      bought: !item.bought,
    });
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
  }

  async function handleEndGrocery() {
    if (!listId || boughtCount === 0) return;
    setEndingGrocery(true);
    try {
      const boughtList = await endGrocery(listId, { location: endLocation });
      setItems((prev) => prev.filter((item) => !item.bought));
      setConfirmEndOpen(false);
      setEndLocation("");
      toast.success("Bought list created", {
        action: {
          label: "View",
          onClick: () => navigate(`/bought-lists/${boughtList.id}`),
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not end grocery");
    } finally {
      setEndingGrocery(false);
    }
  }

  return (
    <PageShell>
      <BackLink />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {listName || "Grocery list"}
        </h1>
        <Badge variant="secondary" aria-label="Item count">
          {visibleItems.length}/{items.length}
        </Badge>
      </div>
      <div className="mt-4">
        <AddGroceryForm
          onAdd={async (input) => {
            const item = await createGroceryItemForList(listId!, input);
            setItems((prev) => [...prev, item]);
          }}
        />
      </div>
      <div className="mt-4">
        <GroceryFilter value={filter} onChange={setFilter} />
      </div>
      <div className="mt-4">
        <GroceryList
          items={visibleItems}
          filter={filter}
          onToggleBought={handleToggleBought}
        />
      </div>
      <Card className="mt-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Ready to finish shopping?</p>
            <p className="text-sm text-muted-foreground">
              Move bought items into a dated bought list and remove them from this list.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setConfirmEndOpen(true)}
            disabled={boughtCount === 0 || endingGrocery}
            className="sm:shrink-0"
          >
            <ShoppingBasket className="h-4 w-4" />
            Grocery End
          </Button>
        </CardContent>
      </Card>
      <AlertDialog
        open={confirmEndOpen}
        onOpenChange={(open) => {
          setConfirmEndOpen(open);
          if (!open && !endingGrocery) setEndLocation("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this grocery trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Move {boughtCount} bought {boughtCount === 1 ? "item" : "items"} to
              a new bought list and remove {boughtCount === 1 ? "it" : "them"} from
              this grocery list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="grocery-end-location"
              className="text-sm font-medium text-foreground"
            >
              Location
            </label>
            <Input
              id="grocery-end-location"
              value={endLocation}
              onChange={(event) => setEndLocation(event.target.value)}
              maxLength={200}
              placeholder="Store or market name"
              disabled={endingGrocery}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={endingGrocery}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleEndGrocery();
              }}
              disabled={endingGrocery || boughtCount === 0}
            >
              {endingGrocery ? "Ending..." : "Grocery End"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
