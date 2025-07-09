import { HfInference } from '@huggingface/inference';
import { Translate } from '@google-cloud/translate/build/src/v2';
import fetch from 'node-fetch';

// Initialize HuggingFace Inference API (using free public endpoints)
const hf = new HfInference();

// Initialize Google Translate (falls back to free translation API if no credentials)
let translator: Translate | null = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_TRANSLATE_API_KEY) {
    translator = new Translate({
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
    });
  }
} catch (error) {
  console.warn('Google Translate API not configured, using fallback translation service');
}

// Free translation fallback using MyMemory API
async function translateTextFallback(text: string, targetLang: string): Promise<string> {
  const langMap: { [key: string]: string } = {
    'hi': 'hi',
    'mr': 'mr', 
    'en': 'en'
  };

  const target = langMap[targetLang] || 'en';
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`
    );
    const data = await response.json() as any;
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Translation fallback failed:', error);
    return text;
  }
}

export interface LegalResponse {
  response: string;
  disclaimer?: string;
  suggestedActions?: string[];
  legalReferences?: string[];
}

export async function getLegalGuidance(
  query: string,
  language: string = "en",
  context?: string
): Promise<LegalResponse> {
  const languageInstructions = {
    en: "Respond in English",
    hi: "हिन्दी में जवाब दें",
    mr: "मराठी मध्ये उत्तर द्या"
  };

  const systemPrompt = `You are LexiBot, an AI legal assistant for Indian law. You provide general legal information and guidance.

IMPORTANT GUIDELINES:
1. Always provide accurate information based on Indian law
2. Include appropriate legal disclaimers
3. ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}
4. Format responses in JSON with these fields:
   - response: Main legal guidance
   - disclaimer: Legal disclaimer text
   - suggestedActions: Array of suggested next steps
   - legalReferences: Array of relevant legal sections/acts

LEGAL DISCLAIMER REQUIREMENT:
Always include a disclaimer that this is general legal information and not legal advice, and recommend consulting a qualified lawyer for specific cases.

Context: ${context || "General legal query"}

Query: ${query}`;

  try {
    // Use HuggingFace's free text generation model
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-large',
      inputs: systemPrompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        do_sample: true,
      }
    });

    let responseText = response.generated_text || response.toString();
    
    // Clean up the response to extract only the new content
    if (responseText.includes(systemPrompt)) {
      responseText = responseText.replace(systemPrompt, '').trim();
    }
    
    // Try to parse as JSON, fallback to structured response
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.response) {
        return parsed;
      }
    } catch {
      // Fallback: create structured response
    }
    
    // If not JSON or missing fields, create structured response
    const structuredResponse: LegalResponse = {
      response: responseText || generateBasicLegalResponse(query, language),
      disclaimer: getDisclaimer(language),
      suggestedActions: getSuggestedActions(language),
      legalReferences: []
    };

    // Translate if needed
    if (language !== 'en' && structuredResponse.response) {
      structuredResponse.response = await translateText(structuredResponse.response, language);
      structuredResponse.disclaimer = await translateText(structuredResponse.disclaimer!, language);
    }

    return structuredResponse;
  } catch (error) {
    console.error('HuggingFace model failed, using fallback:', error);
    // Fallback response
    return {
      response: generateBasicLegalResponse(query, language),
      disclaimer: getDisclaimer(language),
      suggestedActions: getSuggestedActions(language),
      legalReferences: []
    };
  }
}

// Helper functions for fallback responses
function generateBasicLegalResponse(query: string, language: string): string {
  const responses = {
    en: `I understand you have a legal question about: "${query}". For accurate legal guidance specific to your situation, I recommend consulting with a qualified lawyer who specializes in Indian law. They can provide personalized advice based on the complete details of your case.`,
    hi: `मैं समझता हूं कि आपका कानूनी प्रश्न है: "${query}"। आपकी स्थिति के लिए सटीक कानूनी मार्गदर्शन के लिए, मैं भारतीय कानून में विशेषज्ञता रखने वाले एक योग्य वकील से सलाह लेने की सिफारिश करता हूं।`,
    mr: `मला समजले की तुमचा कायदेशीर प्रश्न आहे: "${query}"। तुमच्या परिस्थितीसाठी अचूक कायदेशीर मार्गदर्शनासाठी, मी भारतीय कायद्यात तज्ञ असलेल्या पात्र वकीलाचा सल्ला घेण्याची शिफारस करतो।`
  };
  
  return responses[language as keyof typeof responses] || responses.en;
}

function getDisclaimer(language: string): string {
  const disclaimers = {
    en: "This information is for general guidance only and does not constitute legal advice. Please consult a qualified lawyer for specific legal matters.",
    hi: "यह जानकारी केवल सामान्य मार्गदर्शन के लिए है और कानूनी सलाह नहीं है। विशिष्ट कानूनी मामलों के लिए कृपया एक योग्य वकील से सलाह लें।",
    mr: "ही माहिती केवळ सामान्य मार्गदर्शनासाठी आहे आणि कायदेशीर सल्ला नाही. विशिष्ट कायदेशीर बाबींसाठी कृपया पात्र वकीलाचा सल्ला घेऊ."
  };
  
  return disclaimers[language as keyof typeof disclaimers] || disclaimers.en;
}

function getSuggestedActions(language: string): string[] {
  const actions = {
    en: ["Consult a qualified lawyer", "Gather relevant documents", "Research applicable laws"],
    hi: ["एक योग्य वकील से सलाह लें", "संबंधित दस्तावेज इकट्ठे करें", "लागू कानूनों पर शोध करें"],
    mr: ["पात्र वकीलाचा सल्ला घ्या", "संबंधित कागदपत्रे गोळा करा", "लागू कायद्यांचे संशोधन करा"]
  };
  
  return actions[language as keyof typeof actions] || actions.en;
}

export async function generateFIRDraft(
  incidentDetails: {
    incidentType: string;
    location: string;
    dateTime: string;
    description: string;
    complainantDetails: {
      name: string;
      address: string;
      phone: string;
    };
  },
  language: string = "en"
): Promise<{ content: string; title: string }> {
  try {
    // Generate basic FIR structure
    const firContent = generateBasicFIRTemplate(incidentDetails, language);
    
    const title = language === 'hi' ? `प्राथमिकी मसौदा - ${incidentDetails.incidentType}` :
                  language === 'mr' ? `प्राथमिक माहिती अहवाल मसुदा - ${incidentDetails.incidentType}` :
                  `FIR Draft - ${incidentDetails.incidentType}`;

    // Try to enhance with HuggingFace if available
    try {
      const enhancementPrompt = `Improve this FIR draft to make it more legally appropriate and formal:\n\n${firContent}`;
      
      const response = await hf.textGeneration({
        model: 'microsoft/DialoGPT-large',
        inputs: enhancementPrompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.3,
          do_sample: true,
        }
      });

      let enhancedContent = response.generated_text || firContent;
      if (enhancedContent.includes(enhancementPrompt)) {
        enhancedContent = enhancedContent.replace(enhancementPrompt, '').trim();
      }

      return {
        content: enhancedContent || firContent,
        title
      };
    } catch (error) {
      console.warn('FIR enhancement failed, using template:', error);
      return {
        content: firContent,
        title
      };
    }
  } catch (error) {
    throw new Error("Failed to generate FIR draft: " + error.message);
  }
}

function generateBasicFIRTemplate(incidentDetails: any, language: string): string {
  const templates = {
    en: `
FIRST INFORMATION REPORT (FIR)
Police Station: ________________
Date: ${new Date().toLocaleDateString('en-IN')}
Time: ${new Date().toLocaleTimeString('en-IN')}

COMPLAINANT DETAILS:
Name: ${incidentDetails.complainantDetails.name}
Address: ${incidentDetails.complainantDetails.address}
Phone: ${incidentDetails.complainantDetails.phone}

INCIDENT DETAILS:
Type of Incident: ${incidentDetails.incidentType}
Date and Time of Incident: ${incidentDetails.dateTime}
Place of Incident: ${incidentDetails.location}

DESCRIPTION OF INCIDENT:
${incidentDetails.description}

I hereby lodge this complaint and request that appropriate legal action be taken in this matter.

Signature of Complainant: _________________
Date: ${new Date().toLocaleDateString('en-IN')}

[This is a draft FIR. Please review with a legal expert before filing]
    `,
    hi: `
प्राथमिक सूचना रिपोर्ट (FIR)
पुलिस स्टेशन: ________________
दिनांक: ${new Date().toLocaleDateString('hi-IN')}
समय: ${new Date().toLocaleTimeString('hi-IN')}

शिकायतकर्ता की जानकारी:
नाम: ${incidentDetails.complainantDetails.name}
पता: ${incidentDetails.complainantDetails.address}
फोन: ${incidentDetails.complainantDetails.phone}

घटना की जानकारी:
घटना का प्रकार: ${incidentDetails.incidentType}
घटना की दिनांक और समय: ${incidentDetails.dateTime}
घटना स्थल: ${incidentDetails.location}

घटना का विवरण:
${incidentDetails.description}

मैं इस शिकायत को दर्ज कराता हूं और अनुरोध करता हूं कि इस मामले में उचित कानूनी कार्रवाई की जाए।

शिकायतकर्ता के हस्ताक्षर: _________________
दिनांक: ${new Date().toLocaleDateString('hi-IN')}

[यह एक मसौदा FIR है। दाखिल करने से पहले कानूनी विशेषज्ञ से समीक्षा कराएं]
    `,
    mr: `
प्राथमिक माहिती अहवाल (FIR)
पोलीस स्टेशन: ________________
दिनांक: ${new Date().toLocaleDateString('mr-IN')}
वेळ: ${new Date().toLocaleTimeString('mr-IN')}

तक्रारदाराची माहिती:
नाव: ${incidentDetails.complainantDetails.name}
पत्ता: ${incidentDetails.complainantDetails.address}
फोन: ${incidentDetails.complainantDetails.phone}

घटनेची माहिती:
घटनेचा प्रकार: ${incidentDetails.incidentType}
घटनेची दिनांक आणि वेळ: ${incidentDetails.dateTime}
घटनास्थळ: ${incidentDetails.location}

घटनेचे वर्णन:
${incidentDetails.description}

मी ही तक्रार नोंदवतो आणि या प्रकरणी योग्य कायदेशीर कारवाई करण्याची विनंती करतो।

तक्रारदाराची स्वाक्षरी: _________________
दिनांक: ${new Date().toLocaleDateString('mr-IN')}

[हा एक मसुदा FIR आहे. दाखल करण्यापूर्वी कायदेशीर तज्ञाकडून पुनरावलोकन कराव्याची विनंती]
    `
  };

  return templates[language as keyof typeof templates] || templates.en;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  // If target language is English or text is very short, return as-is
  if (targetLanguage === 'en' || text.length < 5) {
    return text;
  }

  try {
    // Try Google Translate API first if available
    if (translator) {
      const [translation] = await translator.translate(text, targetLanguage);
      return translation;
    }
    
    // Fallback to MyMemory API
    return await translateTextFallback(text, targetLanguage);
    
  } catch (error) {
    console.warn('Translation failed, returning original text:', error);
    return text; // Return original text if translation fails
  }
}
