'use client';

import Image from 'next/image';

const CompanySection = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              <span className="text-orange-500">About</span> Our Company
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Ambassadors is a trusted provider of commercial kitchen equipment and professional food service solutions in Pakistan. With more than 15 years of industry experience, we specialize in supplying high-quality equipment sourced from leading international brands.
              </p>
              <p>
                Our company is committed to supporting restaurants, hotels, bakeries, cafés, supermarkets, and institutional kitchens with reliable and efficient equipment designed to meet modern culinary and operational demands. From cooking ranges and refrigeration systems to stainless steel workstations and imported kitchen solutions, we offer a complete range of products for professional kitchens.
              </p>
              <p>
                At Ambassadors, our goal is to help businesses build fully functional, efficient, and durable kitchen environments. We focus on delivering quality products, dependable service, and practical solutions that help our clients operate smoothly and maintain high standards in food preparation and service.
              </p>
              <p>
                With a strong emphasis on quality, reliability, and customer satisfaction, Ambassadors continues to be a dependable partner for food service businesses across Pakistan.
              </p>
            </div>
          </div>
          
          {/* Right - Image */}
          <div className="relative">
            <Image
              src="/Images/about/chef.jpg"
              alt="Chef"
              width={500}
              height={600}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;
