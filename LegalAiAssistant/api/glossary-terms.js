// Legal glossary API endpoint
module.exports = async (req, res) => {
  try {
    const glossaryTerms = [
      {
        id: 1,
        term: "FIR",
        definition: "First Information Report - A written document prepared by police when they receive information about a cognizable offense. It is the first step in the criminal justice process.",
        language: "en",
        category: "Criminal Law"
      },
      {
        id: 2,
        term: "Bail",
        definition: "The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged as guarantee of their appearance in court.",
        language: "en",
        category: "Criminal Law"
      },
      {
        id: 3,
        term: "Cognizable Offense",
        definition: "An offense for which police can arrest without warrant and investigate without the permission of the court. These are generally serious crimes.",
        language: "en",
        category: "Criminal Law"
      },
      {
        id: 4,
        term: "Non-Cognizable Offense",
        definition: "An offense for which police cannot arrest without warrant and cannot investigate without the permission of the magistrate. These are generally minor offenses.",
        language: "en",
        category: "Criminal Law"
      },
      {
        id: 5,
        term: "Writ Petition",
        definition: "A formal written order issued by a court requiring the performance of a specific act or giving authority to have it done. Common writs include Habeas Corpus, Mandamus, and Certiorari.",
        language: "en",
        category: "Constitutional Law"
      },
      {
        id: 6,
        term: "Habeas Corpus",
        definition: "A writ requiring a person under arrest to be brought before a judge or into court, especially to secure the person's release unless lawful grounds are shown for their detention.",
        language: "en",
        category: "Constitutional Law"
      },
      {
        id: 7,
        term: "Mandamus",
        definition: "A judicial remedy in the form of an order from a court to any government, subordinate court, corporation, or public authority, to do some specific act.",
        language: "en",
        category: "Constitutional Law"
      },
      {
        id: 8,
        term: "Injunction",
        definition: "A judicial order that restrains a person from beginning or continuing an action threatening or invading the legal right of another.",
        language: "en",
        category: "Civil Law"
      },
      {
        id: 9,
        term: "Tort",
        definition: "A wrongful act or an infringement of a right (other than under contract) leading to civil legal liability. Examples include negligence, defamation, and trespass.",
        language: "en",
        category: "Civil Law"
      },
      {
        id: 10,
        term: "Contract",
        definition: "A legally binding agreement between two or more parties that creates mutual obligations enforceable by law.",
        language: "en",
        category: "Contract Law"
      }
    ];

    // Filter by query parameters
    const { search, language = 'en', category } = req.query;
    let filteredTerms = glossaryTerms.filter(term => term.language === language);

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTerms = filteredTerms.filter(term => 
        term.term.toLowerCase().includes(searchTerm) ||
        term.definition.toLowerCase().includes(searchTerm) ||
        term.category.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filteredTerms = filteredTerms.filter(term => 
        term.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    res.status(200).json(filteredTerms);
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch glossary terms'
    });
  }
};