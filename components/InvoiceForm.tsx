
import React from 'react';
import type { Invoice, Item, Company, Customer, TemplateId } from '../types';
import Input from './common/Input';
import TemplateSelector from './TemplateSelector';

interface InvoiceFormProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoice, 
  setInvoice, 
  customers, 
  onSelectCustomer,
  selectedTemplate,
  onSelectTemplate
}) => {
  const handleCompanyChange = (
    party: 'sender' | 'recipient',
    field: keyof Company,
    value: string
  ) => {
    setInvoice(prev => ({
      ...prev,
      [party]: { ...prev[party], [field]: value },
    }));
  };

  const handleInvoiceDetailsChange = (
    field: keyof Invoice,
    value: string | number | boolean
  ) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const newItems = [...invoice.items];
    const item = newItems[index];
    if (field === 'description' || field === 'hsnSacCode') {
        item[field] = value as string;
    } else {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            if (field === 'quantity') item.quantity = numValue;
            if (field === 'rate') item.rate = numValue;
            if (field === 'gstPercent') item.gstPercent = numValue;
        }
    }
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', hsnSacCode: '', quantity: 1, rate: 0, gstPercent: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: newItems }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("File is too large. Please select an image under 1MB.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice(prev => ({
          ...prev,
          sender: { ...prev.sender, logo: reader.result as string },
        }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeLogo = () => {
    setInvoice(prev => ({
      ...prev,
      sender: { ...prev.sender, logo: '' },
    }));
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File is too large. Please select an image under 1MB.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice(prev => ({
          ...prev,
          sender: { ...prev.sender, signatureImage: reader.result as string },
        }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeSignature = () => {
    setInvoice(prev => ({
      ...prev,
      sender: { ...prev.sender, signatureImage: '' },
    }));
  };


  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-md">
      <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={onSelectTemplate} />
      
      {/* Sender & Recipient Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">From</h3>
           <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Company Logo
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-32 bg-gray-100 rounded-md flex items-center justify-center border border-dashed">
                {invoice.sender.logo ? (
                  <img src={invoice.sender.logo} alt="Company Logo" className="max-h-16 max-w-32 object-contain" />
                ) : (
                  <span className="text-xs text-gray-500">Preview</span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span>Upload</span>
                  <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                </label>
                {invoice.sender.logo && (
                  <button type="button" onClick={removeLogo} className="text-xs text-red-600 hover:text-red-800 font-medium">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <Input label="Company Name" value={invoice.sender.name} onChange={e => handleCompanyChange('sender', 'name', e.target.value)} />
          <Input label="Address" value={invoice.sender.address} onChange={e => handleCompanyChange('sender', 'address', e.target.value)} />
          <Input label="Email" type="email" value={invoice.sender.email} onChange={e => handleCompanyChange('sender', 'email', e.target.value)} />
          <Input label="Phone" value={invoice.sender.phone} onChange={e => handleCompanyChange('sender', 'phone', e.target.value)} />
          <Input label="GSTIN" value={invoice.sender.gstin || ''} onChange={e => handleCompanyChange('sender', 'gstin', e.target.value)} />
          <Input label="Bank Name" value={invoice.sender.bankName || ''} onChange={e => handleCompanyChange('sender', 'bankName', e.target.value)} />
          <Input label="Account Name" value={invoice.sender.bankAccountName || ''} onChange={e => handleCompanyChange('sender', 'bankAccountName', e.target.value)} />
          <Input label="Bank Account" value={invoice.sender.bankAccount || ''} onChange={e => handleCompanyChange('sender', 'bankAccount', e.target.value)} />
          <Input label="IFSC" value={invoice.sender.bankIfsc || ''} onChange={e => handleCompanyChange('sender', 'bankIfsc', e.target.value)} />
          <Input label="Bank Branch" value={invoice.sender.bankBranch || ''} onChange={e => handleCompanyChange('sender', 'bankBranch', e.target.value)} />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Signature Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-32 bg-gray-100 rounded-md flex items-center justify-center border border-dashed">
                {invoice.sender.signatureImage ? (
                  <img src={invoice.sender.signatureImage} alt="Signature" className="max-h-16 max-w-32 object-contain" />
                ) : (
                  <span className="text-xs text-gray-500">Preview</span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="signature-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span>Upload</span>
                  <input id="signature-upload" name="signature-upload" type="file" className="sr-only" onChange={handleSignatureChange} accept="image/png, image/jpeg, image/svg+xml" />
                </label>
                {invoice.sender.signatureImage && (
                  <button type="button" onClick={removeSignature} className="text-xs text-red-600 hover:text-red-800 font-medium">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <Input label="Signatory Name" value={invoice.sender.signatureName || ''} onChange={e => handleCompanyChange('sender', 'signatureName', e.target.value)} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-800">To</h3>
              {customers.length > 0 && (
                <div className="w-2/3">
                  <select
                      id="customer-select"
                      onChange={(e) => onSelectCustomer(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-xs"
                      defaultValue=""
                  >
                      <option value="" disabled>-- Select a customer --</option>
                      {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                  </select>
                </div>
              )}
          </div>
          <Input label="Client Name" value={invoice.recipient.name} onChange={e => handleCompanyChange('recipient', 'name', e.target.value)} />
          <Input label="Address" value={invoice.recipient.address} onChange={e => handleCompanyChange('recipient', 'address', e.target.value)} />
          <Input label="Email" type="email" value={invoice.recipient.email} onChange={e => handleCompanyChange('recipient', 'email', e.target.value)} />
          <Input label="Phone" value={invoice.recipient.phone} onChange={e => handleCompanyChange('recipient', 'phone', e.target.value)} />
          <Input label="GSTIN" value={invoice.recipient.gstin || ''} onChange={e => handleCompanyChange('recipient', 'gstin', e.target.value)} />
        </div>
      </div>

      {/* Invoice Metadata */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Invoice Number" value={invoice.invoiceNumber} onChange={e => handleInvoiceDetailsChange('invoiceNumber', e.target.value)} />
            <Input label="Invoice Date" type="date" value={invoice.invoiceDate} onChange={e => handleInvoiceDetailsChange('invoiceDate', e.target.value)} />
            <Input label="Due Date" type="date" value={invoice.dueDate} onChange={e => handleInvoiceDetailsChange('dueDate', e.target.value)} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Place of Supply" value={invoice.placeOfSupply} onChange={e => handleInvoiceDetailsChange('placeOfSupply', e.target.value)} />
            <Input label="Payment Terms" value={invoice.paymentTerms || ''} onChange={e => handleInvoiceDetailsChange('paymentTerms', e.target.value)} />
        </div>
      </div>


      {/* Items */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800">Items</h3>
        {invoice.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md hover:bg-gray-50">
            <div className="col-span-12 md:col-span-4">
              <Input label="Description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} noLabel={index !== 0} />
            </div>
             <div className="col-span-12 md:col-span-2">
              <Input label="HSN/SAC" value={item.hsnSacCode || ''} onChange={e => handleItemChange(index, 'hsnSacCode', e.target.value)} noLabel={index !== 0} />
            </div>
            <div className="col-span-4 md:col-span-1">
              <Input label="Qty" type="number" value={item.quantity.toString()} onChange={e => handleItemChange(index, 'quantity', e.target.value)} noLabel={index !== 0} />
            </div>
            <div className="col-span-4 md:col-span-2">
               <Input label="Rate" type="number" value={item.rate.toString()} onChange={e => handleItemChange(index, 'rate', e.target.value)} noLabel={index !== 0} />
            </div>
            <div className="col-span-4 md:col-span-1">
              <Input label="GST %" type="number" value={(item.gstPercent ?? 0).toString()} onChange={e => handleItemChange(index, 'gstPercent', e.target.value)} noLabel={index !== 0} />
            </div>
            <div className="col-span-3 md:col-span-2 flex items-center">
                <p className="text-gray-700 font-medium pt-1 whitespace-nowrap">₹ {(item.quantity * item.rate).toFixed(2)}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        <button onClick={addItem} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Item
        </button>
      </div>
      
       {/* Notes, Terms */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Notes &amp; Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex items-center h-full pt-4">
                <input
                    id="reverse-charge"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={invoice.reverseCharge}
                    onChange={e => handleInvoiceDetailsChange('reverseCharge', e.target.checked)}
                />
                <label htmlFor="reverse-charge" className="ml-2 block text-sm text-gray-700">Reverse Charge</label>
            </div>
        </div>
         <Input label="Notes" value={invoice.notes} onChange={e => handleInvoiceDetailsChange('notes', e.target.value)} />
         <Input label="Terms & Conditions" value={invoice.terms} onChange={e => handleInvoiceDetailsChange('terms', e.target.value)} />
      </div>

    </div>
  );
};

export default InvoiceForm;