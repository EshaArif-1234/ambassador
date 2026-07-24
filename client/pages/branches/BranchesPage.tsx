'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/branches/HeroSection';
import BranchesGrid from '@/components/branches/BranchesGrid';
import BranchModal from '@/components/branches/BranchModal';
import BookVisitSection from '@/components/branches/BookVisitSection';
import StatsSection from '@/components/branches/StatsSection';
import SignupBanner from '@/components/common/signup-banner';

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

const BranchesPage = () => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const branches: Branch[] = [
    {
      id: '4',
      name: 'Head Office',
      address: '5-A Fazal ELahi Road, Rehman Pura Link Ferozpur Road, Lahore, Pakistan',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54600',
      phone: '03324313104',
      email: 'info@ambassador.pk',
      manager: 'Mr Faheem Ashraf',
      hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
      services: ['Catering Equipment', 'Industrial Kitchen', 'Consulting', 'Training'],
      image: '/Images/Thumbnail-Head-office.png',
      coordinates: { lat: 31.524732, lng: 74.322147 },
    },
    {
      id: '1',
      name: 'Fazaia Showroom',
      address: 'Ca 77, Fazaia Downtown, Lahore, Pakistan',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54000',
      phone: '03302003735',
      email: 'info@ambassador.pk',
      manager: 'Mr Syed Naeem-ul-Hassan',
      hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
      services: ['Commercial Kitchen Setup', 'Equipment Sales', 'After-Sales Service', 'Spare Parts'],
      image: '/Images/fazaia-show.png',
      coordinates: { lat: 31.367931, lng: 74.235808 },
    },
    {
      id: '2',
      name: 'Raya Showroom',
      address: 'Ambassador Commercial Kitchen 57, Raya Fairways Ph DHA, Lahore',
      city: 'Lahore',
      state: 'Punjab',
      pincode: '54000',
      phone: '03370127561',
      email: 'info@ambassador.pk',
      manager: 'Mr Rashid',
      hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
      services: ['Restaurant Equipment', 'Hotel Supplies', 'Installation Service', 'Maintenance'],
      image: '/Images/branch-1.png',
      coordinates: { lat: 31.5204, lng: 74.3587 },
    },
    {
      id: '3',
      name: 'Rawalpindi Showroom',
      address: 'Ambassador House 1, Khursheed Palace 135, Kashmir Road, Sadar, Rawalpindi',
      city: 'Rawalpindi',
      state: 'Punjab',
      pincode: '46000',
      phone: '03324313108',
      email: 'info@ambassador.pk',
      manager: 'Mr Abid Moen',
      hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
      services: ['Bakery Equipment', 'Food Processing', 'Custom Solutions', 'Technical Support'],
      image: '/Images/branch-2.png',
      coordinates: { lat: 33.600344, lng: 73.060206 },
    },
  ];

  const handleGetDirections = (branch: Branch) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const selectedBranchData = branches.find((branch) => branch.id === selectedBranch);

  return (
    <div className="min-h-screen bg-white">
      {/* 1 — dark hero */}
      <HeroSection />

      {/* 2 — brand blue accent band */}
      <section className="bg-[#0F4C69] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <p className="text-sm md:text-base text-white/80 text-center md:text-left">
              <span className="font-semibold text-white">4 showrooms</span> across Lahore & Rawalpindi — walk in or book a visit
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+923314937412"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                0333-1166925
              </a>
              <Link
                href="/contact-us"
                className="rounded-xl bg-[#E36630] px-4 py-2 text-sm font-semibold hover:bg-[#cc5a2a] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — light gray: white branch cards */}
      <BranchesGrid
        branches={branches}
        onGetDirections={handleGetDirections}
        onViewDetails={setSelectedBranch}
      />

      {/* 4 — white: individual stat cards */}
      <StatsSection />

      {/* 5 — light gray: white book-visit card */}
      <BookVisitSection branches={branches} />

      {/* 6 — brand orange CTA */}

      <BranchModal
        branch={selectedBranchData ?? null}
        onClose={() => setSelectedBranch(null)}
        onGetDirections={handleGetDirections}
      />

      <SignupBanner />
    </div>
  );
};

export default BranchesPage;
