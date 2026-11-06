'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Settings,
  DollarSign,
  Users,
  Check,
  Milk,
  MessageSquare,
} from 'lucide-react';
import {
  MonthlyDueRemindersResponse,
  WhatsAppReminderItem,
} from '@/types';
import {
  getMonthlyDueRemindersApi,
  postCustomerWhatsAppReminderApi,
  postBroadcastWhatsAppRemindersApi,
  postUpdateReminderSettingsApi,
} from '@/lib/api';

interface MonthEndWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function MonthEndWhatsAppModal({
  isOpen,
  onClose,
  onSuccess,
}: MonthEndWhatsAppModalProps) {
  const [data, setData] = useState<MonthlyDueRemindersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState<WhatsAppReminderItem | null>(null);
  
  // Settings toggle & inputs
  const [showSettings, setShowSettings] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Status message within modal
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setStatusNotice(null);
    try {
      const res = await getMonthlyDueRemindersApi();
      if (res) {
        setData(res);
        setUpiIdInput(res.upi_id || '');
        setAutoRemindersEnabled(res.auto_reminders_enabled ?? true);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    } else {
      setPreviewCustomer(null);
      setStatusNotice(null);
      setShowSettings(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendSingle = async (item: WhatsAppReminderItem) => {
    // 1. Open WhatsApp Web / App directly in new tab with prefilled message
    if (item.whatsapp_url) {
      window.open(item.whatsapp_url, '_blank', 'noopener,noreferrer');
    }

    // 2. Mark reminder as sent on backend
    try {
      const res = await postCustomerWhatsAppReminderApi(item.customer_id);
      if (res && res.last_reminder_sent) {
        // Update local state timestamp
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            customers: prev.customers.map((c) =>
              c.customer_id === item.customer_id
                ? { ...c, last_reminder_sent: res.last_reminder_sent }
                : c
            ),
          };
        });
        setStatusNotice(`WhatsApp reminder sent to ${item.customer_name}!`);
      }
    } catch (err) {
      console.error('Error logging reminder send:', err);
    }
  };

  const handleCopySingle = (item: WhatsAppReminderItem) => {
    navigator.clipboard.writeText(item.message_text);
    setCopiedId(item.customer_id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAll = () => {
    if (!data || !data.customers.length) return;
    const combined = data.customers
      .map(
        (c, idx) =>
          `------------------------------\nCUSTOMER #${idx + 1}: ${c.customer_name} (${c.phone})\nDUE: Rs. ${c.balance.toFixed(2)}\n------------------------------\n${c.message_text}\n`
      )
      .join('\n\n');
    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleBroadcastAll = async () => {
    if (!data || data.customers.length === 0) return;
    setBroadcasting(true);
    setStatusNotice(null);
    try {
      const res = await postBroadcastWhatsAppRemindersApi({
        billing_month: data.billing_month,
      });

      if (res && res.status === 'SUCCESS') {
        setStatusNotice(
          `🎉 Successfully broadcasted month-end reminders to ${res.total_reminders} customers totaling ₹${res.total_amount.toLocaleString()}!`
        );
        if (onSuccess) {
          onSuccess(res.message);
        }
        // Refresh local list with updated timestamps
        await fetchData();
      } else {
        setStatusNotice('Broadcast completed.');
      }
    } catch (err) {
      console.error('Broadcast failed:', err);
      setStatusNotice('Error dispatching broadcast.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await postUpdateReminderSettingsApi({
        upi_id: upiIdInput.trim(),
        auto_reminders: autoRemindersEnabled,
      });
      if (res && res.status === 'success') {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        // Refresh reminder messages with updated UPI ID
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Month-End WhatsApp Dues Broadcast</h3>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Automated
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                {data ? `${data.dairy_name} • Month: ${data.billing_month}` : 'Loading month-end customer ledger...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                showSettings ? 'bg-white text-emerald-800' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Reminder Settings (UPI ID & Schedule)"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notice Banner */}
        {statusNotice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Settings Drawer / Accordion */}
        {showSettings && (
          <form
            onSubmit={handleSaveSettings}
            className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-xs space-y-3 animate-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700" />
                <h4 className="font-extrabold text-slate-900 text-sm">Month-End Automated Reminder Settings</h4>
              </div>
              {settingsSuccess && (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                  <Check className="w-3.5 h-3.5" /> Saved Successfully!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Dairy UPI ID for Quick Customer Payment
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="e.g. yourdairy@okhdfcbank"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Embedded into 1-click UPI pay links sent in every WhatsApp message.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Auto-Dispatch on Month-End
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRemindersEnabled}
                      onChange={(e) => setAutoRemindersEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs font-bold text-slate-800">
                    {autoRemindersEnabled ? 'Enabled (Auto on 30th/31st)' : 'Manual Dispatch Only'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  When enabled, DairyPulse queues month-end notices automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Customers with Dues</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
                {data ? data.total_customers_with_dues : '—'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Need reminder notice</div>
            </div>

            <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200">
              <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Total Due Amount</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tabular-nums">
                ₹{data ? data.total_due_amount.toLocaleString() : '0.00'}
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-0.5">Pending collection</div>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click UPI Pay</span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-950 mt-1 truncate">
                {data?.upi_id || 'dairypulse@okhdfcbank'}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Configured VPA</div>
            </div>

            <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200">
              <div className="flex items-center gap-1.5 text-indigo-800 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto Schedule</span>
              </div>
              <div className="text-xs font-extrabold text-indigo-950 mt-1">
                {data?.auto_reminders_enabled ? 'Active (Month-End)' : 'Manual Mode'}
              </div>
              <div className="text-[10px] text-indigo-700 font-medium mt-0.5">WhatsApp Automation</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Refresh Dues List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleCopyAll}
                disabled={!data || data.customers.length === 0}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied All Dues!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy All Messages</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBroadcastAll}
              disabled={broadcasting || !data || data.customers.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${broadcasting ? 'animate-pulse' : ''}`} />
              <span>
                {broadcasting
                  ? 'Broadcasting Reminders...'
                  : `Broadcast to All (${data?.total_customers_with_dues || 0})`}
              </span>
            </button>
          </div>

          {/* Customers With Dues Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Calculating monthly liters and outstanding dues...</span>
            </div>
          ) : !data || data.customers.length === 0 ? (
            <div className="py-12 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">Zero Outstanding Dues! 🎉</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All customer accounts are completely settled or have advance balances. No WhatsApp reminders needed right now.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Customer</th>
                      <th className="py-2.5 px-3 font-semibold">Milk Plan & Consumption</th>
                      <th className="py-2.5 px-3 font-semibold">Outstanding Due</th>
                      <th className="py-2.5 px-3 font-semibold">Last Reminder</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.customers.map((c) => {
                      const isCopied = copiedId === c.customer_id;
                      return (
                        <tr key={c.customer_id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900">{c.customer_name}</div>
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>{c.phone}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Milk className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{c.milk_plan}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ~{c.monthly_liters} Liters delivered this month
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                              ₹{c.balance.toLocaleString()}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {c.last_reminder_sent ? (
                              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{c.last_reminder_sent}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Not sent yet
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview Message */}
                              <button
                                onClick={() => setPreviewCustomer(c)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                                title="Preview bill message"
                              >
                                Preview
                              </button>

                              {/* Copy message text */}
                              <button
                                onClick={() => handleCopySingle(c)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="Copy WhatsApp message"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Send WhatsApp 1-click */}
                              <button
                                onClick={() => handleSendSingle(c)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                                title="Open WhatsApp chat with bill message"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send WA</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Message Preview Drawer / Modal */}
          {previewCustomer && (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-extrabold text-xs text-white">
                    WhatsApp Message Preview for {previewCustomer.customer_name} ({previewCustomer.phone})
                  </span>
                </div>
                <button
                  onClick={() => setPreviewCustomer(null)}
                  className="text-slate-400 hover:text-white cursor-pointer font-bold text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <pre className="text-[11px] font-mono whitespace-pre-wrap bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                {previewCustomer.message_text}
              </pre>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  Target URL: <code className="text-emerald-400 font-mono">wa.me/{previewCustomer.clean_phone}</code>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySingle(previewCustomer)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => handleSendSingle(previewCustomer)}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-3xl">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct WhatsApp Web / App integration. No expensive SMS credits needed.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
