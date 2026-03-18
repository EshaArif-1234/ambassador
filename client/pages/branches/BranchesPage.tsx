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

const BranchesPage = () => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const branches: Branch[] = [
    {
      id: '1',
      name: 'FAZYYIA DISPLAY',
      address: 'Ca 77, fazaia downtown, Lahore Pakistan',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54000',
      phone: '03302003735',
      email: 'info@ambassador.pk',
      manager: 'Mr ABDUL RAHEEM',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      services: ['Commercial Kitchen Setup', 'Equipment Sales', 'After-sales Service', 'Spare Parts'],
      image: '/Images/home/slider 1.jpg',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
      id: '2',
      name: 'RAYA DISPLAY',
      address: 'Ca 77, fazaia downtown, Lahore Pakistan',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54000',
      phone: '03370127561',
      email: 'info@ambassador.pk',
      manager: 'Mr RASHID',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      services: ['Restaurant Equipment', 'Hotel Supplies', 'Installation Service', 'Maintenance'],
      image: '/Images/home/slider 2.jpg',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    },
    {
      id: '3',
      name: 'RAWALPINDI DISPLAY',
      address: 'Ambassador house 1- khursheed Palace 135 - kasmeer rood sadar rawalpindi.',
      city: 'Rawalpindi',
      state: 'Punjab',
      pincode: '46000',
      phone: '03324313108',
      email: 'info@ambassador.pk',
      manager: 'Mr ABID MOEN',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      services: ['Bakery Equipment', 'Food Processing', 'Custom Solutions', 'Technical Support'],
      image: '/Images/home/slider 3.jpg',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    {
      id: '4',
      name: 'MUSLIM TOWN DISPLAY',
      address: '5-A Fazal ELahi Road, Rehman Pura Link Ferozpur Road, Lahore,Pakistan',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54600',
      phone: '03324313104',
      email: 'info@ambassador.pk',
      manager: 'Suresh Babu',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      services: ['Catering Equipment', 'Industrial Kitchen', 'Consulting', 'Training'],
      image: '/Images/home/card1.jpg',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        :root {
          --color-gray-dark: #565D63;
          --color-orange: #E36630;
          --color-blue: #0F4C69;
          --color-gray-medium: #4B4B4B;
          --color-black: #000000;
          --color-white: #FFFFFF;
        }
      `}</style>

      {/* Hero Section */}
      

       <div className="relative bg-gray-900 text-white py-16 h-96 md:h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/Images/our branches dark.jpg"
            alt="Gallery & Reviews Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x400/E36630/ffffff?text=Gallery+Reviews`;
            }}
          />
          <div className="absolute"></div>
        </div>
         <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                Our Branches
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
               Visit our 4 branches across India for premium kitchen equipment solutions
            </p>
          </div>
        </div>
        
      </div>

      {/* Branches Grid */}
      <div className="container mx-auto px-4 py-12">
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
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setSelectedBranch(branch.id)}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    View Details
                  </button>
                  {/* <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Get Directions
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Branch Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const branch = branches.find(b => b.id === selectedBranch);
              if (!branch) return null;
              
              return (
                <>
                  <div className="relative h-64 bg-gray-100">
                    <img
                      src={branch.image}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400/E36630/ffffff?text=${encodeURIComponent(branch.name)}`;
                      }}
                    />
                    <button
                      onClick={() => setSelectedBranch(null)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{branch.name}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            <span className="font-medium">Address:</span> {branch.address}, {branch.city}, {branch.state} - {branch.pincode}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Phone:</span> {branch.phone}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Email:</span> {branch.email}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Hours:</span> {branch.hours}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Branch Manager</h3>
                        <p className="text-gray-600 mb-2">{branch.manager}</p>
                      </div>
                    </div>

                    {/* <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Call Branch
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Send Email
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Get Directions
                      </button>
                    </div> */}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
