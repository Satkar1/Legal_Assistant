import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    if (user?.languagePreference && user.languagePreference !== selectedLanguage) {
      setSelectedLanguage(user.languagePreference);
      i18n.changeLanguage(user.languagePreference);
    }
  }, [user?.languagePreference, i18n, selectedLanguage]);

  const updateLanguageMutation = useMutation({
    mutationFn: async (languagePreference: string) => {
      await apiRequest("PUT", "/api/user/preferences", { languagePreference });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    updateLanguageMutation.mutate(language);
  };

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto border border-gray-300 focus:ring-legal-accent focus:border-legal-accent">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span>{selectedLang.flag}</span>
            <span className="text-sm hidden sm:block">{selectedLang.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
