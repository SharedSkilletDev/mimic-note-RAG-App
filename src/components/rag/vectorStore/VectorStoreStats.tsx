
import React from 'react';

interface VectorStoreStatsProps {
  stats: {
    total_vectors: number;
    vector_dimension: number;
    unique_subjects: number;
    store_size_mb: number;
  };
}

export const VectorStoreStats = ({ stats }: VectorStoreStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium">Total Vectors</p>
        <p className="text-2xl font-bold">{stats.total_vectors}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium">Vector Dimension</p>
        <p className="text-2xl font-bold">{stats.vector_dimension}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium">Unique Subjects</p>
        <p className="text-2xl font-bold">{stats.unique_subjects}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium">Store Size</p>
        <p className="text-2xl font-bold">{stats.store_size_mb}MB</p>
      </div>
    </div>
  );
};
