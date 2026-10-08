import React from 'react';
import EquipmentViewDashboard from '../components/EquipmentViewDashboard';

function BMEUDashboard() {
  return (
    <EquipmentViewDashboard
      title="BMEU Dashboard"
      subtitle="View-only — filter by institution and category"
      accentFrom="from-emerald-500"
      accentTo="to-teal-600"
      accentRing="focus:ring-emerald-400"
      accentBorder="focus:border-emerald-400"
    />
  );
}

export default BMEUDashboard;
