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

interface BookVisitSectionProps {
  branches: Branch[];
}

const BookVisitSection = ({ branches }: BookVisitSectionProps) => {
  return (
    <div className="py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book a <span className="text-orange-500">Showroom Visit</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience our premium kitchen equipment firsthand. Schedule a personalized tour with our experts to explore solutions tailored for your culinary needs.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 lg:border-r border-gray-200 lg:pr-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2v10a2 2 0 002-2h-4a2 2 0 00-2 2v10a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Consultation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Meet with our kitchen equipment specialists for one-on-one consultation and product demonstrations tailored to your specific requirements.
                  </p>
                </div>
                
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quick Booking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Fill out our simple form to schedule your visit at your preferred branch and time.
                  </p>
                </div>
              </div>
              
              <div className="lg:w-1/2 lg:pl-8">
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Branch
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      required
                      className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select a branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                  >
                    Book Appointment
                  </button>
                </form>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookVisitSection;
