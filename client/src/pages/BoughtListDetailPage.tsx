import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ChevronLeft,
  Download,
  FileDown,
  FileQuestion,
  ReceiptText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getBoughtList, updateBoughtItem, updateBoughtItemPrice } from "../api/client";
import {
  BOUGHT_LIST_IMPORT_TEMPLATE_CSV,
  boughtItemsToCsv,
  sanitizeFilenameBase,
  triggerTextFileDownload,
} from "../lib/boughtListCsv";
import {
  matchEntries,
  parseImportFile,
  type FileEntry,
  type MatchResult,
} from "../lib/importFile";
import {
  GROCERY_CATEGORIES,
  getGroceryCategoryLabel,
  type GroceryCategory,
} from "../types/grocery";
import type { BoughtItem, BoughtList } from "../types/boughtList";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "ok" };

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl">{children}</div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/bought-lists">
        <ChevronLeft className="h-4 w-4" />
        Bought lists
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
          <Link to="/bought-lists">
            <ChevronLeft className="h-4 w-4" />
            Back to bought lists
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function priceToDraft(price: number | null): string {
  return price === null ? "" : String(price);
}

function UnmatchedItemsDialog({
  open,
  unmatched,
  availableItems,
  applying,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  unmatched: FileEntry[];
  availableItems: BoughtItem[];
  applying: boolean;
  onConfirm: (mappings: Map<number, string>) => void;
  onCancel: () => void;
}) {
  const [selections, setSelections] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) setSelections({});
  }, [open]);

  const usedItemIds = new Set(Object.values(selections));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !applying && onCancel()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unrecognized products</DialogTitle>
          <DialogDescription>
            These products from the file couldn't be matched by name. Select the
            corresponding bought list item for each, or skip them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {unmatched.map((entry, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{entry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.price !== null ? formatCurrency(entry.price) : "No price"}
                  {entry.category
                    ? ` · ${getGroceryCategoryLabel(entry.category)}`
                    : ""}
                </p>
              </div>
              <Select
                value={selections[idx] ?? "__skip__"}
                onValueChange={(val) => {
                  setSelections((prev) => {
                    const next = { ...prev };
                    if (val === "__skip__") {
                      delete next[idx];
                    } else {
                      next[idx] = val;
                    }
                    return next;
                  });
                }}
                disabled={applying}
              >
                <SelectTrigger className="w-full sm:w-52" aria-label={`Map ${entry.name}`}>
                  <SelectValue placeholder="Skip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__skip__">Skip</SelectItem>
                  {availableItems
                    .filter(
                      (item) =>
                        !usedItemIds.has(item.id) || selections[idx] === item.id
                    )
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={applying}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const mappings = new Map<number, string>();
              for (const [idx, itemId] of Object.entries(selections)) {
                mappings.set(Number(idx), itemId);
              }
              onConfirm(mappings);
            }}
            disabled={applying}
          >
            {applying ? "Applying..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BoughtListDetailPage() {
  const { boughtListId } = useParams<{ boughtListId: string }>();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [boughtList, setBoughtList] = useState<BoughtList | null>(null);
  const [items, setItems] = useState<BoughtItem[]>([]);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<MatchResult | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [applyingImport, setApplyingImport] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [items]
  );

  useEffect(() => {
    if (!boughtListId) {
      setLoad({ status: "notFound" });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoad({ status: "loading" });
      try {
        const list = await getBoughtList(boughtListId);
        if (cancelled) return;
        const loadedItems = list.items ?? [];
        setBoughtList(list);
        setItems(loadedItems);
        setPriceDrafts(
          Object.fromEntries(
            loadedItems.map((item) => [item.id, priceToDraft(item.price)])
          )
        );
        setLoad({ status: "ok" });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load bought list";
        if (msg === "Bought list not found" || /not found/i.test(msg)) {
          setLoad({ status: "notFound" });
        } else {
          setLoad({ status: "error", message: msg });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boughtListId]);

  async function savePrice(item: BoughtItem) {
    if (!boughtListId) return;
    const draft = priceDrafts[item.id]?.trim() ?? "";
    const nextPrice = draft === "" ? null : Number(draft);
    if (nextPrice !== null && (!Number.isFinite(nextPrice) || nextPrice < 0)) {
      toast.error("Price must be a positive number");
      setPriceDrafts((prev) => ({ ...prev, [item.id]: priceToDraft(item.price) }));
      return;
    }
    if (nextPrice === item.price) return;

    setSavingId(item.id);
    try {
      const updated = await updateBoughtItemPrice(boughtListId, item.id, nextPrice);
      setItems((prev) =>
        prev.map((current) => (current.id === updated.id ? updated : current))
      );
      setPriceDrafts((prev) => ({
        ...prev,
        [updated.id]: priceToDraft(updated.price),
      }));
      toast.success("Price saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save price");
      setPriceDrafts((prev) => ({ ...prev, [item.id]: priceToDraft(item.price) }));
    } finally {
      setSavingId(null);
    }
  }

  async function saveCategory(item: BoughtItem, category: GroceryCategory) {
    if (!boughtListId || category === item.category) return;
    setSavingId(item.id);
    try {
      const updated = await updateBoughtItem(boughtListId, item.id, { category });
      setItems((prev) =>
        prev.map((current) => (current.id === updated.id ? updated : current))
      );
      toast.success("Category saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSavingId(null);
    }
  }

  const handleFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = "";

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const entries = parseImportFile(text, file.name);
          if (entries.length === 0) {
            toast.error("No valid entries found in file");
            return;
          }
          const result = matchEntries(entries, items);
          if (result.unmatched.length === 0) {
            void applyImport(result.matched, new Map());
          } else {
            setImportResult(result);
            setShowImportDialog(true);
          }
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Could not parse file"
          );
        }
      };
      reader.onerror = () => toast.error("Could not read file");
      reader.readAsText(file);
    },
    [items, boughtListId]
  );

  async function applyImport(
    matched: MatchResult["matched"],
    manualMappings: Map<number, string>
  ) {
    if (!boughtListId) return;
    setApplyingImport(true);

    const updates: Array<{ itemId: string; data: { price?: number | null; category?: GroceryCategory } }> = [];

    for (const { fileEntry, item } of matched) {
      const data: { price?: number | null; category?: GroceryCategory } = {};
      if (fileEntry.price !== null) data.price = fileEntry.price;
      if (fileEntry.category) data.category = fileEntry.category;
      if (Object.keys(data).length > 0) {
        updates.push({ itemId: item.id, data });
      }
    }

    const unmatched = importResult?.unmatched ?? [];
    for (const [idx, itemId] of manualMappings) {
      const entry = unmatched[idx];
      if (!entry) continue;
      const data: { price?: number | null; category?: GroceryCategory } = {};
      if (entry.price !== null) data.price = entry.price;
      if (entry.category) data.category = entry.category;
      if (Object.keys(data).length > 0) {
        updates.push({ itemId, data });
      }
    }

    let successCount = 0;
    let errorCount = 0;

    for (const { itemId, data } of updates) {
      try {
        const updated = await updateBoughtItem(boughtListId, itemId, data);
        setItems((prev) =>
          prev.map((current) => (current.id === updated.id ? updated : current))
        );
        setPriceDrafts((prev) => ({
          ...prev,
          [updated.id]: priceToDraft(updated.price),
        }));
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setApplyingImport(false);
    setShowImportDialog(false);
    setImportResult(null);

    if (errorCount === 0 && successCount > 0) {
      toast.success(`Updated ${successCount} item${successCount === 1 ? "" : "s"}`);
    } else if (errorCount > 0 && successCount > 0) {
      toast.warning(
        `Updated ${successCount} item${successCount === 1 ? "" : "s"}, ${errorCount} failed`
      );
    } else if (errorCount > 0) {
      toast.error("Failed to update items");
    } else {
      toast.info("No items needed updating");
    }
  }

  const unmatchedAvailableItems = useMemo(() => {
    if (!importResult) return [];
    const matchedIds = new Set(importResult.matched.map((m) => m.item.id));
    return items.filter((item) => !matchedIds.has(item.id));
  }, [importResult, items]);

  if (!boughtListId || load.status === "notFound") {
    return (
      <PageShell>
        <StatusCard
          icon={<FileQuestion className="h-8 w-8" />}
          title="Bought list not found"
          description="The bought list you’re looking for doesn’t exist or was removed."
        />
      </PageShell>
    );
  }

  if (load.status === "loading") {
    return (
      <PageShell>
        <BackLink />
        <Skeleton className="mt-3 h-8 w-56" />
        <Skeleton className="mt-3 h-5 w-36" />
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </PageShell>
    );
  }

  if (load.status === "error") {
    return (
      <PageShell>
        <StatusCard
          icon={<AlertCircle className="h-8 w-8" />}
          title="Couldn’t load this bought list"
          description={load.message}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BackLink />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {boughtList?.name ?? "Bought list"}
        </h1>
        <Badge variant="secondary" aria-label="Bought item count">
          {items.length}
        </Badge>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              triggerTextFileDownload(
                "bought-list-import-template.csv",
                BOUGHT_LIST_IMPORT_TEMPLATE_CSV
              );
            }}
          >
            <FileDown className="h-4 w-4" />
            Download template
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            onClick={() => {
              const base = sanitizeFilenameBase(
                boughtList?.name ?? "bought-list"
              );
              triggerTextFileDownload(
                `${base}.csv`,
                boughtItemsToCsv(items)
              );
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={items.length === 0}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
      {boughtList ? (
        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
          <p>Created {formatDate(boughtList.createdAt)}</p>
          {boughtList.location ? <p>{boughtList.location}</p> : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <Card className="mt-6">
          <CardContent
            role="status"
            className="flex flex-col items-center gap-3 px-6 py-10 text-center text-muted-foreground"
          >
            <ReceiptText className="h-8 w-8 opacity-60" aria-hidden="true" />
            <p className="text-sm">This bought list has no items.</p>
          </CardContent>
        </Card>
      ) : (
        <ul aria-label="Bought items" className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_11rem_10rem] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`category-${item.id}`}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Category
                    </label>
                    <Select
                      value={item.category}
                      onValueChange={(value) =>
                        void saveCategory(item, value as GroceryCategory)
                      }
                      disabled={savingId === item.id}
                    >
                      <SelectTrigger
                        id={`category-${item.id}`}
                        aria-label={`Category for ${item.name}`}
                        className="h-10"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GROCERY_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getGroceryCategoryLabel(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`price-${item.id}`}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Price
                    </label>
                    <Input
                      id={`price-${item.id}`}
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      type="number"
                      placeholder="0.00"
                      value={priceDrafts[item.id] ?? ""}
                      disabled={savingId === item.id}
                      onChange={(event) =>
                        setPriceDrafts((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))
                      }
                      onBlur={() => void savePrice(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-4">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-xl font-semibold">{formatCurrency(total)}</span>
        </CardContent>
      </Card>

      <UnmatchedItemsDialog
        open={showImportDialog}
        unmatched={importResult?.unmatched ?? []}
        availableItems={unmatchedAvailableItems}
        applying={applyingImport}
        onCancel={() => {
          setShowImportDialog(false);
          setImportResult(null);
        }}
        onConfirm={(mappings) => {
          void applyImport(importResult?.matched ?? [], mappings);
        }}
      />
    </PageShell>
  );
}
