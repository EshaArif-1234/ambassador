'use client';

import { useState } from 'react';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  manager: string;
  hours: string;
  services: string[];
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface BranchesGridProps {
  branches: Branch[];
  onGetDirections?: (branch: Branch) => void;
  onViewDetails?: (branchId: string) => void;
}

const BranchesGrid = ({ branches, onGetDirections, onViewDetails }: BranchesGridProps) => {
  return (
    <div className="container mx-auto px-4 py-32">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our <span className="text-orange-500">Branches</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Visit our 4 branches across Pakistan for premium kitchen equipment solutions and personalized service
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Branch Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={branch.image}
                alt={branch.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/E36630/ffffff?text=${encodeURIComponent(branch.name.substring(0, 10))}`;
                }}
              />
              <div className="absolute top-4 right-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {branch.city}
                </span>
              </div>
            </div>

            {/* Branch Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{branch.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">{branch.address}</p>
                    <p className="text-sm text-gray-600">{branch.city}, {branch.state} - {branch.pincode}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-sm text-gray-600">{branch.phone}</p>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">{branch.email}</p>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">{branch.hours}</p>
                </div>
              </div>

              {/* Manager Info */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Branch Manager:</span> {branch.manager}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => onGetDirections?.(branch)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Get Directions
                </button>
                <button
                  onClick={() => onViewDetails?.(branch.id)}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchesGrid;
