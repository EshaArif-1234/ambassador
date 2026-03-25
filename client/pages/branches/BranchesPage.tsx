'use client';

import { useState } from 'react';
import HeroSection from '@/components/branches/HeroSection';
import BranchesGrid from '@/components/branches/BranchesGrid';
import BranchModal from '@/components/branches/BranchModal';
import BookVisitSection from '@/components/branches/BookVisitSection';
import StatsSection from '@/components/branches/StatsSection';



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
      coordinates: { lat: 31.367931, lng:  74.235808 } // Lahore coordinates
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
      coordinates: { lat: 31.5204, lng: 74.3587 } // Lahore coordinates (slightly different)
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
      coordinates: { lat: 33.600344, lng: 73.060206 } // Rawalpindi coordinates
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
      manager: 'Mr Faheem Ashraf',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
      services: ['Catering Equipment', 'Industrial Kitchen', 'Consulting', 'Training'],
      image: '/Images/home/card1.jpg',
      coordinates: { lat: 31.524732, lng: 74.322147} // Lahore Muslim Town coordinates
    }
  ];

  const handleGetDirections = (branch: Branch) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleViewDetails = (branchId: string) => {
    setSelectedBranch(branchId);
  };

  const handleCloseModal = () => {
    setSelectedBranch(null);
  };

  const selectedBranchData = branches.find(branch => branch.id === selectedBranch);

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
      <HeroSection />

      

      {/* Branches Grid */}
      <BranchesGrid 
        branches={branches}
        onGetDirections={handleGetDirections}
        onViewDetails={handleViewDetails}
      />
{/* Statistics Section */}
      <StatsSection />
      {/* Book a Visit Section */}
      <BookVisitSection branches={branches} />

      {/* Selected Branch Modal */}
      <BranchModal 
        branch={selectedBranchData || null}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default BranchesPage;
