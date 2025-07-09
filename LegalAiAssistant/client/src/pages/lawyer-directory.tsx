import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Users, 
  MapPin, 
  Star,
  Phone,
  Mail,
  Award,
  Clock,
  Scale,
  Filter,
  User,
  CheckCircle
} from "lucide-react";
import type { Lawyer } from "@shared/schema";

const specializations = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Constitutional Law",
  "Labor Law",
  "Property Law",
  "Tax Law",
  "Consumer Law",
  "Environmental Law",
  "Immigration Law",
  "Intellectual Property"
];

const cities = [
  "Mumbai",
  "Delhi", 
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Jaipur"
];

// Sample lawyer data
const sampleLawyers: Lawyer[] = [
  {
    id: 1,
    name: "Adv. Priya Sharma",
    email: "priya.sharma@law.com",
    phone: "+91-98765-43210",
    specialization: "Criminal Law",
    experience: 12,
    location: "Mumbai",
    rating: 5,
    isVerified: true,
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Adv. Rajesh Kumar",
    email: "rajesh.kumar@legal.com",
    phone: "+91-87654-32109",
    specialization: "Civil Law",
    experience: 8,
    location: "Delhi",
    rating: 4,
    isVerified: true,
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Adv. Meera Patel",
    email: "meera.patel@advocates.com",
    phone: "+91-76543-21098",
    specialization: "Family Law",
    experience: 15,
    location: "Bangalore",
    rating: 5,
    isVerified: true,
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Adv. Suresh Reddy",
    email: "suresh.reddy@law.co.in",
    phone: "+91-65432-10987",
    specialization: "Corporate Law",
    experience: 20,
    location: "Hyderabad",
    rating: 4,
    isVerified: true,
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Adv. Kavita Singh",
    email: "kavita.singh@legal.in",
    phone: "+91-54321-09876",
    specialization: "Constitutional Law",
    experience: 18,
    location: "Mumbai",
    rating: 5,
    isVerified: true,
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    name: "Adv. Amit Joshi",
    email: "amit.joshi@advocates.in",
    phone: "+91-43210-98765",
    specialization: "Tax Law",
    experience: 10,
    location: "Pune",
    rating: 4,
    isVerified: false,
    profileImage: null,
    createdAt: new Date().toISOString()
  }
];

export default function LawyerDirectory() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

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

  const { data: lawyers, isLoading: lawyersLoading } = useQuery({
    queryKey: ["/api/lawyers", { 
      q: searchQuery || undefined,
      specialization: selectedSpecialization !== "all" ? selectedSpecialization : undefined,
      location: selectedLocation !== "all" ? selectedLocation : undefined
    }],
    retry: false,
  });

  // Use sample data when API returns empty or fails
  const displayLawyers = lawyers && lawyers.length > 0 ? lawyers : sampleLawyers;

  const filteredLawyers = displayLawyers.filter((lawyer: Lawyer) => {
    const matchesSearch = !searchQuery || 
      lawyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === "all" || lawyer.specialization === selectedSpecialization;
    const matchesLocation = selectedLocation === "all" || lawyer.location === selectedLocation;
    
    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  const handleLawyerClick = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={`${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                  <h1 className="text-2xl font-bold text-gray-900">Lawyer Directory</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Connect with qualified legal professionals across India
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Search and Lawyers List */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Search and Filters */}
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search lawyers by name, specialization, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 focus:ring-legal-accent focus:border-legal-accent"
                          />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                            <SelectTrigger className="w-full sm:w-48">
                              <SelectValue placeholder="Specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Specializations</SelectItem>
                              {specializations.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                            <SelectTrigger className="w-full sm:w-48">
                              <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Locations</SelectItem>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lawyers List */}
                    <div className="space-y-4">
                      {lawyersLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                              <CardContent className="p-6">
                                <div className="flex space-x-4">
                                  <Skeleton className="w-16 h-16 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : filteredLawyers.length > 0 ? (
                        filteredLawyers.map((lawyer: Lawyer) => (
                          <Card 
                            key={lawyer.id} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedLawyer?.id === lawyer.id ? "ring-2 ring-legal-blue" : ""
                            }`}
                            onClick={() => handleLawyerClick(lawyer)}
                          >
                            <CardContent className="p-6">
                              <div className="flex space-x-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={lawyer.profileImage || ""} alt={lawyer.name} />
                                  <AvatarFallback className="bg-legal-blue text-white font-semibold">
                                    {getInitials(lawyer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {lawyer.name}
                                    </h3>
                                    {lawyer.isVerified && (
                                      <CheckCircle size={16} className="text-green-600" />
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <Scale size={16} />
                                      <span>{lawyer.specialization}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <MapPin size={16} />
                                      <span>{lawyer.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <Clock size={16} />
                                      <span>{lawyer.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {renderStars(lawyer.rating || 0)}
                                      <span className="text-sm text-gray-600">
                                        ({lawyer.rating}/5)
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Badge 
                                      variant={lawyer.isVerified ? "default" : "outline"}
                                      className={lawyer.isVerified ? "bg-green-100 text-green-800" : ""}
                                    >
                                      {lawyer.isVerified ? "Verified" : "Unverified"}
                                    </Badge>
                                    <Badge variant="outline">
                                      {lawyer.specialization}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-12 text-center">
                            <Users size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No lawyers found
                            </h3>
                            <p className="text-gray-600">
                              Try adjusting your search criteria or filters
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Selected Lawyer Details */}
                    {selectedLawyer ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <User size={20} className="text-legal-blue" />
                            <span>Lawyer Details</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center">
                              <Avatar className="w-20 h-20 mx-auto mb-3">
                                <AvatarImage src={selectedLawyer.profileImage || ""} alt={selectedLawyer.name} />
                                <AvatarFallback className="bg-legal-blue text-white font-semibold text-lg">
                                  {getInitials(selectedLawyer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {selectedLawyer.name}
                              </h3>
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                {renderStars(selectedLawyer.rating || 0)}
                                <span className="text-sm text-gray-600">
                                  ({selectedLawyer.rating}/5)
                                </span>
                              </div>
                              {selectedLawyer.isVerified && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle size={12} className="mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <Scale size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Specialization</p>
                                  <p className="text-sm text-gray-600">{selectedLawyer.specialization}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <Award size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Experience</p>
                                  <p className="text-sm text-gray-600">{selectedLawyer.experience} years</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <MapPin size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Location</p>
                                  <p className="text-sm text-gray-600">{selectedLawyer.location}</p>
                                </div>
                              </div>
                              
                              {selectedLawyer.email && (
                                <div className="flex items-center space-x-3">
                                  <Mail size={16} className="text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">{selectedLawyer.email}</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedLawyer.phone && (
                                <div className="flex items-center space-x-3">
                                  <Phone size={16} className="text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                    <p className="text-sm text-gray-600">{selectedLawyer.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Button className="w-full bg-legal-blue hover:bg-legal-blue-dark">
                                <Phone size={16} className="mr-2" />
                                Contact Lawyer
                              </Button>
                              <Button variant="outline" className="w-full">
                                <Mail size={16} className="mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Users size={20} className="text-legal-blue" />
                            <span>Getting Started</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-6">
                            <User size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm text-gray-600 mb-4">
                              Select a lawyer from the list to view their detailed profile and contact information.
                            </p>
                            <p className="text-xs text-gray-500">
                              Use filters to find lawyers by specialization and location.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Search Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Filter size={20} className="text-legal-blue" />
                          <span>Search Results</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Lawyers</span>
                            <span className="text-lg font-bold text-legal-blue">
                              {filteredLawyers.length}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Verified</span>
                            <span className="text-lg font-bold text-green-600">
                              {filteredLawyers.filter(l => l.isVerified).length}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg. Experience</span>
                            <span className="text-lg font-bold text-purple-600">
                              {Math.round(filteredLawyers.reduce((acc, l) => acc + (l.experience || 0), 0) / filteredLawyers.length || 0)} yrs
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Popular Specializations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Scale size={20} className="text-legal-blue" />
                          <span>Popular Specializations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {specializations.slice(0, 6).map((spec) => (
                            <button
                              key={spec}
                              className="w-full text-left p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedSpecialization(spec)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {spec}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {filteredLawyers.filter(l => l.specialization === spec).length}
                                </span>
                              </div>
                            </button>
                          ))}
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
