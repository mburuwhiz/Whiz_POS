import { useState, useMemo } from 'react';
import React from 'react';
import { usePosStore } from '../store/posStore';
import { Expense, Supplier } from '../store/posStore';
import { Plus, Edit2, Trash2, Receipt, Calendar, DollarSign, TrendingUp, FileText, User, Phone, MapPin, Search } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Supplies', 'Equipment', 'Rent', 'Utilities', 'Marketing', 
  'Transportation', 'Maintenance', 'Insurance', 'Other'
];

export default function EnhancedExpenseTracker() {
  const { expenses, suppliers, currentCashier, addExpense, updateExpense, deleteExpense, addSupplier, updateSupplier, deleteSupplier } = usePosStore();

  // State for Supplier Detail View
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // State for Forms
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contact: '',
    location: '',
    notes: '',
    active: true
  });

  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'Supplies',
    receiptUrl: ''
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');

  // --- Derived Data: Virtual Suppliers from Legacy Expenses ---
  // Create virtual suppliers for unique expense descriptions (that don't have supplierId)
  // to support legacy data visualization as per request.
  const derivedSuppliers = useMemo(() => {
    const virtualMap = new Map<string, Supplier>();

    // Existing real suppliers
    suppliers.forEach(s => virtualMap.set(s.id, s));

    // Process expenses to find "Legacy Suppliers"
    expenses.forEach(exp => {
      if (!exp.supplierId) {
        // Use description as supplier name for legacy items
        const legacyName = exp.description.trim();
        const virtualId = `legacy-${legacyName}`; // Unique ID for virtual supplier

        if (!virtualMap.has(virtualId)) {
            // Check if we already have a real supplier with this name to avoid dups in display
            const existingReal = suppliers.find(s => s.name.toLowerCase() === legacyName.toLowerCase());
            if (!existingReal) {
                virtualMap.set(virtualId, {
                    id: virtualId,
                    name: legacyName,
                    contact: '',
                    location: 'Legacy Record',
                    active: true,
                    createdAt: exp.timestamp,
                    notes: 'Auto-generated from legacy expense'
                });
            }
        }
      }
    });

    return Array.from(virtualMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses, suppliers]);

  const filteredSuppliers = derivedSuppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contact && s.contact.includes(searchQuery))
  );

  // --- Actions: Supplier ---

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierData: Supplier = {
      id: editingSupplier ? editingSupplier.id : `SUP${Date.now()}`,
      name: supplierFormData.name,
      contact: supplierFormData.contact,
      location: supplierFormData.location,
      notes: supplierFormData.notes,
      active: supplierFormData.active,
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString()
    };

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
    } else {
      addSupplier(supplierData);
    }
    closeSupplierForm();
  };

  const openSupplierForm = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierFormData({
        name: supplier.name,
        contact: supplier.contact,
        location: supplier.location,
        notes: supplier.notes || '',
        active: supplier.active
      });
    } else {
      setEditingSupplier(null);
      setSupplierFormData({ name: '', contact: '', location: '', notes: '', active: true });
    }
    setIsSupplierFormOpen(true);
  };

  const closeSupplierForm = () => {
    setIsSupplierFormOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
      if (id.startsWith('legacy-')) {
          alert("Cannot delete a virtual supplier. Delete the underlying expenses instead.");
          return;
      }
      if (confirm("Delete this supplier?")) {
          deleteSupplier(id);
          if (selectedSupplierId === id) setSelectedSupplierId(null);
      }
  };

  // --- Actions: Expense ---

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) return;

    // If it's a legacy virtual supplier, we can't add to it directly unless we convert it?
    // For now, if adding to legacy, we just create a new expense with that description.
    // Ideally, user should create a real supplier.
    
    // Determine Supplier ID and Name to save
    let finalSupplierId = selectedSupplierId;
    let finalSupplierName = '';

    const supplier = derivedSuppliers.find(s => s.id === selectedSupplierId);
    if (supplier) {
        finalSupplierName = supplier.name;
        // If adding to a legacy supplier, we treat it as just a description match for now
        // OR we should prompt to create real supplier?
        // Let's attach the ID if it's not legacy.
        if (selectedSupplierId.startsWith('legacy-')) {
            finalSupplierId = ''; // No real link, relies on description matching name
        }
    }

    const expenseData: Expense = {
      id: editingExpense?.id || `EXP${Date.now()}`,
      description: expenseFormData.description, // User entered description (e.g., "Flour")
      amount: parseFloat(expenseFormData.amount),
      category: expenseFormData.category,
      receipt: expenseFormData.receiptUrl,
      timestamp: editingExpense?.timestamp || new Date().toISOString(),
      cashier: currentCashier?.name || 'Unknown',
      supplierId: finalSupplierId === '' ? undefined : finalSupplierId,
      supplierName: finalSupplierName
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    closeExpenseForm();
  };

  const openExpenseForm = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        receiptUrl: expense.receipt || ''
      });
    } else {
      setEditingExpense(null);
      setExpenseFormData({ description: '', amount: '', category: 'Supplies', receiptUrl: '' });
    }
    setIsExpenseFormOpen(true);
  };

  const closeExpenseForm = () => {
    setIsExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExpenseFormData(prev => ({ ...prev, receiptUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Render ---

  // Get expenses for selected supplier
  const selectedSupplier = derivedSuppliers.find(s => s.id === selectedSupplierId);
  const supplierExpenses = useMemo(() => {
      if (!selectedSupplier) return [];

      return expenses.filter(exp => {
          // Match by ID
          if (exp.supplierId === selectedSupplier.id) return true;
          // Match by Name (Legacy fallback)
          if (!exp.supplierId && selectedSupplier.id.startsWith('legacy-')) {
              return exp.description.trim().toLowerCase() === selectedSupplier.name.toLowerCase();
          }
          return false;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [expenses, selectedSupplier]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Supplier Expenses</h1>
                <p className="text-gray-600">Manage suppliers and track their expenses</p>
            </div>
            {!selectedSupplierId && (
                <button
                    onClick={() => openSupplierForm()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Supplier</span>
                </button>
            )}
            {selectedSupplierId && (
                <button
                    onClick={() => setSelectedSupplierId(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                    Back to Suppliers
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
            {!selectedSupplierId ? (
                // --- SUPPLIER LIST VIEW ---
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {filteredSuppliers.map(supplier => (
                            <div
                                key={supplier.id}
                                onClick={() => setSelectedSupplierId(supplier.id)}
                                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{supplier.name}</h3>
                                        {!supplier.id.startsWith('legacy-') && (
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openSupplierForm(supplier); }}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(supplier.id); }}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        {supplier.contact && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{supplier.contact}</span>
                                            </div>
                                        )}
                                        {supplier.location && (
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4" />
                                                <span>{supplier.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <span className={`px-2 py-1 rounded-full ${supplier.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {supplier.active ? 'Active' : 'Inactive'}
                                    </span>
                                    {/* Count Expenses if possible, tricky with legacy mapping here efficiently without filtering all, but okay for small scale */}
                                    <span className="text-gray-500 flex items-center space-x-1">
                                        <FileText className="w-4 h-4" />
                                        <span>View Records</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredSuppliers.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                No suppliers found. Add one to get started.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // --- SUPPLIER DETAIL VIEW ---
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-sm">
                    {/* Supplier Info Header */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier?.name}</h2>
                                <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                                    {selectedSupplier?.contact && <span>📞 {selectedSupplier.contact}</span>}
                                    {selectedSupplier?.location && <span>📍 {selectedSupplier.location}</span>}
                                </div>
                                {selectedSupplier?.notes && (
                                    <p className="mt-2 text-sm text-gray-500 italic">"{selectedSupplier.notes}"</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <button
                                    onClick={() => openExpenseForm()}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mb-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Record</span>
                                </button>
                                <div className="text-xl font-bold text-gray-800">
                                    Total: KES {supplierExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expenses Table */}
                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-medium sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Item/Description</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Added By</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {supplierExpenses.map(expense => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">{new Date(expense.timestamp).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{expense.description}</td>
                                        <td className="px-6 py-3">KES {expense.amount.toFixed(2)}</td>
                                        <td className="px-6 py-3">{expense.cashier}</td>
                                        <td className="px-6 py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => openExpenseForm(expense)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { if(confirm('Delete?')) deleteExpense(expense.id); }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Del
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {supplierExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No records found for this supplier.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* --- MODALS --- */}

        {/* Supplier Modal */}
        {isSupplierFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h2 className="text-xl font-bold mb-4">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                    <form onSubmit={handleSupplierSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" required className="w-full border p-2 rounded"
                                value={supplierFormData.name} onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone No</label>
                            <input type="text" className="w-full border p-2 rounded"
                                value={supplierFormData.contact} onChange={e => setSupplierFormData({...supplierFormData, contact: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" className="w-full border p-2 rounded"
                                value={supplierFormData.location} onChange={e => setSupplierFormData({...supplierFormData, location: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Comment/Rating</label>
                            <textarea className="w-full border p-2 rounded" rows={3}
                                value={supplierFormData.notes} onChange={e => setSupplierFormData({...supplierFormData, notes: e.target.value})}
                                placeholder="Accuracy and credibility..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" checked={supplierFormData.active} onChange={e => setSupplierFormData({...supplierFormData, active: e.target.checked})} />
                            <label className="text-sm text-gray-700">Is Active?</label>
                        </div>
                        <div className="flex space-x-3 pt-2">
                            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
                            <button type="button" onClick={closeSupplierForm} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Expense Modal */}
        {isExpenseFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <h2 className="text-xl font-bold mb-4">{editingExpense ? 'Edit Record' : 'Add Record'}</h2>
                    <form onSubmit={handleExpenseSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item/Description</label>
                            <input type="text" required className="w-full border p-2 rounded"
                                value={expenseFormData.description} onChange={e => setExpenseFormData({...expenseFormData, description: e.target.value})}
                                placeholder="e.g. Flour, Omo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input type="number" required className="w-full border p-2 rounded"
                                value={expenseFormData.amount} onChange={e => setExpenseFormData({...expenseFormData, amount: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select className="w-full border p-2 rounded"
                                value={expenseFormData.category} onChange={e => setExpenseFormData({...expenseFormData, category: e.target.value})} >
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Receipt (Optional)</label>
                            <input type="file" accept="image/*" onChange={handleReceiptUpload} className="w-full text-sm" />
                        </div>
                        <div className="flex space-x-3 pt-2">
                            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
                            <button type="button" onClick={closeExpenseForm} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
