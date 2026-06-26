import React from 'react';
import MenuScreen, { MenuItem } from '../components/MenuScreen';

const ITEMS: MenuItem[] = [
  { label: 'Expense Tracker', description: 'Log legal, medical, childcare and housing costs', icon: 'receipt', color: '#f97316', bg: '#fff7ed', screen: 'ExpenseTracker' },
  { label: 'Asset & Debt Inventory', description: 'Catalog shared assets and debts with values', icon: 'home', color: '#f59e0b', bg: '#fffbeb', screen: 'AssetInventory' },
];

export default function FinanceMenuScreen({ navigation }: any) {
  return <MenuScreen title="Finance" subtitle="Track money and shared property" items={ITEMS} navigation={navigation} />;
}
