
import React from 'react';
import type { Invoice } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const formatINR = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const rowAmount = (q: number, r: number) => q * r;
  const rowGst = (q: number, r: number, p: number) => (q * r * (p || 0)) / 100;
  const subtotal = invoice.items.reduce((s, it) => s + rowAmount(it.quantity, it.rate), 0);
  const totalGst = invoice.items.reduce((s, it) => s + rowGst(it.quantity, it.rate, it.gstPercent || 0), 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const total = subtotal + totalGst;

  return (
    <div className="bg-white rounded-lg shadow-lg" id="invoice-preview-container">
      <div className="p-4 sm:p-6 lg:p-8 min-h-[800px] border border-gray-200 rounded-lg">
        <div id="invoice-preview" className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              {invoice.sender.logo ? (
                <img src={invoice.sender.logo} alt="Logo" className="h-16 w-auto object-contain" />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{invoice.sender.name}</h1>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-500">Tax Invoice</p>
              <p className="text-lg font-semibold text-gray-800">{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">Seller</h3>
              <p className="text-sm text-gray-800">{invoice.sender.name}</p>
              <p className="text-sm text-gray-600">{invoice.sender.address}</p>
              <p className="text-sm text-gray-600">{invoice.sender.email} • {invoice.sender.phone}</p>
              {invoice.sender.gstin && <p className="text-sm text-gray-700 font-medium">GSTIN: {invoice.sender.gstin}</p>}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">Buyer</h3>
              <p className="text-sm text-gray-800">{invoice.recipient.name}</p>
              <p className="text-sm text-gray-600">{invoice.recipient.address}</p>
              <p className="text-sm text-gray-600">{invoice.recipient.email} • {invoice.recipient.phone}</p>
              {invoice.recipient.gstin && <p className="text-sm text-gray-700 font-medium">GSTIN: {invoice.recipient.gstin}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Invoice Date</p>
              <p className="font-medium text-gray-800">{invoice.invoiceDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium text-gray-800">{invoice.dueDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Place of Supply</p>
              <p className="font-medium text-gray-800">{invoice.placeOfSupply}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN/SAC</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST%</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-sm text-gray-800">{it.description}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{it.hsnSacCode || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 text-right">{it.quantity}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 text-right">{formatINR(it.rate)}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 text-right">{it.gstPercent || 0}%</td>
                    <td className="px-3 py-2 text-sm text-gray-800 text-right">{formatINR(rowAmount(it.quantity, it.rate))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              {(invoice.sender.bankName || invoice.sender.bankAccount || invoice.sender.bankIfsc) && (
                <div>
                  <h4 className="font-semibold text-gray-800">Bank Details</h4>
                  {invoice.sender.bankName && <p className="text-gray-700">Bank: {invoice.sender.bankName}{invoice.sender.bankBranch ? `, ${invoice.sender.bankBranch}` : ''}</p>}
                  {invoice.sender.bankAccountName && <p className="text-gray-700">A/C Name: {invoice.sender.bankAccountName}</p>}
                  {invoice.sender.bankAccount && <p className="text-gray-700">A/C No: {invoice.sender.bankAccount}</p>}
                  {invoice.sender.bankIfsc && <p className="text-gray-700">IFSC: {invoice.sender.bankIfsc}</p>}
                </div>
              )}
              {(invoice.terms || invoice.paymentTerms) && (
                <div>
                  <h4 className="font-semibold text-gray-800">Terms & Conditions</h4>
                  {invoice.paymentTerms && <p className="text-gray-700 font-medium">Payment Terms: {invoice.paymentTerms}</p>}
                  {invoice.terms && <p className="text-gray-600 whitespace-pre-line">{invoice.terms}</p>}
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-800">Notes</h4>
                  <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.reverseCharge && (
                <p className="text-sm text-gray-700">GST payable on reverse charge basis.</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST</span>
                    <span className="font-medium text-gray-800">{formatINR(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST</span>
                    <span className="font-medium text-gray-800">{formatINR(sgst)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="text-gray-900 font-bold">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="text-sm">
              <div className="h-16 border border-dashed rounded-md"></div>
              <p className="mt-2 text-gray-700">Customer Signature</p>
            </div>
            <div className="text-sm text-right">
              {invoice.sender.signatureImage ? (
                <img src={invoice.sender.signatureImage} alt="Authorized Signature" className="h-16 w-auto object-contain ml-auto" />
              ) : (
                <div className="h-16 border border-dashed rounded-md"></div>
              )}
              <p className="mt-2 font-medium text-gray-800">{invoice.sender.signatureName || 'Authorized Signatory'}</p>
              {!invoice.sender.signatureImage && invoice.sender.signatureName && (
                <p className="text-xs text-gray-500">(Authorized Signatory)</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
