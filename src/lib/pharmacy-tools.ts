// This is a mock database lookup. In a real app, this would query a database.
export async function getExpiryDateForMedication(medicationName: string, purchaseDate: string, salesRecords: any[], email: string) {
  console.log(`Searching for expiry date for ${medicationName} purchased on ${purchaseDate} for user ${email}`);

  // The tool now receives the sales records directly from the client.
  const matchingSale = salesRecords.find((sale: any) => {
    // Normalize purchase date from the form (it's already in YYYY-MM-DD)
    const formPurchaseDate = purchaseDate;
    // Normalize date from the sales record to YYYY-MM-DD
    const saleDate = new Date(sale.dateSold).toISOString().split('T')[0];

    const isMedicationMatch = sale.medicineName.toLowerCase() === medicationName.toLowerCase();
    const isDateMatch = saleDate === formPurchaseDate;
    const isEmailMatch = sale.patientEmail?.toLowerCase() === email.toLowerCase();
    
    return isMedicationMatch && isDateMatch && isEmailMatch;
  });

  if (matchingSale && matchingSale.expiryDate) {
    console.log(`Found matching sale:`, matchingSale);
    return { expiryDate: matchingSale.expiryDate };
  }
  
  console.log('No matching sale found.');
  return { expiryDate: undefined };
}
