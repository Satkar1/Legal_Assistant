import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { insertCaseSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Scale, 
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit
} from "lucide-react";
import type { Case } from "@shared/schema";

const caseFormSchema = insertCaseSchema.extend({
  nextHearing: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

const caseTypes = [
  "Civil",
  "Criminal",
  "Family",
  "Commercial",
  "Labour",
  "Consumer",
  "Constitutional",
  "Tax",
  "Property",
  "Other"
];

const caseStatuses = [
  "Filed",
  "Under Investigation",
  "In Progress",
  "Hearing Scheduled",
  "Judgment Reserved",
  "Completed",
  "Dismissed",
  "Withdrawn"
];

const courts = [
  "District Court",
  "Sessions Court",
  "High Court",
  "Supreme Court",
  "Family Court",
  "Consumer Court",
  "Labour Court",
  "Tax Tribunal"
];

export default function CaseTracker() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("unauthorized"),
        description: t("logged_out_message"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      caseNumber: "",
      court: "",
      caseType: "",
      status: "",
      description: "",
      nextHearing: "",
    },
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
    retry: false,
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      const caseData = {
        ...data,
        nextHearing: data.nextHearing ? new Date(data.nextHearing).toISOString() : undefined
      };
      const response = await apiRequest("POST", "/api/cases", caseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      setIsDialogOpen(false);
      setEditingCase(null);
      form.reset();
      toast({
        title: "Case Added",
        description: "Your case has been added successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("unauthorized"),
          description: t("logged_out_message"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Case> }) => {
      const response = await apiRequest("PUT", `/api/cases/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      setIsDialogOpen(false);
      setEditingCase(null);
      form.reset();
      toast({
        title: "Case Updated",
        description: "Your case has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("unauthorized"),
          description: t("logged_out_message"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CaseFormData) => {
    if (editingCase) {
      updateCaseMutation.mutate({ id: editingCase.id, data });
    } else {
      createCaseMutation.mutate(data);
    }
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    form.reset({
      caseNumber: caseItem.caseNumber || "",
      court: caseItem.court || "",
      caseType: caseItem.caseType || "",
      status: caseItem.status || "",
      description: caseItem.description || "",
      nextHearing: caseItem.nextHearing ? new Date(caseItem.nextHearing).toISOString().slice(0, 16) : "",
    });
    setIsDialogOpen(true);
  };

  const handleNewCase = () => {
    setEditingCase(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
      case "hearing scheduled":
        return "bg-blue-100 text-blue-800";
      case "dismissed":
      case "withdrawn":
        return "bg-red-100 text-red-800";
      case "judgment reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "dismissed":
      case "withdrawn":
        return <XCircle size={16} className="text-red-600" />;
      case "in progress":
      case "hearing scheduled":
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const filteredCases = cases?.filter((caseItem: Case) => {
    const matchesSearch = !searchQuery || 
      caseItem.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.court?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-legal-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none mobile-safe-bottom">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Case Tracker</h1>
                      <p className="mt-1 text-sm text-gray-600">
                        Monitor and manage your legal cases in one place
                      </p>
                    </div>
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={handleNewCase}
                          className="bg-legal-blue hover:bg-legal-blue-dark"
                        >
                          <Plus size={16} className="mr-2" />
                          Add New Case
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingCase ? "Edit Case" : "Add New Case"}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="caseNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Case Number</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="e.g., CC/123/2024"
                                        {...field}
                                        className="focus:ring-legal-accent focus:border-legal-accent"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="court"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Court</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select court" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {courts.map((court) => (
                                          <SelectItem key={court} value={court}>
                                            {court}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="caseType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Case Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select case type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {caseTypes.map((type) => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {caseStatuses.map((status) => (
                                          <SelectItem key={status} value={status}>
                                            {status}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="nextHearing"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Next Hearing Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="datetime-local"
                                      {...field}
                                      className="focus:ring-legal-accent focus:border-legal-accent"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Case Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Brief description of the case"
                                      className="focus:ring-legal-accent focus:border-legal-accent"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit"
                                className="bg-legal-blue hover:bg-legal-blue-dark"
                                disabled={createCaseMutation.isPending || updateCaseMutation.isPending}
                              >
                                {editingCase ? "Update Case" : "Add Case"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by case number, description, or court..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 focus:ring-legal-accent focus:border-legal-accent"
                          />
                        </div>
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {caseStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Cases List */}
                <div className="space-y-4">
                  {casesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <Skeleton className="h-6 w-1/3" />
                              <Skeleton className="h-4 w-2/3" />
                              <div className="flex space-x-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredCases.length > 0 ? (
                    filteredCases.map((caseItem: Case) => (
                      <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {caseItem.caseNumber || "Case #" + caseItem.id}
                                </h3>
                                <Badge className={getStatusColor(caseItem.status || "")}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(caseItem.status || "")}
                                    <span>{caseItem.status}</span>
                                  </div>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Scale size={16} />
                                  <span>{caseItem.court}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <FileText size={16} />
                                  <span>{caseItem.caseType}</span>
                                </div>
                                {caseItem.nextHearing && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar size={16} />
                                    <span>Next: {new Date(caseItem.nextHearing).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              {caseItem.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {caseItem.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                <span>Created: {new Date(caseItem.createdAt).toLocaleDateString()}</span>
                                <span>Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCase(caseItem)}
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Scale size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchQuery || statusFilter !== "all" ? "No cases found" : "No cases added yet"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchQuery || statusFilter !== "all" 
                            ? "Try adjusting your search criteria" 
                            : "Add your first case to start tracking your legal matters"
                          }
                        </p>
                        {!searchQuery && statusFilter === "all" && (
                          <Button 
                            onClick={handleNewCase}
                            className="bg-legal-blue hover:bg-legal-blue-dark"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Your First Case
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
