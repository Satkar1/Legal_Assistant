import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "legal_library": "Legal Library",
      "case_tracker": "Case Tracker",
      "fir_generator": "FIR Generator",
      
      // Dashboard
      "ai_legal_assistant_dashboard": "AI Legal Assistant Dashboard",
      "get_instant_legal_guidance": "Get instant legal guidance and assistance for your queries",
      "legal_ai_assistant": "Legal AI Assistant",
      "online": "Online",
      "quick_actions": "Quick Actions",
      "generate_fir_draft": "Generate FIR Draft",
      "create_police_complaint_draft": "Create police complaint draft",
      "track_case_status": "Track Case Status",
      "check_your_case_progress": "Check your case progress",
      "legal_glossary": "Legal Glossary",
      "search_legal_terms": "Search legal terms",
      "find_a_lawyer": "Find a Lawyer",
      "connect_with_legal_experts": "Connect with legal experts",
      "recent_activity": "Recent Activity",
      "your_cases": "Your Cases",
      "featured_lawyers": "Featured Lawyers",
      
      // Chat
      "type_your_legal_question": "Type your legal question here...",
      "attach_document": "Attach Document",
      "voice_input": "Voice Input",
      "hello_lexibot": "Hello! I'm LexiBot, your AI legal assistant. I can help you with:",
      "legal_terminology": "Legal terminology and definitions",
      "basic_legal_procedures": "Basic legal procedures", 
      "document_drafting": "Document drafting assistance",
      "case_law_references": "Case law references",
      "how_can_i_assist": "How can I assist you today?",
      
      // Legal Disclaimer
      "legal_disclaimer": "Legal Disclaimer",
      "disclaimer_text": "This AI assistant provides general legal information only and does not constitute legal advice.",
      
      // Common actions
      "send": "Send",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "download": "Download",
      "upload": "Upload",
      "search": "Search",
      "filter": "Filter",
      "view_all": "View All",
      
      // Authentication
      "login": "Log In",
      "logout": "Log Out",
      "welcome_back": "Welcome back",
      "please_login": "Please log in to continue",
      
      // Error messages
      "error_occurred": "An error occurred",
      "try_again": "Please try again",
      "unauthorized": "Unauthorized",
      "logged_out_message": "You are logged out. Logging in again...",
      "failed_to_load": "Failed to load",
    }
  },
  hi: {
    translation: {
      // Navigation
      "dashboard": "डैशबोर्ड",
      "legal_library": "कानूनी लाइब्रेरी",
      "case_tracker": "केस ट्रैकर",
      "fir_generator": "FIR जेनरेटर",
      
      // Dashboard
      "ai_legal_assistant_dashboard": "AI कानूनी सहायक डैशबोर्ड",
      "get_instant_legal_guidance": "अपने प्रश्नों के लिए तुरंत कानूनी मार्गदर्शन और सहायता प्राप्त करें",
      "legal_ai_assistant": "कानूनी AI सहायक",
      "online": "ऑनलाइन",
      "quick_actions": "त्वरित कार्य",
      "generate_fir_draft": "FIR का मसौदा तैयार करें",
      "create_police_complaint_draft": "पुलिस शिकायत का मसौदा बनाएं",
      "track_case_status": "केस की स्थिति ट्रैक करें",
      "check_your_case_progress": "अपने केस की प्रगति जांचें",
      "legal_glossary": "कानूनी शब्दकोश",
      "search_legal_terms": "कानूनी शब्द खोजें",
      "find_a_lawyer": "वकील खोजें",
      "connect_with_legal_experts": "कानूनी विशेषज्ञों से जुड़ें",
      "recent_activity": "हाल की गतिविधि",
      "your_cases": "आपके केस",
      "featured_lawyers": "प्रमुख वकील",
      
      // Chat
      "type_your_legal_question": "यहाँ अपना कानूनी प्रश्न टाइप करें...",
      "attach_document": "दस्तावेज़ संलग्न करें",
      "voice_input": "आवाज़ इनपुट",
      "hello_lexibot": "नमस्ते! मैं LexiBot हूँ, आपका AI कानूनी सहायक। मैं आपकी इनमें सहायता कर सकता हूँ:",
      "legal_terminology": "कानूनी शब्दावली और परिभाषाएं",
      "basic_legal_procedures": "बुनियादी कानूनी प्रक्रियाएं",
      "document_drafting": "दस्तावेज़ तैयार करने में सहायता",
      "case_law_references": "केस लॉ संदर्भ",
      "how_can_i_assist": "आज मैं आपकी कैसे सहायता कर सकता हूँ?",
      
      // Legal Disclaimer
      "legal_disclaimer": "कानूनी अस्वीकरण",
      "disclaimer_text": "यह AI सहायक केवल सामान्य कानूनी जानकारी प्रदान करता है और यह कानूनी सलाह नहीं है।",
      
      // Common actions
      "send": "भेजें",
      "save": "सेव करें",
      "cancel": "रद्द करें",
      "edit": "संपादित करें",
      "delete": "हटाएं",
      "download": "डाउनलोड",
      "upload": "अपलोड",
      "search": "खोजें",
      "filter": "फ़िल्टर",
      "view_all": "सभी देखें",
      
      // Authentication
      "login": "लॉग इन",
      "logout": "लॉग आउट",
      "welcome_back": "वापस स्वागत है",
      "please_login": "जारी रखने के लिए कृपया लॉग इन करें",
      
      // Error messages
      "error_occurred": "एक त्रुटि हुई",
      "try_again": "कृपया पुनः प्रयास करें",
      "unauthorized": "अनधिकृत",
      "logged_out_message": "आप लॉग आउट हैं। फिर से लॉग इन हो रहे हैं...",
      "failed_to_load": "लोड करने में असफल",
    }
  },
  mr: {
    translation: {
      // Navigation
      "dashboard": "डॅशबोर्ड",
      "legal_library": "कायदेशीर लायब्ररी",
      "case_tracker": "केस ट्रॅकर",
      "fir_generator": "FIR जनरेटर",
      
      // Dashboard
      "ai_legal_assistant_dashboard": "AI कायदेशीर सहाय्यक डॅशबोर्ड",
      "get_instant_legal_guidance": "आपल्या प्रश्नांसाठी तत्काळ कायदेशीर मार्गदर्शन आणि सहाय्य मिळवा",
      "legal_ai_assistant": "कायदेशीर AI सहाय्यक",
      "online": "ऑनलाइन",
      "quick_actions": "द्रुत कृती",
      "generate_fir_draft": "FIR चा मसुदा तयार करा",
      "create_police_complaint_draft": "पोलीस तक्रारीचा मसुदा तयार करा",
      "track_case_status": "केसची स्थिती ट्रॅक करा",
      "check_your_case_progress": "आपल्या केसची प्रगती तपासा",
      "legal_glossary": "कायदेशीर शब्दकोश",
      "search_legal_terms": "कायदेशीर संज्ञा शोधा",
      "find_a_lawyer": "वकील शोधा",
      "connect_with_legal_experts": "कायदेशीर तज्ञांशी संपर्क साधा",
      "recent_activity": "अलीकडील क्रियाकलाप",
      "your_cases": "आपली केसेस",
      "featured_lawyers": "वैशिष्ट्यीकृत वकील",
      
      // Chat
      "type_your_legal_question": "येथे आपला कायदेशीर प्रश्न टाइप करा...",
      "attach_document": "दस्तऐवज जोडा",
      "voice_input": "आवाज इनपुट",
      "hello_lexibot": "नमस्कार! मी LexiBot आहे, आपला AI कायदेशीर सहाय्यक. मी यामध्ये आपली मदत करू शकतो:",
      "legal_terminology": "कायदेशीर शब्दावली आणि व्याख्या",
      "basic_legal_procedures": "मूलभूत कायदेशीर प्रक्रिया",
      "document_drafting": "दस्तऐवज तयार करण्यात सहाय्य",
      "case_law_references": "केस लॉ संदर्भ",
      "how_can_i_assist": "आज मी आपली कशी मदत करू शकतो?",
      
      // Legal Disclaimer
      "legal_disclaimer": "कायदेशीर अस्वीकरण",
      "disclaimer_text": "हा AI सहाय्यक केवळ सामान्य कायदेशीर माहिती प्रदान करतो आणि हा कायदेशीर सल्ला नाही.",
      
      // Common actions
      "send": "पाठवा",
      "save": "सेव्ह करा",
      "cancel": "रद्द करा",
      "edit": "संपादित करा",
      "delete": "हटवा",
      "download": "डाउनलोड",
      "upload": "अपलोड",
      "search": "शोधा",
      "filter": "फिल्टर",
      "view_all": "सर्व पहा",
      
      // Authentication
      "login": "लॉग इन",
      "logout": "लॉग आउट",
      "welcome_back": "परत स्वागत आहे",
      "please_login": "सुरू ठेवण्यासाठी कृपया लॉग इन करा",
      
      // Error messages
      "error_occurred": "त्रुटी झाली",
      "try_again": "कृपया पुन्हा प्रयत्न करा",
      "unauthorized": "अनधिकृत",
      "logged_out_message": "तुम्ही लॉग आउट आहात. पुन्हा लॉग इन होत आहे...",
      "failed_to_load": "लोड करण्यात अयशस्वी",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
