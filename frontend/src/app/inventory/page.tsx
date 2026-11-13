'use client';

import React, { useState } from 'react';
import {
  Milk,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Check,
  IndianRupee,
  Layers,
  Calendar,
} from 'lucide-react';
import { PageHead } from '@/components/common/PageHead';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { Product } from '@/types';
import {
  Card,
  StatCard,
  Badge,
  Button,
  PageHeader,
  ProgressBar,
} from '@/components/ui';

export default function MilkInventoryPage() {
  const {
    products,
    movements,
    openModal,
    addProduct,
    updateProductPrice,
    deleteProduct,
    updateIntakeExpiry,
  } = useDairyPulse();

  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal States for Variety Management
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expiry Edit State for Intake Movements
  const [editingMovement, setEditingMovement] = useState<any | null>(null);
  const [newExpiryInput, setNewExpiryInput] = useState('');
  const [isUpdatingExpiry, setIsUpdatingExpiry] = useState(false);

  const handleOpenEditExpiry = (m: any) => {
    setEditingMovement(m);
    setNewExpiryInput(m.expiryDate || new Date().toISOString().split('T')[0]);
  };

  const handleSaveExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement || !newExpiryInput.trim()) return;
    setIsUpdatingExpiry(true);
    await updateIntakeExpiry(editingMovement.id, newExpiryInput.trim());
    setIsUpdatingExpiry(false);
    setEditingMovement(null);
  };

  const getExpiryInfo = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Expired (${Math.abs(diffDays)}d ago)`,
        style: 'bg-orange-50 text-orange-900 border-orange-200 font-semibold',
      };
    } else if (diffDays === 0) {
      return {
        label: 'Expires Today',
        style: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      };
    } else if (diffDays <= 2) {
      return {
        label: `${diffDays}d left (${expiryDate})`,
        style: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      };
    } else {
      return {
        label: `${diffDays}d left (${expiryDate})`,
        style: 'bg-teal-50 text-teal-800 border-teal-200 font-medium',
      };
    }
  };

  // Add Variety Form State
  const [varName, setVarName] = useState('');
  const [varVariant, setVarVariant] = useState('');
  const [varSellingPrice, setVarSellingPrice] = useState('65');
  const [varCostPrice, setVarCostPrice] = useState('50');
  const [varFat, setVarFat] = useState('4.5');
  const [varSnf, setVarSnf] = useState('8.5');
  const [varStock, setVarStock] = useState('200');
  const [varThreshold, setVarThreshold] = useState('50');

  // Edit Price Form State
  const [editSellingPrice, setEditSellingPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');

  const totalStock = products.reduce((acc, p) => acc + p.availableStock, 0);
  const totalReceivedToday = movements
    .filter((m) => m.type === 'RECEIPT')
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalDispatchedToday = movements
    .filter((m) => m.type === 'DISPATCH')
    .reduce((acc, m) => acc + m.quantity, 0);
  const totalWastageToday = movements
    .filter((m) => m.type === 'WASTAGE')
    .reduce((acc, m) => acc + m.quantity, 0);

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.type === filterType;
  });

  // Handle Add Variety Submit
  const handleAddVarietySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varName.trim() || !varSellingPrice) return;

    setIsSubmitting(true);
    const variantTag = varVariant.trim() || varName.trim();
    const sellingPrice = parseFloat(varSellingPrice) || 60;
    const costPrice = parseFloat(varCostPrice) || 45;
    const availableStock = parseFloat(varStock) || 0;
    const lowStockThreshold = parseFloat(varThreshold) || 50;

    await addProduct({
      name: varName.trim(),
      variant: variantTag,
      unit: 'Liter',
      fatContent: parseFloat(varFat) || 4.0,
      snfContent: parseFloat(varSnf) || 8.5,
      sellingPrice,
      costPrice,
      availableStock,
      lowStockThreshold,
      status: availableStock > lowStockThreshold ? 'In Stock' : 'Low Stock',
    });

    setIsSubmitting(false);
    setIsAddVarietyOpen(false);
    setVarName('');
    setVarVariant('');
    setVarSellingPrice('65');
    setVarCostPrice('50');
  };

  // Open Edit Price Dialog
  const handleOpenEditPrice = (p: Product) => {
    setEditingProduct(p);
    setEditSellingPrice(p.sellingPrice.toString());
    setEditCostPrice(p.costPrice.toString());
  };

  // Handle Update Price Submit
  const handleUpdatePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const newSelling = parseFloat(editSellingPrice);
    const newCost = parseFloat(editCostPrice);
    if (isNaN(newSelling)) return;

    setIsSubmitting(true);
    await updateProductPrice(editingProduct.id, newSelling, isNaN(newCost) ? undefined : newCost);
    setIsSubmitting(false);
    setEditingProduct(null);
  };

  // Handle Delete Variety Submit
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    await deleteProduct(deletingProduct.id);
    setIsSubmitting(false);
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHead
        title="Milk Inventory & Storage Tanks"
        description="Track fresh cow and buffalo milk stock, morning and evening milking batches, quality tests, and tank capacities."
      />

      {/* ── Page Header ── */}
      <PageHeader
        title="Milk Inventory & Storage Silos"
        description="Live tank storage levels, FAT/SNF composition, pricing adjustments, and traceable stock movement ledger."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('logWastage')}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            >
              Log Wastage
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('addStock')}
              leftIcon={<Plus className="w-3.5 h-3.5 text-[#0F766E]" />}
            >
              Add Intake Stock
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddVarietyOpen(true)}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              + Add Milk Variety
            </Button>
          </>
        }
      />

      {/* ── 4 KPI Metric Cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-purpose="inventory-metrics">
        <StatCard
          title="Total Stock"
          value={`${totalStock.toLocaleString()} L`}
          subtitle={`${products.length} milk varieties configured`}
          icon={<Milk className="w-5 h-5" />}
          variant="teal"
          trend={{ value: 'Live Silos', isPositive: true }}
        />

        <StatCard
          title="Intake Today"
          value={`+${totalReceivedToday.toLocaleString()} L`}
          subtitle="Collected from morning tankers"
          icon={<ArrowDownRight className="w-5 h-5" />}
          variant="blue"
          trend={{ value: 'Inbound', isPositive: true }}
        />

        <StatCard
          title="Dispatched"
          value={`-${totalDispatchedToday.toLocaleString()} L`}
          subtitle="Sent to active delivery routes"
          icon={<ArrowUpRight className="w-5 h-5" />}
          variant="amber"
          trend={{ value: 'Routes', isPositive: true }}
        />

        <StatCard
          title="Wastage / Loss"
          value={`${totalWastageToday} L`}
          subtitle="Handling & spillage logs"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="terracotta"
          trend={{
            value: totalWastageToday > 0 ? 'Recorded' : 'Zero',
            isPositive: totalWastageToday === 0,
          }}
        />
      </section>

      {/* ── Storage Silos & Milk Varieties Cards ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Storage Silos & Varieties ({products.length})
            </h3>
            <p className="text-xs text-stone-500 font-normal">
              Adjust live selling prices, procurement rates, or catalog listings.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddVarietyOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#0F766E]" />}
          >
            Add Variety
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F6F2EA] text-[#0F766E] flex items-center justify-center border border-stone-200 shadow-2xs mb-3">
              <Milk className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">No Milk Varieties Configured</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 font-normal">
              Add your first milk variety (e.g. Cow Milk, Buffalo Milk, A2 Desi Milk) to manage inventory stock, pricing, and intake.
            </p>
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddVarietyOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add Milk Variety
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const percentage = Math.min(100, Math.round((p.availableStock / 2000) * 100));
              return (
                <div
                  key={p.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(28,25,23,0.04)] hover:border-stone-300 transition-colors space-y-3"
                >
                  {/* Header: Title, Status & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight truncate">
                        {p.name || p.variant}
                      </h4>
                      <span className="text-[10px] text-stone-500 block truncate">{p.variant}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant={p.status === 'In Stock' ? 'success' : 'warning'}
                        dot
                        size="xs"
                      >
                        {p.status}
                      </Badge>
                      <button
                        onClick={() => handleOpenEditPrice(p)}
                        title="Change Price"
                        className="p-1 rounded-lg text-stone-400 hover:text-[#0F766E] hover:bg-teal-50 transition-colors cursor-pointer"
                        aria-label={`Change price for ${p.variant}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        title="Remove Variety"
                        className="p-1 rounded-lg text-stone-400 hover:text-orange-700 hover:bg-orange-50 transition-colors cursor-pointer"
                        aria-label={`Remove variety ${p.variant}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Level & Price */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-2xl font-black text-stone-900 tabular-nums">
                        {p.availableStock}{' '}
                        <span className="text-xs font-normal text-stone-400">Litres</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#0F766E] tabular-nums">
                        ₹{p.sellingPrice}
                        <span className="text-[10px] font-normal text-stone-400">/L</span>
                      </div>
                      <div className="text-[10px] text-stone-500 tabular-nums font-medium">
                        Cost: ₹{p.costPrice}/L
                      </div>
                    </div>
                  </div>

                  {/* Silo Capacity Progress Bar */}
                  <div className="space-y-1">
                    <ProgressBar
                      value={percentage}
                      variant={p.status === 'In Stock' ? 'teal' : 'amber'}
                      size="sm"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                      <span>FAT: {p.fatContent}% | SNF: {p.snfContent}%</span>
                      <span>Min: {p.lowStockThreshold}L</span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenEditPrice(p)}
                      className="w-full py-1.5 px-2 bg-[#F6F2EA] hover:bg-teal-50 hover:text-teal-900 text-stone-700 text-[11px] font-semibold rounded-xl border border-stone-200/70 hover:border-teal-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#0F766E]" />
                      <span>Adjust Price (₹{p.sellingPrice})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Auditable Inventory Movement Ledger ── */}
      <Card
        title="Auditable Movement Ledger"
        subtitle="Traceable transactions: farm intake, morning/evening routes, wastage, and calibrations"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
              aria-label="Filter movement ledger"
            >
              <option value="ALL">All Transactions</option>
              <option value="RECEIPT">Intake Receipts</option>
              <option value="DISPATCH">Dispatches</option>
              <option value="WASTAGE">Wastage Logs</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]" aria-label="Movement Ledger Table">
            <thead>
              <tr className="text-stone-500 font-bold border-b border-stone-200/80 bg-[#F6F2EA]/60">
                <th scope="col" className="py-2.5 px-3 font-semibold rounded-l-lg">Timestamp</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Variety</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Type</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-center">Quantity</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Source / Route</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Expiry / Shelf Life</th>
                <th scope="col" className="py-2.5 px-3 font-semibold rounded-r-lg">Notes & Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Milk className="w-8 h-8 text-stone-300" />
                      <span className="font-semibold text-sm text-stone-600">No stock movements recorded yet</span>
                      <span className="text-xs text-stone-400">Record a new intake using &apos;+ Add Intake Stock&apos; above</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      <div>{m.timestamp}</div>
                      <div className="text-[10px] text-stone-500 font-normal">{m.date}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">{m.productVariant}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          m.type === 'RECEIPT'
                            ? 'success'
                            : m.type === 'DISPATCH'
                            ? 'info'
                            : 'danger'
                        }
                        dot
                        size="xs"
                      >
                        {m.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-stone-900 tabular-nums">
                      {m.type === 'RECEIPT' ? '+' : '-'} {m.quantity} L
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-700">{m.supplierOrBatch}</td>
                    <td className="py-3 px-3">
                      {m.type === 'RECEIPT' ? (
                        m.expiryDate ? (
                          (() => {
                            const info = getExpiryInfo(m.expiryDate);
                            return (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] border ${info?.style}`}
                                >
                                  <Calendar className="w-2.5 h-2.5 mr-1 shrink-0" />
                                  <span>{info?.label}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditExpiry(m)}
                                  title="Change expiry date"
                                  className="p-1 text-stone-400 hover:text-[#0F766E] hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })()
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEditExpiry(m)}
                            className="text-[10px] text-stone-400 hover:text-[#0F766E] font-medium underline flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span>+ Set Expiry</span>
                          </button>
                        )
                      ) : (
                        <span className="text-stone-300 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {m.notes || (m.ratePerLiter ? `₹${m.ratePerLiter}/L purchase cost` : 'Standard handling')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MODAL 1: ADD NEW MILK VARIETY ── */}
      {isAddVarietyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Add New Milk Variety</h3>
                <p className="text-[11px] text-stone-500 font-normal">
                  Add a new milk type or product to your dairy inventory
                </p>
              </div>
              <button
                onClick={() => setIsAddVarietyOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVarietySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Variety Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  placeholder="e.g. Pure A2 Gir Cow Milk"
                  className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Variant Tag / SKU
                </label>
                <input
                  type="text"
                  value={varVariant}
                  onChange={(e) => setVarVariant(e.target.value)}
                  placeholder="e.g. Gir Cow Milk"
                  className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selling Price (₹/L) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={varSellingPrice}
                    onChange={(e) => setVarSellingPrice(e.target.value)}
                    placeholder="65"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden font-bold text-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cost / Intake Price (₹/L)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={varCostPrice}
                    onChange={(e) => setVarCostPrice(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden text-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    FAT Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={varFat}
                    onChange={(e) => setVarFat(e.target.value)}
                    placeholder="4.5"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    SNF Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={varSnf}
                    onChange={(e) => setVarSnf(e.target.value)}
                    placeholder="8.5"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Stock (Litres)
                  </label>
                  <input
                    type="number"
                    value={varStock}
                    onChange={(e) => setVarStock(e.target.value)}
                    placeholder="200"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Low Stock Alert (L)
                  </label>
                  <input
                    type="number"
                    value={varThreshold}
                    onChange={(e) => setVarThreshold(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-1/3"
                  onClick={() => setIsAddVarietyOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-2/3"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save Milk Variety
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CHANGE MILK VARIETY PRICE ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Change Price</h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {editingProduct.name || editingProduct.variant}
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Customer Selling Rate (₹ / Liter) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    placeholder="65"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-sm font-bold text-[#0F766E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Procurement / Cost Rate (₹ / Liter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    placeholder="50"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F6F2EA] border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] transition-all"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-[11px] text-teal-800 font-medium">
                Updated pricing takes effect for all new dispatches and daily deliveries immediately.
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-1/3"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-2/3"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Update Price
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EDIT INTAKE EXPIRY DATE ── */}
      {editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Change Expiry Date</h3>
                  <p className="text-[11px] text-stone-500">
                    {editingMovement.productVariant} ({editingMovement.quantity} L)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMovement(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpiry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Expiry / Best Before Date *
                </label>
                <input
                  type="date"
                  required
                  value={newExpiryInput}
                  onChange={(e) => setNewExpiryInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F2EA] border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden font-semibold text-stone-800"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-500 font-medium">Quick Presets:</span>
                {[
                  { label: '+3 Days', days: 3 },
                  { label: '+5 Days', days: 5 },
                  { label: '+7 Days', days: 7 },
                  { label: '+10 Days', days: 10 },
                ].map((preset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + preset.days);
                  const pDate = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setNewExpiryInput(pDate)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F6F2EA] hover:bg-stone-200 text-stone-700 font-semibold border border-stone-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-1/2"
                  onClick={() => setEditingMovement(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-1/2"
                  isLoading={isUpdatingExpiry}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Update Expiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DELETE VARIETY CONFIRMATION ── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#C2410C] border border-orange-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Remove Milk Variety?</h3>
              <p className="text-xs text-stone-500 mt-1 font-normal">
                Are you sure you want to remove <strong>{deletingProduct.name || deletingProduct.variant}</strong> from your dairy catalog?
              </p>
            </div>

            <div className="bg-[#F6F2EA] p-3 rounded-xl border border-stone-200 text-xs text-stone-600 text-left space-y-1">
              <div className="flex justify-between">
                <span>Current Stock:</span>
                <span className="font-semibold text-stone-800">{deletingProduct.availableStock} Litres</span>
              </div>
              <div className="flex justify-between">
                <span>Selling Price:</span>
                <span className="font-semibold text-stone-800">₹{deletingProduct.sellingPrice}/L</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-1/2"
                onClick={() => setDeletingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                className="w-1/2"
                isLoading={isSubmitting}
                onClick={handleDeleteProduct}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
