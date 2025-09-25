import React, { useState } from "react";

function Menu({ onNavigate, activeItem, onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Menú principal y submenús
  const menuItems = [
    { key: "dashboard", icon: "fa-house", label: "Dashboard" },
    { key: "eventos", icon: "fa-calendar-days", label: "Eventos" },
    { key: "invitaciones", icon: "fa-envelope", label: "Invitaciones"},
    { key: "confirmaciones", icon: "fa-check", label: "Confirmaciones" },
    { key: "reportes", icon: "fa-file", label: "Reportes" },
    { key: "new-user", icon: "fa-user-plus", label: "Nuevo Usuario" }
  ];

  const toggleSubmenu = (key) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

  return (
    <aside 
      className="sidebar d-flex flex-column p-3 text-white"
      style={{ backgroundColor: "#043474" }}
    >
      {/* Botón cerrar en móvil */}
      <div className="d-md-none mb-3">
        <button 
          className="btn btn-outline-light btn-sm"
          onClick={onClose}
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      {/* Navegación */}
      <nav>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item mb-2">
              {/* Botón principal */}
              <button
                className={`nav-link btn btn-link text-start w-100 text-white d-flex align-items-center justify-content-between ${
                  activeItem === item.key ? "fw-bold" : ""
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.key);
                  } else {
                    onNavigate(item.key);
                  }
                }}
              >
                <span>
                  <i className={`fa-solid ${item.icon} me-2`}></i>
                  {item.label}
                </span>
                {item.submenu && (
                  <i
                    className={`fa-solid ms-2 ${
                      openSubmenu === item.key ? "fa-chevron-up" : "fa-chevron-down"
                    }`}
                  ></i>
                )}
              </button>

              {/* Submenú */}
              {item.submenu && openSubmenu === item.key && (
                <ul className="nav flex-column ms-4 mt-2">
                  {item.submenu.map((sub) => (
                    <li key={sub.key} className="nav-item mb-1">
                      <button
                        className={`nav-link btn btn-link text-start w-100 text-white ${
                          activeItem === sub.key ? "fw-bold" : ""
                        }`}
                        onClick={() => onNavigate(sub.key)}
                      >
                        <i className="fa-solid fa-angle-right me-2"></i>
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* Salir */}
          <li className="nav-item mt-4">
            <button
              className="nav-link btn btn-link text-start w-100 text-white"
              onClick={() => onNavigate("login")}
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
              Salir
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Menu;
