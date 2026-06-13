'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { PersonalCareItem, PersonalCareCategory } from '@/types';

export function usePersonalCare() {
  const items = useLiveQuery(() => db.personalCareItems.orderBy('sortOrder').toArray(), []);

  const addItem = async (data: Omit<PersonalCareItem, 'id' | 'createdAt' | 'sortOrder'>) => {
    const count = await db.personalCareItems.where('category').equals(data.category).count();
    return db.personalCareItems.add({ ...data, sortOrder: count, createdAt: new Date() });
  };

  const updateItem = async (id: number, data: Partial<Omit<PersonalCareItem, 'id'>>) => {
    return db.personalCareItems.update(id, data);
  };

  const deleteItem = async (id: number) => {
    return db.personalCareItems.delete(id);
  };

  const cosmetics = items?.filter((i) => i.category === 'cosmetics') ?? [];
  const personalItems = items?.filter((i) => i.category === 'personal_items') ?? [];

  return { items: items ?? [], cosmetics, personalItems, addItem, updateItem, deleteItem };
}
