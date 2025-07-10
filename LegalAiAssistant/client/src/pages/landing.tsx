import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Scale, MessageCircle, FileText, Search, Users, Book } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: MessageCircle,
      title: "AI Legal Assistant",
      description: "Get instant legal guidance through our intelligent chatbot"
    },
    {
      icon: FileText,
      title: "FIR Generator",
      description: "Create professional police complaint drafts automatically"
    },
    {
      icon: Search,
      title: "Case Tracking",
      description: "Monitor your legal cases and stay updated on progress"
    },
    {
      icon: Book,
      title: "Legal Library",
      description: "Access comprehensive legal glossary and resources"
    },
    {
      icon: Users,
      title: "Lawyer Directory",
      description: "Connect with qualified legal professionals"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Scale className="text-legal-blue text-2xl mr-3" size={32} />
              <span className="text-xl font-bold text-gray-900">LexiBot</span>
            </div>
            <Button onClick={handleLogin} className="bg-legal-blue hover:bg-legal-blue-dark">
              {t("login")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Legal Assistant for
            <span className="text-legal-blue block">Real-Time Justice Access</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get multilingual legal guidance, generate FIR drafts, track cases, and access comprehensive legal resources - all powered by advanced AI technology.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-legal-blue hover:bg-legal-blue-dark text-lg px-8 py-3"
          >
            Get Started - It's Free
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Legal Technology Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for legal assistance in one intelligent platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-legal-blue transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-legal-blue rounded-lg flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-language Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-legal-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Multi-Language Support
          </h2>
          <div className="flex justify-center space-x-8 text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇺🇸</span>
              <span className="font-medium">English</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇮🇳</span>
              <span className="font-medium">हिन्दी</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇮🇳</span>
              <span className="font-medium">मराठी</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Access legal assistance in your preferred language for better understanding and clarity
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-legal-blue">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Legal Assistance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust LexiBot for their legal needs
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="secondary"
            className="bg-white text-legal-blue hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Using LexiBot Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="text-legal-blue mr-3" size={24} />
            <span className="text-lg font-bold">LexiBot</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered legal assistance for everyone
          </p>
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-200 font-medium mb-2">{t("legal_disclaimer")}</p>
            <p className="text-sm text-blue-300">
              {t("disclaimer_text")} Always consult with qualified legal professionals for specific legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
