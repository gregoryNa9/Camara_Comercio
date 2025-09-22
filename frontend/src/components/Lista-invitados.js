import React, { useState } from 'react';
import './style.css';
import Menu from './Menu';

function ListaInvitados({ onNavigate }) {
  // Estado para los usuarios
  const [usuarios, setUsuarios] = useState([
    { nombre: 'JUAN ALAN PEREZ ZAMBRANO', celular: '0999999999', correo: 'juanperez@gmail.com', empresa: 'PRONACA', imagen: null, metodos: { whatsapp: false, correo: false }, invitar: true },
    { nombre: 'ANA LUCIA RODRIGUEZ ESPINOZA', celular: '0852852852', correo: 'analu_rodri@outlook.com', empresa: 'PRONACA', imagen: null, metodos: { whatsapp: false, correo: false }, invitar: true },
    { nombre: 'ANTHONY GEOVANNY MEJIA GAIBOR', celular: '0789789789', correo: 'ant_mejia@hotmail.com', empresa: 'POLACA', imagen: null, metodos: { whatsapp: false, correo: false }, invitar: true },
    { nombre: 'RONALD JOSUE PURUNCJAIS GONZALEZ', celular: '0456456456', correo: 'ron_puruncjais@hotmail.com', empresa: 'POLACA', imagen: null, metodos: { whatsapp: false, correo: false }, invitar: true },
  ]);

  const handleCheckboxChange = (idx, campo) => {
    const nuevosUsuarios = [...usuarios];
    if (campo === 'invitar') {
      nuevosUsuarios[idx].invitar = !nuevosUsuarios[idx].invitar;
    } else {
      nuevosUsuarios[idx].metodos[campo] = !nuevosUsuarios[idx].metodos[campo];
    }
    setUsuarios(nuevosUsuarios);
  };

  const handleImagenChange = (idx, file) => {
    const nuevosUsuarios = [...usuarios];
    nuevosUsuarios[idx].imagen = file;
    setUsuarios(nuevosUsuarios);
  };

  return (
    <div className="d-flex min-vh-100 lista-invitados-container">
      {/* Sidebar */}
      <Menu onNavigate={onNavigate} activeItem="eventos" />

      {/* Main Content */}
      <main className="flex-grow-1 p-5">
        <div className="mb-2">
          <button className="lista-invitados-back-button" onClick={() => onNavigate('eventos')}>
            <i className="fa-solid fa-arrow-left me-2"></i>Volver
          </button>
        </div>
        <h1 className="lista-invitados-title">Selección de Invitados</h1>
        <h5 className="lista-invitados-subtitle">Evento Tsáchila Economic Forum (TEF)</h5>

        {/* Filtros */}
        <div className="lista-invitados-filters">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-auto">
              <div className="mb-2 fw-bold text-info">Filtros</div>
            </div>
          </div>
          <div className="row g-2 mt-1">
            <div className="col-12 col-md-6 col-lg-6">
              <label className="lista-invitados-filter-label">Cédula:</label>
              <input type="text" className="form-control lista-invitados-filter-input" />
            </div>
            <div className="col-12 col-md-6 col-lg-6">
              <label className="lista-invitados-filter-label">Apellido:</label>
              <input type="text" className="form-control lista-invitados-filter-input" />
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-12 col-md-6 col-lg-6 d-grid">
              <button className="lista-invitados-btn-primary">
                <i className="fa-solid fa-magnifying-glass me-2"></i>Buscar
              </button>
            </div>
            <div className="col-12 col-md-6 col-lg-6 d-grid">
              <button className="lista-invitados-btn-secondary">Limpiar</button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="lista-invitados-table-container mt-4">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-events-header">
                <tr>
                  <th>LISTA DE USUARIOS</th>
                  <th>CELULAR</th>
                  <th>CORREO</th>
                  <th>EMPRESA</th>
                  <th>IMAGEN</th>
                  <th>MÉTODOS</th>
                  <th>INVITAR</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.nombre}</td>
                    <td>{u.celular}</td>
                    <td><a href={`mailto:${u.correo}`}>{u.correo}</a></td>
                    <td>{u.empresa}</td>
                    <td>
                      <input type="file" onChange={e => handleImagenChange(idx, e.target.files[0])} />
                    </td>
                    <td>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={u.metodos.whatsapp} onChange={() => handleCheckboxChange(idx, 'whatsapp')} />
                        <label className="form-check-label">WhatsApp</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={u.metodos.correo} onChange={() => handleCheckboxChange(idx, 'correo')} />
                        <label className="form-check-label">Correo</label>
                      </div>
                    </td>
                    <td>
                      <div className="lista-invitados-checkbox-container">
                        <input className="form-check-input" type="checkbox" checked={u.invitar} onChange={() => handleCheckboxChange(idx, 'invitar')} />
                        <label className="lista-invitados-checkbox-label">Invitar</label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="row lista-invitados-actions g-2 align-items-center mt-4">
          <div className="col-12 col-md-6">
            <button className="lista-invitados-btn-primary" onClick={() => onNavigate('new-user')}>
              <i className="fa-solid fa-user-plus me-2"></i>Agregar nuevo usuario
            </button>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex gap-2 justify-content-md-end">
              <button className="lista-invitados-btn-primary">
                <i className="fa-solid fa-floppy-disk me-2"></i>Guardar
              </button>
              <button className="lista-invitados-btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListaInvitados;
