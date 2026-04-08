'use client';

interface LogoCard {
  id: string;
  logo: string;
  name: string;
}

const MissionVisionSection = () => {
  const logos: LogoCard[] = [
    {
      id: '1',
      logo: '/Images/Logo Final/logo1.webp',
      name: 'Client 1'
    },
    {
      id: '2',
      logo: '/Images/Logo Final/logo2.webp',
      name: 'Client 2'
    },
    {
      id: '3',
      logo: '/Images/Logo Final/logo3.webp',
      name: 'Client 3'
    },
    {
      id: '4',
      logo: '/Images/Logo Final/logo4.webp',
      name: 'Client 4'
    },
    {
      id: '5',
      logo: '/Images/Logo Final/logo5.webp',
      name: 'Client 5'
    },
    {
      id: '6',
      logo: '/Images/Logo Final/logo6.webp',
      name: 'Client 6'
    },
    {
      id: '7',
      logo: '/Images/Logo Final/logo7.webp',
      name: 'Client 7'
    },
    {
      id: '8',
      logo: '/Images/Logo Final/logo8.webp',
      name: 'Client 8'
    },
     {
      id: '9',
      logo: '/Images/Logo Final/logo9.webp',
      name: 'Client 9'
    },
    {
      id: '10',
      logo: '/Images/Logo Final/logo10.webp',
      name: 'Client 10'
    },
    {
      id: '11',
      logo: '/Images/Logo Final/logo11.webp',
      name: 'Client 11'
    },
    {
      id: '12',
      logo: '/Images/Logo Final/logo12.webp',
      name: 'Client 12'
    },
    {
      id: '13',
      logo: '/Images/Logo Final/logo13.webp',
      name: 'Client 13'
    },
     {
      id: '14',
      logo: '/Images/Logo Final/logo14.webp',
      name: 'Client 14'
    }, 
    {
      id: '15',
      logo: '/Images/Logo Final/logo15.webp',
      name: 'Client 15'
    }, 
    {
      id: '16',
      logo: '/Images/Logo Final/logo16.webp',
      name: 'Client 16'
    }, 
    {
      id: '17',
      logo: '/Images/Logo Final/logo17.webp',
      name: 'Client 17'
    }, 
    {
      id: '18',
      logo: '/Images/Logo Final/logo18.webp',
      name: 'Client 18'
    }, 
    {
      id: '19',
      logo: '/Images/Logo Final/logo19.webp',
      name: 'Client 19'
    }, 
    {
      id: '20',
      logo: '/Images/Logo Final/logo20.webp',
      name: 'Client 20'
    }, 
    {
      id: '21',
      logo: '/Images/Logo Final/logo21.webp',
      name: 'Client 21'
    }, 
    {
      id: '22',
      logo: '/Images/Logo Final/logo22.webp',
      name: 'Client 22'
    }, 
    {
      id: '23',
      logo: '/Images/Logo Final/logo23.webp',
      name: 'Client 23'
    }, 
    {
      id: '24',
      logo: '/Images/Logo Final/logo24.webp',
      name: 'Client 24'
    }, 
    {
      id: '25',
      logo: '/Images/Logo Final/logo25.webp',
      name: 'Client 25'
    }, 
    {
      id: '26',
      logo: '/Images/Logo Final/logo26.webp',
      name: 'Client 26'
    }, 
    {
      id: '27',
      logo: '/Images/Logo Final/logo27.webp',
      name: 'Client 27'
    }, 
    {
      id: '28',
      logo: '/Images/Logo Final/logo28.webp',
      name: 'Client 28'
    }, 
    {
      id: '29',
      logo: '/Images/Logo Final/logo29.webp',
      name: 'Client 29'
    }, 
    {
      id: '30',
      logo: '/Images/Logo Final/logo30.webp',
      name: 'Client 30'
    }, 
    {
      id: '31',
      logo: '/Images/Logo Final/logo31.webp',
      name: 'Client 31'
    }, 
    {
      id: '32',
      logo: '/Images/Logo Final/logo32.webp',
      name: 'Client 32'
    },
     {
      id: '33',
      logo: '/Images/Logo Final/logo33.webp',
      name: 'Client 33'
    }, 
    {
      id: '34',
      logo: '/Images/Logo Final/logo34.webp',
      name: 'Client 34'
    }, 
    {
      id: '35',
      logo: '/Images/Logo Final/logo35.webp',
      name: 'Client 35'
    }, 
    {
      id: '36',
      logo: '/Images/Logo Final/logo36.webp',
      name: 'Client 36'
    }, 
    {
      id: '37',
      logo: '/Images/Logo Final/logo37.webp',
      name: 'Client 37'
    }, 
    {
      id: '38',
      logo: '/Images/Logo Final/logo38.webp',
      name: 'Client 38'
    }, 
    {
      id: '39',
      logo: '/Images/Logo Final/logo39.webp',
      name: 'Client 39'
    }, 
    {
      id: '40',
      logo: '/Images/Logo Final/logo40.webp',
      name: 'Client 40'
    }, 
    {
      id: '41',
      logo: '/Images/Logo Final/logo41.webp',
      name: 'Client 41'
    }, 
    {
      id: '42',
      logo: '/Images/Logo Final/logo42.webp',
      name: 'Client 42'
    }, 
    {
      id: '43',
      logo: '/Images/Logo Final/logo43.webp',
      name: 'Client 43'
    }, 
    {
      id: '44',
      logo: '/Images/Logo Final/logo44.webp',
      name: 'Client 44'
    }, 
 

  ];

  return (
    <div className="py-20 bg-white">
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

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-orange-500">Customers</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Trusted by leading businesses across industries
          </p>
        </div>

        {/* Logo Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {logos.map((logo, index) => (
            <div
              key={logo.id}
              className="group relative"
            >
              {/* Logo Card */}
              <div className="relative aspect-square">
                <div className="logo-card">
                  <div className="logo-content">
                    <img
                      src={logo.logo}
                      alt={`${logo.name} logo`}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/80x80/E36630/ffffff?text=${encodeURIComponent(logo.id)}`;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Card CSS */}
      <style jsx>{`
        .logo-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          border: 2px solid #f3f4f6;
          overflow: hidden;
        }
        
        .logo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #e36630;
        }
        
        .logo-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .logo-card:hover .logo-content {
          background: linear-gradient(135deg, #fef7ed 0%, #ffffff 100%);
        }
        
        @media (max-width: 768px) {
          .logo-card {
            border-radius: 50%;
          }
          .logo-content {
            border-radius: 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default MissionVisionSection;
