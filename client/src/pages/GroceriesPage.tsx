import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, FileQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createGroceryItemForList,
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
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {children}
    </div>
  );
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
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [listName, setListName] = useState("");
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [filter, setFilter] = useState<GroceryFilterValue>("all");
  const visibleItems = filterGroceries(items, filter);

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
    </PageShell>
  );
}
