import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type ExportFormat = "pdf" | "excel" | "csv" | "print";

interface ExportColumn {
  id: string;
  label: string;
  labelAr: string;
  selected: boolean;
}

interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  columns: ExportColumn[];
  includeHeader: boolean;
  includeFooter: boolean;
  orientation: "portrait" | "landscape";
}

interface ReportExportProps {
  title?: string;
  titleAr?: string;
  data?: Record<string, unknown>[];
  columns?: { id: string; label: string; labelAr: string }[];
  onExport?: (options: ExportOptions) => Promise<void>;
}

// Default columns for standalone usage
const DEFAULT_COLUMNS = [
  { id: "name", label: "Name", labelAr: "الاسم" },
  { id: "department", label: "Department", labelAr: "القسم" },
  { id: "date", label: "Date", labelAr: "التاريخ" },
  { id: "status", label: "Status", labelAr: "الحالة" },
];

// Export Utilities
async function generatePDF(
  title: string,
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  options: ExportOptions
): Promise<Blob> {
  // Simplified PDF generation - in production use jsPDF or similar
  const selectedColumns = columns.filter((c) => c.selected);
  let content = `${title}\n${"=".repeat(50)}\n\n`;

  // Headers
  content += selectedColumns.map((c) => c.label).join(" | ") + "\n";
  content += "-".repeat(50) + "\n";

  // Data rows
  data.forEach((row) => {
    content +=
      selectedColumns
        .map((c) => String(row[c.id as keyof typeof row] || ""))
        .join(" | ") + "\n";
  });

  if (options.includeFooter) {
    content += `\n\nGenerated on: ${new Date().toLocaleString()}`;
  }

  return new Blob([content], { type: "application/pdf" });
}

async function generateExcel(
  title: string,
  data: Record<string, unknown>[],
  columns: ExportColumn[]
): Promise<Blob> {
  const selectedColumns = columns.filter((c) => c.selected);

  // CSV format (works with Excel)
  let content = "";

  // Header
  content += selectedColumns.map((c) => `"${c.label}"`).join(",") + "\n";

  // Data rows
  data.forEach((row) => {
    content +=
      selectedColumns
        .map((c) => {
          const value = row[c.id as keyof typeof row];
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",") + "\n";
  });

  return new Blob(["\ufeff" + content], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
}

async function generateCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[]
): Promise<Blob> {
  const selectedColumns = columns.filter((c) => c.selected);

  let content = "";
  content += selectedColumns.map((c) => `"${c.label}"`).join(",") + "\n";

  data.forEach((row) => {
    content +=
      selectedColumns
        .map((c) => {
          const value = row[c.id as keyof typeof row];
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",") + "\n";
  });

  return new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" });
}

function printReport(
  title: string,
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  options: ExportOptions
) {
  const selectedColumns = columns.filter((c) => c.selected);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html dir="${document.documentElement.dir}">
    <head>
      <title>${title}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 20px; }
        h1 { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: start; }
        th { background: #f5f5f5; }
        tr:nth-child(even) { background: #fafafa; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
        @page { size: ${options.orientation}; }
      </style>
    </head>
    <body>
      ${options.includeHeader ? `<h1>${title}</h1>` : ""}
      <table>
        <thead>
          <tr>
            ${selectedColumns.map((c) => `<th>${c.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${selectedColumns
                .map((c) => `<td>${row[c.id as keyof typeof row] || ""}</td>`)
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      ${
        options.includeFooter
          ? `<div class="footer">Generated on: ${new Date().toLocaleString()}</div>`
          : ""
      }
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// Main Component
export function ReportExport({
  title = "Report",
  titleAr = "تقرير",
  data = [],
  columns = DEFAULT_COLUMNS,
  onExport,
}: ReportExportProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>(
    columns.map((c) => ({ ...c, selected: true }))
  );
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    columns: exportColumns,
    includeHeader: true,
    includeFooter: true,
    orientation: "portrait",
    dateRange: {
      start: "",
      end: "",
    },
  });

  const handleQuickExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const quickOptions: ExportOptions = {
        format,
        columns: exportColumns,
        includeHeader: true,
        includeFooter: true,
        orientation: "portrait",
      };

      if (onExport) {
        await onExport(quickOptions);
      } else {
        await performExport(format, quickOptions);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const performExport = async (format: ExportFormat, opts: ExportOptions) => {
    const displayTitle = isArabic ? titleAr : title;
    const cols = opts.columns.length > 0 ? opts.columns : exportColumns;

    switch (format) {
      case "pdf": {
        const blob = await generatePDF(displayTitle, data, cols, opts);
        downloadBlob(blob, `${title}.pdf`);
        break;
      }
      case "excel": {
        const blob = await generateExcel(displayTitle, data, cols);
        downloadBlob(blob, `${title}.xlsx`);
        break;
      }
      case "csv": {
        const blob = await generateCSV(data, cols);
        downloadBlob(blob, `${title}.csv`);
        break;
      }
      case "print":
        printReport(displayTitle, data, cols, opts);
        break;
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAdvancedExport = async () => {
    setIsExporting(true);
    try {
      const exportOpts: ExportOptions = {
        ...options,
        format: selectedFormat,
        columns: exportColumns,
      };

      if (onExport) {
        await onExport(exportOpts);
      } else {
        await performExport(selectedFormat, exportOpts);
      }

      setIsDialogOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleColumn = (id: string) => {
    setExportColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleAllColumns = (selected: boolean) => {
    setExportColumns((prev) => prev.map((c) => ({ ...c, selected })));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isArabic ? "تصدير" : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            {isArabic ? "تصدير سريع" : "Quick Export"}
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير PDF" : "Export as PDF"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport("excel")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير Excel" : "Export as Excel"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير CSV" : "Export as CSV"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport("print")}>
            <Printer className="h-4 w-4 mr-2" />
            {isArabic ? "طباعة" : "Print"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير متقدم" : "Advanced Export"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "خيارات التصدير المتقدمة" : "Advanced Export Options"}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? "خصص إعدادات التصدير حسب احتياجاتك"
                : "Customize export settings to your needs"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Format Selection */}
            <div className="grid gap-2">
              <Label>{isArabic ? "صيغة التصدير" : "Export Format"}</Label>
              <Select
                value={selectedFormat}
                onValueChange={(v) => setSelectedFormat(v as ExportFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{isArabic ? "من تاريخ" : "From Date"}</Label>
                <Input
                  type="date"
                  value={options.dateRange?.start || ""}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      dateRange: {
                        start: e.target.value,
                        end: options.dateRange?.end || "",
                      },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{isArabic ? "إلى تاريخ" : "To Date"}</Label>
                <Input
                  type="date"
                  value={options.dateRange?.end || ""}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      dateRange: {
                        start: options.dateRange?.start || "",
                        end: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Column Selection */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{isArabic ? "الأعمدة" : "Columns"}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllColumns(true)}
                  >
                    {isArabic ? "تحديد الكل" : "Select All"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllColumns(false)}
                  >
                    {isArabic ? "إلغاء الكل" : "Deselect All"}
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-2">
                {exportColumns.map((col) => (
                  <div key={col.id} className="flex items-center gap-2">
                    <Checkbox
                      id={col.id}
                      checked={col.selected}
                      onCheckedChange={() => toggleColumn(col.id)}
                    />
                    <label htmlFor={col.id} className="text-sm cursor-pointer">
                      {isArabic ? col.labelAr : col.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            {selectedFormat === "pdf" && (
              <>
                <div className="grid gap-2">
                  <Label>{isArabic ? "اتجاه الصفحة" : "Orientation"}</Label>
                  <Select
                    value={options.orientation}
                    onValueChange={(v) =>
                      setOptions({
                        ...options,
                        orientation: v as "portrait" | "landscape",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">
                        {isArabic ? "عمودي" : "Portrait"}
                      </SelectItem>
                      <SelectItem value="landscape">
                        {isArabic ? "أفقي" : "Landscape"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeHeader"
                      checked={options.includeHeader}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeHeader: !!checked })
                      }
                    />
                    <label htmlFor="includeHeader" className="text-sm">
                      {isArabic ? "تضمين العنوان" : "Include Header"}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeFooter"
                      checked={options.includeFooter}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeFooter: !!checked })
                      }
                    />
                    <label htmlFor="includeFooter" className="text-sm">
                      {isArabic ? "تضمين التاريخ" : "Include Footer with Date"}
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAdvancedExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isArabic ? "تصدير" : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ReportExport;
