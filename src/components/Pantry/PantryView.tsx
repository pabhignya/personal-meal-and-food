import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PantryItem, StoreType, DepartmentType } from '../../types';
import { STORE_METADATA } from '../../data/defaultData';
import {
  Archive,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  X
} from 'lucide-react';

export const PantryView: React.FC = () => {
  const { pantry, addPantryItem, updatePantryStatus, removePantryItem, sendPantryItemToGrocery } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [storeFilter, setStoreFilter] = useState<StoreType | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [store, setStore] = useState<StoreType>('indian');
  const [dept, setDept] = useState<DepartmentType>('Pantry & Bulk');
  const [status, setStatus] = useState<'in_stock' | 'low' | 'out'>('in_stock');

  const filteredPantry = pantry.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesStore = storeFilter === 'all' || item.store === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleSendToGrocery = (item: PantryItem) => {
    sendPantryItemToGrocery(item.id);
    setToastMsg(`Sent "${item.name}" to your ${STORE_METADATA[item.store].name} grocery list!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPantryItem({
      name: name.trim(),
      quantity: quantity.trim() || '1 item',
      store,
      department: dept,
      status
    });

    setName('');
    setQuantity('');
    setIsAddOpen(false);
  };

  const inStockCount = pantry.filter(p => p.status === 'in_stock').length;
  const lowCount = pantry.filter(p => p.status === 'low').length;
  const outCount = pantry.filter(p => p.status === 'out').length;

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            Pantry & Kitchen Stock
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of what's already at home so you avoid duplicate purchases
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pantry Item</span>
        </button>
      </div>

      {/* Overview Status Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === 'in_stock' ? 'all' : 'in_stock')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'in_stock'
              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">In Stock</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{inStockCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'low'
              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Running Low</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{lowCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'out'
              ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{outCount}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pantry items (e.g. Ghee, Rice, Oats, Turmeric)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value as any)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Stores</option>
            <option value="indian">Indian Store</option>
            <option value="costco">Costco</option>
            <option value="american">American Store</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Pantry Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {filteredPantry.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-slate-600">No pantry items found matching your filters.</p>
          </div>
        ) : (
          filteredPantry.map(item => {
            const storeMeta = STORE_METADATA[item.store];
            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-slate-900">{item.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {item.quantity}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${storeMeta.badgeClass}`}>
                      {storeMeta.shortName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.department} • Updated {item.lastUpdated}
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                    <button
                      onClick={() => updatePantryStatus(item.id, 'in_stock')}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        item.status === 'in_stock'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Stock
                    </button>
                    <button
                      onClick={() => updatePantryStatus(item.id, 'low')}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        item.status === 'low'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => updatePantryStatus(item.id, 'out')}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        item.status === 'out'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Out
                    </button>
                  </div>

                  {/* Send to Grocery button for low or out items */}
                  {(item.status === 'low' || item.status === 'out') && (
                    <button
                      onClick={() => handleSendToGrocery(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Add to grocery shopping list"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                      <span>Reorder</span>
                    </button>
                  )}

                  <button
                    onClick={() => removePantryItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Pantry Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-600" />
                Add Item to Pantry
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kashmiri Chili Powder, Basmati Rice 20lb, Olive Oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity / Stock</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 jar, 5 lbs, 2 bottles"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Where do you buy it?</label>
                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value as StoreType)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="indian">Indian Store</option>
                    <option value="costco">Costco</option>
                    <option value="american">American Store</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value as DepartmentType)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Pantry & Bulk">Pantry & Bulk</option>
                    <option value="Spices & Lentils">Spices & Lentils</option>
                    <option value="Produce">Produce</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Bakery & Grains">Bakery & Grains</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low">Running Low</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Add to Pantry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
