export interface CategoryItem {
  id: number;
  type: string;
  name: string;
  parentId?: number;
}

export const LOCATION_DISTANCES: CategoryItem[] = [
  { id: 95, type: 'parent', name: 'Frocks' },
  { id: 96, type: 'child', name: 'Bridal Frocks', parentId: 95 },
  { id: 97, type: 'child', name: 'Preshoot Frocks', parentId: 95 },
  { id: 83, type: 'parent', name: 'Lehenga' },
  { id: 86, type: 'child', name: 'Sharara / Gharara', parentId: 83 },
  { id: 100, type: 'parent', name: 'Saree', },
  { id: 77, type: 'child', name: 'Kandyan', parentId: 100 },
  { id: 71, type: 'child', name: 'Indian Bridal', parentId: 100 },
];

// Kept under the original export above for compatibility with existing work.
export const PRODUCT_CATEGORIES = LOCATION_DISTANCES;
export const PARENT_CATEGORIES = PRODUCT_CATEGORIES.filter((item) => item.type === "parent");
export const childCategoriesFor = (parentId: number) => PRODUCT_CATEGORIES.filter((item) => item.type === "child" && item.parentId === parentId);
