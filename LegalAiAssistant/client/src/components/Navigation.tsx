import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSelector } from "./LanguageSelector";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { path: "/", label: t("dashboard"), icon: "fas fa-tachometer-alt" },
    { path: "/legal-library", label: t("legal_library"), icon: "fas fa-book" },
    { path: "/case-tracker", label: t("case_tracker"), icon: "fas fa-search" },
    { path: "/fir-generator", label: t("fir_generator"), icon: "fas fa-file-alt" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-balance-scale text-legal-blue text-2xl mr-3"></i>
              <Link href="/">
                <span className="text-xl font-bold text-gray-900 cursor-pointer">LexiBot</span>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`px-1 pt-1 pb-1 text-sm font-medium cursor-pointer transition-colors ${
                      isActive(item.path)
                        ? "text-legal-blue border-b-2 border-legal-blue"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || ""} alt="User profile" />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 hidden sm:block">
                {user?.firstName || user?.email || "User"}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:block"
            >
              {t("logout")}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`block px-3 py-2 text-base font-medium cursor-pointer rounded-md transition-colors ${
                    isActive(item.path)
                      ? "text-legal-blue bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  {item.label}
                </span>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start px-3 py-2 text-base font-medium"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              {t("logout")}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
