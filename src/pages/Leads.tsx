import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, UserPlus, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { UploadLeadsDialog } from "@/components/leads/UploadLeadsDialog";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadStatus, type LeadSource } from "@/types/leads";

export default function Leads() {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const { leads, isLoading, deleteLeads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const canCreateLead = isAdmin || isManager;
  const canDeleteLeads = isAdmin || isManager;

  const allVisibleSelected =
    filteredLeads.length > 0 && filteredLeads.every((l) => selectedIds.has(l.id));
  const someVisibleSelected =
    filteredLeads.some((l) => selectedIds.has(l.id)) && !allVisibleSelected;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredLeads.forEach((l) => next.delete(l.id));
      } else {
        filteredLeads.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await deleteLeads.mutateAsync(ids);
      toast.success(`${ids.length} lead${ids.length > 1 ? "s" : ""} deleted`);
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to delete leads");
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex gap-2">
          {canDeleteLeads && selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deleteLeads.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedIds.size})
            </Button>
          )}
          {canCreateLead && (
            <>
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Excel
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {LEAD_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canDeleteLeads && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allVisibleSelected || (someVisibleSelected && "indeterminate")}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all leads"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Inquiry Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {canDeleteLeads && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDeleteLeads ? 7 : 6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No leads found</p>
                    {canCreateLead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Add your first lead
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  {canDeleteLeads && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(lead.id)}
                        onCheckedChange={() => toggleSelectOne(lead.id)}
                        aria-label={`Select ${lead.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && (
                        <span className="text-muted-foreground">{lead.phone}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {lead.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    {lead.owner?.full_name || lead.owner?.email || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(lead.inquiry_date), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateLeadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <UploadLeadsDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected leads?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected lead
              {selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
