import React, { useState, useEffect } from "react";
import "./style.css";
import Menu from "./Menu";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

function Confirmaciones({ onNavigate }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

  const [confirmaciones, setConfirmaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const [menuAbierto, setMenuAbierto] = useState(false);

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
        console.error("Error cargando confirmaciones:", err);
        if (!cancel) setError("No se pudo cargar las confirmaciones.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [API_BASE]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d) ? value : d.toLocaleString();
  };

  const handleVer = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  const Header = () => (
    <header
      className="d-flex justify-content-between align-items-center p-3 text-white"
      style={{ backgroundColor: "#043474" }}
    >
      <button
        className="btn btn-outline-light d-md-none"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      <img src="/logo.jpg" alt="Logo" style={{ height: "50px" }} />
    </header>
  );

  return (
    <div className="d-flex min-vh-100">
			{/* Sidebar - siempre visible en desktop, desplegable en móvil */}
			<div className={`d-none d-md-block`}>
				<Menu onNavigate={onNavigate} activeItem="confirmaciones" />
			</div>
			{menuAbierto && (
				<div className="d-md-none position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }}>
					<div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={() => setMenuAbierto(false)}></div>
					<div className="position-absolute top-0 start-0">
						<Menu onNavigate={onNavigate} activeItem="confirmaciones" onClose={() => setMenuAbierto(false)} />
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="main-content flex-grow-1 d-flex flex-column">
				{/* Header */}
				<Header />

				<main className="flex-grow-1 p-5">
          <h2 className="text-primary fw-bold mb-3">Confirmaciones</h2>

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
                        <th>NOMBRE</th>
                        <th>CORREO</th>
                        <th>TELÉFONO</th>
                        <th>CARGO</th>
                        <th>DIRECCIÓN</th>
                        <th>FECHA CONFIRMACIÓN</th>
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmaciones.length === 0 ? (
                        <tr><td colSpan="7">No hay confirmaciones.</td></tr>
                      ) : (
                        confirmaciones.map(c => (
                          <tr key={c.id_confirmacion}>
                            <td>{c.nombre}</td>
                            <td>{c.correo}</td>
                            <td>{c.telefono || "-"}</td>
                            <td>{c.cargo || "-"}</td>
                            <td>{c.direccion || "-"}</td>
                            <td>{formatDate(c.fecha_confirmacion)}</td>
                            <td>
                              <Button
                                variant="link"
                                className="p-0"
                                onClick={() => handleVer(c)}
                              >
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
      </div>

      {/* Modal detalle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <div>
              <p><b>Nombre:</b> {selected.nombre}</p>
              <p><b>Correo:</b> {selected.correo}</p>
              <p><b>Teléfono:</b> {selected.telefono || "-"}</p>
              <p><b>Cargo:</b> {selected.cargo || "-"}</p>
              <p><b>Dirección:</b> {selected.direccion || "-"}</p>
              <p><b>Fecha Confirmación:</b> {formatDate(selected.fecha_confirmacion)}</p>
            </div>
          ) : (
            <p>No hay datos para mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Confirmaciones;
