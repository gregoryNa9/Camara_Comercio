import React, { useState } from 'react';
import './style.css';
import Menu from './Menu';
import { Modal, Button } from 'react-bootstrap';

function NewUser({ onNavigate }) {
  // Sidebar desplegable
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estado filtros
  const [filtros, setFiltros] = useState({ cedula: '', apellido: '' });
  const [error] = useState('');

  // Modales
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = useState(null);

  // Lista de usuarios simulada
  const usuarios = [
    { nombre: 'JUAN ALAN', apellido: 'PEREZ ZAMBRANO', cedula: '1234567890', celular: '0999999999', correo: 'juanperez@gmail.com', empresa: 'PRONACA', cargo: 'Analista de Sistemas', sector: 'Productores / Agroindustria' },
    { nombre: 'ANA LUCIA', apellido: 'RODRIGUEZ ESPINOZA', cedula: '0987654321', celular: '0852852852', correo: 'analu_rodri@outlook.com', empresa: 'PRONACA', cargo: 'Marketing', sector: 'Comerciantes / Distribuidores' },
    { nombre: 'ANTHONY GEOVANNY', apellido: 'MEJIA GAIBOR', cedula: '1122334455', celular: '0789789789', correo: 'ant_mejia@hotmail.com', empresa: 'POLACA', cargo: 'Gerente', sector: 'Exportadores' }
  ];

  // Funciones modales
  const handleViewUser = (user) => { setSelectedUser(user); setShowViewModal(true); };
  const handleEditUser = (user) => { setSelectedUser(user); setShowEditModal(true); };
  const handleEditChange = (e) => { const { name, value } = e.target; setSelectedUser({ ...selectedUser, [name]: value }); };

  // Filtros
  const handleInputChange = (e) => { setFiltros({ ...filtros, [e.target.name]: e.target.value }); };
  const handleBuscar = () => { console.log('Buscando usuarios:', filtros); };
  const handleLimpiar = () => { setFiltros({ cedula: '', apellido: '' }); };

  // Header
  const Header = () => (
    <header className="d-flex justify-content-between align-items-center p-3 text-white" style={{ backgroundColor: '#043474' }}>
      <button className="btn btn-outline-light" onClick={() => setMenuAbierto(!menuAbierto)}>
        <i className="fa-solid fa-bars"></i>
      </button>
      <h4 className="m-0">Nuevo Usuario/Invitado</h4>
      <div></div>
    </header>
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <div className="d-flex flex-grow-1">
        {/* Sidebar desplegable */}
        {menuAbierto && <Menu onNavigate={onNavigate} activeItem="new-user" />}

        {/* Contenido principal */}
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
            <div className="row g-3">
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">NOMBRES:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">APELLIDOS:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">CEDULA:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">CELULAR:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">CORREO:</label><input type="email" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">EMPRESA:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6"><label className="form-label fw-semibold">CARGO:</label><input type="text" className="form-control" /></div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">SECTOR:</label>
                <select className="form-control">
                  <option value="">Seleccione un sector</option>
                  <option>Productores / Agroindustria</option>
                  <option>Industriales / Manufactureros</option>
                  <option>Comerciantes / Distribuidores</option>
                  <option>Importadores</option>
                  <option>Exportadores</option>
                  <option>Salud</option>
                  <option>Servicios Empresariales</option>
                  <option>Logística y Transporte</option>
                  <option>Finanzas y Seguros</option>
                  <option>Tecnología e Innovación</option>
                  <option>Turístico</option>
                  <option>Servicios</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>
            <div className="row g-2 mt-3">
              <div className="col-12 col-md-3 d-grid"><button className="btn btn-primary"><i className="fa-solid fa-floppy-disk me-2"></i>Guardar</button></div>
              <div className="col-12 col-md-3 d-grid"><button className="btn btn-light" style={{ border: '1px solid #dee2e6' }}>Limpiar</button></div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="stats-card equal-card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-events-header">
                  <tr>
                    <th className="text-white border-0">LISTA DE USUARIOS</th>
                    <th className="text-white border-0">CELULAR</th>
                    <th className="text-white border-0">CORREO</th>
                    <th className="text-white border-0">EMPRESA</th>
                    <th className="text-white border-0">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u, idx) => (
                    <tr key={idx}>
                      <td>{u.nombre} {u.apellido}</td>
                      <td>{u.celular}</td>
                      <td><a href={`mailto:${u.correo}`}>{u.correo}</a></td>
                      <td>{u.empresa}</td>
                      <td className="text-center">
                        <button className="btn btn-link text-primary" onClick={() => handleViewUser(u)}><i className="fa-solid fa-eye"></i></button>
                        <button className="btn btn-link text-primary" onClick={() => handleEditUser(u)}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-link text-danger"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Ver Más */}
          <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
            <Modal.Header closeButton><Modal.Title>Información del Usuario</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <div>
                  <p><strong>Nombre:</strong> {selectedUser.nombre} {selectedUser.apellido}</p>
                  <p><strong>Cédula:</strong> {selectedUser.cedula}</p>
                  <p><strong>Celular:</strong> {selectedUser.celular}</p>
                  <p><strong>Correo:</strong> {selectedUser.correo}</p>
                  <p><strong>Empresa:</strong> {selectedUser.empresa}</p>
                  <p><strong>Cargo:</strong> {selectedUser.cargo}</p>
                  <p><strong>Sector:</strong> {selectedUser.sector}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer><Button variant="secondary" onClick={() => setShowViewModal(false)}>Cerrar</Button></Modal.Footer>
          </Modal>

          {/* Modal Editar */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton><Modal.Title>Editar Usuario</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <div className="row g-2">
                  {['nombre','apellido','cedula','celular','correo','empresa','cargo'].map((field, idx) => (
                    <div className="col-12 col-md-6" key={idx}>
                      <label className="form-label">{field.toUpperCase()}</label>
                      <input type={field==='correo'?'email':'text'} name={field} className="form-control" value={selectedUser[field]} onChange={handleEditChange} />
                    </div>
                  ))}
                  <div className="col-12 col-md-6">
                    <label className="form-label">Sector</label>
                    <select name="sector" className="form-control" value={selectedUser.sector} onChange={handleEditChange}>
                      <option value="">Seleccione un sector</option>
                      <option>Productores / Agroindustria</option>
                      <option>Industriales / Manufactureros</option>
                      <option>Comerciantes / Distribuidores</option>
                      <option>Importadores</option>
                      <option>Exportadores</option>
                      <option>Salud</option>
                      <option>Servicios Empresariales</option>
                      <option>Logística y Transporte</option>
                      <option>Finanzas y Seguros</option>
                      <option>Tecnología e Innovación</option>
                      <option>Turístico</option>
                      <option>Servicios</option>
                      <option>Otro</option>
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
