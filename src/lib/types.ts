export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
};

export type Prescription = {
  id: string;
  medication: string;
  dosage: string;
  refills: number;
  doctor: string;
};

export type HealthStat = {
  month: string;
  systolic: number;
  diastolic: number;
};

export type PharmacyPrescription = {
  id: string;
  patient: string;
  medication: string;
  dateIssued: string;
  status: 'Pending' | 'Filled' | 'Cancelled';
};

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Expired';
};

export type SalesData = {
  month: string;
  revenue: number;
};

export type HealthGoal = {
    id: string;
    title: string;
    progress: number;
};

export type UserMedication = {
    id: string;
    name: string;
    purchaseDate: string;
    expiryDate: string;
};
