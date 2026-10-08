import React from 'react';
import EquipmentViewDashboard from '../components/EquipmentViewDashboard';

function RDHSDashboard() {
  return (
    <EquipmentViewDashboard
      title="RDHS Dashboard"
      subtitle="View-only — regional overview across all institutions"
      accentFrom="from-violet-500"
      accentTo="to-purple-600"
      accentRing="focus:ring-violet-400"
      accentBorder="focus:border-violet-400"
    />
  );
}

export default RDHSDashboard;
