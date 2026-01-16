import React, { useState, useRef, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FileText, Download, Plus, Trash2, Upload, Image as ImageIcon,
  Settings, User, Calendar, DollarSign, LayoutTemplate
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function InvoiceGenerator() {
  const { businessSetup } = usePosStore();

  // State
  const [type, setType] = useState<'INVOICE' | 'QUOTATION'>('INVOICE');
  const [docNumber, setDocNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Branding State
  const [useCustomHeader, setUseCustomHeader] = useState(false);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Client State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Service / Product Description', quantity: 1, price: 0 }
  ]);

  // Footer State
  const [notes, setNotes] = useState('Thank you for your business!');
  const [paymentInfo, setPaymentInfo] = useState('');

  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputHeaderRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputBgRef = useRef<HTMLInputElement>(null);

  // Initialize defaults from store
  useEffect(() => {
    if (businessSetup) {
      if (!paymentInfo) {
         setPaymentInfo(`Bank: Exmaple Bank\nAcc: 123456789\nM-Pesa Till: ${businessSetup.phone}`);
      }
    }
  }, [businessSetup]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxRate = businessSetup?.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(i => {
      if (i.id === id) {
        return { ...i, [field]: value };
      }
      return i;
    }));
  };

  const generatePDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${type.toLowerCase()}-${docNumber}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col lg:flex-row bg-slate-50 gap-6 p-6 overflow-hidden">

      {/* LEFT PANEL: Editor */}
      <div className="w-full lg:w-5/12 flex flex-col gap-6 bg-white rounded-2xl shadow-sm border border-slate-200 h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-sky-500" />
            Document Editor
          </h2>
          <div className="flex bg-slate-200 rounded-lg p-1">
             <button
               onClick={() => setType('INVOICE')}
               className={cn("px-3 py-1 rounded-md text-sm font-medium transition-all", type === 'INVOICE' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-600 hover:text-slate-900')}
             >
               Invoice
             </button>
             <button
               onClick={() => setType('QUOTATION')}
               className={cn("px-3 py-1 rounded-md text-sm font-medium transition-all", type === 'QUOTATION' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-600 hover:text-slate-900')}
             >
               Quotation
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Branding Section */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <ImageIcon className="w-4 h-4" /> Branding & Assets
               </h3>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Logo</label>
                    <div
                      onClick={() => fileInputLogoRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-sky-400 transition-colors h-24"
                    >
                       {logoImage ? (
                         <img src={logoImage} alt="Logo" className="h-full object-contain" />
                       ) : (
                         <div className="text-center text-slate-400">
                           <Upload className="w-6 h-6 mx-auto mb-1" />
                           <span className="text-xs">Upload Logo</span>
                         </div>
                       )}
                       <input ref={fileInputLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setLogoImage)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Full Header (Overwrites Info)</label>
                    <div
                      onClick={() => fileInputHeaderRef.current?.click()}
                      className={cn("border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-sky-400 transition-colors h-24", useCustomHeader && "border-sky-500 bg-sky-50")}
                    >
                       {headerImage ? (
                         <img src={headerImage} alt="Header" className="h-full object-contain" />
                       ) : (
                         <div className="text-center text-slate-400">
                           <Upload className="w-6 h-6 mx-auto mb-1" />
                           <span className="text-xs">Upload Header</span>
                         </div>
                       )}
                       <input ref={fileInputHeaderRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleImageUpload(e, setHeaderImage); setUseCustomHeader(true); }} />
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Watermark / Background</label>
                    <div
                      onClick={() => fileInputBgRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-sky-400 transition-colors"
                    >
                       <span className="text-xs text-slate-500 flex items-center gap-2">
                         <Upload className="w-4 h-4" />
                         {backgroundImage ? 'Change Background Image' : 'Upload Background Image'}
                       </span>
                       <input ref={fileInputBgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setBackgroundImage)} />
                    </div>
                  </div>
               </div>
            </section>

            <hr className="border-slate-100" />

            {/* Document Details */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Details
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Document #</label>
                    <input type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                  </div>
               </div>
            </section>

             <hr className="border-slate-100" />

            {/* Client Info */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <User className="w-4 h-4" /> Client Information
               </h3>
               <div className="space-y-3">
                  <input type="text" placeholder="Client Name / Contact Person" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                  <input type="text" placeholder="Company Name" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                  <input type="text" placeholder="Address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
                  <input type="email" placeholder="Email Address" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
               </div>
            </section>

            <hr className="border-slate-100" />

            {/* Items */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <DollarSign className="w-4 h-4" /> Line Items
               </h3>
               <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start group">
                       <span className="text-xs text-slate-400 py-3 w-4">{index + 1}.</span>
                       <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500"
                          />
                          <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500"
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                                className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500"
                            />
                          </div>
                       </div>
                       <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
                  <button onClick={addItem} className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-sky-600 transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
               </div>
            </section>

            <hr className="border-slate-100" />

            {/* Footer */}
            <section className="space-y-4 pb-12">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Footer & Notes</h3>
               <textarea
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="w-full h-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
                 placeholder="Thank you note..."
               />
               <textarea
                 value={paymentInfo}
                 onChange={(e) => setPaymentInfo(e.target.value)}
                 className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400 font-mono"
                 placeholder="Payment Details..."
               />
            </section>

        </div>
      </div>

      {/* RIGHT PANEL: Preview */}
      <div className="flex-1 bg-slate-200/50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="font-bold text-slate-700">Live Preview</h2>
            <button
              onClick={generatePDF}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
         </div>

         <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100">
            {/* A4 Paper */}
            <div
               ref={previewRef}
               className="bg-white shadow-xl relative text-slate-800 leading-normal"
               style={{
                 width: '210mm',
                 minHeight: '297mm',
                 padding: '0',
                 boxSizing: 'border-box'
               }}
            >
               {backgroundImage && (
                 <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
                    <img src={backgroundImage} className="w-full h-full object-cover" alt="bg" />
                 </div>
               )}

               {/* DOCUMENT CONTENT */}
               <div className="relative z-10 flex flex-col h-full min-h-[297mm]">

                  {/* Header */}
                  <div className="bg-sky-900 text-white p-12 pb-8">
                     <div className="flex justify-between items-start">
                        {/* Left: Logo/Brand */}
                        <div className="w-1/2">
                           {useCustomHeader && headerImage ? (
                             <img src={headerImage} alt="Header" className="max-w-full max-h-32 object-contain" />
                           ) : (
                             <div className="space-y-4">
                                {logoImage && <img src={logoImage} alt="Logo" className="h-20 object-contain mb-4" />}
                                <div>
                                   <h1 className="text-3xl font-bold">{businessSetup?.businessName || 'Your Business Name'}</h1>
                                   <p className="opacity-80 text-sm whitespace-pre-line mt-2">
                                     {businessSetup?.address || 'Address Line 1'}{'\n'}
                                     {businessSetup?.phone || 'Phone Number'}{'\n'}
                                     {businessSetup?.email || 'Email Address'}
                                   </p>
                                </div>
                             </div>
                           )}
                        </div>

                        {/* Right: Document Title */}
                        <div className="text-right">
                           <h2 className="text-5xl font-black opacity-20 tracking-widest">{type}</h2>
                           <div className="mt-4 inline-block text-right">
                              <div className="flex justify-end gap-4 text-sm mb-1">
                                <span className="opacity-70 uppercase tracking-wider">Date:</span>
                                <span className="font-bold">{date}</span>
                              </div>
                              <div className="flex justify-end gap-4 text-sm">
                                <span className="opacity-70 uppercase tracking-wider">No:</span>
                                <span className="font-bold">{docNumber}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Bill To */}
                  <div className="px-12 py-8">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To:</h3>
                     <div className="text-lg font-bold text-slate-800">{clientCompany || 'Company Name'}</div>
                     <div className="text-slate-600">
                        {clientName && <div>{clientName}</div>}
                        {clientAddress && <div>{clientAddress}</div>}
                        {clientEmail && <div>{clientEmail}</div>}
                     </div>
                  </div>

                  {/* Table */}
                  <div className="px-12 flex-1">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b-2 border-sky-900">
                              <th className="py-3 font-bold text-sky-900 w-16">#</th>
                              <th className="py-3 font-bold text-sky-900">Description</th>
                              <th className="py-3 font-bold text-sky-900 text-center w-24">Qty</th>
                              <th className="py-3 font-bold text-sky-900 text-right w-32">Price</th>
                              <th className="py-3 font-bold text-sky-900 text-right w-32">Amount</th>
                           </tr>
                        </thead>
                        <tbody>
                           {items.map((item, index) => (
                             <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-4 text-slate-500">{index + 1}</td>
                                <td className="py-4 font-medium">{item.description}</td>
                                <td className="py-4 text-center">{item.quantity}</td>
                                <td className="py-4 text-right">{item.price.toLocaleString()}</td>
                                <td className="py-4 text-right font-bold text-slate-700">{(item.quantity * item.price).toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                     </table>

                     {/* Totals */}
                     <div className="mt-8 flex justify-end">
                        <div className="w-64 space-y-2">
                           <div className="flex justify-between text-slate-600">
                              <span>Subtotal:</span>
                              <span>{subtotal.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-slate-600">
                              <span>Tax ({taxRate}%):</span>
                              <span>{taxAmount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-xl font-bold text-sky-900 pt-2 border-t-2 border-sky-900">
                              <span>Total:</span>
                              <span>{total.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer Info */}
                  <div className="px-12 py-12">
                     <div className="grid grid-cols-2 gap-12">
                        <div>
                           <h4 className="font-bold text-sky-900 mb-2">Payment Details</h4>
                           <p className="text-sm text-slate-600 whitespace-pre-wrap">{paymentInfo}</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-sky-900 mb-2">Notes</h4>
                           <p className="text-sm text-slate-600 whitespace-pre-wrap">{notes}</p>
                        </div>
                     </div>
                  </div>

                  {/* Branding Footer */}
                  <div className="bg-slate-100 p-4 text-center text-xs text-slate-400 mt-auto">
                     Powered by Whizpoint Solutions • 0740 841 168
                  </div>

               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
