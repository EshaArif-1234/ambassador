'use client';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

const HeroSection = ({ 
  title = "Our Branches",
  subtitle = "Visit our 4 branches across Pakistan for premium kitchen equipment solutions",
  backgroundImage = "/Images/our branches dark.jpg"
}: HeroSectionProps) => {
  return (
    <div className="relative bg-gray-900 text-white py-20 h-96 md:h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="Branches Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/1920x400/E36630/ffffff?text=Our+Branches`;
          }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="container mx-auto px-4">
          <div className="px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 drop-shadow-lg">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
