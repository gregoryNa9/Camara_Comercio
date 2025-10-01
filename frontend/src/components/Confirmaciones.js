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
  const [exporting, setExporting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);

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

  const handleExportar = async () => {
    try {
      setExporting(true);
      const response = await fetch(`${API_BASE}/confirmaciones/exportar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Confirmaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exportando confirmaciones:", err);
      setError("No se pudo exportar las confirmaciones.");
    } finally {
      setExporting(false);
    }
  };

  const handleVerQR = (item) => {
    const qrUrl = item.qr_participante || item.qr_url;
    if (qrUrl) {
      setQrData({
        nombre: item.nombre,
        codigo: item.codigo_participante || item.codigo_unico,
        qrUrl: qrUrl
      });
      setShowQRModal(true);
    }
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="text-primary fw-bold mb-0">Confirmaciones</h2>
            <Button 
              variant="success" 
              onClick={handleExportar}
              disabled={exporting || confirmaciones.length === 0}
            >
              {exporting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-excel me-2"></i>
                  Exportar Excel
                </>
              )}
            </Button>
          </div>

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
                        <th>TIPO</th>
                        <th>NOMBRE</th>
                        <th>CORREO</th>
                        <th>TELÉFONO</th>
                        <th>CARGO</th>
                        <th>CÓDIGO ALFANUMÉRICO</th>
                        <th>QR</th>
                        <th>FECHA CONFIRMACIÓN</th>
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmaciones.length === 0 ? (
                        <tr><td colSpan="9">No hay confirmaciones.</td></tr>
                      ) : (
                        confirmaciones.map(c => (
                          <tr key={c.id_confirmacion}>
                            <td>
                              <span className={`badge ${c.tipo_participante === 'Principal' ? 'bg-primary' : 'bg-success'}`}>
                                {c.tipo_participante || 'Principal'}
                              </span>
                            </td>
                            <td>{c.nombre}</td>
                            <td>{c.correo}</td>
                            <td>{c.telefono || "-"}</td>
                            <td>{c.cargo || "-"}</td>
                            <td>
                              <code className="text-primary">
                                {c.codigo_participante || c.codigo_unico || "-"}
                              </code>
                            </td>
                            <td>
                              {c.qr_participante || c.qr_url ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleVerQR(c)}
                                  className="p-1"
                                >
                                  <i className="fa-solid fa-qrcode"></i>
                                </Button>
                              ) : (
                                "-"
                              )}
                            </td>
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
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Información Personal</h6>
                  <p><b>Nombre:</b> {selected.nombre}</p>
                  <p><b>Correo:</b> {selected.correo}</p>
                  <p><b>Teléfono:</b> {selected.telefono || "-"}</p>
                  <p><b>Cargo:</b> {selected.cargo || "-"}</p>
                  <p><b>Dirección:</b> {selected.direccion || "-"}</p>
                  <p><b>Tipo:</b> 
                    <span className={`badge ms-2 ${selected.tipo_participante === 'Principal' ? 'bg-primary' : 'bg-success'}`}>
                      {selected.tipo_participante || 'Principal'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Códigos y Evento</h6>
                  <p><b>Código Alfanumérico:</b> 
                    <code className="text-primary ms-2">
                      {selected.codigo_participante || selected.codigo_unico || "-"}
                    </code>
                  </p>
                  <p><b>Evento:</b> {selected.evento || "-"}</p>
                  <p><b>Categoría:</b> {selected.categoria || "-"}</p>
                  <p><b>Fecha Evento:</b> {selected.fecha_evento ? new Date(selected.fecha_evento).toLocaleDateString('es-ES') : "-"}</p>
                  <p><b>Lugar:</b> {selected.lugar_evento || "-"}</p>
                  <p><b>Fecha Confirmación:</b> {formatDate(selected.fecha_confirmacion)}</p>
                </div>
              </div>
              
              {(selected.qr_participante || selected.qr_url) && (
                <div className="mt-4 text-center">
                  <h6 className="text-primary mb-3">Código QR</h6>
                  <img 
                    src={`http://localhost:8080${selected.qr_participante || selected.qr_url}`} 
                    alt="QR Code" 
                    style={{ width: "150px", height: "150px" }}
                    className="img-thumbnail"
                  />
                </div>
              )}
            </div>
          ) : (
            <p>No hay datos para mostrar.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal QR */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Código QR</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrData && (
            <div>
              <p><b>Nombre:</b> {qrData.nombre}</p>
              <p><b>Código:</b> <code className="text-primary">{qrData.codigo}</code></p>
              <div className="mt-3">
                <img 
                  src={`http://localhost:8080${qrData.qrUrl}`} 
                  alt="QR Code" 
                  style={{ width: "200px", height: "200px" }}
                  className="img-thumbnail"
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Confirmaciones;
