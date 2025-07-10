import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/Navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { 
  FileText, 
  Search, 
  Book, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast, t]);

  const { data: firDrafts, isLoading: firLoading } = useQuery({
    queryKey: ["/api/fir-drafts"],
    retry: false,
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
    retry: false,
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
    retry: false,
  });

  if (isLoading) {
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

  const quickActions = [
    {
      title: t("generate_fir_draft"),
      description: t("create_police_complaint_draft"),
      icon: FileText,
      href: "/fir-generator",
      color: "bg-blue-500"
    },
    {
      title: t("track_case_status"),
      description: t("check_your_case_progress"),
      icon: Search,
      href: "/case-tracker",
      color: "bg-green-500"
    },
    {
      title: t("legal_glossary"),
      description: t("search_legal_terms"),
      icon: Book,
      href: "/legal-library",
      color: "bg-purple-500"
    },
    {
      title: t("find_a_lawyer"),
      description: t("connect_with_legal_experts"),
      icon: Users,
      href: "/lawyer-directory",
      color: "bg-orange-500"
    },
  ];

  const recentActivities = [
    {
      title: "FIR Draft Created",
      timestamp: "2 hours ago",
      icon: FileText,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Case Status Updated",
      timestamp: "1 day ago",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Legal Term Searched",
      timestamp: "3 days ago",
      icon: Book,
      color: "bg-purple-100 text-purple-600"
    },
  ];

  const activeCases = cases?.filter(c => c.status !== "completed").length || 0;
  const completedCases = cases?.filter(c => c.status === "completed").length || 0;
  const draftsCount = firDrafts?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none mobile-safe-bottom">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t("ai_legal_assistant_dashboard")}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {t("get_instant_legal_guidance")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chat Interface */}
                  <ChatInterface />

                  {/* Quick Actions & Activity */}
                  <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-gray-900">
                          {t("quick_actions")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {quickActions.map((action, index) => (
                          <Link key={index} href={action.href}>
                            <div className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-legal-accent cursor-pointer transition-colors">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                                  <action.icon size={16} className="text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {action.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {action.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-gray-900">
                          {t("recent_activity")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {conversations && conversations.length > 0 ? (
                          conversations.slice(0, 3).map((conversation: any, index: number) => (
                            <div key={conversation.id} className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FileText size={16} className="text-legal-blue" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">
                                  {conversation.title || "Legal Consultation"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(conversation.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                                  <activity.icon size={16} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{activity.title}</p>
                                <p className="text-xs text-gray-500">{activity.timestamp}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Additional Features Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Legal Glossary Preview */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {t("legal_glossary")}
                      </CardTitle>
                      <Book className="text-legal-blue" size={20} />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="border-l-4 border-legal-blue pl-3">
                        <p className="text-sm font-medium text-gray-900">Affidavit</p>
                        <p className="text-xs text-gray-600">
                          A written statement confirmed by oath or affirmation...
                        </p>
                      </div>
                      <div className="border-l-4 border-gray-300 pl-3">
                        <p className="text-sm font-medium text-gray-900">Bail</p>
                        <p className="text-xs text-gray-600">
                          Security given for the release of a person...
                        </p>
                      </div>
                      <Link href="/legal-library">
                        <Button variant="link" className="text-legal-blue hover:text-legal-blue-dark p-0">
                          {t("view_all")} →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Case Statistics */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {t("your_cases")}
                      </CardTitle>
                      <TrendingUp className="text-legal-blue" size={20} />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {casesLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Cases</span>
                            <span className="text-lg font-bold text-legal-blue">{activeCases}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Completed</span>
                            <span className="text-lg font-bold text-green-600">{completedCases}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">FIR Drafts</span>
                            <span className="text-lg font-bold text-purple-600">{draftsCount}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Featured Lawyers Preview */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {t("featured_lawyers")}
                      </CardTitle>
                      <Users className="text-legal-blue" size={20} />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Adv. Priya Sharma</p>
                          <p className="text-xs text-gray-500">Criminal Law</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Adv. Rajesh Kumar</p>
                          <p className="text-xs text-gray-500">Civil Law</p>
                        </div>
                      </div>
                      <Link href="/lawyer-directory">
                        <Button variant="link" className="text-legal-blue hover:text-legal-blue-dark p-0">
                          {t("view_all")} →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Help Widget */}
      <div className="fixed bottom-6 right-6 z-50 lg:bottom-6 lg:right-6">
        <Button 
          size="lg"
          className="bg-legal-blue text-white p-4 rounded-full shadow-lg hover:bg-legal-blue-dark focus:outline-none focus:ring-2 focus:ring-legal-accent focus:ring-offset-2 transition-all duration-200"
        >
          <HelpCircle size={24} />
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          <Link href="/">
            <div className="flex flex-col items-center justify-center py-2 text-legal-blue cursor-pointer">
              <FileText size={20} />
              <span className="text-xs mt-1">Chat</span>
            </div>
          </Link>
          <Link href="/fir-generator">
            <div className="flex flex-col items-center justify-center py-2 text-gray-400 cursor-pointer">
              <FileText size={20} />
              <span className="text-xs mt-1">FIR</span>
            </div>
          </Link>
          <Link href="/case-tracker">
            <div className="flex flex-col items-center justify-center py-2 text-gray-400 cursor-pointer">
              <Search size={20} />
              <span className="text-xs mt-1">Track</span>
            </div>
          </Link>
          <Link href="/legal-library">
            <div className="flex flex-col items-center justify-center py-2 text-gray-400 cursor-pointer">
              <Book size={20} />
              <span className="text-xs mt-1">Library</span>
            </div>
          </Link>
          <Link href="/lawyer-directory">
            <div className="flex flex-col items-center justify-center py-2 text-gray-400 cursor-pointer">
              <Users size={20} />
              <span className="text-xs mt-1">Lawyers</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
