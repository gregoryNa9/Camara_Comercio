import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import Menu from "./Menu";
import { Modal, Button, Table, Spinner, Form } from "react-bootstrap";

function Confirmaciones({ onNavigate }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

  const [confirmaciones, setConfirmaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // Carga inicial
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/confirmaciones`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancel) setConfirmaciones(data);
      } catch (err) {
        if (!cancel) setError("No se pudo cargar las confirmaciones.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [API_BASE]);

  // Cerrar menu con ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && menuAbierto) setMenuAbierto(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuAbierto]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d) ? value : d.toLocaleDateString();
  };

  const handleVer = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  const handleBuscar = () => {
    fetch(`${API_BASE}/confirmaciones`)
      .then((res) => res.json())
      .then((data) => {
        const filtradas = data.filter((c) => {
          const matchNombre = filtroNombre
            ? (c.nombre || "").toLowerCase().includes(filtroNombre.toLowerCase())
            : true;
          const matchEvento = filtroCategoria
            ? (c.nombre_evento || "").toLowerCase().includes(filtroCategoria.toLowerCase())
            : true;
          const matchFecha = filtroFecha
            ? (c.fecha_confirmacion || "").startsWith(filtroFecha)
            : true;
          return matchNombre && matchEvento && matchFecha;
        });
        setConfirmaciones(filtradas);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleLimpiar = () => {
    setFiltroNombre("");
    setFiltroCategoria("");
    setFiltroFecha("");
    fetch(`${API_BASE}/confirmaciones`)
      .then((res) => res.json())
      .then((data) => setConfirmaciones(data))
      .catch((err) => console.error(err));
  };

  const Header = () => (
    <header className="app-header">
      {/* Botón hamburguesa (izquierda) */}
      <div className="d-flex align-items-center">
        <button
          className="btn btn-outline-light hamburger-btn"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Abrir menú"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Logo a la derecha */}
      <div>
        <img src="/logo.jpg" alt="Logo" className="app-logo" />
      </div>
    </header>
  );

  const eventosUnicos = [...new Set(confirmaciones.map((c) => c.nombre_evento).filter(Boolean))];

  return (
    <div className="app-root d-flex flex-column min-vh-100">
      <Header />

      {/* Menu: controlado por `menuAbierto` */}
      <Menu
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onNavigate={(key) => {
          setMenuAbierto(false);
          if (onNavigate) onNavigate(key);
        }}
        activeItem="confirmaciones"
      />

      {/* Contenido principal */}
      <main className="flex-grow-1 p-5 content-area">
        <h2 className="text-primary fw-bold mb-3">Confirmaciones</h2>

        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setMostrarFiltros((prev) => !prev)}
          >
            {mostrarFiltros ? "Ocultar Filtros" : "Filtros"}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="bg-white rounded shadow-sm p-3 mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <Form.Label>Nombre:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <Form.Label>Evento:</Form.Label>
                <Form.Control
                  as="select"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Seleccionar categoría</option>
                  {eventosUnicos.map((evento, idx) => (
                    <option key={idx} value={evento}>
                      {evento}
                    </option>
                  ))}
                </Form.Control>
              </div>
              <div className="col-md-4">
                <Form.Label>Fecha del evento:</Form.Label>
                <Form.Control
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-2 mt-3">
              <div className="col-md-auto">
                <Button variant="success" onClick={handleBuscar}>
                  🔍 Buscar
                </Button>
              </div>
              <div className="col-md-auto">
                <Button variant="secondary" onClick={handleLimpiar}>
                  🧹 Limpiar
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : (
          <div className="table-container">
            <div className="card-body p-0">
              <div className="table-responsive">
                <Table hover striped className="mb-0 text-center">
                  <thead className="table-events-header">
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Cargo</th>
                      <th>Dirección</th>
                      <th>Evento</th>
                      <th>Fecha Confirmación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmaciones.length === 0 ? (
                      <tr>
                        <td colSpan="8">No hay confirmaciones.</td>
                      </tr>
                    ) : (
                      confirmaciones.map((c) => (
                        <tr key={c.id_confirmacion}>
                          <td>{c.nombre}</td>
                          <td>{c.correo}</td>
                          <td>{c.telefono || "-"}</td>
                          <td>{c.cargo || "-"}</td>
                          <td>{c.direccion || "-"}</td>
                          <td>{c.nombre_evento || "-"}</td>
                          <td>{formatDate(c.fecha_confirmacion)}</td>
                          <td>
                            <Button variant="link" className="p-0" onClick={() => handleVer(c)}>
                              <i className="fa-solid fa-eye me-1"></i>Ver
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal detalle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <div>
              <p>
                <b>Nombre:</b> {selected.nombre}
              </p>
              <p>
                <b>Correo:</b> {selected.correo}
              </p>
              <p>
                <b>Teléfono:</b> {selected.telefono || "-"}
              </p>
              <p>
                <b>Cargo:</b> {selected.cargo || "-"}
              </p>
              <p>
                <b>Dirección:</b> {selected.direccion || "-"}
              </p>
              <p>
                <b>Evento:</b> {selected.nombre_evento || "-"}
              </p>
              <p>
                <b>Fecha Confirmación:</b> {formatDate(selected.fecha_confirmacion)}
              </p>
            </div>
          ) : (
            <p>No hay datos para mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Confirmaciones;
