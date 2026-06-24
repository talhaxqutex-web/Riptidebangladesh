import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
        
        <div className="mt-auto flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
