import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Download, Printer, Plus, Trash2,
  Settings, User, Calendar, Hash, Mail, MapPin, Phone,
  CreditCard, AlertCircle, CheckCircle, Clock, Shield,
  FileCheck, Truck, Gavel
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { usePosStore } from '../store/posStore';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

type DocumentType =
  | 'Quote'
  | 'Confirm (LPO/LSO)'
  | 'Deliver'
  | 'Invoice'
  | 'Remind'
  | 'Demand'
  | 'Settle'
  | 'Legal';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const DOCUMENT_TYPES: { type: DocumentType; icon: any; color: string; description: string }[] = [
  { type: 'Quote', icon: FileText, color: 'text-blue-600', description: 'Initial price estimate' },
  { type: 'Confirm (LPO/LSO)', icon: FileCheck, color: 'text-emerald-600', description: 'Order confirmation' },
  { type: 'Deliver', icon: Truck, color: 'text-orange-600', description: 'Delivery note' },
  { type: 'Invoice', icon: FileText, color: 'text-indigo-600', description: 'Request for payment' },
  { type: 'Remind', icon: Clock, color: 'text-yellow-600', description: 'Payment reminder' },
  { type: 'Demand', icon: AlertCircle, color: 'text-red-500', description: 'Formal demand' },
  { type: 'Settle', icon: CheckCircle, color: 'text-green-600', description: 'Payment settlement' },
  { type: 'Legal', icon: Gavel, color: 'text-red-700', description: 'Legal action notice' },
];

export default function InvoiceGenerator() {
  const { businessSetup } = usePosStore();

  // State
  const [docType, setDocType] = useState<DocumentType>('Invoice');
  const [paperSize, setPaperSize] = useState<'a4' | 'a5'>('a4');
  const [docNumber, setDocNumber] = useState(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Client Info
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Service / Product 1', quantity: 1, price: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);

  // Footer
  const [notes, setNotes] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');

  // Customization
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [useCustomHeader, setUseCustomHeader] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Effects
  useEffect(() => {
    // Auto-update document number prefix when type changes
    const prefixMap: Record<string, string> = {
      'Quote': 'QTE',
      'Confirm (LPO/LSO)': 'ORD',
      'Deliver': 'DEL',
      'Invoice': 'INV',
      'Remind': 'REM',
      'Demand': 'DMD',
      'Settle': 'STL',
      'Legal': 'LGL'
    };

    const parts = docNumber.split('-');
    if (parts.length >= 2) {
      const newPrefix = prefixMap[docType] || 'DOC';
      setDocNumber(`${newPrefix}-${parts.slice(1).join('-')}`);
    }

    // Default notes based on type
    const defaultNotes: Record<string, string> = {
      'Quote': 'Valid for 30 days.',
      'Deliver': 'Received the above goods in good condition.',
      'Invoice': 'Payment due upon receipt.',
      'Demand': 'Immediate payment required to avoid further action.'
    };
    if (!notes) setNotes(defaultNotes[docType] || '');

  }, [docType]);

  const handleAddItem = () => {
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      price: 0
    }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setHeaderImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generatePDF = async (format: 'a4' | 'a5') => {
    if (!previewRef.current) return;

    // Switch to target size for capture
    const originalSize = paperSize;
    setPaperSize(format);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');

      // Dimensions in mm
      const pdfWidth = format === 'a4' ? 210 : 148;
      const pdfHeight = format === 'a4' ? 297 : 210;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: format
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${docType}_${docNumber}.pdf`);

    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPaperSize(originalSize);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* LEFT SIDEBAR: Editor */}
      <div className="w-[450px] bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-lg z-10">
        <div className="p-6 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Generator</h1>
            <p className="text-slate-500 text-sm">Create professional business documents.</p>
          </div>

          {/* Document Type Selector */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Label>Document Stage</Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((dt) => {
                const Icon = dt.icon;
                return (
                  <button
                    key={dt.type}
                    onClick={() => setDocType(dt.type)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border text-sm transition-all text-left",
                      docType === dt.type
                        ? "border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{dt.type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Document No.</Label>
                 <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label>Date</Label>
                 <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
               </div>
            </div>
            {docType === 'Invoice' && (
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4" /> Client Details
            </h3>
            <div className="space-y-3">
              <Input placeholder="Company Name" value={clientCompany} onChange={e => setClientCompany(e.target.value)} />
              <Input placeholder="Contact Person" value={clientName} onChange={e => setClientName(e.target.value)} />
              <Input placeholder="Address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                <Input placeholder="Phone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Items
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-start group">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                    />
                    <div className="flex gap-2">
                       <Input
                         type="number"
                         className="w-20"
                         placeholder="Qty"
                         value={item.quantity}
                         onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                       />
                       <Input
                         type="number"
                         className="flex-1"
                         placeholder="Price"
                         value={item.price}
                         onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                       />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddItem} variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4 border-t pt-4">
             <div className="flex items-center gap-4">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
             </div>
          </div>

          {/* Images */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Branding
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label className="text-xs mb-1 block">Logo</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
               </div>
               <div>
                  <Label className="text-xs mb-1 block">Full Header (Optional)</Label>
                  <Input type="file" accept="image/*" onChange={handleHeaderUpload} className="text-xs" />
               </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useHeader"
                checked={useCustomHeader}
                onChange={e => setUseCustomHeader(e.target.checked)}
                className="rounded border-slate-300"
              />
              <Label htmlFor="useHeader" className="text-sm font-normal">Use Full Header Image</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showWatermark"
                checked={showWatermark}
                onChange={e => setShowWatermark(e.target.checked)}
                className="rounded border-slate-300"
              />
              <Label htmlFor="showWatermark" className="text-sm font-normal">Show Watermark</Label>
            </div>
          </div>

          {/* Footer Text */}
          <div className="space-y-4 border-t pt-4 pb-20">
             <div className="space-y-2">
               <Label>Payment Details</Label>
               <Textarea
                 value={paymentInfo}
                 onChange={e => setPaymentInfo(e.target.value)}
                 placeholder="Bank Name, Account No, M-Pesa..."
                 className="h-20"
               />
             </div>
             <div className="space-y-2">
               <Label>Notes / Terms</Label>
               <Textarea
                 value={notes}
                 onChange={e => setNotes(e.target.value)}
                 className="h-20"
               />
             </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="flex-1 bg-slate-800 flex flex-col h-full overflow-hidden">

         {/* Toolbar */}
         <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-4">
               <span className="font-bold text-slate-700">Preview</span>
               <div className="bg-slate-100 rounded-lg p-1 flex">
                 <button
                    onClick={() => setPaperSize('a4')}
                    className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        paperSize === 'a4' ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-800"
                    )}
                 >
                    A4
                 </button>
                 <button
                    onClick={() => setPaperSize('a5')}
                    className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                        paperSize === 'a5' ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-800"
                    )}
                 >
                    A5
                 </button>
               </div>
            </div>

            <div className="flex gap-2">
               <Button
                 onClick={() => generatePDF('a4')}
                 className="bg-sky-600 hover:bg-sky-700"
                 size="sm"
               >
                 <Download className="w-4 h-4 mr-2" /> Save A4
               </Button>
               <Button
                 onClick={() => generatePDF('a5')}
                 className="bg-indigo-600 hover:bg-indigo-700"
                 size="sm"
               >
                 <Download className="w-4 h-4 mr-2" /> Save A5
               </Button>
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-slate-800/50 backdrop-blur-sm">

            {/* The Document Page */}
            <div
               ref={previewRef}
               className="bg-white shadow-2xl relative text-slate-800 flex-shrink-0 transition-all duration-300"
               style={{
                 // Strict Dimensions
                 width: paperSize === 'a4' ? '210mm' : '148mm',
                 minHeight: paperSize === 'a4' ? '297mm' : '210mm',
                 padding: 0,
               }}
            >
               {/* Watermark */}
               {showWatermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                   <div className="transform -rotate-45 text-slate-100 font-black text-9xl uppercase opacity-50 whitespace-nowrap select-none">
                     {docType}
                   </div>
                 </div>
               )}

               {/* CONTENT CONTAINER */}
               <div className="relative z-10 flex flex-col h-full min-h-full">

                  {/* HEADER SECTION */}
                  <div className="p-10 border-b-4 border-sky-900 bg-slate-50">
                     <div className="flex justify-between items-start">
                        {/* Company Identity */}
                        <div className="w-[60%]">
                           {useCustomHeader && headerImage ? (
                             <img src={headerImage} alt="Header" className="w-full max-h-32 object-contain origin-left" />
                           ) : (
                             <div className="space-y-3">
                                {logoImage && <img src={logoImage} alt="Logo" className="h-16 object-contain" />}
                                <div>
                                   <h1 className="text-2xl font-black text-sky-900 uppercase tracking-tight">
                                     {businessSetup?.businessName || 'Your Business Name'}
                                   </h1>
                                   <div className="text-slate-600 text-sm mt-2 space-y-1 font-medium">
                                      <p className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-sky-500" />
                                        {businessSetup?.address || '123 Business Street, City'}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-sky-500" />
                                        {businessSetup?.phone || '+254 700 000 000'}
                                      </p>
                                      {businessSetup?.email && (
                                        <p className="flex items-center gap-2">
                                          <Mail className="w-3 h-3 text-sky-500" />
                                          {businessSetup.email}
                                        </p>
                                      )}
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>

                        {/* Document Meta */}
                        <div className="text-right flex-1">
                           <h2 className="text-4xl font-black text-slate-200 tracking-widest uppercase mb-4">
                             {docType}
                           </h2>
                           <div className="space-y-1">
                              <div className="flex justify-end gap-3 text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-wider">Date:</span>
                                <span className="font-bold text-slate-900">{date}</span>
                              </div>
                              <div className="flex justify-end gap-3 text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-wider">No:</span>
                                <span className="font-bold text-slate-900">{docNumber}</span>
                              </div>
                              {dueDate && (
                                <div className="flex justify-end gap-3 text-sm">
                                  <span className="font-bold text-red-400 uppercase tracking-wider">Due:</span>
                                  <span className="font-bold text-red-600">{dueDate}</span>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* BILL TO */}
                  <div className="px-10 py-8 grid grid-cols-2 gap-8">
                     <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h3>
                        <div className="text-slate-900 font-bold text-lg leading-tight mb-1">
                          {clientCompany || 'Client Company'}
                        </div>
                        <div className="text-slate-600 text-sm space-y-0.5">
                           {clientName && <p>{clientName}</p>}
                           {clientAddress && <p className="max-w-[200px]">{clientAddress}</p>}
                           {clientPhone && <p>{clientPhone}</p>}
                           {clientEmail && <p>{clientEmail}</p>}
                        </div>
                     </div>
                     {/* Could add Ship To here later if needed */}
                  </div>

                  {/* ITEMS TABLE */}
                  <div className="px-10 flex-1">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b-2 border-sky-900">
                              <th className="py-2 text-left text-xs font-bold text-sky-900 uppercase tracking-wider w-12">#</th>
                              <th className="py-2 text-left text-xs font-bold text-sky-900 uppercase tracking-wider">Description</th>
                              <th className="py-2 text-center text-xs font-bold text-sky-900 uppercase tracking-wider w-16">Qty</th>
                              <th className="py-2 text-right text-xs font-bold text-sky-900 uppercase tracking-wider w-24">Price</th>
                              <th className="py-2 text-right text-xs font-bold text-sky-900 uppercase tracking-wider w-24">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {items.map((item, index) => (
                             <tr key={item.id} className="text-sm">
                                <td className="py-3 text-slate-400 font-mono">{index + 1}</td>
                                <td className="py-3 font-medium text-slate-800">{item.description}</td>
                                <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-3 text-right text-slate-600">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td className="py-3 text-right font-bold text-slate-800">{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* TOTALS & SUMMARY */}
                  <div className="px-10 py-4 bg-slate-50/50 break-inside-avoid">
                     <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                           <div className="flex justify-between text-sm text-slate-600">
                              <span>Subtotal</span>
                              <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </div>
                           {taxRate > 0 && (
                             <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax ({taxRate}%)</span>
                                <span>{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                             </div>
                           )}
                           <div className="flex justify-between text-xl font-black text-sky-900 pt-3 border-t-2 border-sky-900">
                              <span>Total</span>
                              <span>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* FOOTER INFO */}
                  <div className="px-10 py-8 mt-auto grid grid-cols-2 gap-12 border-t border-slate-100">
                     <div>
                        <h4 className="font-bold text-sky-900 text-xs uppercase tracking-wider mb-2">Payment Details</h4>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {paymentInfo || "Please verify payment details before sending."}
                        </p>
                     </div>
                     <div>
                        <h4 className="font-bold text-sky-900 text-xs uppercase tracking-wider mb-2">Terms & Notes</h4>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {notes}
                        </p>
                     </div>
                  </div>

                  {/* DEVELOPER BRANDING */}
                  <div className="bg-slate-900 text-white p-3 text-center">
                     <p className="text-[10px] uppercase tracking-widest font-medium opacity-60">
                       Powered by Whizpoint Solutions
                     </p>
                  </div>

               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
