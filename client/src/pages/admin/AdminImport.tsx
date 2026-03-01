import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdmin } from "@/hooks/useAdmin";
import { ArrowLeft, Download, Upload, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";

const CSV_HEADERS = [
  "name", "address", "address2", "town", "postcode",
  "latitude", "longitude", "category", "description",
  "dogPolicy", "waterBowls", "dogTreats", "dogMenu",
  "phone", "website", "imageUrl",
];

const EXAMPLE_ROW = [
  "The Paws Inn", "45 Bark Street", "Unit 2", "Manchester", "M1 1AA",
  "53.4808", "-2.2426", "pub;cafe", "A welcoming pub that loves dogs.",
  "dogs_both", "true", "true", "false",
  "0161 123 4567", "https://example.com", "/images/pub1.jpg",
];

type ParsedRow = Record<string, string> & { _rowNum: number; _errors: string[] };

type ImportResult = {
  created: number;
  errors: { row: number; message: string }[];
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = { _rowNum: i, _errors: [] };
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    if (!row["name"]) row._errors.push("name is required");
    if (!row["address"]) row._errors.push("address is required");
    if (!row["town"]) row._errors.push("town is required");
    if (!row["postcode"]) row._errors.push("postcode is required");
    if (!row["latitude"] || isNaN(Number(row["latitude"]))) row._errors.push("valid latitude is required");
    if (!row["longitude"] || isNaN(Number(row["longitude"]))) row._errors.push("valid longitude is required");
    if (!row["category"]) row._errors.push("category is required");
    if (!row["description"]) row._errors.push("description is required");
    if (!["dogs_inside", "dogs_outside", "dogs_both", "dogs_hotel_only"].includes(row["dogPolicy"])) {
      row._errors.push("dogPolicy must be dogs_inside, dogs_outside, dogs_both, or dogs_hotel_only");
    }

    rows.push(row);
  }

  return rows;
}

function rowToPlace(row: ParsedRow) {
  return {
    name: row["name"],
    address: row["address"],
    address2: row["address2"] || null,
    town: row["town"],
    postcode: row["postcode"],
    latitude: parseFloat(row["latitude"]),
    longitude: parseFloat(row["longitude"]),
    category: row["category"].split(";").map(c => c.trim()).filter(Boolean),
    description: row["description"],
    dogPolicy: row["dogPolicy"],
    waterBowls: row["waterBowls"] === "true",
    dogTreats: row["dogTreats"] === "true",
    dogMenu: row["dogMenu"] === "true",
    phone: row["phone"] || null,
    website: row["website"] || null,
    imageUrl: row["imageUrl"] || null,
  };
}

function downloadTemplate() {
  const lines = [CSV_HEADERS.join(","), EXAMPLE_ROW.join(",")];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "houndsabout-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminImport() {
  const { isLoading: authLoading } = useAdmin();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const validRows = rows.filter(r => r._errors.length === 0);
  const invalidRows = rows.filter(r => r._errors.length > 0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const places = validRows.map(rowToPlace);
      const res = await apiRequest("POST", "/api/admin/places/bulk", { places });
      const data: ImportResult = await res.json();
      setResult(data);
      if (data.created > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/places"] });
        toast({ title: `${data.created} listing${data.created !== 1 ? "s" : ""} imported successfully` });
      }
    } catch {
      toast({ title: "Import failed", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/places">
            <Button variant="ghost" size="sm" data-testid="button-back-to-listings">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Listings
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Import Listings</h1>
            <p className="text-sm text-muted-foreground">Bulk upload via CSV spreadsheet</p>
          </div>
        </div>
        <Button
          data-testid="button-download-template"
          variant="outline"
          onClick={downloadTemplate}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold text-foreground">Upload CSV File</h2>
              <p className="text-sm text-muted-foreground">Download the template above, fill it in, then upload it here.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              data-testid="input-csv-file"
              onChange={handleFile}
            />
            <Button
              data-testid="button-choose-file"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
          </div>

          <div className="bg-muted/40 rounded-lg p-4 text-sm space-y-1">
            <p className="font-medium text-foreground">CSV column guide</p>
            <p className="text-muted-foreground"><strong>category</strong>: separate multiple with a semicolon e.g. <code>pub;cafe</code></p>
            <p className="text-muted-foreground"><strong>dogPolicy</strong>: one of <code>dogs_inside</code>, <code>dogs_outside</code>, <code>dogs_both</code>, <code>dogs_hotel_only</code></p>
            <p className="text-muted-foreground"><strong>waterBowls / dogTreats / dogMenu</strong>: <code>true</code> or <code>false</code></p>
            <p className="text-muted-foreground"><strong>address2, phone, website, imageUrl</strong>: optional — leave blank if not applicable</p>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground font-medium">{rows.length} row{rows.length !== 1 ? "s" : ""} parsed</span>
                {validRows.length > 0 && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {validRows.length} valid
                  </span>
                )}
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    {invalidRows.length} with errors
                  </span>
                )}
              </div>
              {validRows.length > 0 && !result && (
                <Button
                  data-testid="button-import"
                  onClick={handleImport}
                  disabled={importing}
                  style={{ backgroundColor: "#ff9900", color: "white" }}
                >
                  {importing ? "Importing…" : `Import ${validRows.length} listing${validRows.length !== 1 ? "s" : ""}`}
                </Button>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10">#</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Town</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Policy</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row._rowNum}
                      data-testid={`row-import-${row._rowNum}`}
                      className={`border-b border-border last:border-0 ${row._errors.length > 0 ? "bg-destructive/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-muted-foreground">{row._rowNum}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{row["name"] || <span className="text-destructive italic">missing</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row["address"]}
                        {row["address2"] && <span className="block text-xs">{row["address2"]}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row["town"]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row["category"]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row["dogPolicy"]}</td>
                      <td className="px-4 py-3">
                        {row._errors.length === 0 ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-destructive text-xs" title={row._errors.join("; ")}>
                            <XCircle className="w-3.5 h-3.5 inline mr-1" />
                            {row._errors[0]}{row._errors.length > 1 ? ` (+${row._errors.length - 1} more)` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-xl border p-5 space-y-3 ${result.created > 0 ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-muted border-border"}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-foreground">
                {result.created} listing{result.created !== 1 ? "s" : ""} imported successfully
              </p>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">{result.errors.length} row{result.errors.length !== 1 ? "s" : ""} failed:</p>
                {result.errors.map(e => (
                  <p key={e.row} className="text-sm text-muted-foreground">Row {e.row}: {e.message}</p>
                ))}
              </div>
            )}
            <Link href="/admin/places">
              <Button variant="outline" size="sm" data-testid="button-view-listings">
                View all listings
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
