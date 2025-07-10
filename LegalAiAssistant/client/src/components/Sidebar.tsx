import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const sidebarItems = [
    {
      path: "/",
      label: t("dashboard"),
      icon: "fas fa-comments",
      description: "AI Legal Chat"
    },
    {
      path: "/fir-generator",
      label: t("fir_generator"),
      icon: "fas fa-file-alt",
      description: "FIR Generator"
    },
    {
      path: "/case-tracker",
      label: t("case_tracker"),
      icon: "fas fa-search",
      description: "Case Tracking"
    },
    {
      path: "/legal-library",
      label: t("legal_library"),
      icon: "fas fa-book",
      description: "Legal Library"
    },
    {
      path: "/lawyer-directory",
      label: t("find_a_lawyer"),
      icon: "fas fa-users",
      description: "Lawyer Directory"
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto custom-scrollbar">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                      isActive(item.path)
                        ? "bg-legal-blue text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <i 
                      className={`mr-3 ${item.icon} ${
                        isActive(item.path) ? "text-white" : "text-gray-400"
                      }`}
                    ></i>
                    {item.description}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium">{t("legal_disclaimer")}</p>
              <p className="text-xs text-blue-600 mt-1">
                {t("disclaimer_text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
