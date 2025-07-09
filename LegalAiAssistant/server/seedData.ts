import { db } from "./db";
import { glossaryTerms, lawyers } from "@shared/schema";

// Sample legal glossary terms for Indian law
const glossaryData = [
  {
    term: "FIR",
    definition: "First Information Report - A written document prepared by police upon receiving information about a cognizable offense.",
    language: "en",
    category: "Criminal Law"
  },
  {
    term: "प्राथमिकी",
    definition: "प्राथमिक सूचना रिपोर्ट - पुलिस द्वारा संज्ञेय अपराध की जानकारी प्राप्त होने पर तैयार किया जाने वाला लिखित दस्तावेज।",
    language: "hi",
    category: "आपराधिक कानून"
  },
  {
    term: "Bail",
    definition: "Temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged as security.",
    language: "en",
    category: "Criminal Law"
  },
  {
    term: "जमानत",
    definition: "मुकदमे की प्रतीक्षा कर रहे आरोपी व्यक्ति की अस्थायी रिहाई, कभी-कभी इस शर्त पर कि जमानत के रूप में धन जमा किया जाए।",
    language: "hi",
    category: "आपराधिक कानून"
  },
  {
    term: "Contract",
    definition: "A legally binding agreement between two or more parties that creates mutual obligations enforceable by law.",
    language: "en",
    category: "Civil Law"
  },
  {
    term: "Property Rights",
    definition: "Legal rights that govern the ownership, use, and transfer of property, including real estate and personal property.",
    language: "en",
    category: "Property Law"
  },
  {
    term: "Divorce",
    definition: "Legal dissolution of marriage by a court or other competent body, ending the marital relationship.",
    language: "en",
    category: "Family Law"
  },
  {
    term: "तलाक",
    definition: "न्यायालय या अन्य सक्षम निकाय द्वारा विवाह का कानूनी विघटन, जो वैवाहिक संबंध को समाप्त करता है।",
    language: "hi",
    category: "पारिवारिक कानून"
  }
];

// Sample lawyer directory
const lawyerData = [
  {
    name: "Advocate Priya Sharma",
    specialization: "Criminal Law",
    location: "New Delhi",
    experience: 12,
    phone: "+91-9876543210",
    email: "priya.sharma@lawfirm.com",
    rating: 5,
    languages: ["English", "Hindi"],
    bio: "Experienced criminal lawyer with expertise in high-profile cases and constitutional matters."
  },
  {
    name: "Advocate Rajesh Kumar",
    specialization: "Civil Law",
    location: "Mumbai",
    experience: 8,
    phone: "+91-9876543211",
    email: "rajesh.kumar@advocates.com",
    rating: 5,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Specialized in property disputes, contract law, and commercial litigation."
  },
  {
    name: "Advocate Meera Joshi",
    specialization: "Family Law",
    location: "Pune",
    experience: 15,
    phone: "+91-9876543212",
    email: "meera.joshi@familylaw.com",
    rating: 5,
    languages: ["English", "Marathi", "Hindi"],
    bio: "Expert in family court matters, divorce proceedings, and child custody cases."
  },
  {
    name: "Advocate Arjun Patel",
    specialization: "Corporate Law",
    location: "Ahmedabad",
    experience: 10,
    phone: "+91-9876543213",
    email: "arjun.patel@corporatelaw.com",
    rating: 5,
    languages: ["English", "Gujarati", "Hindi"],
    bio: "Corporate lawyer with experience in mergers, acquisitions, and business compliance."
  },
  {
    name: "Advocate Sunita Reddy",
    specialization: "Property Law",
    location: "Hyderabad",
    experience: 18,
    phone: "+91-9876543214",
    email: "sunita.reddy@propertylaw.com",
    rating: 5,
    languages: ["English", "Telugu", "Hindi"],
    bio: "Property law expert handling real estate transactions and land disputes."
  }
];

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Seed glossary terms
    for (const term of glossaryData) {
      await db.insert(glossaryTerms)
        .values(term)
        .onConflictDoNothing();
    }
    
    // Seed lawyers
    for (const lawyer of lawyerData) {
      await db.insert(lawyers)
        .values(lawyer)
        .onConflictDoNothing();
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}