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
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { FileText, Download, Save, Plus, Edit, Trash2, Calendar, MapPin, AlertCircle } from "lucide-react";
import type { FirDraft } from "@shared/schema";

const firGenerationSchema = z.object({
  incidentType: z.string().min(1, "Incident type is required"),
  location: z.string().min(1, "Location is required"),
  dateTime: z.string().min(1, "Date and time is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  complainantName: z.string().min(1, "Name is required"),
  complainantAddress: z.string().min(1, "Address is required"),
  complainantPhone: z.string().min(10, "Valid phone number is required"),
});

type FirGenerationData = z.infer<typeof firGenerationSchema>;

const incidentTypes = [
  "Theft",
  "Robbery",
  "Assault",
  "Fraud",
  "Cybercrime",
  "Domestic Violence",
  "Property Dispute",
  "Harassment",
  "Cheating",
  "Other"
];

export default function FirGenerator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedDraft, setSelectedDraft] = useState<FirDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const form = useForm<FirGenerationData>({
    resolver: zodResolver(firGenerationSchema),
    defaultValues: {
      incidentType: "",
      location: "",
      dateTime: "",
      description: "",
      complainantName: "",
      complainantAddress: "",
      complainantPhone: "",
    },
  });

  const { data: firDrafts, isLoading: draftsLoading } = useQuery({
    queryKey: ["/api/fir-drafts"],
    retry: false,
  });

  const generateFirMutation = useMutation({
    mutationFn: async (data: FirGenerationData) => {
      const response = await apiRequest("POST", "/api/fir-drafts/generate", {
        incidentType: data.incidentType,
        location: data.location,
        dateTime: data.dateTime,
        description: data.description,
        complainantDetails: {
          name: data.complainantName,
          address: data.complainantAddress,
          phone: data.complainantPhone,
        }
      });
      return response.json();
    },
    onSuccess: (draft) => {
      setSelectedDraft(draft);
      queryClient.invalidateQueries({ queryKey: ["/api/fir-drafts"] });
      setIsGenerating(false);
      toast({
        title: "FIR Draft Generated",
        description: "Your FIR draft has been generated successfully.",
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
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate FIR draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFirMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<FirDraft> }) => {
      const response = await apiRequest("PUT", `/api/fir-drafts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fir-drafts"] });
      toast({
        title: "Draft Updated",
        description: "Your FIR draft has been updated successfully.",
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
        description: "Failed to update FIR draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FirGenerationData) => {
    setIsGenerating(true);
    generateFirMutation.mutate(data);
  };

  const handleSaveDraft = () => {
    if (selectedDraft) {
      updateFirMutation.mutate({
        id: selectedDraft.id,
        updates: { content: selectedDraft.content }
      });
    }
  };

  const handleDownload = () => {
    if (selectedDraft) {
      const element = document.createElement("a");
      const file = new Blob([selectedDraft.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedDraft.title || "FIR_Draft"}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

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
                  <h1 className="text-2xl font-bold text-gray-900">FIR Generator</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Generate professional First Information Report drafts using AI assistance
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* FIR Generation Form */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="text-legal-blue" size={20} />
                          <span>Generate New FIR Draft</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Incident Details */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="incidentType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Incident Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select incident type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {incidentTypes.map((type) => (
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
                                  name="dateTime"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date & Time of Incident</FormLabel>
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
                              </div>

                              <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem className="mt-4">
                                    <FormLabel>Location of Incident</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Enter complete address where incident occurred"
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
                                  <FormItem className="mt-4">
                                    <FormLabel>Detailed Description</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Provide a detailed description of the incident including what happened, when, and any witnesses"
                                        className="min-h-32 focus:ring-legal-accent focus:border-legal-accent"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Separator />

                            {/* Complainant Details */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Complainant Details</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="complainantName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Full Name</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Enter your full name"
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
                                  name="complainantPhone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Enter your phone number"
                                          {...field}
                                          className="focus:ring-legal-accent focus:border-legal-accent"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="complainantAddress"
                                render={({ field }) => (
                                  <FormItem className="mt-4">
                                    <FormLabel>Complete Address</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Enter your complete address"
                                        className="focus:ring-legal-accent focus:border-legal-accent"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button 
                              type="submit" 
                              className="w-full bg-legal-blue hover:bg-legal-blue-dark"
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Generating FIR Draft...
                                </>
                              ) : (
                                <>
                                  <Plus size={16} className="mr-2" />
                                  Generate FIR Draft
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>

                        {/* Legal Disclaimer */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Legal Disclaimer</p>
                              <p className="text-sm text-blue-600 mt-1">
                                This is an AI-generated draft. Please review and verify all information before submitting to authorities. 
                                Consider consulting with a legal professional for complex cases.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar - Draft Management */}
                  <div className="space-y-6">
                    {/* Generated Draft Preview */}
                    {selectedDraft && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">Generated Draft</CardTitle>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={handleSaveDraft}
                              disabled={updateFirMutation.isPending}
                              className="bg-legal-blue hover:bg-legal-blue-dark"
                            >
                              <Save size={14} className="mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleDownload}
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                              <Calendar size={14} />
                              <span>{new Date(selectedDraft.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                              <MapPin size={14} />
                              <span>{selectedDraft.location}</span>
                            </div>
                            <Badge variant="secondary">{selectedDraft.incidentType}</Badge>
                          </div>
                          <Textarea
                            value={selectedDraft.content}
                            onChange={(e) => setSelectedDraft({...selectedDraft, content: e.target.value})}
                            className="min-h-64 text-sm font-mono focus:ring-legal-accent focus:border-legal-accent"
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Previous Drafts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Previous Drafts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {draftsLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        ) : firDrafts && firDrafts.length > 0 ? (
                          <div className="space-y-3">
                            {firDrafts.map((draft: FirDraft) => (
                              <div 
                                key={draft.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedDraft?.id === draft.id 
                                    ? "border-legal-blue bg-blue-50" 
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setSelectedDraft(draft)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {draft.title}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-gray-500">
                                        {new Date(draft.createdAt).toLocaleDateString()}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {draft.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <FileText size={16} className="text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm text-gray-500">No drafts created yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Generate your first FIR draft using the form
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
