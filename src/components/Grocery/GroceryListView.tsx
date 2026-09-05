import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GroceryItem, StoreType, DepartmentType } from '../../types';
import { STORE_METADATA } from '../../data/defaultData';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  PackageCheck,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuantityUnitInput } from '../Common/QuantityUnitInput';

export const GroceryListView: React.FC = () => {
  const {
    groceries,
    toggleGroceryBought,
    removeGroceryItem,
    clearBoughtGroceries,
    moveBoughtToPantry,
    addGroceryItem,
    activeStoreFilter,
    setActiveStoreFilter
  } = useApp();

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Add item form fields
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('1');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemStore, setItemStore] = useState<StoreType>(
    activeStoreFilter === 'all' ? 'indian' : activeStoreFilter
  );
  const [itemDept, setItemDept] = useState<DepartmentType>('Produce');
  const [itemNotes, setItemNotes] = useState('');

  const stores: { id: StoreType | 'all'; label: string; icon: string; accent: string }[] = [
    { id: 'indian', label: 'Indian Grocery', icon: '🇮🇳', accent: 'border-amber-500 text-amber-900' },
    { id: 'american', label: 'American Grocery', icon: '🇺🇸', accent: 'border-blue-500 text-blue-900' },
    { id: 'costco', label: 'Costco Wholesale', icon: '🔴', accent: 'border-red-500 text-red-900' },
    { id: 'all', label: 'All Stores', icon: '🌐', accent: 'border-slate-800 text-slate-900' },
  ];

  const departments: DepartmentType[] = [
    'Produce',
    'Spices & Lentils',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Pantry & Bulk',
    'Bakery & Grains',
    'Frozen',
    'Snacks & Beverages',
    'Other'
  ];

  // Filter groceries by store, department, and search
  const filteredGroceries = groceries.filter(item => {
    const matchesStore = activeStoreFilter === 'all' || item.store === activeStoreFilter;
    const matchesDept = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.recipeTitle && item.recipeTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStore && matchesDept && matchesSearch;
  });

  const unboughtItems = filteredGroceries.filter(g => !g.isBought);
  const boughtItems = filteredGroceries.filter(g => g.isBought);

  // Group unbought items by department
  const groupedByDept = unboughtItems.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const dept = item.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(item);
    return acc;
  }, {});

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const formattedQty = `${itemAmount.trim() || '1'} ${itemUnit}`.trim();

    addGroceryItem({
      name: itemName.trim(),
      quantity: formattedQty,
      store: itemStore,
      department: itemDept,
      notes: itemNotes.trim() || undefined
    });

    setItemName('');
    setItemAmount('1');
    setItemNotes('');
    setIsAddItemOpen(false);
  };

  const handleMoveToPantry = () => {
    moveBoughtToPantry(activeStoreFilter);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className={`space-y-5 pb-20 md:pb-8 max-w-5xl mx-auto ${isShoppingMode ? 'bg-slate-900 min-h-screen text-white p-4 -m-4 sm:-m-6' : ''}`}>
      {/* Top Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isShoppingMode ? 'text-white' : ''}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-black text-xl sm:text-2xl tracking-tight">
              {isShoppingMode ? '🛒 In-Store Shopping Mode' : 'Store-Categorized Grocery List'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {unboughtItems.length} to buy
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organized for efficient shopping at Indian markets, American stores, and Costco
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Shopping Mode Toggle */}
          <button
            onClick={() => setIsShoppingMode(!isShoppingMode)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              isShoppingMode
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isShoppingMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isShoppingMode ? 'Exit Shopping Mode' : 'Shopping Mode'}</span>
          </button>

          {/* Add Item Button */}
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Store Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stores.map(store => {
          const isSelected = activeStoreFilter === store.id;
          const count = groceries.filter(g => !g.isBought && (store.id === 'all' || g.store === store.id)).length;
          const meta = store.id !== 'all' ? STORE_METADATA[store.id] : null;

          return (
            <button
              key={store.id}
              onClick={() => setActiveStoreFilter(store.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? isShoppingMode
                    ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400'
                    : 'bg-white border-emerald-600 ring-2 ring-emerald-600 shadow-md'
                  : isShoppingMode
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{store.icon}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-black ${
                    count > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div className="mt-2">
                <div className={`font-black text-sm ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {store.label}
                </div>
                {meta && (
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {meta.subtext}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Department Filters */}
      {!isShoppingMode && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, notes, or recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Store Sub-Banner Information */}
      {activeStoreFilter !== 'all' && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          STORE_METADATA[activeStoreFilter].badgeClass
        }`}>
          <div>
            <span className="font-bold">{STORE_METADATA[activeStoreFilter].name}: </span>
            <span className="opacity-90">{STORE_METADATA[activeStoreFilter].description}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {unboughtItems.length === 0 && boughtItems.length === 0 && (
        <div className={`p-10 rounded-2xl text-center border-2 border-dashed ${
          isShoppingMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
        }`}>
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-3">
            🛒
          </div>
          <h3 className="font-bold text-base text-slate-800">Your grocery list is empty!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Plan meals in the Meal Planner to automatically populate missing items here, or tap "Add Item" above.
          </p>
        </div>
      )}

      {/* Grouped Grocery Items List (Unbought) */}
      {Object.entries(groupedByDept).map(([dept, items]) => (
        <div
          key={dept}
          className={`rounded-2xl shadow-sm border overflow-hidden ${
            isShoppingMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          {/* Department Header */}
          <div className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between ${
            isShoppingMode ? 'bg-slate-700/70 text-amber-300' : 'bg-slate-100/80 text-slate-700'
          }`}>
            <span>{dept}</span>
            <span className="text-[11px] font-semibold opacity-70">
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Items in this Department */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map(item => {
              const storeMeta = STORE_METADATA[item.store];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleGroceryBought(item.id)}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                    isShoppingMode
                      ? 'hover:bg-slate-700/50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isShoppingMode ? 'border-amber-400' : 'border-slate-400 hover:border-emerald-600'
                      }`}
                    >
                      {item.isBought && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm sm:text-base ${isShoppingMode ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isShoppingMode ? 'bg-slate-700 text-amber-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.quantity}
                        </span>
                      </div>

                      {/* Store & Origin Badges */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${storeMeta.badgeClass}`}>
                          {storeMeta.shortName}
                        </span>
                        {item.recipeTitle && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            For: {item.recipeTitle}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[10px] text-slate-400 italic">
                            ({item.notes})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroceryItem(item.id);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bought / Checked Items Section */}
      {boughtItems.length > 0 && (
        <div className={`rounded-2xl border p-4 shadow-sm ${
          isShoppingMode ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Purchased Items ({boughtItems.length})
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMoveToPantry}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                title="Automatically update your Pantry with these purchased items"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Move to Pantry Stock</span>
              </button>
              <button
                onClick={() => clearBoughtGroceries(activeStoreFilter)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-100/50 transition-colors"
              >
                Clear Checked
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200/50">
            {boughtItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleGroceryBought(item.id)}
                className="py-2.5 flex items-center justify-between gap-3 cursor-pointer opacity-70 hover:opacity-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="line-through font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {item.name} ({item.quantity})
                    </span>
                    <span className="ml-2 text-[10px] text-slate-400">[{STORE_METADATA[item.store].shortName}]</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGroceryItem(item.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Grocery Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Add to Grocery List
              </h3>
              <button onClick={() => setIsAddItemOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Atta (Aashirvaad 10lb), Kirkland Salmon, Ghee"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <QuantityUnitInput
                amount={itemAmount}
                unit={itemUnit}
                onAmountChange={setItemAmount}
                onUnitChange={setItemUnit}
                label="Quantity & Measurement (pcs, weight, box, spoons, etc.)"
                amountPlaceholder="e.g. 2"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Category</label>
                <select
                  value={itemStore}
                  onChange={(e) => setItemStore(e.target.value as StoreType)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="indian">🇮🇳 Indian Grocery</option>
                  <option value="costco">🔴 Costco Wholesale</option>
                  <option value="american">🇺🇸 American Grocery</option>
                  <option value="other">🌐 General / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={itemDept}
                  onChange={(e) => setItemDept(e.target.value as DepartmentType)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Brand preference, organic, sale price"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
