import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import Menu from './Menu';
import { Modal, Button } from 'react-bootstrap';

const API_BASE = 'http://localhost:8080/api';

function NewUser({ onNavigate }) {
  // Sidebar desplegable
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [filtros, setFiltros] = useState({ cedula: '', apellido: '' });

  // Modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = useState(null);

  // Formulario de nuevo usuario invitado
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    cedula: '',
    correo: '',
    telefono: '',
    empresa: '',
    cargo: '',
    direccion: '',
    usuario: '', // Se generará automáticamente
    password: '', // Se generará automáticamente
    // El rol se asigna automáticamente por la base de datos (usuario por defecto)
    activo: 1
  });

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/usuarios`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo usuario invitado
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Preparar datos del invitado
      const datosInvitado = {
        ...nuevoUsuario,
        // Generar credenciales automáticamente (no se muestran al usuario)
        usuario: `invitado_${nuevoUsuario.cedula}`,
        password: `invitado${nuevoUsuario.cedula}`,
        // El rol se asigna automáticamente por la base de datos (usuario por defecto)
        activo: 1
      };

      const response = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosInvitado),
      });

      if (response.ok) {
        setSuccess('Invitado registrado exitosamente');
        setNuevoUsuario({
          nombre: '',
          cedula: '',
          correo: '',
          telefono: '',
          empresa: '',
          cargo: '',
          direccion: '',
          usuario: '', // Se generará automáticamente
          password: '', // Se generará automáticamente
          // El rol se asigna automáticamente por la base de datos
          activo: 1
        });
        fetchUsuarios(); // Recargar la lista
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al registrar invitado');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({ ...nuevoUsuario, [name]: value });
  };

  // Limpiar formulario
  const handleLimpiarFormulario = () => {
    setNuevoUsuario({
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      empresa: '',
      cargo: '',
      direccion: '',
      usuario: '', // Se generará automáticamente
      password: '', // Se generará automáticamente
      // El rol se asigna automáticamente por la base de datos
      activo: 1
    });
    setError('');
    setSuccess('');
  };

  // Funciones modales
  const handleViewUser = (user) => { setSelectedUser(user); setShowViewModal(true); };
  const handleEditUser = (user) => { setSelectedUser(user); setShowEditModal(true); };
  const handleEditChange = (e) => { const { name, value } = e.target; setSelectedUser({ ...selectedUser, [name]: value }); };

  // Filtros
  const handleInputChange = (e) => { setFiltros({ ...filtros, [e.target.name]: e.target.value }); };
  const handleBuscar = () => { console.log('Buscando usuarios:', filtros); };
  const handleLimpiar = () => { setFiltros({ cedula: '', apellido: '' }); };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Header
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

  return (
    <div className="d-flex min-vh-100">
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

      {/* Main Content */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        {/* Header */}
        <Header />

        <main className="flex-grow-1 p-5">
          {/* Filtros */}
          <div className="bg-white rounded shadow-sm p-3 mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-auto"><div className="mb-2 fw-bold text-info">Filtros</div></div>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label">Cédula:</label>
                <input type="text" className="form-control" name="cedula" value={filtros.cedula} onChange={handleInputChange} />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label">Apellido:</label>
                <input type="text" className="form-control" name="apellido" value={filtros.apellido} onChange={handleInputChange} />
              </div>
              <div className="col-lg-4 d-grid">
                <button className="btn btn-primary mb-1" onClick={handleBuscar}><i className="fa-solid fa-magnifying-glass me-1"></i>Buscar</button>
                <button className="btn btn-outline-secondary" onClick={handleLimpiar}><i className="fa-solid fa-eraser me-1"></i>Limpiar</button>
              </div>
            </div>
            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
          </div>

          {/* Formulario de registro */}
          <div className="bg-white rounded shadow-sm p-4 mb-4">
            <div className="alert alert-info mb-3">
              <i className="fa-solid fa-info-circle me-2"></i>
              <strong>Registrar Invitado:</strong> Complete los datos de la persona que será invitada a los eventos. 
              No se requieren credenciales de acceso al sistema.
            </div>
            <form onSubmit={handleCrearUsuario}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">NOMBRES:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="nombre"
                    value={nuevoUsuario.nombre}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">CEDULA:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="cedula"
                    value={nuevoUsuario.cedula}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">CELULAR:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="telefono"
                    value={nuevoUsuario.telefono}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">CORREO:</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    name="correo"
                    value={nuevoUsuario.correo}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">EMPRESA:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="empresa"
                    value={nuevoUsuario.empresa}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">CARGO:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="cargo"
                    value={nuevoUsuario.cargo}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              {/* Mensajes de éxito y error */}
              {success && <div className="alert alert-success mt-3 mb-0">{success}</div>}
              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
              
              <div className="row g-2 mt-3">
                <div className="col-12 col-md-3 d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                  >
                    <i className="fa-solid fa-floppy-disk me-2"></i>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
                <div className="col-12 col-md-3 d-grid">
                  <button 
                    type="button" 
                    className="btn btn-light" 
                    style={{ border: '1px solid #dee2e6' }}
                    onClick={handleLimpiarFormulario}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tabla de usuarios */}
          <div className="stats-card equal-card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-events-header">
                  <tr>
                    <th className="text-white border-0">LISTA DE INVITADOS</th>
                    <th className="text-white border-0">CELULAR</th>
                    <th className="text-white border-0">CORREO</th>
                    <th className="text-white border-0">EMPRESA</th>
                    <th className="text-white border-0">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : usuarios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No hay invitados registrados</td>
                    </tr>
                  ) : (
                    usuarios.map((u, idx) => (
                      <tr key={u.id_usuario || idx}>
                        <td>{u.nombre}</td>
                        <td>{u.telefono || '-'}</td>
                        <td><a href={`mailto:${u.correo}`}>{u.correo}</a></td>
                        <td>{u.empresa || '-'}</td>
                        <td className="text-center">
                          <button className="btn btn-link text-primary" onClick={() => handleViewUser(u)}><i className="fa-solid fa-eye"></i></button>
                          <button className="btn btn-link text-primary" onClick={() => handleEditUser(u)}><i className="fa-solid fa-pen"></i></button>
                          <button className="btn btn-link text-danger"><i className="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Ver Más */}
          <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
            <Modal.Header closeButton><Modal.Title>Información del Invitado</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <div>
                  <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
                  <p><strong>Cédula:</strong> {selectedUser.cedula}</p>
                  <p><strong>Celular:</strong> {selectedUser.telefono || '-'}</p>
                  <p><strong>Correo:</strong> {selectedUser.correo}</p>
                  <p><strong>Empresa:</strong> {selectedUser.empresa || '-'}</p>
                  <p><strong>Cargo:</strong> {selectedUser.cargo || '-'}</p>
                  <p><strong>Usuario:</strong> {selectedUser.usuario}</p>
                  <p><strong>Rol:</strong> {selectedUser.rol}</p>
                  <p><strong>Estado:</strong> {selectedUser.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer><Button variant="secondary" onClick={() => setShowViewModal(false)}>Cerrar</Button></Modal.Footer>
          </Modal>

          {/* Modal Editar */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton><Modal.Title>Editar Invitado</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label">NOMBRE</label>
                    <input type="text" name="nombre" className="form-control" value={selectedUser.nombre || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">CÉDULA</label>
                    <input type="text" name="cedula" className="form-control" value={selectedUser.cedula || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">TELÉFONO</label>
                    <input type="text" name="telefono" className="form-control" value={selectedUser.telefono || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">CORREO</label>
                    <input type="email" name="correo" className="form-control" value={selectedUser.correo || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">EMPRESA</label>
                    <input type="text" name="empresa" className="form-control" value={selectedUser.empresa || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">CARGO</label>
                    <input type="text" name="cargo" className="form-control" value={selectedUser.cargo || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">USUARIO</label>
                    <input type="text" name="usuario" className="form-control" value={selectedUser.usuario || ''} onChange={handleEditChange} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">ROL</label>
                    <select name="rol" className="form-control" value={selectedUser.rol || 'usuario'} onChange={handleEditChange}>
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
              <Button variant="primary">Guardar Cambios</Button>
            </Modal.Footer>
          </Modal>
        </main>
      </div>
    </div>
  );
}

export default NewUser;
