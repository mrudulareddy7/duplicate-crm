import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface ParsedLead {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface UploadLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadLeadsDialog({ open, onOpenChange }: UploadLeadsDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parseError, setParseError] = useState("");

  const reset = () => {
    setParsedLeads([]);
    setFileName("");
    setParseError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError("");
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length === 0) {
          setParseError("The file contains no data rows.");
          return;
        }

        const leads: ParsedLead[] = rows.map((row) => {
          const get = (keys: string[]) => {
            for (const k of keys) {
              const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
              if (val !== undefined && val !== null && String(val).trim()) return String(val).trim();
            }
            return null;
          };

          return {
            name: get(["Name", "name", "Full Name", "full_name"]) || "Unknown",
            phone: get(["Mobile Number", "mobile_number", "Phone", "phone", "Mobile", "mobile", "Contact Number"]),
            email: get(["Email ID", "email_id", "Email", "email", "Email Address", "email_address"]),
            address: get(["Address", "address", "Location", "location"]),
          };
        });

        setParsedLeads(leads);
      } catch {
        setParseError("Failed to parse the file. Please ensure it's a valid Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!user || parsedLeads.length === 0) return;
    setIsUploading(true);

    try {
      const now = new Date().toISOString();
      const insertData = parsedLeads.map((lead) => ({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        source: "other" as const,
        status: "new" as const,
        owner_id: user.id,
        inquiry_date: now,
      }));

      const { error } = await supabase.from("leads").insert(insertData);
      if (error) throw error;

      toast.success(`${parsedLeads.length} leads uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload leads");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Leads from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file with columns: Name, Mobile Number, Email ID, Address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fileName || "Click to select an Excel file (.xlsx, .xls)"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {parseError}
            </div>
          )}

          {parsedLeads.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {parsedLeads.length} lead(s) found and ready to upload
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={parsedLeads.length === 0 || isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : `Upload ${parsedLeads.length} Lead(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
