import React, { useState, useRef, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import {
  FileText, Download, Plus, Trash2, Upload, Image as ImageIcon,
  Settings, User, Calendar, DollarSign, LayoutTemplate,
  Printer, Eye, FileOutput, FileInput, AlertTriangle, Scale, CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DocumentModal } from '../components/invoice/DocumentModal';
import { DOCUMENT_TEMPLATES } from '../components/invoice/documentData';
import { DocumentType } from '../components/invoice/DocumentPreview';

// Types
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const DOCUMENT_TYPES: { id: DocumentType; label: string; icon: any; category: 'transaction' | 'letter' }[] = [
  // Transactional
  { id: 'QUOTATION', label: 'Quotation', icon: FileInput, category: 'transaction' },
  { id: 'PURCHASE_ORDER', label: 'Purchase Order', icon: FileText, category: 'transaction' },
  { id: 'WORK_ORDER', label: 'Work Order', icon: Settings, category: 'transaction' },
  { id: 'DELIVERY_NOTE', label: 'Delivery Note', icon: FileOutput, category: 'transaction' },
  { id: 'INVOICE', label: 'Invoice', icon: DollarSign, category: 'transaction' },
  // Letters
  { id: 'COMPLETION_CERTIFICATE', label: 'Completion Cert', icon: CheckCircle, category: 'letter' },
  // Letters
  { id: 'PAYMENT_RECEIPT', label: 'Payment Receipt', icon: CheckCircle, category: 'letter' },
  { id: 'PAYMENT_REMINDER', label: 'Payment Reminder', icon: AlertTriangle, category: 'letter' },
  { id: 'DEMAND_LETTER_FULL', label: 'Demand (Full)', icon: AlertTriangle, category: 'letter' },
  { id: 'DEMAND_LETTER_PARTIAL', label: 'Demand (Partial)', icon: AlertTriangle, category: 'letter' },
  { id: 'SETTLEMENT_OFFER', label: 'Settlement Offer', icon: Scale, category: 'letter' },
  { id: 'FINAL_NOTICE', label: 'Final Notice', icon: AlertTriangle, category: 'letter' },
  { id: 'LEGAL_NOTICE', label: 'Legal Notice', icon: Scale, category: 'letter' },
];

export default function InvoiceGenerator() {
  const { businessSetup } = usePosStore();

  // Document State
  const [docType, setDocType] = useState<DocumentType>('INVOICE');
  const [docNumber, setDocNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Letter State
  const [subject, setSubject] = useState('');
  // const [bodyText, setBodyText] = useState(''); // REPLACED BY TEMPLATE LOGIC
  const [templateString, setTemplateString] = useState('');

  // Specific Form Fields
  const [partialAmount, setPartialAmount] = useState(0);
  const [settlementDate, setSettlementDate] = useState('');
  const [daysNotice, setDaysNotice] = useState(7);
  const [paymentMode, setPaymentMode] = useState('');
  const [projectReference, setProjectReference] = useState('');

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

  // Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPaperSize, setPreviewPaperSize] = useState<'a4' | 'a5'>('a4');

  // Refs
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

  // Handle Document Type Change
  const handleTypeChange = (newType: DocumentType) => {
    setDocType(newType);

    // Auto-generate number prefix
    const prefixMap: Record<string, string> = {
      QUOTATION: 'QTN', PURCHASE_ORDER: 'PO', WORK_ORDER: 'WO', DELIVERY_NOTE: 'DN',
      COMPLETION_CERTIFICATE: 'CC', INVOICE: 'INV', PAYMENT_RECEIPT: 'RCT',
      PAYMENT_REMINDER: 'REM', DEMAND_LETTER_FULL: 'DMD', DEMAND_LETTER_PARTIAL: 'DMD',
      SETTLEMENT_OFFER: 'SET', FINAL_NOTICE: 'FNL', LEGAL_NOTICE: 'LGL'
    };

    setDocNumber(`${prefixMap[newType] || 'DOC'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);

    // Auto-fill template content
    // Map types to template keys
    let templateKey = '';
    if (newType === 'PAYMENT_REMINDER') templateKey = 'PAYMENT_REMINDER_SOFT';
    else if (newType === 'COMPLETION_CERTIFICATE') templateKey = 'DELIVERY_CONFIRMATION';
    else if (newType === 'DEMAND_LETTER_FULL') templateKey = 'DEMAND_LETTER_FULL';
    else if (newType === 'DEMAND_LETTER_PARTIAL') templateKey = 'DEMAND_LETTER_PARTIAL';
    else if (newType === 'FINAL_NOTICE') templateKey = 'FINAL_NOTICE';
    else if (newType === 'PAYMENT_RECEIPT') templateKey = 'PAYMENT_RECEIPT_LETTER'; // If used as letter
    // Invoice cover letter is usually separate, but if selected...

    const template = (DOCUMENT_TEMPLATES as any)[templateKey];
    if (template) {
      setSubject(template.subject);
      setTemplateString(template.body);
    } else {
       // Reset if switching back to transaction or unknown
       setTemplateString('');
       if (['INVOICE', 'QUOTATION', 'PURCHASE_ORDER'].includes(newType)) {
          setSubject('');
       }
    }
  };

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

  const openPreview = (size: 'a4' | 'a5') => {
    setPreviewPaperSize(size);
    setIsPreviewOpen(true);
  };

  const isLetter = DOCUMENT_TYPES.find(t => t.id === docType)?.category === 'letter';

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">

      {/* Header Area */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <LayoutTemplate className="w-6 h-6 text-sky-600" />
             Document Generator
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create Quotes, Invoices, Orders & Legal Notices</p>
        </div>

        <div className="flex gap-3">
           <button
             onClick={() => openPreview('a4')}
             className="flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-500 hover:text-sky-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
           >
             <Eye className="w-4 h-4" /> Preview A4
           </button>
           <button
             onClick={() => openPreview('a5')}
             className="flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-500 hover:text-sky-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
           >
             <Eye className="w-4 h-4" /> Preview A5
           </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Settings & Branding */}
        <div className="space-y-6">

           {/* Document Type Selector */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Document Type</h3>
              <div className="grid grid-cols-2 gap-2">
                 {DOCUMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2",
                        docType === type.id
                          ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm ring-1 ring-sky-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                       <type.icon className={cn("w-3.5 h-3.5", docType === type.id ? "text-sky-500" : "text-slate-400")} />
                       {type.label}
                    </button>
                 ))}
              </div>
           </div>

           {/* Branding */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <ImageIcon className="w-4 h-4" /> Branding
               </h3>

               <div className="space-y-3">
                  <div
                    onClick={() => fileInputLogoRef.current?.click()}
                    className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                     <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoImage ? <img src={logoImage} className="w-full h-full object-contain" /> : <Upload className="w-4 h-4 text-slate-400" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700">Upload Logo</div>
                        <div className="text-[10px] text-slate-400 truncate">Replaces default text logo</div>
                     </div>
                     <input ref={fileInputLogoRef} type="file" className="hidden" onChange={(e) => handleImageUpload(e, setLogoImage)} />
                  </div>

                  <div
                    onClick={() => fileInputHeaderRef.current?.click()}
                    className={cn(
                      "flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors",
                      useCustomHeader && "border-sky-500 bg-sky-50"
                    )}
                  >
                     <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {headerImage ? <img src={headerImage} className="w-full h-full object-contain" /> : <LayoutTemplate className="w-4 h-4 text-slate-400" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700">Full Header Image</div>
                        <div className="text-[10px] text-slate-400 truncate">Replaces entire header area</div>
                     </div>
                     <input ref={fileInputHeaderRef} type="file" className="hidden" onChange={(e) => { handleImageUpload(e, setHeaderImage); setUseCustomHeader(true); }} />
                  </div>

                  <div
                    onClick={() => fileInputBgRef.current?.click()}
                    className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                     <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {backgroundImage ? <img src={backgroundImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-400" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-700">Watermark / Background</div>
                        <div className="text-[10px] text-slate-400 truncate">Applied to all pages</div>
                     </div>
                     <input ref={fileInputBgRef} type="file" className="hidden" onChange={(e) => handleImageUpload(e, setBackgroundImage)} />
                  </div>
               </div>
           </div>

           {/* Details */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Document Details
               </h3>
               <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Ref Number</label>
                    <input type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Issue Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                    </div>
                  </div>
               </div>
           </div>

        </div>

        {/* CENTER & RIGHT: Main Content */}
        <div className="lg:col-span-2 space-y-6">

            {/* Client Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                 <User className="w-4 h-4" /> Recipient Details
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Company Name" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                  <input type="text" placeholder="Contact Person" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                  <input type="email" placeholder="Email Address" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                  <input type="text" placeholder="Physical Address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
               </div>
            </div>

            {/* CONDITIONAL EDITOR: ITEMS OR TEXT */}
            {!isLetter ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4" /> Line Items
                </h3>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                       <span className="text-xs text-slate-400 py-2 w-6 text-center">{index + 1}</span>
                       <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="col-span-2">
                             <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500 text-center"
                            />
                          </div>
                          <div className="col-span-3">
                             <input
                                type="number"
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-sky-500 text-right"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                             <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button onClick={addItem} className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors">
                      <Plus className="w-4 h-4" /> Add Line Item
                    </button>
                    <div className="text-right">
                       <div className="text-xs text-slate-500">Total Amount</div>
                       <div className="text-xl font-bold text-slate-800">{total.toLocaleString()}</div>
                    </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                   <FileText className="w-4 h-4" /> Letter Details
                 </h3>

                 <div className="space-y-4">
                    {/* Common Subject Line */}
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Subject Line</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 font-medium"
                      />
                    </div>

                    {/* Specific Fields based on Document Type */}

                    {docType === 'DEMAND_LETTER_PARTIAL' && (
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Total Outstanding</label>
                            <div className="text-sm font-bold text-slate-700 px-3 py-2 bg-slate-100 rounded-lg border border-transparent">
                                {total.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Calculated from Line Items (hidden)</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Partial Amount Requested</label>
                            <input
                              type="number"
                              value={partialAmount}
                              onChange={(e) => setPartialAmount(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div>
                             <label className="text-xs text-slate-500 mb-1 block">Final Settlement Date</label>
                             <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
                          </div>
                       </div>
                    )}

                    {docType === 'FINAL_NOTICE' && (
                       <div>
                          <label className="text-xs text-slate-500 mb-1 block">Days Notice (Legal Action)</label>
                          <input
                              type="number"
                              value={daysNotice}
                              onChange={(e) => setDaysNotice(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                            />
                       </div>
                    )}

                    {docType === 'PAYMENT_RECEIPT' && (
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Payment Mode</label>
                           <select
                             value={paymentMode}
                             onChange={(e) => setPaymentMode(e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                           >
                              <option value="">Select Mode...</option>
                              <option value="Cash">Cash</option>
                              <option value="M-Pesa">M-Pesa</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Cheque">Cheque</option>
                           </select>
                        </div>
                    )}

                    {docType === 'COMPLETION_CERTIFICATE' && (
                        <div>
                           <label className="text-xs text-slate-500 mb-1 block">Project Reference</label>
                           <input
                              type="text"
                              value={projectReference}
                              onChange={(e) => setProjectReference(e.target.value)}
                              placeholder="e.g. Website Development Project"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                            />
                        </div>
                    )}
                 </div>
              </div>
            )}

            {/* Footer Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms / Notes</h3>
                     <textarea
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400 resize-none"
                     />
                  </div>
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h3>
                     <textarea
                       value={paymentInfo}
                       onChange={(e) => setPaymentInfo(e.target.value)}
                       className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-400 resize-none font-mono"
                     />
                  </div>
               </div>
            </div>

        </div>
      </div>

      <DocumentModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type={docType}
        initialPaperSize={previewPaperSize}
        branding={{
          logoImage,
          headerImage,
          backgroundImage,
          useCustomHeader,
          businessName: businessSetup?.businessName || 'Your Business',
          address: businessSetup?.address || '',
          phone: businessSetup?.phone || '',
          email: businessSetup?.email || ''
        }}
        data={{
          docNumber,
          date,
          dueDate,
          clientName,
          clientCompany,
          clientAddress,
          clientEmail,
          items,
          subtotal,
          taxAmount,
          total,
          taxRate,
          notes,
          paymentInfo,
          subject,
          bodyText: templateString,
          partialAmount,
          settlementDate,
          daysNotice,
          paymentMode,
          projectReference
        }}
      />
    </div>
  );
}
