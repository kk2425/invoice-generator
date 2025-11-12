
import React, { useState, useEffect } from 'react';
import type { Invoice, Customer, TemplateId } from './types';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import CustomerManager from './components/CustomerManager';

const App: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    sender: {
      name: 'Your Company',
      address: '123 Main St, Anytown, State',
      email: 'your@email.com',
      phone: '555-1234',
      gstin: '27ABCDE1234F1Z5',
      logo: '',
      bankName: 'HDFC Bank',
      bankAccountName: 'Your Company',
      bankAccount: '1234567890',
      bankIfsc: 'HDFC0001234',
      bankBranch: 'Main Branch',
    },
    recipient: { name: 'Client Company', address: '456 Oak Ave, Sometown, State', email: 'client@email.com', phone: '555-5678', gstin: '29FGHIJ5678K1Z5' },
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    items: [
      { description: 'Web Design Services', quantity: 1, rate: 2500, hsnSacCode: '998314', gstPercent: 18 },
      { description: 'Hosting (1 Year)', quantity: 1, rate: 300, hsnSacCode: '998315', gstPercent: 18 },
    ],
    placeOfSupply: 'Maharashtra',
    reverseCharge: false,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days.',
    paymentTerms: 'Net 30',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomerManagerOpen, setIsCustomerManagerOpen] = useState(false);
  const [lastCustomerId, setLastCustomerId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('invoice-app-customers');
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }
      const storedSender = localStorage.getItem('invoice-app-sender');
      if (storedSender) {
        const parsed = JSON.parse(storedSender);
        setInvoice(prev => ({ ...prev, sender: { ...prev.sender, ...parsed } }));
      }
      const storedLastCustomerId = localStorage.getItem('invoice-app-last-customer-id');
      if (storedLastCustomerId) {
        setLastCustomerId(storedLastCustomerId);
      }
    } catch (error) {
      console.error("Failed to parse customers from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('invoice-app-customers', JSON.stringify(customers));
    } catch (error) {
        console.error("Failed to save customers to localStorage", error);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('invoice-app-sender', JSON.stringify(invoice.sender));
    } catch (error) {
      console.error('Failed to save sender to localStorage', error);
    }
  }, [invoice.sender]);

  useEffect(() => {
    if (!lastCustomerId) return;
    const selectedCustomer = customers.find(c => c.id === lastCustomerId);
    if (selectedCustomer) {
      setInvoice(prev => ({ ...prev, recipient: {
        name: selectedCustomer.name,
        address: selectedCustomer.address,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        gstin: selectedCustomer.gstin,
      } }));
    }
  }, [customers, lastCustomerId]);

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers(prev => {
        const existing = prev.find(c => c.id === customer.id);
        if (existing) {
            return prev.map(c => c.id === customer.id ? customer : c);
        }
        return [...prev, customer];
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  const handleSelectCustomer = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setInvoice(prev => ({ ...prev, recipient: {
        name: selectedCustomer.name,
        address: selectedCustomer.address,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        gstin: selectedCustomer.gstin,
      } }));
      setLastCustomerId(customerId);
      try { localStorage.setItem('invoice-app-last-customer-id', customerId); } catch {}
    }
  };
  const handlePrint = () => {
    window.print();
  };

  const computeTotals = () => {
    const subtotal = invoice.items.reduce((sum, it) => sum + (it.quantity * it.rate), 0);
    const totalGst = invoice.items.reduce((sum, it) => sum + ((it.quantity * it.rate) * (it.gstPercent || 0) / 100), 0);
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const total = subtotal + totalGst;
    return { subtotal, totalGst, cgst, sgst, total };
  };

  const formatINR = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const handleDownloadPdf = async () => {
    const el = document.getElementById('invoice-preview');
    if (!el) return;
    const filename = `${invoice.invoiceNumber || 'invoice'}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) return;
    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(el).save();
  };

  const handleShare = async () => {
    const { subtotal, cgst, sgst, total } = computeTotals();
    const text = `Invoice ${invoice.invoiceNumber}\nFrom: ${invoice.sender.name}\nTo: ${invoice.recipient.name}\nSubtotal: ${formatINR(subtotal)}\nCGST: ${formatINR(cgst)}\nSGST: ${formatINR(sgst)}\nTotal: ${formatINR(total)}`;

    try {
      // Try to share PDF file if supported
      const el = document.getElementById('invoice-preview');
      const html2pdf = (window as any).html2pdf;
      if (navigator.canShare && html2pdf && el) {
        const worker = html2pdf().set({ jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).toPdf();
        const pdf: any = await worker.outputPdf ? worker.outputPdf() : worker.get('pdf').then((pdfObj: any) => pdfObj.output('blob'));
        const blob: Blob = pdf instanceof Blob ? pdf : new Blob([pdf], { type: 'application/pdf' });
        const file = new File([blob], `${invoice.invoiceNumber || 'invoice'}.pdf`, { type: 'application/pdf' });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({ files: [file], title: `Invoice ${invoice.invoiceNumber}`, text });
          return;
        }
      }
      if (navigator.share) {
        await (navigator as any).share({ title: `Invoice ${invoice.invoiceNumber}`, text });
        return;
      }
    } catch (e) {
      console.error('Share failed', e);
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              AI Invoice Generator
            </h1>
            <div className="flex items-center space-x-2">
               <button
                  onClick={() => setIsCustomerManagerOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Customers
                </button>
              <>
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 14a1 1 0 011-1h2v-3a1 1 0 112 0v3h2a1 1 0 011 1v2h2a1 1 0 110 2H5a1 1 0 110-2h2v-2H4a1 1 0 01-1-1zM9 3a1 1 0 00-1 1v6.586L6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414L10 10.586V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.83-4H12a3 3 0 000 6h3zm-7 4a3 3 0 10-2.83-4H5a3 3 0 000 6h3zm9 4a3 3 0 10-2.83-4H17a3 3 0 000 6z" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print
                </button>
              </>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          <div className="no-print">
            <InvoiceForm 
              invoice={invoice} 
              setInvoice={setInvoice}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
          </div>
          <div className="mt-8 lg:mt-0">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 no-print">Invoice Preview</h2>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </main>
      
      {isCustomerManagerOpen && (
        <CustomerManager
          customers={customers}
          onSave={handleSaveCustomer}
          onDelete={handleDeleteCustomer}
          onClose={() => setIsCustomerManagerOpen(false)}
        />
      )}
    </div>
  );
};

export default App;