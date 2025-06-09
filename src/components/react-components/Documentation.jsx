import React, { useState, useEffect, useRef } from 'react';

const CACHE_KEY = 'gas_n_ride_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const PAGE_SIZE = 12;

const Documentation = () => {
  const [selectedSection, setSelectedSection] = useState('Gas N Ride');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [municipios, setMunicipios] = useState([]);
  const [puntosInteres, setPuntosInteres] = useState([]);
  const [gasolineras, setGasolineras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedData = useRef(false);
  const [visibleMunicipios, setVisibleMunicipios] = useState(PAGE_SIZE);
  const [visibleGasolineras, setVisibleGasolineras] = useState(PAGE_SIZE);
  const [visiblePuntosInteres, setVisiblePuntosInteres] = useState(PAGE_SIZE);

  // Función para verificar si el caché es válido
  const isCacheValid = (cacheData) => {
    if (!cacheData) return false;
    const now = new Date().getTime();
    return cacheData.timestamp && (now - cacheData.timestamp < CACHE_DURATION);
  };

  // Función para cargar datos del caché
  const loadFromCache = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (isCacheValid(parsedData)) {
          console.log('Loading data from cache');
          setMunicipios(parsedData.municipios);
          setPuntosInteres(parsedData.puntosInteres);
          setGasolineras(parsedData.gasolineras);
          setIsLoading(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return false;
    }
  };

  // Función para guardar datos en el caché
  const saveToCache = (data) => {
    try {
      const cacheData = {
        ...data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Data saved to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const handleScroll = (type) => (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (type === 'municipios') {
        setVisibleMunicipios((prev) => Math.min(prev + PAGE_SIZE, municipios.length));
      } else if (type === 'gasolineras') {
        setVisibleGasolineras((prev) => Math.min(prev + PAGE_SIZE, gasolineras.length));
      } else if (type === 'puntos_interes') {
        setVisiblePuntosInteres((prev) => Math.min(prev + PAGE_SIZE, puntosInteres.length));
      }
    }
  };

  useEffect(() => {
    // Verificar el tema inicial
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Forzar limpieza de caché
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache cleared');

    // Cargar datos de la API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching from API...');

        const [municipiosRes, puntosInteresRes, gasolinerasRes] = await Promise.all([
          fetch('https://gas-n-ride-api-iq2n.vercel.app/municipios'),
          fetch('https://gas-n-ride-api-iq2n.vercel.app/puntos_interes'),
          fetch('https://gas-n-ride-api-iq2n.vercel.app/gasolineras')
        ]);

        const [municipiosData, puntosInteresData, gasolinerasData] = await Promise.all([
          municipiosRes.json(),
          puntosInteresRes.json(),
          gasolinerasRes.json()
        ]);

        // Log detallado de la estructura de datos
        console.log('Estructura completa del primer municipio:', JSON.stringify(municipiosData[0], null, 2));
        console.log('Campos disponibles en municipio:', Object.keys(municipiosData[0]));

        // Optimizar datos según lo solicitado
        const municipiosOptimizados = municipiosData.map(municipio => {
          console.log('Procesando municipio:', municipio.nombre, 'con imagen:', municipio.imagen_url);
          return {
            id: municipio.id,
            nombre: municipio.nombre,
            num_gasolineras: municipio.num_gasolineras,
            imagen_url: municipio.imagen_url
          };
        });

        const gasolinerasOptimizadas = gasolinerasData.map(gasolinera => ({
          id: gasolinera.id,
          nombre_gas: gasolinera.nombre_gas,
          direccion_gas: gasolinera.direccion_gas,
          precio_gas95: gasolinera.precio_gas95,
          precio_gas98: gasolinera.precio_gas98,
          precio_diesel: gasolinera.precio_diesel,
          precio_gaslicuado: gasolinera.precio_gaslicuado
        }));

        const puntosInteresOptimizados = puntosInteresData.map(punto => ({
          id: punto.id,
          nombre: punto.nombre,
          tipo: punto.tipo,
          url_imagen_poi: punto.url_imagen_poi
        }));

        // Guardar datos optimizados
        const optimizedData = {
          municipios: municipiosOptimizados,
          puntosInteres: puntosInteresOptimizados,
          gasolineras: gasolinerasOptimizadas
        };

        setMunicipios(municipiosOptimizados);
        setPuntosInteres(puntosInteresOptimizados);
        setGasolineras(gasolinerasOptimizadas);
        saveToCache(optimizedData);
        
        console.log('Data fetched and cached successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      id: 'Gas N Ride',
      title: 'Gas N Ride',
      content: 'Gas N Ride es una aplicación móvil innovadora diseñada para mejorar tu experiencia de viaje por la Comunidad de Madrid. Nuestra aplicación te permite explorar y descubrir los municipios y puntos de interés más destacados de la región, mientras te ayuda a planificar tus rutas de manera eficiente.\n\nCon Gas N Ride, podrás:\n• Explorar municipios y sus atracciones\n• Encontrar gasolineras cercanas para optimizar tus trayectos\n• Descubrir puntos de interés únicos en cada localidad\n• Planificar rutas personalizadas\n• Acceder a información detallada sobre servicios y facilidades\n\nNuestra misión es hacer que tus viajes por Madrid sean más convenientes y enriquecedores, combinando la exploración cultural con la eficiencia en la planificación de rutas.'
    },
    {
      id: 'Municipios',
      title: 'Municipios',
      content: 'Explora los municipios de la Comunidad de Madrid',
      data: municipios,
      type: 'municipios'
    },
    {
      id: 'Gasolineras',
      title: 'Gasolineras',
      content: 'Encuentra las gasolineras más cercanas a tu ubicación',
      data: gasolineras,
      type: 'gasolineras'
    },
    {
      id: 'Puntos de Interés',
      title: 'Puntos de Interés',
      content: 'Descubre los lugares más interesantes de cada municipio',
      data: puntosInteres,
      type: 'puntos_interes'
    },
    {
      id: 'API',
      title: 'API',
      content: 'Nuestra API proporciona acceso a toda la información de Gas N Ride. La documentación completa de la API está disponible en el siguiente enlace:',
      link: 'https://gas-n-ride-api-iq2n.vercel.app/docs'
    },
    {
      id: 'Documentación',
      title: 'Documentación',
      content: 'La documentación completa del proyecto estará disponible próximamente.'
    }
  ];

  const renderDataGrid = (data, type) => {
    if (isLoading) return <p>Cargando datos...</p>;
    if (!data || data.length === 0) return <p>No hay datos disponibles</p>;

    let visibleCount = PAGE_SIZE;
    if (type === 'municipios') visibleCount = visibleMunicipios;
    if (type === 'gasolineras') visibleCount = visibleGasolineras;
    if (type === 'puntos_interes') visibleCount = visiblePuntosInteres;

    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[600px]"
        style={{ minHeight: '200px' }}
        onScroll={handleScroll(type)}
      >
        {data.slice(0, visibleCount).map((item) => (
          <div key={item.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:shadow-lg transition-shadow duration-300`}>
            {type === 'municipios' && (
              <a 
                href={`https://es.wikipedia.org/wiki/${encodeURIComponent(item.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-90 transition-opacity"
              >
                <h3 className="text-lg font-semibold mb-2">{item.nombre}</h3>
                <p className="mb-2">Gasolineras: {item.num_gasolineras}</p>
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg mt-2 overflow-hidden">
                  {item.imagen_url && (
                    <img 
                      src={item.imagen_url.startsWith('//') ? `https:${item.imagen_url}` : item.imagen_url}
                      alt={item.nombre}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.log('Error cargando imagen para:', item.nombre);
                        console.log('URL de la imagen:', item.imagen_url);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                      }}
                    />
                  )}
                </div>
              </a>
            )}
            {type === 'gasolineras' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{item.nombre_gas || 'Sin nombre'}</h3>
                <p className="mb-1">Dirección: {item.direccion_gas || 'Sin dirección'}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <span>Gas95: <b>{item.precio_gas95 !== undefined ? item.precio_gas95 + '€' : 'N/D'}</b></span>
                  <span>Gas98: <b>{item.precio_gas98 !== undefined ? item.precio_gas98 + '€' : 'N/D'}</b></span>
                  <span>Diesel: <b>{item.precio_diesel !== undefined ? item.precio_diesel + '€' : 'N/D'}</b></span>
                  <span>Licuado: <b>{item.precio_gaslicuado !== undefined ? item.precio_gaslicuado + '€' : 'N/D'}</b></span>
                </div>
              </div>
            )}
            {type === 'puntos_interes' && (
              <a 
                href={`https://es.wikipedia.org/wiki/${encodeURIComponent(item.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-90 transition-opacity"
              >
                <h3 className="text-lg font-semibold mb-2">{item.nombre}</h3>
                <p className="mb-2">Tipo: {item.tipo}</p>
                {item.url_imagen_poi && (
                  <img 
                    src={item.url_imagen_poi.startsWith('//') ? `https:${item.url_imagen_poi}` : item.url_imagen_poi}
                    alt={item.nombre}
                    className="w-full h-48 object-cover rounded-lg mt-2"
                  />
                )}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-2xl overflow-hidden`}>
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-black hover:bg-gray-200'
              }`}
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 17 14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Información sobre Gas N Ride
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 flex-1 overflow-hidden">
          <div 
            className={`w-full lg:w-72 xl:w-80 transition-all duration-300 ease-in-out ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            } ${isMenuOpen ? 'block' : 'hidden lg:block'} rounded-lg p-4 sm:p-6`}
          >
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSection(section.id);
                    if (window.innerWidth < 1024) {
                      setIsMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left p-2 sm:p-3 rounded transition-colors ${
                    selectedSection === section.id
                      ? isDarkMode 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-200 text-gray-900'
                      : isDarkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-sm sm:text-base lg:text-lg">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`${
                  selectedSection === section.id ? 'block' : 'hidden'
                } max-w-4xl mx-auto`}
              >
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {section.title}
                </h2>
                <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
                  {section.content.split('\n').map((line, index) => (
                    <p key={index} className="mb-4 text-base sm:text-lg lg:text-xl">
                      {line}
                    </p>
                  ))}
                  {section.link && (
                    <a
                      href={section.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block mt-4 px-6 py-3 rounded-lg ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Ver documentación de la API
                    </a>
                  )}
                  {section.data && renderDataGrid(section.data, section.type)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 