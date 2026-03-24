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
      logo: '/Images/clients/Dan-Dan.webp',
      name: 'Client 1'
    },
    {
      id: '2',
      logo: '/Images/clients/Avari.webp',
      name: 'Client 2'
    },
    {
      id: '3',
      logo: '/Images/clients/Cafe-Zouk.webp',
      name: 'Client 3'
    },
    {
      id: '4',
      logo: '/Images/clients/Aitchison-College.png.webp',
      name: 'Client 4'
    },
    {
      id: '5',
      logo: '/Images/clients/Avari-Express.webp',
      name: 'Client 5'
    },
    {
      id: '6',
      logo: '/Images/clients/Coffee-Bean.webp',
      name: 'Client 6'
    },
    {
      id: '7',
      logo: '/Images/clients/Cothm.webp',
      name: 'Client 7'
    },
    {
      id: '8',
      logo: '/Images/clients/Dagwood.webp',
      name: 'Client 8'
    },
     {
      id: '9',
      logo: '/Images/clients/DEfense-Raya.webp',
      name: 'Client 9'
    },
    {
      id: '10',
      logo: '/Images/clients/Deja.webp',
      name: 'Client 10'
    },
    {
      id: '11',
      logo: '/Images/clients/Fuoco.webp',
      name: 'Client 11'
    },
    {
      id: '12',
      logo: '/Images/clients/Ginyaki.webp',
      name: 'Client 12'
    },
    {
      id: '13',
      logo: '/Images/clients/Gloria-Jeans.webp',
      name: 'Client 13'
    },
     {
      id: '14',
      logo: '/Images/clients/Gloria-Jeans.webp',
      name: 'Client 14'
    }, 
    {
      id: '15',
      logo: '/Images/clients/Gourmet-Restaurants.webp',
      name: 'Client 15'
    }, 
    {
      id: '16',
      logo: '/Images/clients/Hardees.png.webp',
      name: 'Client 16'
    }, 
    {
      id: '17',
      logo: '/Images/clients/HD.webp',
      name: 'Client 17'
    }, 
    {
      id: '18',
      logo: '/Images/clients/HOtel-One.webp',
      name: 'Client 18'
    }, 
    {
      id: '19',
      logo: '/Images/clients/Howdy.webp',
      name: 'Client 19'
    }, 
    {
      id: '20',
      logo: '/Images/clients/Jalal-Sons-1.webp',
      name: 'Client 20'
    }, 
    {
      id: '21',
      logo: '/Images/clients/Lahore-Gymkhana.webp',
      name: 'Client 21'
    }, 
    {
      id: '22',
      logo: '/Images/clients/Lahore-School-of-Economics.png.webp',
      name: 'Client 22'
    }, 
    {
      id: '23',
      logo: '/Images/clients/Layers.png.webp',
      name: 'Client 23'
    }, 
    {
      id: '24',
      logo: '/Images/clients/Mandrin-Kitchen.png.webp',
      name: 'Client 24'
    }, 
    {
      id: '25',
      logo: '/Images/clients/Mandrin-Kitchen.webp',
      name: 'Client 25'
    }, 
    {
      id: '26',
      logo: '/Images/clients/Mcdonalds.webp',
      name: 'Client 26'
    }, 
    {
      id: '27',
      logo: '/Images/clients/Mei-Kong.webp',
      name: 'Client 27'
    }, 
    {
      id: '28',
      logo: '/Images/clients/Miso.webp',
      name: 'Client 28'
    }, 
    {
      id: '29',
      logo: '/Images/clients/Nandos.png.webp',
      name: 'Client 29'
    }, 
    {
      id: '30',
      logo: '/Images/clients/Nisa-Sultan.webp',
      name: 'Client 30'
    }, 
    {
      id: '31',
      logo: '/Images/clients/PC-Hotel.webp',
      name: 'Client 31'
    }, 
    {
      id: '32',
      logo: '/Images/clients/Pink-Pistachio.webp',
      name: 'Client 32'
    },
     {
      id: '33',
      logo: '/Images/clients/Ramada-Hotel.webp',
      name: 'Client 33'
    }, 
    {
      id: '34',
      logo: '/Images/clients/Rina-Kitchenette.webp',
      name: 'Client 34'
    }, 
    {
      id: '35',
      logo: '/Images/clients/Salt-n-Paper.webp',
      name: 'Client 35'
    }, 
    {
      id: '36',
      logo: '/Images/clients/Sarpinos.webp',
      name: 'Client 36'
    }, 
    {
      id: '37',
      logo: '/Images/clients/Sashas.webp',
      name: 'Client 37'
    }, 
    {
      id: '38',
      logo: '/Images/clients/Savoey-Hotel.webp',
      name: 'Client 38'
    }, 
    {
      id: '39',
      logo: '/Images/clients/Scafa.webp',
      name: 'Client 39'
    }, 
    {
      id: '40',
      logo: '/Images/clients/Serena-Hotels.webp',
      name: 'Client 40'
    }, 
    {
      id: '41',
      logo: '/Images/clients/Shezan.png.webp',
      name: 'Client 41'
    }, 
    {
      id: '42',
      logo: '/Images/clients/Steak-Away.webp',
      name: 'Client 42'
    }, 
    {
      id: '43',
      logo: '/Images/clients/Subway.webp',
      name: 'Client 43'
    }, 
    {
      id: '44',
      logo: '/Images/clients/Sumo.webp',
      name: 'Client 44'
    }, 
    {
      id: '45',
      logo: '/Images/clients/The-carnivore.webp',
      name: 'Client 45'
    }, 
    {
      id: '46',
      logo: '/Images/clients/The-Mad-Itlian.webp',
      name: 'Client 46'
    }


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
            Our <span className="text-orange-500">Partners</span>
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
