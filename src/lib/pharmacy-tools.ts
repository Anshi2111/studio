import { mockSoldMedications } from './mock-data';

// This is a mock database lookup. In a real app, this would query a database.
export async function getExpiryDateForMedication(medicationName: string, purchaseDate: string) {
  console.log(`Searching for expiry date for ${medicationName} purchased on ${purchaseDate}`);
  
  const matchingSale = mockSoldMedications.find(sale => 
    sale.medicineName.toLowerCase() === medicationName.toLowerCase() &&
    sale.dateSold === purchaseDate
  );

  if (matchingSale) {
    console.log(`Found matching sale:`, matchingSale);
    return { expiryDate: matchingSale.expiryDate };
  }
  
  console.log('No matching sale found.');
  return { expiryDate: undefined };
}
