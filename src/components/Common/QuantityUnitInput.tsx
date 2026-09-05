import React from 'react';

export interface UnitGroup {
  groupName: string;
  units: { id: string; label: string }[];
}

export const MEASUREMENT_UNITS: UnitGroup[] = [
  {
    groupName: '🔢 Pieces & Count',
    units: [
      { id: 'pcs', label: 'Pieces (pcs)' },
      { id: 'count', label: 'Count / Whole' },
      { id: 'cloves', label: 'Cloves (garlic)' },
      { id: 'slices', label: 'Slices' },
    ]
  },
  {
    groupName: '⚖️ Weight',
    units: [
      { id: 'lbs', label: 'Pounds (lbs)' },
      { id: 'kg', label: 'Kilograms (kg)' },
      { id: 'g', label: 'Grams (g)' },
      { id: 'oz', label: 'Ounces (oz)' },
    ]
  },
  {
    groupName: '🥄 Spoons & Volume',
    units: [
      { id: 'tbsp', label: 'Tablespoon (tbsp)' },
      { id: 'tsp', label: 'Teaspoon (tsp)' },
      { id: 'cups', label: 'Cups' },
      { id: 'ml', label: 'Milliliters (ml)' },
      { id: 'L', label: 'Liters (L)' },
      { id: 'pinch', label: 'Pinch' },
    ]
  },
  {
    groupName: '📦 Packs & Containers',
    units: [
      { id: 'box', label: 'Box' },
      { id: 'pack', label: 'Pack / Packet' },
      { id: 'bag', label: 'Bag' },
      { id: 'tub', label: 'Tub' },
      { id: 'can', label: 'Can' },
      { id: 'jar', label: 'Jar' },
      { id: 'bottle', label: 'Bottle' },
      { id: 'bunch', label: 'Bunch' },
      { id: 'block', label: 'Block (paneer/tofu)' },
    ]
  }
];

interface QuantityUnitInputProps {
  amount: string;
  unit: string;
  onAmountChange: (val: string) => void;
  onUnitChange: (val: string) => void;
  label?: string;
  amountPlaceholder?: string;
}

export const QuantityUnitInput: React.FC<QuantityUnitInputProps> = ({
  amount,
  unit,
  onAmountChange,
  onUnitChange,
  label = 'Quantity & Measurement',
  amountPlaceholder = 'e.g. 2'
}) => {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={amountPlaceholder}
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-24 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 font-medium"
        >
          {MEASUREMENT_UNITS.map(group => (
            <optgroup key={group.groupName} label={group.groupName}>
              {group.units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};
