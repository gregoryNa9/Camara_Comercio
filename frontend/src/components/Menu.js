import React from "react";

function Menu({ open = false, onClose = () => {}, onNavigate = () => {}, activeItem }) {
  const menuItems = [
    { key: "dashboard", icon: "fa-house", label: "Dashboard" },
    { key: "eventos", icon: "fa-calendar-days", label: "Eventos" },
    { key: "invitaciones", icon: "fa-envelope", label: "Invitaciones" },
    { key: "confirmaciones", icon: "fa-check", label: "Confirmaciones" },
    { key: "reportes", icon: "fa-file", label: "Reportes" },
    { key: "new-user", icon: "fa-user-plus", label: "Nuevo Usuario" },
  ];

  return (
    <>
      {/* Overlay: clic cierra */}
      <div className={`menu-overlay ${open ? "visible" : ""}`} onClick={onClose} />

      <aside className={`menu-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="menu-drawer-header d-flex justify-content-end">
          <button className="btn btn-sm btn-outline-light" onClick={onClose} aria-label="Cerrar menú">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <nav className="mt-2">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item mb-2" key={item.key}>
                <button
                  className={`btn btn-link text-start w-100 ${activeItem === item.key ? "fw-bold" : ""}`}
                  onClick={() => {
                    onNavigate(item.key);
                    onClose();
                  }}
                >
                  <i className={`fa-solid ${item.icon} me-2`}></i>
                  {item.label}
                </button>
              </li>
            ))}

            <li className="nav-item mt-4">
              <button
                className="btn btn-link text-start w-100"
                onClick={() => {
                  onNavigate("login");
                  onClose();
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                Salir
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Menu;
