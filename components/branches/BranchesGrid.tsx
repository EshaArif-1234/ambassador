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

interface BranchesGridProps {
  branches: Branch[];
  onGetDirections?: (branch: Branch) => void;
  onViewDetails?: (branchId: string) => void;
}

const BranchesGrid = ({ branches, onGetDirections, onViewDetails }: BranchesGridProps) => {
  return (
    <section className="bg-[#FAFAFA] py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#0F4C69]" />
            Showrooms
            <span className="w-8 h-px bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Our <span className="text-[#E36630]">Branches</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Visit any of our locations in Lahore and Rawalpindi for expert advice, live demos, and after-sales support.
          </p>
          <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {branches.map((branch) => (
            <article
              key={branch.id}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#E36630]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] transition-all duration-300"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={branch.image}
                  alt={branch.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/0F4C69/ffffff?text=${encodeURIComponent(branch.city)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 right-3 rounded-full bg-[#E36630] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  {branch.city}
                </span>
                {branch.id === '4' && (
                  <span className="absolute top-3 left-3 rounded-full bg-[#0F4C69] px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Head Office
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#0F4C69] transition-colors">
                  {branch.name}
                </h3>

                <ul className="space-y-2.5 mb-4 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-[#E36630] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{branch.address}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-[#E36630] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${branch.phone}`} className="hover:text-[#E36630] transition-colors">
                      {branch.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-[#E36630] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {branch.hours}
                  </li>
                </ul>

                <p className="text-xs text-gray-400 mb-4 border-t border-gray-100 pt-3">
                  <span className="font-medium text-gray-600">Manager:</span> {branch.manager}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onGetDirections?.(branch)}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-[#0F4C69] hover:text-[#0F4C69] transition-colors"
                  >
                    Directions
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(branch.id)}
                    className="flex-1 rounded-xl bg-[#E36630] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#cc5a2a] transition-colors shadow-sm shadow-[#E36630]/20"
                  >
                    Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BranchesGrid;
