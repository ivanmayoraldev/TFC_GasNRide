import React, { useEffect, useState } from "react";

const DarkMode = () => {
  // Función para obtener la preferencia inicial del tema
  // Comprueba si hay un tema guardado en localStorage o usa la preferencia del sistema
  const getInitialMode = () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // Si no hay tema guardado, usa la preferencia del sistema
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };

  // Estado para controlar el modo oscuro
  const [darkMode, setDarkMode] = useState(getInitialMode);

  // Efecto que se ejecuta cuando cambia el modo oscuro
  // Actualiza el atributo data-theme y guarda la preferencia en localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Renderizado del botón de cambio de tema
  return (
    <button
      aria-label="Cambiar tema"
      onClick={() => setDarkMode((prev) => !prev)}
      className="relative w-14 h-7 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow"
    >
      {/* Indicador del tema actual */}
      <span
        className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
          darkMode 
            ? 'bg-blue-900 translate-x-7' 
            : 'bg-yellow-400 translate-x-0'
        }`}
      >
        {/* Icono de luna para modo oscuro */}
        {darkMode ? (
          <svg
            className="w-full h-full p-1 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        ) : (
          // Icono de sol para modo claro
          <svg
            className="w-full h-full p-1 bg-yellow-500 text-white rounded-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default DarkMode;
