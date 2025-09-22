import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import Menu from './Menu';
import { Modal, Button } from 'react-bootstrap';

function Eventos({ onNavigate }) {
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

  // Estado para abrir/cerrar menú lateral
  const [menuAbierto, setMenuAbierto] = useState(true);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    categoria: '',
    fecha: ''
  });
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para modales
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Categorías disponibles
  const categorias = ['Macroevento', 'Adicional', 'Especial'];

  // 🔹 Header con logo y botón menú
  const Header = () => (
    <header
      className="header d-flex justify-content-between align-items-center p-3 text-white"
      style={{ backgroundColor: "#043474" }}
    >
      <button
        className="btn btn-outline-light"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      <img src="/logo.jpg" alt="Logo" style={{ height: "50px" }} />
    </header>
  );

  // Cargar eventos desde el backend
  const cargarEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/eventos`);
      if (!res.ok) throw new Error("Error al cargar eventos");
      const data = await res.json();
      setEventos(data);
    } catch (err) {
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Funciones de filtros
  const handleInputChange = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    console.log("Buscar con filtros", filtros);
  };

  const handleLimpiar = () => {
    setFiltros({ categoria: '', fecha: '' });
    cargarEventos();
  };

  // Clases para estado
  const getEstadoBadgeClass = (estado) => {
    switch ((estado || '').toLowerCase()) {
      case 'activo': return 'badge badge-activo';
      case 'inactivo': return 'badge badge-inactivo';
      default: return 'badge bg-secondary';
    }
  };

  // Funciones para abrir modales
  const handleView = (evento) => {
    setEventoSeleccionado(evento);
    setShowViewModal(true);
  };

  const handleEdit = (evento) => {
    setEventoSeleccionado({ ...evento });
    setShowEditModal(true);
  };

  const handleDelete = (evento) => {
    setEventoSeleccionado(evento);
    setShowDeleteModal(true);
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(`${API_BASE}/eventos/${eventoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventoSeleccionado),
      });
      if (!res.ok) throw new Error("Error al actualizar evento");
      await cargarEventos();
      setShowEditModal(false);
      alert("Evento actualizado correctamente");
    } catch {
      alert("Error al actualizar el evento");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/eventos/${eventoSeleccionado.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar evento");
      await cargarEventos();
      setShowDeleteModal(false);
    } catch {
      alert("Error al eliminar el evento");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header */}
      <Header />

      <div className="d-flex flex-grow-1">
        {/* Menú lateral condicional */}
        {menuAbierto && (
          <Menu onNavigate={onNavigate} activeItem="eventos" />
        )}

        {/* Contenido principal */}
        <main className="flex-grow-1 p-5">
          <h2 className="text-primary fw-bold mb-3">Eventos</h2>

          {/* Botón de Filtros */}
          <div className="bg-white rounded shadow-sm p-3 mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-auto">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={() => setMostrarFiltros(prev => !prev)}
                >
                  {mostrarFiltros ? "Ocultar Filtros" : "Filtros"}
                </button>
              </div>
            </div>

            {/* Contenido de filtros desplegable */}
            {mostrarFiltros && (
              <>
                <div className="row g-2 mt-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Categoría:</label>
                    <select
                      className="form-select"
                      name="categoria"
                      value={filtros.categoria}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Fecha del evento:</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha"
                      value={filtros.fecha}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-12 col-md-4 d-grid">
                    <button className="btn btn-success w-100" onClick={handleBuscar}>
                      <i className="fa-solid fa-magnifying-glass me-1"></i>Buscar
                    </button>
                  </div>
                  <div className="col-12 col-md-4 d-grid">
                    <button className="btn btn-outline-secondary w-100" onClick={handleLimpiar}>
                      <i className="fa-solid fa-eraser me-1"></i>Limpiar
                    </button>
                  </div>
                  <div className="col-12 col-md-4 d-grid">
                    <button className="btn btn-primary w-100" onClick={() => onNavigate('new-evento')}>
                      <i className="fa-solid fa-plus me-1"></i>Nuevo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

          {/* Tabla de eventos */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 text-center">
                  <thead className="table-events-header">
                    <tr>
                      <th className="text-white border-0">EVENTO</th>
                      <th className="text-white border-0">CATEGORÍA</th>
                      <th className="text-white border-0">ESTADO</th>
                      <th className="text-white border-0">FECHA</th>
                      <th className="text-white border-0">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>
                    )}
                    {!loading && eventos.map(evento => (
                      <tr key={evento.id}>
                        <td className="border-0">{evento.nombre}</td>
                        <td className="border-0">{evento.categoria}</td>
                        <td className="border-0">
                          <span className={getEstadoBadgeClass(evento.estado)}>{evento.estado}</span>
                        </td>
                        <td className="border-0">{evento.fecha}</td>
                        <td className="border-0">
                          <div className="btn-group" role="group">
                            <button className="btn btn-link text-primary btn-action" title="Ver" onClick={() => handleView(evento)}>
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button className="btn btn-link text-primary btn-action" title="Editar" onClick={() => handleEdit(evento)}>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button className="btn btn-link btn-action-danger" title="Eliminar" onClick={() => handleDelete(evento)}>
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Ver Detalles */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eventoSeleccionado && (
            <div>
              <p><strong>Nombre:</strong> {eventoSeleccionado.nombre}</p>
              <p><strong>Categoría:</strong> {eventoSeleccionado.categoria}</p>
              <p><strong>Tema del Evento:</strong> {eventoSeleccionado.temaEvento}</p>
              <p><strong>Tema de la Conferencia:</strong> {eventoSeleccionado.temaConferencia}</p>
              <p><strong>Fecha:</strong> {eventoSeleccionado.fecha}</p>
              <p><strong>Lugar:</strong> {eventoSeleccionado.lugar}</p>
              <p><strong>Hora Inicio:</strong> {eventoSeleccionado.horaInicio}</p>
              <p><strong>Hora Fin:</strong> {eventoSeleccionado.horaFin}</p>
              <p><strong>Código Vestimenta:</strong> {eventoSeleccionado.codigoVestimenta}</p>
              <p><strong>Organizado Por:</strong> {eventoSeleccionado.organizadoPor}</p>
              <p><strong>Estado:</strong> {eventoSeleccionado.estado}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Evento */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eventoSeleccionado && (
            <form>
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.nombre}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, nombre: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={eventoSeleccionado.categoria}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, categoria: e.target.value })}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Tema del Evento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.temaEvento}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, temaEvento: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Tema de la Conferencia</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.temaConferencia}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, temaConferencia: e.target.value })}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={eventoSeleccionado.fecha}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, fecha: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Lugar</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.lugar}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, lugar: e.target.value })}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Hora Inicio</label>
                  <input
                    type="time"
                    className="form-control"
                    value={eventoSeleccionado.horaInicio}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, horaInicio: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Hora Fin</label>
                  <input
                    type="time"
                    className="form-control"
                    value={eventoSeleccionado.horaFin}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, horaFin: e.target.value })}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Código de Vestimenta</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.codigoVestimenta}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, codigoVestimenta: e.target.value })}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Organizado Por</label>
                  <input
                    type="text"
                    className="form-control"
                    value={eventoSeleccionado.organizadoPor}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, organizadoPor: e.target.value })}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={eventoSeleccionado.estado}
                    onChange={(e) => setEventoSeleccionado({ ...eventoSeleccionado, estado: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarCambios}>Guardar cambios</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eventoSeleccionado && (
            <p>¿Seguro que deseas eliminar el evento <strong>{eventoSeleccionado.nombre}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Eventos;
