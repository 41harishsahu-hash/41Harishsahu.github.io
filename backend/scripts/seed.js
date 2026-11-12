require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const {
  Service,
  Testimonial,
  Gallery,
  HeroCarousel,
  FAQ,
  WebsiteSettings,
} = require('../models/Content');
const { Enquiry, Booking } = require('../models/Business');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Ensuring verified admin and default accounts exist...');
    const adminEmail = (process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase().trim();
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        existingAdmin.email = adminEmail;
        await existingAdmin.save();
        admin = existingAdmin;
      } else {
        admin = await User.create({
          name: 'System Administrator',
          email: adminEmail,
          mobile: '9251273070',
          password: 'Admin@Password123',
          role: 'admin',
          status: 'active',
        });
      }
    }

    let customer = await User.findOne({ email: 'rahul.sharma@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '9876543210',
        password: 'Customer@Password123',
        role: 'customer',
        status: 'active',
      });
    }

    const settingsCount = await WebsiteSettings.countDocuments();
    if (settingsCount === 0) {
      console.log('[Seeder] Seeding business website settings...');
      await WebsiteSettings.create({
      companyName: 'History Packers & Movers',
      tagline: 'Safe Fast Reliable',
      phone1: '+91 9251273070',
      phone2: '+91 6375273070',
      email: 'Historypackersandmovers@gmail.com',
      address: 'SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.',
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      whatsappNumber: '+91 9251273070',
      heroHeadline: 'Moving Made Simple. Moving Made Safe.',
      heroSubtext: 'Reliable packing and moving solutions for your home, office and vehicle. Experience safe handling, professional packing and dependable transportation.',
      aboutStory: 'History Packers & Movers is Jaipur’s trusted relocation partner. Founded with the mission to eliminate moving stress, we provide end-to-end packing, loading, transportation, and careful unpacking. We operate from our central office in Dhawas, Jaipur, serving clients locally across Rajasthan and nationwide.',
      seoTitle: 'History Packers & Movers | Best Shifting Services in Jaipur',
      seoDescription: 'Professional Packers and Movers in Jaipur. Reliable home relocation, vehicle transportation, office shifting, and door-to-door delivery across India.',
    });
    }

    console.log('[Seeder] Seeding services...');
    const services = [
      {
        title: 'Home Relocation',
        slug: 'home-relocation',
        icon: 'Home',
        shortDescription: 'Complete household shifting solutions with multi-layer protective packaging for your furniture, electronics, and delicate items.',
        fullDescription: 'Our Home Relocation service provides comprehensive household shifting designed to ensure your belongings reach your new residence safely. From fragile kitchenware to bulky wooden wardrobes, our trained packing staff wraps each item using premium corrugated sheets, bubble wrap, and stretch film.',
        benefits: [
          'Multi-layer protective packing for fragile items',
          'Dismantling and reassembly of large furniture',
          'Specialized boxes for crockery and glassware',
          'Clean, covered transport vehicles designed for household goods',
          'Direct door-to-door delivery with zero transshipment risk',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Survey & Estimate', description: 'Detailed inspection of your items to calculate packing materials and provide an honest estimate.' },
          { stepNumber: 2, title: 'Professional Packing', description: 'Our trained crew carefully packs every household item using industry-grade materials.' },
          { stepNumber: 3, title: 'Careful Loading & Transit', description: 'Systematic loading into covered trucks with shock-resistant cushioning for smooth transit.' },
          { stepNumber: 4, title: 'Unloading & Placement', description: 'Safe unloading at your new home with placement of furniture in designated rooms.' },
        ],
        faqs: [
          { question: 'How much in advance should I book home relocation?', answer: 'We recommend booking 2 to 4 days in advance for local shifting, and 5 to 7 days for inter-city moving.' },
          { question: 'Do you provide cartons and bubble wraps?', answer: 'Yes, our team brings all required packing materials including corrugated boxes, bubble wrap, corner guards, and tape.' },
        ],
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'Car Transportation',
        slug: 'car-transportation',
        icon: 'Car',
        shortDescription: 'Safe, enclosed car carrier solutions with wheel-stoppers, specialized tie-downs, and nationwide delivery.',
        fullDescription: 'Car transportation requires specialized carriers and careful securing. History Packers & Movers offers dedicated single and multi-vehicle covered carriers to move your car without adding unnecessary mileage or risking highway gravel damage.',
        benefits: [
          'Enclosed and open carrier options available',
          'Hydraulic ramps and heavy-duty wheel-stoppers',
          'Vehicle inspection report prior to loading',
          'Door-to-door pickup and delivery',
          'Regular transit tracking updates',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Condition Inspection', description: 'Pre-shipment vehicle inspection and odometer recording with photo documentation.' },
          { stepNumber: 2, title: 'Secure Carrier Loading', description: 'Loading via safety ramps and securing with 4-point wheel harnesses.' },
          { stepNumber: 3, title: 'Express Highway Transit', description: 'Experienced drivers navigate optimal national highway routes.' },
          { stepNumber: 4, title: 'Handover & Verification', description: 'Inspection upon delivery at your doorstep and handover of vehicle keys.' },
        ],
        faqs: [
          { question: 'Can I leave personal belongings inside the car during transit?', answer: 'We advise keeping personal valuables, cash, and documents with you. Small household cartons may be permitted upon prior inspection.' },
        ],
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Two-Wheeler Transportation',
        slug: 'two-wheeler-transportation',
        icon: 'Bike',
        shortDescription: 'Scratch-resistant wooden crate and corrugated bubble packaging for motorcycles, scooters, and premium bikes.',
        fullDescription: 'We provide specialized bike transport services across India. Every motorcycle or scooter is packed with corrugated sheets, bubble wrap, foam guards for mirrors and indicators, and tied down securely inside covered trucks.',
        benefits: [
          'Full scratch-proof foam and bubble wrapping',
          'Mirror and handle protection guards',
          'Fuel drain protocols for fire safety compliance',
          'Doorstep pickup and doorstep delivery',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Inspection & Fuel Protocol', description: 'Condition note and draining petrol down to minimum reserve for transit safety.' },
          { stepNumber: 2, title: 'Complete Bike Wrapping', description: 'Wrapping tank, exhaust, indicators, and fairings in multi-layer bubble wrap.' },
          { stepNumber: 3, title: 'Rigid Fastening in Truck', description: 'Fastened to internal vehicle anchors using nylon ratchet straps.' },
          { stepNumber: 4, title: 'Doorstep Delivery', description: 'Delivered, unpacked, and verified in your presence.' },
        ],
        faqs: [
          { question: 'What documents are needed for bike transport?', answer: 'Copy of Registration Certificate (RC), valid insurance, and owner identity proof.' },
        ],
        displayOrder: 3,
        isActive: true,
      },
      {
        title: 'Office Relocation',
        slug: 'office-relocation',
        icon: 'Building',
        shortDescription: 'Structured commercial shifting with minimal operational downtime for IT equipment, files, and workstations.',
        fullDescription: 'Corporate and office relocation demands strict timelines and precise organization. Our team packs IT servers, desktop workstations, sensitive file archives, and modular furniture with systematic tagging and weekend/overnight moving schedules.',
        benefits: [
          'Color-coded box tagging for department-wise placement',
          'Anti-static bubble wrap for computers and server hardware',
          'Weekend and after-hours shifting to avoid business interruption',
          'Experienced commercial moving supervisors',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Planning & Inventory Audit', description: 'Detailed site survey with department-wise asset cataloging.' },
          { stepNumber: 2, title: 'IT & Document Packing', description: 'Special anti-static packaging for servers, laptops, and archival labeling.' },
          { stepNumber: 3, title: 'Coordinated Logistics', description: 'Scheduled fleet movement to meet designated timeline milestones.' },
          { stepNumber: 4, title: 'Desk-by-Desk Setup', description: 'Unpacking and placing assets at corresponding floor layouts.' },
        ],
        faqs: [
          { question: 'Can you handle office shifting during holidays or weekends?', answer: 'Yes, we frequently carry out commercial relocations on weekends and night shifts to avoid operational downtime.' },
        ],
        displayOrder: 4,
        isActive: true,
      },
      {
        title: 'Shop Relocation',
        slug: 'shop-relocation',
        icon: 'Store',
        shortDescription: 'Efficient retail and showroom moving for retail merchandise, display counters, racks, and inventory.',
        fullDescription: 'Shifting a retail outlet or showroom requires specialized handling of retail inventory, glass showcases, and heavy display racks. We ensure swift moving so your business resumes retail operations quickly.',
        benefits: [
          'Inventory categorization and carton count verification',
          'Padded protection for glass display units and shelving',
          'Rapid turn-around to minimize commercial sales loss',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Retail Assessment', description: 'Evaluation of inventory volume, showcases, and equipment.' },
          { stepNumber: 2, title: 'Merchandise Packaging', description: 'Product packing grouped by category with clear retail labels.' },
          { stepNumber: 3, title: 'Safe Transport', description: 'Covered trucks prevent dust and rain exposure during transit.' },
          { stepNumber: 4, title: 'Reassembly Support', description: 'Rebuilding display shelving and unloading merchandise.' },
        ],
        faqs: [
          { question: 'How do you safeguard fragile glassware and mirrors in shops?', answer: 'We use thick thermocol sheets, foam corner protectors, and heavy corrugated wooden crates.' },
        ],
        displayOrder: 5,
        isActive: true,
      },
      {
        title: 'Packing and Moving',
        slug: 'packing-and-moving',
        icon: 'Package',
        shortDescription: 'End-to-end relocation services combining industrial-grade packing materials with experienced handlers.',
        fullDescription: 'From individual apartments to large bungalows, our comprehensive packing and moving service handles the entire relocation journey from your current doorstep to your new home.',
        benefits: [
          'High-density 5-ply and 7-ply corrugated boxes',
          'Bubble wrap, stretch wrap, and edge protectors',
          'Trained packing professionals with background verification',
          'Transparent pricing with detailed quote breakdown',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Booking Confirmation', description: 'Schedule your moving date and confirm requirements.' },
          { stepNumber: 2, title: 'Item-by-Item Packing', description: 'Expert packing crew wraps every piece using protective layers.' },
          { stepNumber: 3, title: 'Transportation', description: 'Smooth transit inside well-maintained covered logistics vehicles.' },
          { stepNumber: 4, title: 'Delivery & Inspection', description: 'Unloading, unpacking, and checking of all goods.' },
        ],
        faqs: [
          { question: 'Are packing charges included in the quotation?', answer: 'Yes, all our quotations clearly detail the cost of packing materials and labor.' },
        ],
        displayOrder: 6,
        isActive: true,
      },
      {
        title: 'Loading and Unloading',
        slug: 'loading-and-unloading',
        icon: 'Truck',
        shortDescription: 'Trained, physically skilled laborers using moving dollies, lifting belts, and protective floor blankets.',
        fullDescription: 'Safe loading and unloading prevents damages to doorways, staircases, and heavy furniture. Our skilled crew utilizes lifting straps, hand trucks, and ramps to load your goods systematically.',
        benefits: [
          'Heavy-item lifting straps to prevent physical strain and drops',
          'Staircase and corner wall padding protection',
          'Proper weight distribution inside moving trucks',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Pathway Prep', description: 'Clearing corridors and placing doorway blankets.' },
          { stepNumber: 2, title: 'Systematic Loading', description: 'Heaviest furniture loaded at the bottom, delicate boxes on top.' },
          { stepNumber: 3, title: 'Anchor Securing', description: 'Goods lashed inside truck to avoid movement on transit turns.' },
          { stepNumber: 4, title: 'Gentle Unloading', description: 'Step-by-step unloading into your specified rooms.' },
        ],
        faqs: [
          { question: 'Can I hire only loading and unloading labor without a truck?', answer: 'Yes, labor-only loading and unloading services can be requested for local assignments.' },
        ],
        displayOrder: 7,
        isActive: true,
      },
      {
        title: 'Door-to-Door Transportation',
        slug: 'door-to-door-transportation',
        icon: 'Truck',
        shortDescription: 'Direct transport from your current doorstep directly to your destination across Rajasthan and pan-India.',
        fullDescription: 'Our door-to-door transportation service guarantees that your items stay on the assigned truck without being dumped into intermediary transshipment hubs. Direct transit ensures maximum safety and accountability.',
        benefits: [
          'Direct point-to-point transit without intermediate warehouse offloading',
          'Real-time transit updates and phone coordination with driver',
          'All-India permit logistics fleet',
        ],
        processSteps: [
          { stepNumber: 1, title: 'Pickup at Source', description: 'Goods loaded directly at your address.' },
          { stepNumber: 2, title: 'Direct Highway Transit', description: 'Non-stop scheduled road transit across states.' },
          { stepNumber: 3, title: 'Pre-arrival Notification', description: 'Driver alerts you 3 to 4 hours prior to reaching destination.' },
          { stepNumber: 4, title: 'Delivery at Destination', description: 'Direct delivery right to your new address.' },
        ],
        faqs: [
          { question: 'Which cities do you cover for door-to-door transport?', answer: 'We cover all major cities across Rajasthan (Jaipur, Jodhpur, Udaipur, Kota, Ajmer) and pan-India destinations including Delhi NCR, Mumbai, Bangalore, Hyderabad, Ahmedabad, and Kolkata.' },
        ],
        displayOrder: 8,
        isActive: true,
      },
    ];

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(services);
      console.log('[Seeder] Services seeded successfully.');
    }

    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0) {
      console.log('[Seeder] Seeding FAQs...');
      const faqs = [
        {
          question: 'How do you calculate shifting charges?',
          answer: 'Shifting charges depend on the volume of goods, packing material required, floor levels, availability of elevator, and transit distance.',
          category: 'Pricing',
          displayOrder: 1,
        },
        {
          question: 'Are there hidden charges added later?',
          answer: 'No. History Packers & Movers provides transparent, upfront estimates detailing packing, labor, and transport. Any special request outside the scope is communicated beforehand.',
          category: 'Pricing',
          displayOrder: 2,
        },
        {
          question: 'How are fragile items like glass, TV, and electronics protected?',
          answer: 'We use 5-layer packing for electronics and glass: foam sheet, bubble wrap, custom corrugated cardboard, edge protectors, and stretch film.',
          category: 'Safety',
          displayOrder: 3,
        },
        {
          question: 'Do you provide car and bike shifting along with household items?',
          answer: 'Yes, we provide combined shifting packages where your household goods and vehicles can be moved together seamlessly.',
          category: 'Services',
          displayOrder: 4,
        },
        {
          question: 'Where is your Jaipur office located?',
          answer: 'Our main office is located at Shop No 05 Basement Plot No R 3/42, Indraprasth Colony, Chordiya City, Dhawas, Jaipur, Rajasthan.',
          category: 'Company',
          displayOrder: 5,
        },
      ];
      await FAQ.insertMany(faqs);
    }

    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      console.log('[Seeder] Seeding testimonials...');
      const testimonials = [
        {
          name: 'Vikas Shekhawat',
          location: 'Jaipur (Vaishali Nagar) to Delhi',
          rating: 5,
          comment: 'History Packers & Movers handled our 3 BHK shifting to Delhi with absolute care. The packing staff was polite and well trained. All electronics arrived without a single scratch.',
          serviceUsed: 'Home Relocation',
          displayOrder: 1,
          isApproved: true,
        },
        {
          name: 'Pooja Agarwal',
          location: 'Mansarovar, Jaipur to Mansarovar Ext.',
          rating: 5,
          comment: 'Very professional local shifting in Jaipur. They arrived on time at 9 AM, dismantled our beds and sofa, and had everything settled in our new flat by evening.',
          serviceUsed: 'Packing and Moving',
          displayOrder: 2,
          isApproved: true,
        },
        {
          name: 'Sunil Choudhary',
          location: 'Jaipur to Pune',
          rating: 5,
          comment: 'Transported my Hyundai Creta from Jaipur to Pune. The car carrier service was reliable, odometer reading matched, and vehicle reached in pristine condition.',
          serviceUsed: 'Car Transportation',
          displayOrder: 3,
          isApproved: true,
        },
      ];
      await Testimonial.insertMany(testimonials);
    }

    const heroCount = await HeroCarousel.countDocuments();
    if (heroCount === 0) {
      console.log('[Seeder] Seeding default dynamic hero carousel slides...');
      await HeroCarousel.insertMany([
        {
          title: 'Safe & Professional Household Packing',
          description: 'Multi-layer corrugated and bubble protection for delicate home items and furniture.',
          imageUrl: '/images/hero/hero-1.svg',
          publicId: 'local_hero-1.svg',
          displayOrder: 1,
          isActive: true,
          isPublished: true,
        },
        {
          title: 'Dedicated Vehicle Carriers & Pan-India Logistics',
          description: 'Specialized covered vehicle carriers ensuring scratch-free car and two-wheeler transit.',
          imageUrl: '/images/hero/hero-2.svg',
          publicId: 'local_hero-2.svg',
          displayOrder: 2,
          isActive: true,
          isPublished: true,
        },
        {
          title: 'Direct Doorstep Relocation Delivery',
          description: 'Careful loading, smooth highway transit, and prompt unloading in every city.',
          imageUrl: '/images/hero/hero-3.svg',
          publicId: 'local_hero-3.svg',
          displayOrder: 3,
          isActive: true,
          isPublished: true,
        },
      ]);
    }

    const enqCount = await Enquiry.countDocuments();
    if (enqCount === 0) {
      console.log('[Seeder] Seeding sample enquiries & bookings for dashboard demo...');
      const sampleEnquiry = await Enquiry.create({
        customerId: customer._id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '9876543210',
        pickupAddress: 'B-42 Shyam Nagar, Ajmer Road',
        destinationAddress: 'Plot 104, Malviya Nagar Sector 3',
        pickupCity: 'Jaipur',
        destinationCity: 'Jaipur',
        serviceType: 'Home Relocation',
        movingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        propertyType: '2 BHK',
        message: 'Looking for complete packing and moving with sofa, 2 double beds, and refrigerator.',
        status: 'Quotation Sent',
        quoteAmount: 14500,
        customerResponse: 'Our team has inspected the list of items. Formal quotation of Rs 14,500 includes 5-ply cartons, bubble wrap, loading, and transit insurance.',
        internalNotes: [
          { note: 'Customer contacted via phone. Estimated 2 BHK volume.', addedBy: 'Admin' },
        ],
      });

      await Booking.create({
        enquiryId: sampleEnquiry._id,
        customerId: customer._id,
        customerName: 'Rahul Sharma',
        customerMobile: '9876543210',
        customerEmail: 'rahul.sharma@example.com',
        pickupAddress: 'B-42 Shyam Nagar, Ajmer Road',
        destinationAddress: 'Plot 104, Malviya Nagar Sector 3',
        pickupCity: 'Jaipur',
        destinationCity: 'Jaipur',
        serviceType: 'Home Relocation',
        movingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        propertyType: '2 BHK',
        status: 'Confirmed',
        quoteAmount: 14500,
        paymentStatus: 'Partial',
        paidAmount: 3000,
        paymentNotes: 'Advance token received via UPI. Balance on delivery.',
        internalNotes: [
          { note: 'Advance booking confirmed. Assigned truck RJ-14-GA-8921.', addedBy: 'Admin' },
        ],
        trackingUpdates: [
          { status: 'Confirmed', location: 'Jaipur Office', remarks: 'Relocation team and vehicle assigned.', timestamp: new Date() },
        ],
      });
    }

    console.log('[Seeder] Seeding completed successfully!');
    console.log('=====================================================');
    console.log('Default Admin Account Provisioned:');
    console.log('  Email:    admin@historypackers.com');
    console.log('Default Demo Customer Account Provisioned:');
    console.log('  Email:    rahul.sharma@example.com');
    console.log('=====================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Error seeding database:', err);
    process.exit(1);
  }
};

seedData();

