import type { Appointment, Prescription, HealthStat, PharmacyPrescription, InventoryItem, SalesData, HealthGoal, UserMedication } from './types';

export const mockAppointments: Appointment[] = [
  { id: '1', doctor: 'Dr. Evelyn Reed', specialty: 'Cardiology', date: '2024-08-15', time: '10:00 AM', status: 'Upcoming' },
  { id: '2', doctor: 'Dr. Samuel Green', specialty: 'Dermatology', date: '2024-08-22', time: '02:30 PM', status: 'Upcoming' },
  { id: '3', doctor: 'Dr. Jane Smith', specialty: 'Pediatrics', date: '2024-07-20', time: '11:00 AM', status: 'Completed' },
];

export const mockPrescriptions: Prescription[] = [
  { id: 'p1', medication: 'Lisinopril', dosage: '10mg Daily', refills: 2, doctor: 'Dr. Evelyn Reed' },
  { id: 'p2', medication: 'Metformin', dosage: '500mg Twice Daily', refills: 1, doctor: 'Dr. Ben Carter' },
  { id: 'p3', medication: 'Atorvastatin', dosage: '20mg Daily', refills: 0, doctor: 'Dr. Evelyn Reed' },
];

export const mockHealthStats: HealthStat[] = [
  { month: 'Mar', systolic: 120, diastolic: 80 },
  { month: 'Apr', systolic: 122, diastolic: 81 },
  { month: 'May', systolic: 118, diastolic: 79 },
  { month: 'Jun', systolic: 125, diastolic: 82 },
  { month: 'Jul', systolic: 123, diastolic: 80 },
];

export const mockPharmacyPrescriptions: PharmacyPrescription[] = [
  { id: 'ph1', patient: 'John Doe', medication: 'Amoxicillin 500mg', dateIssued: '2024-08-01', status: 'Pending' },
  { id: 'ph2', patient: 'Alice Johnson', medication: 'Ibuprofen 200mg', dateIssued: '2024-08-01', status: 'Pending' },
  { id: 'ph3', patient: 'Robert Brown', medication: 'Lisinopril 10mg', dateIssued: '2024-07-31', status: 'Filled' },
  { id: 'ph4', patient: 'Emily White', medication: 'Ventolin Inhaler', dateIssued: '2024-07-30', status: 'Filled' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'Amoxicillin 500mg', stock: 150, expiryDate: '2025-12-31', status: 'In Stock' },
  { id: 'i2', name: 'Ibuprofen 200mg', stock: 30, expiryDate: '2024-11-30', status: 'Low Stock' },
  { id: 'i3', name: 'Paracetamol 500mg', stock: 200, expiryDate: '2026-06-30', status: 'In Stock' },
  { id: 'i4', name: 'Aspirin 81mg', stock: 8, expiryDate: '2024-09-30', status: 'Low Stock' },
  { id: 'i5', name: 'Cephalexin 250mg', stock: 0, expiryDate: '2024-07-01', status: 'Expired' },
];

export const mockSalesData: SalesData[] = [
  { month: 'Mar', revenue: 4500 },
  { month: 'Apr', revenue: 5200 },
  { month: 'May', revenue: 6100 },
  { month: 'Jun', revenue: 5800 },
  { month: 'Jul', revenue: 7300 },
];

export const mockHealthGoals: HealthGoal[] = [
    { id: 'g1', title: 'Walk 10,000 steps daily', progress: 75 },
    { id: 'g2', title: 'Drink 8 glasses of water', progress: 90 },
    { id: 'g3', title: 'Weekly mindfulness session', progress: 50 },
];

export const mockUserMedications: UserMedication[] = [
    { id: 'um1', name: 'Advil', purchaseDate: '2024-07-01', expiryDate: '2025-06-01' },
    { id: 'um2', name: 'Benadryl', purchaseDate: '2024-06-15', expiryDate: '2024-08-30' },
];
