import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import Menu from './Menu';

function Historial({ onNavigate, selectedUser }) {
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

  // Estados
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtros, setFiltros] = useState({
    tipoEvento: '',
    fechaEvento: ''
  });
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

  // Tipos de evento
  const tiposEvento = ['Macroevento', 'Adicional', 'Especial'];

  // Cargar historial de eventos del usuario seleccionado
  const cargarHistorialUsuario = useCallback(async (usuarioId) => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener invitaciones del usuario con información de eventos
      const res = await fetch(`${API_BASE}/invitaciones/usuario/${usuarioId}`);
      if (!res.ok) throw new Error("Error al cargar historial del usuario");
      
      const data = await res.json();
      
      // Mapear los datos para mostrar en la tabla
      const historialMapeado = data.map(invitacion => ({
        id: invitacion.id_invitacion,
        nombre: invitacion.evento || 'Evento no disponible',
        categoria: invitacion.categoria || 'Sin categoría',
        fecha: invitacion.fecha_evento ? new Date(invitacion.fecha_evento).toLocaleDateString('es-ES') : 'Sin fecha',
        lugar: invitacion.lugar || 'Sin lugar',
        estado: invitacion.id_estado === 1 ? 'Pendiente' : invitacion.id_estado === 2 ? 'Confirmado' : 'Cancelado',
        fechaEnvio: invitacion.fecha_envio ? new Date(invitacion.fecha_envio).toLocaleDateString('es-ES') : 'No enviado',
        codigoAlfanumerico: invitacion.codigo_unico || 'Sin código',
        qrUrl: invitacion.qr_url || null
      }));
      
      setHistorial(historialMapeado);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('No se pudo cargar el historial del usuario');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Carga inicial de historial
  useEffect(() => {
    if (selectedUser && selectedUser.id_usuario) {
      cargarHistorialUsuario(selectedUser.id_usuario);
    } else {
      setHistorial([]);
      setError('No se ha seleccionado un usuario');
    }
  }, [selectedUser, cargarHistorialUsuario]);

  // Funciones de filtro
  const handleInputChange = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    // Aplicar filtros locales a los datos ya cargados
    if (selectedUser && selectedUser.id_usuario) {
      cargarHistorialUsuario(selectedUser.id_usuario);
    }
  };

  const handleLimpiar = () => {
    setFiltros({ tipoEvento: '', fechaEvento: '' });
    // Recargar datos sin filtros
    if (selectedUser && selectedUser.id_usuario) {
      cargarHistorialUsuario(selectedUser.id_usuario);
    }
  };

  // Filtrar historial localmente
  const historialFiltrado = historial.filter(item => {
    const cumpleTipo = !filtros.tipoEvento || item.categoria === filtros.tipoEvento;
    const cumpleFecha = !filtros.fechaEvento || item.fecha.includes(filtros.fechaEvento);
    return cumpleTipo && cumpleFecha;
  });

  // Funciones para manejar el modal del QR
  const handleShowQR = (qrUrl, codigoAlfanumerico) => {
    setSelectedQR({ qrUrl, codigoAlfanumerico });
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedQR(null);
  };

  // Header con logo y menú, color #043474
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
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header */}
      <Header />

      <div className="d-flex flex-grow-1">
        {/* Sidebar - siempre visible en desktop, desplegable en móvil */}
        <div className={`d-none d-md-block`}>
          <Menu onNavigate={onNavigate} activeItem="reportes" />
        </div>
        {menuAbierto && (
          <div className="d-md-none">
            <Menu onNavigate={onNavigate} activeItem="reportes" />
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-grow-1 p-5">
        <h2 className="text-primary fw-bold mb-3">Historial</h2>
        <h5 className="text-muted mb-4">
          Historial de {selectedUser ? selectedUser.nombre : 'Usuario no seleccionado'}
        </h5>

        {/* Filtros */}
        <div className="bg-white rounded shadow-sm p-3 mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-auto">
              <button className="btn btn-primary active w-100">Filtros</button>
            </div>
          </div>
          <div className="row g-2 mt-1">
            <div className="col-12 col-md-6">
              <label className="form-label">Tipo de evento:</label>
              <select className="form-select" name="tipoEvento" value={filtros.tipoEvento} onChange={handleInputChange}>
                <option value="">Seleccionar tipo</option>
                {tiposEvento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Fecha del evento:</label>
              <input
                type="text"
                className="form-control"
                placeholder="dd/mm/aaaa"
                name="fechaEvento"
                value={filtros.fechaEvento}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-12 col-md-6 d-grid">
              <button className="btn btn-primary w-100" onClick={handleBuscar}>
                <i className="fa-solid fa-magnifying-glass me-1"></i>Buscar
              </button>
            </div>
            <div className="col-12 col-md-6 d-grid">
              <button className="btn btn-outline-secondary w-100" onClick={handleLimpiar}>
                <i className="fa-solid fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </div>

        {/* Tabla de historial */}
        <div className="stats-card equal-card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-events-header">
                  <tr>
                    <th className="text-white border-0">EVENTO</th>
                    <th className="text-white border-0">CATEGORÍA</th>
                    <th className="text-white border-0">FECHA</th>
                    <th className="text-white border-0">LUGAR</th>
                    <th className="text-white border-0">CÓDIGO</th>
                    <th className="text-white border-0">QR</th>
                    <th className="text-white border-0">ESTADO</th>
                    <th className="text-white border-0">FECHA ENVÍO</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="8" className="text-center py-4">Cargando...</td></tr>
                  )}
                  {!loading && historialFiltrado.length === 0 && (
                    <tr><td colSpan="8" className="text-center py-4 text-muted">No hay eventos registrados para este usuario</td></tr>
                  )}
                  {!loading && historialFiltrado.map(item => (
                    <tr key={item.id}>
                      <td className="border-0">{item.nombre}</td>
                      <td className="border-0">{item.categoria}</td>
                      <td className="border-0">{item.fecha}</td>
                      <td className="border-0">{item.lugar}</td>
                      <td className="border-0">
                        <span className="badge bg-info text-dark fw-bold">
                          {item.codigoAlfanumerico}
                        </span>
                      </td>
                      <td className="border-0 text-center">
                        {item.qrUrl ? (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShowQR(item.qrUrl, item.codigoAlfanumerico)}
                            style={{ fontSize: '12px' }}
                          >
                            Código QR
                          </button>
                        ) : (
                          <span className="text-muted">Sin QR</span>
                        )}
                      </td>
                      <td className="border-0">
                        <span className={`badge ${
                          item.estado === 'Confirmado' ? 'bg-success' : 
                          item.estado === 'Pendiente' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {item.estado}
                        </span>
                      </td>
                      <td className="border-0">{item.fechaEnvio}</td>
                    </tr>
                  ))}
                  {/* Filas vacías para mantener la estética */}
                  {!loading && historialFiltrado.length > 0 && historialFiltrado.length < 6 && (
                    Array.from({ length: 6 - historialFiltrado.length }).map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                        <td className="border-0">&nbsp;</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Modal para mostrar el código QR */}
      {showQRModal && selectedQR && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Código QR - {selectedQR.codigoAlfanumerico}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseQR}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedQR.qrUrl.includes('\\') || selectedQR.qrUrl.includes('/') 
                    ? `http://localhost:8080/temp/${selectedQR.qrUrl.split(/[\\/]/).pop()}` 
                    : `http://localhost:8080/temp/${selectedQR.qrUrl}`} 
                  alt={`QR para ${selectedQR.codigoAlfanumerico}`}
                  style={{ maxWidth: '300px', maxHeight: '300px' }}
                  className="img-fluid"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="alert alert-warning mt-3" style={{ display: 'none' }}>
                  <i className="fa-solid fa-exclamation-triangle me-2"></i>
                  Error al cargar el código QR
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    Código: <strong>{selectedQR.codigoAlfanumerico}</strong>
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseQR}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historial;
