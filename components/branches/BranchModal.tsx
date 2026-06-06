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
  coordinates: { lat: number; lng: number };
}

interface BranchModalProps {
  branch: Branch | null;
  onClose: () => void;
  onGetDirections?: (branch: Branch) => void;
}

const BranchModal = ({ branch, onClose, onGetDirections }: BranchModalProps) => {
  if (!branch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg hover:bg-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative h-56 md:h-64 bg-gray-100">
            <img
              src={branch.image}
              alt={branch.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400/0F4C69/ffffff?text=${encodeURIComponent(branch.name)}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block rounded-full bg-[#E36630] px-3 py-1 text-xs font-semibold text-white mb-2">
                {branch.city}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{branch.name}</h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F4C69]">
                  Contact Information
                </h3>

                {[
                  {
                    label: 'Address',
                    value: `${branch.address}, ${branch.city}, ${branch.state} ${branch.pincode}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    ),
                  },
                  {
                    label: 'Phone',
                    value: branch.phone,
                    href: `tel:${branch.phone}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    ),
                  },
                  {
                    label: 'Email',
                    value: branch.email,
                    href: `mailto:${branch.email}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    ),
                  },
                  {
                    label: 'Hours',
                    value: branch.hours,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E36630]/10 text-[#E36630]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-gray-700 hover:text-[#E36630] transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F4C69]">
                  Branch Manager
                </h3>
                <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                  <p className="font-semibold text-gray-900">{branch.manager}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Branch Manager</p>
                </div>

                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0F4C69] pt-2">
                  Services
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {branch.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-full border border-[#0F4C69]/20 bg-[#0F4C69]/5 px-3 py-1 text-xs font-medium text-[#0F4C69]"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onGetDirections?.(branch)}
                className="flex-1 rounded-xl bg-[#E36630] py-3 px-4 text-sm font-semibold text-white hover:bg-[#cc5a2a] transition-colors"
              >
                Get Directions
              </button>
              <a
                href="/contact-us"
                className="flex-1 rounded-xl border-2 border-[#0F4C69] py-3 px-4 text-sm font-semibold text-[#0F4C69] text-center hover:bg-[#0F4C69] hover:text-white transition-colors"
              >
                Contact This Branch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;
