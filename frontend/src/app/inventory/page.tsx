'use client';

import React, { useState } from 'react';
import {
  Milk,
  Plus,
  History,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Edit2,
  Trash2,
  X,
  Check,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { useDairyPulse } from '@/context/DairyPulseContext';
import { Product, MilkVariant } from '@/types';

export default function MilkInventoryPage() {
  const { products, movements, openModal, addProduct, updateProductPrice, deleteProduct } = useDairyPulse();
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal States for Variety Management
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Reset form
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
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-purpose="page-header">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Milk Inventory & Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track milk storage silos, manage milk varieties, set pricing, and log movements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => openModal('logWastage')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Log Wastage</span>
          </button>
          <button
            onClick={() => openModal('addStock')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Intake Stock</span>
          </button>
          <button
            onClick={() => setIsAddVarietyOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>+ Add Milk Variety</span>
          </button>
        </div>
      </section>

      {/* 4 Metric KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" data-purpose="inventory-metrics">
        {/* Total Stock */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Total Stock</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {totalStock.toLocaleString()} L
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">{products.length} Varieties</p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Milk className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Received Today */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Intake Today</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                +{totalReceivedToday.toLocaleString()} L
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Intake batches</p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Dispatched Today */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Dispatched</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                -{totalDispatchedToday.toLocaleString()} L
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Active routes</p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Wastage */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">Wastage / Loss</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 tabular-nums">
                {totalWastageToday} L
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">Handling loss</p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Stock by Variant Grid with Price Editing & Variety Removal */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Milk Varieties & Storage Silos ({products.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage variants, adjust selling and procurement prices, or remove varieties.
            </p>
          </div>
          <button
            onClick={() => setIsAddVarietyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variety</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const percentage = Math.min(100, Math.round((p.availableStock / 2000) * 100));
            return (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 hover:border-slate-300 transition">
                {/* Header: Title, Status, and Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{p.name || p.variant}</h4>
                    <span className="text-[10px] text-slate-400">{p.variant}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        p.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => handleOpenEditPrice(p)}
                      title="Change Price"
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(p)}
                      title="Remove Variety"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Level & Price */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {p.availableStock} <span className="text-xs font-normal text-slate-400">Litres</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-700 tabular-nums">
                      ₹{p.sellingPrice}<span className="text-[10px] font-normal text-slate-400">/L</span>
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums">Cost: ₹{p.costPrice}/L</div>
                  </div>
                </div>

                {/* Storage Silo Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        p.status === 'In Stock' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>FAT: {p.fatContent}% | SNF: {p.snfContent}%</span>
                    <span>Min: {p.lowStockThreshold}L</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditPrice(p)}
                    className="w-full py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-semibold rounded-xl border border-slate-200 hover:border-emerald-200 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change Price (₹{p.sellingPrice})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Movement Ledger Table */}
      <section className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Auditable Inventory Movement Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Traceable movements: farm intake, dispatch runs, wastage, and calibrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Transactions</option>
              <option value="RECEIPT">Intake Receipts</option>
              <option value="DISPATCH">Dispatches</option>
              <option value="WASTAGE">Wastage Logs</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-2.5 font-medium">Timestamp</th>
                <th className="pb-2.5 font-medium">Variant</th>
                <th className="pb-2.5 font-medium">Type</th>
                <th className="pb-2.5 font-medium text-center">Quantity</th>
                <th className="pb-2.5 font-medium">Source / Route</th>
                <th className="pb-2.5 font-medium">Notes & Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Milk className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-sm text-slate-600">No stock movements recorded yet</span>
                      <span className="text-xs text-slate-400">Record a new intake using &apos;+ Add Stock Intake&apos; above</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-700">
                      <div>{m.timestamp}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{m.date}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-800">{m.productVariant}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.type === 'RECEIPT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.type === 'DISPATCH'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-slate-800 tabular-nums">
                      {m.type === 'RECEIPT' ? '+' : '-'} {m.quantity} L
                    </td>
                    <td className="py-3 font-medium text-slate-600">{m.supplierOrBatch}</td>
                    <td className="py-3 text-slate-500">
                      {m.notes || (m.ratePerLiter ? `₹${m.ratePerLiter}/L purchase cost` : 'Standard handling')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW MILK VARIETY                            */}
      {/* ======================================================== */}
      {isAddVarietyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Milk Variety</h3>
                <p className="text-[11px] text-slate-400">Add a new milk type or product to your dairy inventory</p>
              </div>
              <button
                onClick={() => setIsAddVarietyOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVarietySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variety Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  placeholder="e.g. Pure A2 Gir Cow Milk"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Variant Tag / SKU
                </label>
                <input
                  type="text"
                  value={varVariant}
                  onChange={(e) => setVarVariant(e.target.value)}
                  placeholder="e.g. Gir Cow Milk"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹/L) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={varSellingPrice}
                    onChange={(e) => setVarSellingPrice(e.target.value)}
                    placeholder="65"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost / Intake Price (₹/L)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={varCostPrice}
                    onChange={(e) => setVarCostPrice(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    FAT Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={varFat}
                    onChange={(e) => setVarFat(e.target.value)}
                    placeholder="4.5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SNF Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={varSnf}
                    onChange={(e) => setVarSnf(e.target.value)}
                    placeholder="8.5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Stock (Litres)
                  </label>
                  <input
                    type="number"
                    value={varStock}
                    onChange={(e) => setVarStock(e.target.value)}
                    placeholder="200"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert (L)
                  </label>
                  <input
                    type="number"
                    value={varThreshold}
                    onChange={(e) => setVarThreshold(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVarietyOpen(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Milk Variety'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CHANGE MILK VARIETY PRICE                       */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Price</h3>
                <p className="text-[11px] text-slate-500 font-medium">{editingProduct.name || editingProduct.variant}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Selling Rate (₹ / Liter) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(e.target.value)}
                    placeholder="65"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procurement / Cost Rate (₹ / Liter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    placeholder="50"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                Updated pricing takes effect for all new dispatches and daily deliveries immediately.
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update Price'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE / REMOVE VARIETY CONFIRMATION            */}
      {/* ======================================================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Milk Variety?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>{deletingProduct.name || deletingProduct.variant}</strong> from your dairy catalog?
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div className="flex justify-between">
                <span>Current Stock:</span>
                <span className="font-semibold text-slate-800">{deletingProduct.availableStock} Litres</span>
              </div>
              <div className="flex justify-between">
                <span>Selling Price:</span>
                <span className="font-semibold text-slate-800">₹{deletingProduct.sellingPrice}/L</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Removing...' : 'Yes, Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
