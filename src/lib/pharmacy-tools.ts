// This is a mock database lookup. In a real app, this would query a database.
export async function getExpiryDateForMedication(medicationName: string, purchaseDate: string, salesRecords: any[]) {
  console.log(`Searching for expiry date for ${medicationName} purchased on ${purchaseDate}`);

  // The tool now receives the sales records directly from the client.
  const matchingSale = salesRecords.find((sale: any) => 
    sale.medicineName.toLowerCase() === medicationName.toLowerCase() &&
    new Date(sale.dateSold).toISOString().split('T')[0] === purchaseDate
  );

  if (matchingSale && matchingSale.expiryDate) {
    console.log(`Found matching sale:`, matchingSale);
    return { expiryDate: matchingSale.expiryDate };
  }
  
  console.log('No matching sale found.');
  return { expiryDate: undefined };
}
