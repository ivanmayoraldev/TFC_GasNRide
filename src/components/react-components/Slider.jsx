import React, { useRef, useEffect, useState } from "react";

const images = [
  {
    src: "/public/capturas/1 Pantalla Inicial (white).png",
    title: "Pantalla Inicial",
  },
  { src: "/public/capturas/2 Iniciar Sesión (white).png" },
  { src: "/public/capturas/2.1 Crear Cuenta (white).png" },
  { src: "/public/capturas/3 Home (white).png" },
  { src: "/public/capturas/4 Buscar (white).png" },
  { src: "/public/capturas/4.1 Gasolineras (white).png" },
  { src: "/public/capturas/4.2 Puntos de Interés (white).png" },
  { src: "/public/capturas/4.2.1 Detalle Puntos de Interés (white).png" },
  { src: "/public/capturas/5 Mapa (white).png" },
  { src: "/public/capturas/6 Favoritos (white).png" },
  { src: "/public/capturas/7 User (white).png" },
  { src: "/public/capturas/7.1 Editar Perfil (white).png" },
];

const images_Dark = [
  {
    src: "/public/capturas/1 Pantalla Inicial (dark).png",
    title: "Pantalla Inicial",
  },
  { src: "/public/capturas/2 Iniciar Sesión (dark).png" },
  { src: "/public/capturas/2.1 Crear Cuenta (dark).png" },
  { src: "/public/capturas/3 Home (dark).png" },
  { src: "/public/capturas/4 Buscar (dark).png" },
  { src: "/public/capturas/4.1 Gasolineras (dark).png" },
  { src: "/public/capturas/4.2 Puntos de Interés (dark).png" },
  { src: "/public/capturas/4.2.1 Detalle Puntos de Interés (dark).png" },
  { src: "/public/capturas/5 Mapa (dark).png" },
  { src: "/public/capturas/6 Favoritos (dark).png" },
  { src: "/public/capturas/7 User (dark).png" },
  { src: "/public/capturas/7.1 Editar Perfil (dark).png" },
];

const Slider = () => {
  const sliderRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkTheme(theme === "dark");
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          checkTheme();
        }
      });
    });

    checkTheme();
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const currentImages = isDarkTheme ? images_Dark : images;

  return (
    <div className="w-full max-w-[7xl] mx-auto pt-10 px-4">
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
      >
        {currentImages.map((img, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 rounded-xl overflow-hidden snap-start shadow-lg border border-gray-200 dark:border-gray-600"
            style={{ width: "196.5px", height: "426px" }} // Reducido a la mitad
          >
            <img
              src={img.src}
              alt={img.title || `Captura ${idx + 1}`}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
