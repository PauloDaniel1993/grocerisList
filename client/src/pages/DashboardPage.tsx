import { useCallback, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, LineChart as LineChartIcon } from "lucide-react";

import { getPriceHistory } from "@/api/client";
import {
  filterPricePointsByLocalDate,
  validateDateRange,
} from "@/lib/filterPricePointsByLocalDate";
import { ProductAutocomplete } from "@/components/ProductAutocomplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GROCERY_CATEGORIES,
  getGroceryCategoryLabel,
  type GroceryCategory,
} from "@/types/grocery";
import type { PricePoint } from "@/types/priceHistory";

const CHART_STROKES = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type CategoryFilter = GroceryCategory | "all";

function formatAxisDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTableDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

type ChartRow = Record<string, string | number | null | undefined>;

export function DashboardPage() {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFromChange = (value: string) => {
    setFrom(value);
    setDateError(validateDateRange(value, to));
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setDateError(validateDateRange(from, value));
  };

  const loadChart = useCallback(async () => {
    setDateError(null);
    setValidationError(null);
    setError(null);
    if (category === "all" && !product.trim()) {
      setValidationError(
        "Choose a category or enter a product (category “All” needs a product)."
      );
      return;
    }
    setLoading(true);
    try {
      const next = await getPriceHistory({
        product: product.trim() || undefined,
        category: category === "all" ? undefined : category,
      });
      setPoints(next);
    } catch (e) {
      setPoints([]);
      setError(e instanceof Error ? e.message : "Could not load price history");
    } finally {
      setLoading(false);
    }
  }, [category, product]);

  const displayPoints = useMemo(
    () => filterPricePointsByLocalDate(points, from, to),
    [points, from, to]
  );

  const productNames = useMemo(() => {
    const names = [...new Set(displayPoints.map((p) => p.name))];
    names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return names;
  }, [displayPoints]);

  const chartData = useMemo(() => {
    if (displayPoints.length === 0) return [];
    const dates = [...new Set(displayPoints.map((p) => p.date))].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const rows: ChartRow[] = dates.map((date) => {
      const row: ChartRow = {
        date,
        dateLabel: formatAxisDate(date),
      };
      for (const name of productNames) {
        const match = displayPoints.filter(
          (p) => p.date === date && p.name === name
        );
        const last = match[match.length - 1];
        if (last) {
          row[name] = last.price;
          if (productNames.length === 1) {
            row.location = last.location ?? "";
          }
        }
      }
      return row;
    });
    return rows;
  }, [displayPoints, productNames]);

  const tooltipFormatter = useCallback(
    (value: number, name: string, item: { payload?: ChartRow }) => {
      const loc = item.payload?.location;
      const price = formatMoney(value);
      if (typeof loc === "string" && loc.length > 0) {
        return [price, `${name} (${loc})`];
      }
      return [price, name];
    },
    []
  );

  const emptyAfterLoad = !loading && !error && points.length === 0;
  const dateRangeExcludesAll =
    !loading &&
    !error &&
    points.length > 0 &&
    displayPoints.length === 0 &&
    (from.trim() !== "" || to.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Price dashboard</h1>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(11rem,13rem)] md:items-end md:gap-x-6">
              <div className="space-y-2">
                <Label htmlFor="dash-product">Product</Label>
                <ProductAutocomplete
                  id="dash-product"
                  value={product}
                  onChange={setProduct}
                  placeholder="Previously bought items"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dash-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as CategoryFilter)}
                >
                  <SelectTrigger id="dash-category" className="h-11 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {GROCERY_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {getGroceryCategoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-none sm:gap-4">
                <div className="min-w-0 space-y-2 sm:w-[11.25rem]">
                  <Label htmlFor="dash-from">From</Label>
                  <input
                    id="dash-from"
                    type="date"
                    value={from}
                    onChange={(e) => handleFromChange(e.target.value)}
                    aria-invalid={
                      dateError !== null &&
                      dateError.startsWith("Invalid From")
                        ? true
                        : undefined
                    }
                    className={`h-11 w-full rounded-md border px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      dateError !== null &&
                      (dateError.startsWith("Invalid From") ||
                        dateError.includes("after From"))
                        ? "border-destructive"
                        : "border-input"
                    } bg-background`}
                  />
                </div>
                <div className="min-w-0 space-y-2 sm:w-[11.25rem]">
                  <Label htmlFor="dash-to">To</Label>
                  <input
                    id="dash-to"
                    type="date"
                    value={to}
                    onChange={(e) => handleToChange(e.target.value)}
                    aria-invalid={
                      dateError !== null &&
                      dateError.startsWith("Invalid To")
                        ? true
                        : undefined
                    }
                    className={`h-11 w-full rounded-md border px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      dateError !== null &&
                      (dateError.startsWith("Invalid To") ||
                        dateError.includes("after From"))
                        ? "border-destructive"
                        : "border-input"
                    } bg-background`}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                className="h-11 w-full shrink-0 sm:w-auto sm:min-w-[8.5rem]"
                disabled={loading}
                onClick={() => void loadChart()}
              >
                {loading ? "Loading…" : "Show"}
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Leave From and To empty to show every purchase date in the chart.
            </p>
            {dateError ? (
              <p className="text-sm text-destructive" role="alert">
                {dateError}
              </p>
            ) : null}
          </div>

          {validationError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {dateRangeExcludesAll ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No purchases fall in this date range. Clear From and To to see all
                dates.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {emptyAfterLoad ? (
        <Card>
          <CardContent
            role="status"
            className="flex flex-col items-center gap-3 px-6 py-12 text-center text-muted-foreground"
          >
            <LineChartIcon className="h-10 w-10 opacity-60" aria-hidden />
            <p className="text-sm">
              No price points in this range. Add prices on bought lists, then try
              again.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {chartData.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Price over time
            </div>
            <div className="h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(v) =>
                      typeof v === "number" ? formatMoney(v) : String(v)
                    }
                  />
                  <Tooltip
                    formatter={tooltipFormatter}
                    labelFormatter={(label) => String(label)}
                    contentStyle={{
                      borderRadius: "var(--radius)",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: "12px",
                    }}
                  />
                  {productNames.length > 1 ? <Legend /> : null}
                  {productNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      name={name}
                      stroke={CHART_STROKES[i % CHART_STROKES.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {displayPoints.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 text-sm font-medium text-muted-foreground">
              Data points
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...displayPoints]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((p, idx) => (
                    <TableRow key={`${p.date}-${p.name}-${idx}`}>
                      <TableCell>{formatTableDate(p.date)}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="text-right">
                        {formatMoney(p.price)}
                      </TableCell>
                      <TableCell>{p.location ?? "—"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
