// Run once to seed hospitals: npx ts-node lib/seedHospitals.ts
// Or call GET /api/seed in dev

const generateSlots = (start: string, end: string) => {
  const slots: string[] = [];
  let [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  while (sh < eh || (sh === eh && sm <= em)) {
    slots.push(`${String(sh).padStart(2,"0")}:${String(sm).padStart(2,"0")}`);
    sm += 15; if (sm >= 60) { sm = 0; sh++; }
  }
  return slots;
};

export const HOSPITALS = [
  {
    name: "Manipal Hospital",
    address: "98, HAL Airport Road, Bengaluru",
    city: "Bengaluru",
    phone: "080-25023456",
    ambulanceNumber: "080-25023400",
    rating: 4.7,
    totalBeds: 600,
    availableBeds: 42,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Cardiology","Neurology","Oncology","Orthopedics","Pediatrics"],
    image: "/hospitals/manipal.png",
    location: { lat: 12.9592, lng: 77.6474 },
    doctors: [
      { name: "Dr. Ramesh Kumar", specialty: "Cardiologist", experience: 18, rating: 4.9, consultationFee: 800, availableSlots: generateSlots("09:00","12:00").concat(generateSlots("14:00","17:00")) },
      { name: "Dr. Sunita Rao", specialty: "Neurologist", experience: 14, rating: 4.8, consultationFee: 900, availableSlots: generateSlots("10:00","13:00").concat(generateSlots("15:00","17:00")) },
      { name: "Dr. Anil Sharma", specialty: "Orthopedic", experience: 12, rating: 4.7, consultationFee: 700, availableSlots: generateSlots("09:00","12:00") },
    ],
  },
  {
    name: "Narayana Health City",
    address: "258/A, Bommasandra Industrial Area, Bengaluru",
    city: "Bengaluru",
    phone: "080-71222222",
    ambulanceNumber: "1800-425-8080",
    rating: 4.8,
    totalBeds: 1000,
    availableBeds: 78,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Cardiac Surgery","Nephrology","Transplant","Pediatric Cardiology"],
    image: "/hospitals/narayana.png",
    location: { lat: 12.8340, lng: 77.6770 },
    doctors: [
      { name: "Dr. Priya Nair", specialty: "Cardiac Surgeon", experience: 20, rating: 4.9, consultationFee: 1200, availableSlots: generateSlots("08:00","11:00").concat(generateSlots("14:00","16:00")) },
      { name: "Dr. Venkat Reddy", specialty: "Nephrologist", experience: 16, rating: 4.8, consultationFee: 1000, availableSlots: generateSlots("09:00","12:00") },
      { name: "Dr. Meena Iyer", specialty: "Pediatric Cardiologist", experience: 11, rating: 4.7, consultationFee: 900, availableSlots: generateSlots("10:00","13:00") },
    ],
  },
  {
    name: "Fortis Hospital",
    address: "14, Cunningham Road, Bengaluru",
    city: "Bengaluru",
    phone: "080-66214444",
    ambulanceNumber: "080-66214400",
    rating: 4.6,
    totalBeds: 400,
    availableBeds: 25,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Oncology","Dermatology","Gynecology","General Medicine"],
    image: "/hospitals/fortis.png",
    location: { lat: 12.9900, lng: 77.5950 },
    doctors: [
      { name: "Dr. Kavitha Menon", specialty: "Oncologist", experience: 15, rating: 4.8, consultationFee: 1100, availableSlots: generateSlots("09:00","12:00").concat(generateSlots("14:00","16:00")) },
      { name: "Dr. Sharan Patil", specialty: "Dermatologist", experience: 10, rating: 4.9, consultationFee: 600, availableSlots: generateSlots("10:00","13:00").concat(generateSlots("15:00","17:00")) },
      { name: "Dr. Rekha Shetty", specialty: "Gynecologist", experience: 13, rating: 4.7, consultationFee: 700, availableSlots: generateSlots("09:00","11:00") },
    ],
  },
  {
    name: "Apollo Hospital",
    address: "154/11, Bannerghatta Road, Bengaluru",
    city: "Bengaluru",
    phone: "080-26304050",
    ambulanceNumber: "1066",
    rating: 4.7,
    totalBeds: 500,
    availableBeds: 33,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Neurosurgery","Spine","Psychiatry","Endocrinology","Urology"],
    image: "/hospitals/apollo.png",
    location: { lat: 12.8956, lng: 77.5966 },
    doctors: [
      { name: "Dr. Basavaraj M", specialty: "Neurosurgeon", experience: 17, rating: 4.9, consultationFee: 1300, availableSlots: generateSlots("08:00","11:00") },
      { name: "Dr. Deepa Kulkarni", specialty: "Endocrinologist", experience: 12, rating: 4.7, consultationFee: 800, availableSlots: generateSlots("10:00","13:00").concat(generateSlots("15:00","17:00")) },
      { name: "Dr. Rahul Joshi", specialty: "Urologist", experience: 9, rating: 4.6, consultationFee: 750, availableSlots: generateSlots("09:00","12:00") },
    ],
  },
  {
    name: "Vikram Hospital",
    address: "71/1, Millers Road, Bengaluru",
    city: "Bengaluru",
    phone: "080-40206000",
    ambulanceNumber: "080-40206001",
    rating: 4.5,
    totalBeds: 250,
    availableBeds: 18,
    isOpen: true,
    openHours: "08:00 - 22:00",
    specializations: ["General Surgery","ENT","Ophthalmology","Physiotherapy"],
    image: "/hospitals/vikram.png",
    location: { lat: 12.9950, lng: 77.5800 },
    doctors: [
      { name: "Dr. Sarah Patil", specialty: "General Surgeon", experience: 15, rating: 4.8, consultationFee: 600, availableSlots: generateSlots("09:00","12:00").concat(generateSlots("14:00","16:00")) },
      { name: "Dr. Mohan Das", specialty: "ENT Specialist", experience: 11, rating: 4.6, consultationFee: 500, availableSlots: generateSlots("10:00","13:00") },
      { name: "Dr. Priya Hegde", specialty: "Ophthalmologist", experience: 8, rating: 4.7, consultationFee: 550, availableSlots: generateSlots("09:00","11:00").concat(generateSlots("15:00","17:00")) },
    ],
  },
  {
    name: "Columbia Asia Hospital",
    address: "26/4, Brigade Gateway, Bengaluru",
    city: "Bengaluru",
    phone: "080-61222222",
    ambulanceNumber: "080-61222200",
    rating: 4.6,
    totalBeds: 300,
    availableBeds: 22,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Gastroenterology","Pulmonology","Rheumatology","Diabetology"],
    image: "/hospitals/columbia.png",
    location: { lat: 13.0100, lng: 77.5550 },
    doctors: [
      { name: "Dr. Anand Krishnan", specialty: "Gastroenterologist", experience: 14, rating: 4.8, consultationFee: 850, availableSlots: generateSlots("09:00","12:00").concat(generateSlots("14:00","16:00")) },
      { name: "Dr. Nisha Verma", specialty: "Pulmonologist", experience: 10, rating: 4.7, consultationFee: 750, availableSlots: generateSlots("10:00","13:00") },
      { name: "Dr. Suresh Babu", specialty: "Diabetologist", experience: 12, rating: 4.6, consultationFee: 700, availableSlots: generateSlots("09:00","11:00").concat(generateSlots("15:00","17:00")) },
    ],
  },
];
