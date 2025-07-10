import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Book, 
  BookOpen, 
  Scale, 
  FileText,
  Globe,
  Filter,
  Library
} from "lucide-react";
import type { GlossaryTerm } from "@shared/schema";

const legalCategories = [
  "Criminal Law",
  "Civil Law", 
  "Constitutional Law",
  "Family Law",
  "Commercial Law",
  "Labour Law",
  "Property Law",
  "Tax Law",
  "Consumer Law",
  "Environmental Law"
];

const popularTerms = [
  { term: "Affidavit", category: "General" },
  { term: "Bail", category: "Criminal Law" },
  { term: "Caveat", category: "Civil Law" },
  { term: "Decree", category: "Civil Law" },
  { term: "Ex-parte", category: "General" },
  { term: "Habeas Corpus", category: "Constitutional Law" },
  { term: "Injunction", category: "Civil Law" },
  { term: "Jurisdiction", category: "General" },
  { term: "Locus Standi", category: "General" },
  { term: "Mandamus", category: "Constitutional Law" },
  { term: "Natural Justice", category: "General" },
  { term: "Obiter Dicta", category: "General" },
];

const sampleGlossaryTerms: GlossaryTerm[] = [
  {
    id: 1,
    term: "Affidavit",
    definition: "A written statement confirmed by oath or affirmation, for use as evidence in court. It is a voluntary declaration of facts that a person swears to be true before an authorized officer.",
    category: "General",
    language: "en",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    term: "Bail",
    definition: "Security given for the release of a person from custody, with the understanding that they will appear in court when required. It is a guarantee that the accused will not flee from justice.",
    category: "Criminal Law",
    language: "en",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    term: "Caveat",
    definition: "A legal notice requesting the court not to take a specific action without informing the person who filed the caveat. It means 'let him beware' in Latin.",
    category: "Civil Law",
    language: "en",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    term: "Decree",
    definition: "A formal order of a court or judicial tribunal that settles the rights of parties to a suit. It is the final decision or judgment in a civil case.",
    category: "Civil Law",
    language: "en",
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    term: "Ex-parte",
    definition: "Legal proceedings conducted for the benefit of one party only, without notice to or appearance by the other party. It means 'from one side' in Latin.",
    category: "General",
    language: "en",
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    term: "Habeas Corpus",
    definition: "A writ requiring a person to be brought before a judge or court, especially for investigation of a restraint of the person's liberty. It protects against unlawful detention.",
    category: "Constitutional Law",
    language: "en",
    createdAt: new Date().toISOString()
  }
];

export default function LegalLibrary() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

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

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/glossary", { q: searchQuery }],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  // Use sample data when no search is performed or API results are empty
  const displayTerms = searchQuery.length > 2 
    ? (searchResults && searchResults.length > 0 ? searchResults : sampleGlossaryTerms.filter(term => 
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    : sampleGlossaryTerms;

  const filteredTerms = displayTerms.filter((term: GlossaryTerm) => {
    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
    return matchesCategory;
  });

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
  };

  const handlePopularTermClick = (termName: string) => {
    setSearchQuery(termName);
    const term = sampleGlossaryTerms.find(t => t.term.toLowerCase() === termName.toLowerCase());
    if (term) {
      setSelectedTerm(term);
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
                  <h1 className="text-2xl font-bold text-gray-900">Legal Library</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Explore comprehensive legal glossary and resources
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Search and Terms List */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Search Bar */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="relative">
                          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search legal terms, definitions, laws..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 focus:ring-legal-accent focus:border-legal-accent"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category Filter */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Filter size={20} className="text-legal-blue" />
                          <span>Browse by Category</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={selectedCategory === "all" ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedCategory === "all" 
                                ? "bg-legal-blue hover:bg-legal-blue-dark" 
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => setSelectedCategory("all")}
                          >
                            All Categories
                          </Badge>
                          {legalCategories.map((category) => (
                            <Badge
                              key={category}
                              variant={selectedCategory === category ? "default" : "outline"}
                              className={`cursor-pointer ${
                                selectedCategory === category 
                                  ? "bg-legal-blue hover:bg-legal-blue-dark" 
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => setSelectedCategory(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Search Results / Terms List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen size={20} className="text-legal-blue" />
                          <span>
                            {searchQuery ? `Search Results (${filteredTerms.length})` : "Legal Terms"}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {searchLoading && searchQuery.length > 2 ? (
                          <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="space-y-2">
                                <Skeleton className="h-6 w-1/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                              </div>
                            ))}
                          </div>
                        ) : filteredTerms.length > 0 ? (
                          <div className="space-y-4">
                            {filteredTerms.map((term: GlossaryTerm, index) => (
                              <div
                                key={term.id || index}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedTerm?.id === term.id
                                    ? "border-legal-blue bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() => handleTermClick(term)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {term.term}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {term.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {term.definition}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Book size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {searchQuery ? "No terms found" : "No terms available"}
                            </h3>
                            <p className="text-gray-600">
                              {searchQuery 
                                ? "Try adjusting your search query" 
                                : "Browse our comprehensive legal glossary"
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Selected Term Details */}
                    {selectedTerm ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Scale size={20} className="text-legal-blue" />
                            <span>Term Details</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {selectedTerm.term}
                              </h3>
                              <Badge variant="secondary" className="mb-3">
                                {selectedTerm.category}
                              </Badge>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Definition</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedTerm.definition}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Globe size={12} />
                              <span>Language: {selectedTerm.language?.toUpperCase() || "EN"}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Library size={20} className="text-legal-blue" />
                            <span>Getting Started</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6">
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm text-gray-600 mb-4">
                              Select a term from the list to view its detailed definition and explanation.
                            </p>
                            <p className="text-xs text-gray-500">
                              Use the search bar to find specific legal terms or browse by category.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Popular Terms */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText size={20} className="text-legal-blue" />
                          <span>Popular Terms</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {popularTerms.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handlePopularTermClick(item.term)}
                            >
                              <span className="text-sm font-medium text-gray-900">
                                {item.term}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Legal Resources */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Scale size={20} className="text-legal-blue" />
                          <span>Legal Resources</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              Indian Constitution
                            </h4>
                            <p className="text-xs text-gray-600">
                              Fundamental rights and duties of Indian citizens
                            </p>
                          </div>
                          
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              Indian Penal Code
                            </h4>
                            <p className="text-xs text-gray-600">
                              Criminal offenses and penalties in India
                            </p>
                          </div>
                          
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              Code of Civil Procedure
                            </h4>
                            <p className="text-xs text-gray-600">
                              Procedures for civil litigation in Indian courts
                            </p>
                          </div>
                        </div>
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
