// Lawyers directory API endpoint
module.exports = async (req, res) => {
  try {
    const lawyers = [
      {
        id: 1,
        name: "Adv. Rajesh Kumar",
        specialization: "Criminal Law",
        location: "Mumbai, Maharashtra",
        experience: "15 years",
        rating: 4.8,
        contact: "+91-9876543210",
        email: "rajesh.kumar@lawfirm.com",
        description: "Experienced criminal lawyer specializing in white-collar crimes and corporate fraud cases."
      },
      {
        id: 2,
        name: "Adv. Priya Sharma",
        specialization: "Family Law",
        location: "Delhi, NCR",
        experience: "12 years",
        rating: 4.7,
        contact: "+91-9876543211",
        email: "priya.sharma@familylaw.com",
        description: "Expert in family disputes, divorce proceedings, and child custody cases."
      },
      {
        id: 3,
        name: "Adv. Suresh Patel",
        specialization: "Property Law",
        location: "Pune, Maharashtra",
        experience: "20 years",
        rating: 4.9,
        contact: "+91-9876543212",
        email: "suresh.patel@propertylaw.com",
        description: "Specialist in real estate transactions, property disputes, and land acquisition."
      },
      {
        id: 4,
        name: "Adv. Meera Reddy",
        specialization: "Corporate Law",
        location: "Bangalore, Karnataka",
        experience: "18 years",
        rating: 4.8,
        contact: "+91-9876543213",
        email: "meera.reddy@corplaw.com",
        description: "Corporate legal advisor with expertise in mergers, acquisitions, and compliance."
      },
      {
        id: 5,
        name: "Adv. Vikram Singh",
        specialization: "Civil Rights",
        location: "Jaipur, Rajasthan",
        experience: "10 years",
        rating: 4.6,
        contact: "+91-9876543214",
        email: "vikram.singh@civilrights.com",
        description: "Human rights advocate specializing in social justice and civil liberties cases."
      }
    ];

    // Filter by query parameters
    const { search, specialization, location } = req.query;
    let filteredLawyers = lawyers;

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredLawyers = filteredLawyers.filter(lawyer => 
        lawyer.name.toLowerCase().includes(searchTerm) ||
        lawyer.specialization.toLowerCase().includes(searchTerm) ||
        lawyer.location.toLowerCase().includes(searchTerm)
      );
    }

    if (specialization) {
      filteredLawyers = filteredLawyers.filter(lawyer => 
        lawyer.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    if (location) {
      filteredLawyers = filteredLawyers.filter(lawyer => 
        lawyer.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.status(200).json(filteredLawyers);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch lawyers directory'
    });
  }
};