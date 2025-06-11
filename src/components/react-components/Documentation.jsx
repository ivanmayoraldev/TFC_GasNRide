/**
 * Este componente maneja la visualización de información sobre municipios, gasolineras
 * y puntos de interés de la Comunidad de Madrid, incluyendo funcionalidades de filtrado
 * y búsqueda en tiempo real dentro de estos 3 sections. También pero no menos importante,
 * se puede acceder a la API de la aplicación para obtener los datos de los municipios,
 * gasolineras y puntos de interés, y ver información general sobre Gas N Ride.
*/


import React, { useState, useEffect, useRef } from 'react';

// Clave y duración del caché para almacenar los datos localmente
// para evitar cargas innecesarias y extras en consultas a la API.
const CACHE_KEY = 'gas_n_ride_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

const Documentation = () => {
  // Estados para manejar la sección seleccionada, tema oscuro y menú desplegable para el responsive.
  const [selectedSection, setSelectedSection] = useState('Gas N Ride');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Estados para almacenar los datos de la API
  const [municipios, setMunicipios] = useState([]);
  const [puntosInteres, setPuntosInteres] = useState([]);
  const [gasolineras, setGasolineras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para los filtros de búsqueda
  const [searchMunicipio, setSearchMunicipio] = useState('');
  const [searchPuntoInteres, setSearchPuntoInteres] = useState('');
  const [selectedCombustible, setSelectedCombustible] = useState('todos');
  const [selectedTipoPuntoInteres, setSelectedTipoPuntoInteres] = useState('todos');

  // Referencia para controlar si ya se han cargado los datos
  const hasFetchedData = useRef(false);

  // Función que verifica si los datos en caché siguen siendo válidos
  const isCacheValid = (cacheData) => {
    if (!cacheData) return false;
    const now = new Date().getTime();
    return cacheData.timestamp && (now - cacheData.timestamp < CACHE_DURATION);
  };

  // Función para cargar datos desde el caché local (para evitar consultas a la API innecesarias).
  const loadFromCache = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (isCacheValid(parsedData)) {
          setMunicipios(parsedData.municipios);
          setPuntosInteres(parsedData.puntosInteres);
          setGasolineras(parsedData.gasolineras);
          setIsLoading(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error al cargar caché:', error);
      return false;
    }
  };

  // Función para guardar datos en el caché local (para evitar consultas a la API innecesarias).
  const saveToCache = (data) => {
    try {
      const cacheData = {
        ...data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  };

  // Efecto principal que se ejecuta al montar el componente
  useEffect(() => {
    // Comprobar si el tema oscuro está activado
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDarkMode(isDark);

    // Observador para detectar cambios en el tema
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

    // Limpiar caché al cargar
    localStorage.removeItem(CACHE_KEY);

    // Función para obtener datos de la API
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Realizar peticiones a la API para obtener los datos de los municipios, gasolineras y puntos de interés.
        const [municipiosRes, puntosInteresRes, gasolinerasRes] = await Promise.all([
          fetch('https://gas-n-ride-api-iq2n.vercel.app/municipios'),
          fetch('https://gas-n-ride-api-iq2n.vercel.app/puntos_interes'),
          fetch('https://gas-n-ride-api-iq2n.vercel.app/gasolineras')
        ]);

        // Convertir respuestas a JSON para poder usarlos en el componente.
        const [municipiosData, puntosInteresData, gasolinerasData] = await Promise.all([
          municipiosRes.json(),
          puntosInteresRes.json(),
          gasolinerasRes.json()
        ]);

        // Procesar y optimizar los datos
        const municipiosOptimizados = municipiosData.map(municipio => ({
          id: municipio.id,
          nombre: municipio.nombre,
          num_gasolineras: municipio.num_gasolineras,
          imagen_url: municipio.imagen_url
        }));

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

        // Actualizar estados y caché para utilizar la caché en vez de volver a hacer peticiones a la API.
        setMunicipios(municipiosOptimizados);
        setPuntosInteres(puntosInteresOptimizados);
        setGasolineras(gasolinerasOptimizadas);
        saveToCache(optimizedData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => observer.disconnect();
  }, []);

  // Definición de las secciones del menú
  const sections = [
    {
      id: 'Gas N Ride',
      title: 'Gas N Ride',
      content: 'Gas N Ride es una aplicación móvil innovadora diseñada para revolucionar tu experiencia de viaje por la Comunidad de Madrid. Nuestra plataforma combina la exploración cultural con la eficiencia en la planificación de rutas, ofreciendo una solución integral para conductores y viajeros.\n\nCaracterísticas principales:\n\n1. Exploración de Municipios:\n  - Acceso a información detallada de cada municipio de Madrid\n  - Visualización de imágenes y datos relevantes\n  - Enlaces directos a Wikipedia para información adicional\n\n2. Sistema de Gasolineras:\n  - Localización de gasolineras cercanas\n  - Precios actualizados de diferentes combustibles (Gasolina 95, 98, Diesel, Gas Licuado)\n  - Información detallada de ubicación y servicios\n\n3. Puntos de Interés:\n  - Descubrimiento de lugares emblemáticos\n  - Categorización por tipos de interés\n  - Visualización de imágenes y descripciones\n  - Enlaces a información adicional en Wikipedia\n\n4. Planificación de Rutas:\n  - Creación de rutas personalizadas\n  - Optimización de trayectos\n  - Integración con puntos de interés y gasolineras\n\n5. Características Técnicas:\n  - Interfaz moderna y responsive\n  - Soporte para tema claro y oscuro\n  - Sistema de caché para datos optimizados\n  - API RESTful para acceso a datos\n  - Actualización automática de precios y ubicaciones\n\n6. Experiencia de Usuario:\n  - Diseño intuitivo y fácil de usar\n  - Navegación fluida entre secciones\n  - Visualización de datos en tiempo real\n  - Interfaz adaptativa para diferentes dispositivos\n\nNuestra misión es transformar la forma en que los usuarios exploran y disfrutan de la Comunidad de Madrid, combinando la eficiencia en la planificación de rutas con el descubrimiento cultural. Gas N Ride no es solo una aplicación de navegación, es tu compañero perfecto para descubrir Madrid de una manera más inteligente y enriquecedora.\n\nLa aplicación está en constante evolución, con actualizaciones regulares que incluyen:\n1. Mejoras en el sistema de mapas\n2. Actualización de datos de municipios y puntos de interés\n3. Optimización de la interfaz de usuario\n4. Nuevas funcionalidades basadas en el feedback de los usuarios\n\nÚnete a la comunidad de Gas N Ride y descubre una nueva forma de explorar Madrid.'
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
      content: 'Nuestra API proporciona acceso a todos los datos de Gas N Ride a través de los siguientes endpoints:\n\n Endpoints Disponibles\n\n1. **Compañías** (`GET /companias`)\n   - Obtiene el listado de todas las compañías de gasolineras\n   - Filtros: idcompania, nombre_comp\n   - Base de datos: FireStore\n\n2. **Municipios** (`GET /municipios`)\n   - Lista todos los municipios de la Comunidad de Madrid\n   - Filtros: idmunicipio, nombre, codigo_Territorial, num_gasolineras\n   - Incluye: imágenes y datos territoriales\n\n3. **Usuarios** (`GET /usuarios`)\n   - Gestiona el acceso de usuarios al sistema\n   - Campos: nombreUser, passUser\n   - Autenticación segura\n\n4. **Gasolineras** (`GET /gasolineras`)\n   - Información completa de todas las gasolineras\n   - Filtros: idgasolinera, idMunicipioFK, idCompaniaFK, nombre_gas, precios\n   - Datos: ubicación, precios de combustibles (95, 98, diesel, gas licuado)\n\n5. **Puntos de Interés** (`GET /puntos_interes`)\n   - Catálogo de lugares de interés por municipio\n   - Filtros: idpunto_interes, nombre, tipo, idmunicipio_fk\n   - Incluye: descripciones, imágenes y enlaces a Wikipedia\n\nTodas las respuestas se devuelven en formato JSON con código de estado 200 para peticiones exitosas.\n\nPara acceder a la documentación completa, ejemplos de uso y probar los endpoints, visita:',
      link: 'https://gas-n-ride-api-iq2n.vercel.app/'
    }
  ];

  // Función para obtener tipos únicos de puntos de interés para el filtro de puntos de interés.
  const tiposPuntoInteres = ['todos', ...new Set(puntosInteres.map(punto => punto.tipo))];

  // Función para filtrar gasolineras por tipo de combustible para el filtro de gasolineras.
  const filteredGasolineras = gasolineras.filter(gasolinera => {
    if (selectedCombustible === 'todos') return true;
    const precio = gasolinera[`precio_${selectedCombustible}`];
    return precio !== undefined && precio !== 0;
  });

  // Función para filtrar puntos de interés por nombre y tipo para el filtro de puntos de interés.
  const filteredPuntosInteres = puntosInteres.filter(punto =>
    punto.nombre.toLowerCase().includes(searchPuntoInteres.toLowerCase()) &&
    (selectedTipoPuntoInteres === 'todos' || punto.tipo === selectedTipoPuntoInteres)
  );

  // Función para filtrar municipios por nombre para los filtros de municipios.
  const filteredMunicipios = municipios.filter(municipio =>
    municipio.nombre.toLowerCase().includes(searchMunicipio.toLowerCase())
  );

  // Función para renderizar la cuadrícula de datos con filtros
  const renderDataGrid = (data, type) => {
    if (isLoading) return <p>Cargando datos...</p>;
    if (!data || data.length === 0) return <p>No hay datos disponibles</p>;

    // Renderizar los filtros según el tipo de datos que se está mostrando.
    const renderFilters = () => {
      switch (type) {
        case 'municipios':
          return (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar municipio..."
                value={searchMunicipio}
                onChange={(e) => setSearchMunicipio(e.target.value)}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />
            </div>
          );
        case 'gasolineras':
          return (
            <div className="mb-4">
              <select
                value={selectedCombustible}
                onChange={(e) => setSelectedCombustible(e.target.value)}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <option value="todos">Todos los combustibles</option>
                <option value="gas95">Gasolina 95</option>
                <option value="gas98">Gasolina 98</option>
                <option value="diesel">Diesel</option>
                <option value="gaslicuado">Gas Licuado</option>
              </select>
            </div>
          );
        case 'puntos_interes':
          return (
            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Buscar punto de interés..."
                value={searchPuntoInteres}
                onChange={(e) => setSearchPuntoInteres(e.target.value)}
                className={`flex-1 p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />
              <select
                value={selectedTipoPuntoInteres}
                onChange={(e) => setSelectedTipoPuntoInteres(e.target.value)}
                className={`w-1/3 p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <option value="todos">Todos los tipos</option>
                {tiposPuntoInteres.filter(tipo => tipo !== 'todos').map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          );
        default:
          return null;
      }
    };

    // Seleccionar los datos filtrados según el tipo
    const filteredData = type === 'municipios' 
      ? filteredMunicipios 
      : type === 'gasolineras' 
        ? filteredGasolineras 
        : filteredPuntosInteres;

    return (
      <div>
        {renderFilters()}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[600px]" style={{ minHeight: '200px' }}>
          {filteredData.map((item) => (
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
      </div>
    );
  };

  // Renderizado principal del componente
  return (
    <div className={`h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-2xl overflow-hidden`}>
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-full flex flex-col">
        {/* Cabecera con botón de menú y título */}
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
                      API
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