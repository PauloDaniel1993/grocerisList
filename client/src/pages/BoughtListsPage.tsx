import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  MapPin,
  MoreVertical,
  Pencil,
  ReceiptText,
  Trash2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteBoughtList,
  getBoughtLists,
  updateBoughtListLocation,
} from "../api/client";
import type { BoughtList } from "../types/boughtList";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function BoughtListsPage() {
  const [boughtLists, setBoughtLists] = useState<BoughtList[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<BoughtList | null>(null);
  const [editingLocation, setEditingLocation] = useState<BoughtList | null>(null);
  const [locationDraft, setLocationDraft] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setBoughtLists(await getBoughtLists());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load bought lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteBoughtList(target.id);
      setBoughtLists((prev) => prev.filter((list) => list.id !== target.id));
      toast.success("Bought list deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete bought list");
    }
  }

  async function saveLocation() {
    if (!editingLocation) return;
    setSavingLocation(true);
    try {
      const updated = await updateBoughtListLocation(
        editingLocation.id,
        locationDraft
      );
      setBoughtLists((prev) =>
        prev.map((list) => (list.id === updated.id ? updated : list))
      );
      setEditingLocation(null);
      setLocationDraft("");
      toast.success("Location saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save location");
    } finally {
      setSavingLocation(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Bought lists</h1>
        {!loading && !loadError ? (
          <Badge variant="secondary" aria-label="Bought list count">
            {boughtLists.length}
          </Badge>
        ) : null}
      </div>

      {loadError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : !loadError && boughtLists.length === 0 ? (
        <Card className="mt-6">
          <CardContent
            role="status"
            className="flex flex-col items-center gap-3 px-6 py-10 text-center text-muted-foreground"
          >
            <ReceiptText className="h-8 w-8 opacity-60" aria-hidden="true" />
            <p className="text-sm">
              You have no bought lists yet. Mark items as bought and use Grocery End.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul
          aria-label="Your bought lists"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {boughtLists.map((list) => (
            <li key={list.id} className="relative">
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardContent className="flex items-start gap-2 p-4">
                  <Link
                    to={`/bought-lists/${list.id}`}
                    className="block flex-1 focus-visible:outline-none focus-visible:underline"
                  >
                    <span className="block truncate text-base font-medium hover:underline">
                      {list.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {formatDate(list.createdAt)}
                    </span>
                    {list.location ? (
                      <span className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="truncate">{list.location}</span>
                      </span>
                    ) : null}
                    <Badge variant="outline" className="mt-3">
                      {list.items?.length ?? 0} {(list.items?.length ?? 0) === 1 ? "item" : "items"}
                    </Badge>
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
                        onSelect={() => {
                          setEditingLocation(list);
                          setLocationDraft(list.location ?? "");
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit location
                      </DropdownMenuItem>
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
            <AlertDialogTitle>Delete this bought list?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this bought list and all saved prices? This cannot be undone.
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
      <AlertDialog
        open={editingLocation !== null}
        onOpenChange={(open) => {
          if (!open && !savingLocation) {
            setEditingLocation(null);
            setLocationDraft("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit location</AlertDialogTitle>
            <AlertDialogDescription>
              Update where this bought list was purchased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="bought-list-location"
              className="text-sm font-medium text-foreground"
            >
              Location
            </label>
            <Input
              id="bought-list-location"
              value={locationDraft}
              onChange={(event) => setLocationDraft(event.target.value)}
              maxLength={200}
              placeholder="Store or market name"
              disabled={savingLocation}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingLocation}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void saveLocation();
              }}
              disabled={savingLocation}
            >
              {savingLocation ? "Saving..." : "Save location"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
