
import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';
import Input from './common/Input';

interface CustomerManagerProps {
  customers: Customer[];
  onSave: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onClose: () => void;
}

const BLANK_CUSTOMER: Omit<Customer, 'id'> = { name: '', address: '', email: '', phone: '', gstin: '' };

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, onSave, onDelete, onClose }) => {
  const [mode, setMode] = useState<'list' | 'edit' | 'add'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(BLANK_CUSTOMER);

  useEffect(() => {
    if (mode === 'edit' && selectedCustomer) {
      setFormData(selectedCustomer);
    } else if (mode === 'add') {
      setFormData(BLANK_CUSTOMER);
    }
  }, [mode, selectedCustomer]);
  
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMode('edit');
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setMode('add');
  };

  const handleDelete = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      onDelete(customerId);
    }
  };

  const handleFormChange = (field: keyof Omit<Customer, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCancel = () => {
    setMode('list');
    setSelectedCustomer(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerToSave: Customer = {
      ...formData,
      id: selectedCustomer?.id || crypto.randomUUID(),
    };
    onSave(customerToSave);
    setMode('list');
    setSelectedCustomer(null);
  };
  
  const FormView = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" value={formData.name} onChange={e => handleFormChange('name', e.target.value)} required />
      <Input label="Address" value={formData.address} onChange={e => handleFormChange('address', e.target.value)} />
      <Input label="Email" type="email" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} />
      <Input label="Phone" value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)} />
      <Input label="GSTIN" value={formData.gstin || ''} onChange={e => handleFormChange('gstin', e.target.value)} />
      <div className="flex justify-end items-center gap-2 pt-4 border-t">
         <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
        </button>
        <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save Customer
        </button>
      </div>
    </form>
  );

  const ListView = () => (
     <div className="space-y-3">
        <div className="flex justify-end">
             <button onClick={handleAddNew} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Customer
            </button>
        </div>
        {customers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {customers.map(customer => (
                    <li key={customer.id} className="p-3 flex justify-between items-center hover:bg-gray-50 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email} {customer.gstin && `| ${customer.gstin}`}</p>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => handleEdit(customer)} className="text-indigo-600 hover:text-indigo-800 p-2 text-sm font-medium">Edit</button>
                             <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 p-2 text-sm font-medium">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
             <div className="text-center py-10">
                <p className="text-gray-500">No customers found. Add your first customer!</p>
            </div>
        )}
     </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'list' && 'Customer Management'}
            {mode === 'add' && 'Add New Customer'}
            {mode === 'edit' && 'Edit Customer'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            {mode === 'list' ? <ListView /> : <FormView />}
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
