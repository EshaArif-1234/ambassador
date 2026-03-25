'use client';

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

interface BranchModalProps {
  branch: Branch | null;
  onClose: () => void;
}

const BranchModal = ({ branch, onClose }: BranchModalProps) => {
  if (!branch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Branch Image */}
          <div className="relative h-64 bg-gray-100">
            <img
              src={branch.image}
              alt={branch.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400/E36630/ffffff?text=${encodeURIComponent(branch.name)}`;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h2 className="text-3xl font-bold text-white mb-2">{branch.name}</h2>
              <p className="text-white text-lg">{branch.city}</p>
            </div>
          </div>

          {/* Branch Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Address</p>
                    <p className="text-gray-600">{branch.address}</p>
                    <p className="text-gray-600">{branch.city}, {branch.state} - {branch.pincode}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">{branch.phone}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">{branch.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Business Hours</p>
                    <p className="text-gray-600">{branch.hours}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Branch Manager</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800">{branch.manager}</p>
                  <p className="text-gray-600 text-sm">Branch Manager</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Location</h3>
                <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map View</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-4">
              <button className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                Get Directions
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Call Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;
