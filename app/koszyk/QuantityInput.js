"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  error = false,
}) {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleDirectChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setDisplayValue(val);
    }
  };

  const handleBlur = () => {
    let num = parseInt(displayValue, 10);
    if (isNaN(num) || num < min) num = min;
    else if (num > max) num = max;

    setDisplayValue(num.toString());
    if (num !== value) onChange(num);
  };

  const containerClass = `flex items-center rounded-md border overflow-hidden transition-all ${
    error ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
  } ${
    disabled ? "bg-gray-100" : "bg-white"
  } focus-within:ring-2 focus-within:ring-red-300 focus-within:border-red-300`;

  const buttonClass =
    "flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  const inputClass =
    "w-12 h-8 text-center p-1 text-gray-900 focus:outline-none disabled:bg-gray-100";

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={`${buttonClass} border-r border-gray-300`}
        aria-label="Zmniejsz ilość"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={displayValue}
        onChange={handleDirectChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        disabled={disabled}
        className={inputClass}
        aria-label="Ilość"
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className={`${buttonClass} border-l border-gray-300`}
        aria-label="Zwiększ ilość"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
