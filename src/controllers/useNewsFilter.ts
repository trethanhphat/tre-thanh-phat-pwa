// src/controllers/useNewsFilter.ts
import { useState } from 'react';

export function useNewsFilter(defaultValue: number | 'all' = 'all') {
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>(defaultValue);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedCategory(val === 'all' ? 'all' : parseInt(val));
  }

  return {
    selectedCategory,
    handleCategoryChange,
  };
}
