import React, { useState } from 'react';
import { usePosStore, Salary } from '../store/posStore';
import {
  Plus,
  Trash2,
  Search,
  DollarSign,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SalariesPage() {
  const { salaries, addSalary, deleteSalary, currentCashier } = usePosStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newSalary, setNewSalary] = useState<Partial<Salary>>({
    type: 'full',
    amount: 0,
    employeeName: '',
    notes: ''
  });

  const filteredSalaries = salaries.filter(s =>
    s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSalary = () => {
    if (!newSalary.employeeName || !newSalary.amount) return;

    const salary: Salary = {
      id: `SAL${Date.now()}`,
      employeeName: newSalary.employeeName,
      amount: Number(newSalary.amount),
      type: newSalary.type as 'full' | 'advance',
      date: new Date().toISOString(),
      notes: newSalary.notes
    };

    addSalary(salary);
    setIsAddDialogOpen(false);
    setNewSalary({ type: 'full', amount: 0, employeeName: '', notes: '' });
  };

  if (currentCashier?.role !== 'admin') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <User className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-bold">Access Restricted</h2>
              <p>Only administrators can view this page.</p>
          </div>
      );
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Salaries & Advances</h1>
          <p className="text-slate-500">Manage employee payments and records.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Record Salary
        </Button>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Notes</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No salary records found.
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(salary.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {salary.employeeName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold uppercase",
                        salary.type === 'full'
                          ? "bg-sky-100 text-sky-700"
                          : "bg-orange-100 text-orange-700"
                      )}>
                        {salary.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {salary.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Ksh. {salary.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this record?')) {
                            deleteSalary(salary.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Employee Name</Label>
              <Input
                id="name"
                value={newSalary.employeeName}
                onChange={(e) => setNewSalary({ ...newSalary, employeeName: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Ksh)</Label>
              <Input
                id="amount"
                type="number"
                value={newSalary.amount || ''}
                onChange={(e) => setNewSalary({ ...newSalary, amount: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Payment Type</Label>
              <Select
                value={newSalary.type}
                onValueChange={(val: any) => setNewSalary({ ...newSalary, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Salary</SelectItem>
                  <SelectItem value="advance">Advance Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newSalary.notes}
                onChange={(e) => setNewSalary({ ...newSalary, notes: e.target.value })}
                placeholder="Optional details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSalary} className="bg-emerald-600 hover:bg-emerald-700">Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
