
export interface Company {
  name: string;
  address: string;
  email: string;
  phone: string;
  gstin?: string;
  logo?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankBranch?: string;
  signatureName?: string;
  signatureImage?: string; // data URL
}

export interface Customer extends Company {
  id: string;
}

export interface Item {
  description: string;
  quantity: number;
  rate: number;
  hsnSacCode?: string;
  gstPercent: number;
}

export interface Invoice {
  sender: Company;
  recipient: Company;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Item[];
  placeOfSupply: string;
  reverseCharge: boolean;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  notes: string;
  terms: string;
  paymentTerms?: string;
}

export type TemplateId = 'classic' | 'modern' | 'minimalist';