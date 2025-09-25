import React, { useState, useEffect, useCallback } from 'react';
import './style.css';
import Menu from './Menu';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function ListaInvitados({ onNavigate }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [filtros, setFiltros] = useState({
    cedula: '',
    apellidos: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar usuarios desde el backend
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/usuarios`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      
      // Agregar campos adicionales para la gestión de invitaciones
      const usuariosConInvitacion = data.map(usuario => ({
        ...usuario,
        eventoSeleccionado: '',
        metodos: { whatsapp: false, correo: false },
        invitar: false,
        imagen: null
      }));
      
      setUsuarios(usuariosConInvitacion);
    } catch (err) {
      setError("No se pudo cargar la información de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Cargar eventos desde el backend
  const cargarEventos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/eventos`);
      if (!res.ok) throw new Error("Error al cargar eventos");
      const data = await res.json();
      setEventos(data);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    cargarUsuarios();
    cargarEventos();
  }, [cargarUsuarios, cargarEventos]);

  // Manejar cambios en filtros
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Buscar usuario por cédula
  const buscarUsuario = async (cedula) => {
    if (!cedula.trim()) {
      cargarUsuarios();
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/usuarios/cedula/${cedula}`);
      if (res.ok) {
        const usuario = await res.json();
        const usuarioConInvitacion = {
          ...usuario,
          eventoSeleccionado: '',
          metodos: { whatsapp: false, correo: false },
          invitar: false,
          imagen: null
        };
        setUsuarios([usuarioConInvitacion]);
      } else {
        setUsuarios([]);
      }
    } catch (err) {
      setError("Error al buscar usuario");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en checkboxes
  const handleCheckboxChange = (idUsuario, campo) => {
    console.log(`🔄 Cambiando ${campo} para usuario ID: ${idUsuario}`);
    const nuevosUsuarios = usuarios.map(usuario => {
      if (usuario.id_usuario === idUsuario) {
        if (campo === 'invitar') {
          console.log(`✅ Usuario ${usuario.nombre} - Invitar: ${!usuario.invitar}`);
          return { ...usuario, invitar: !usuario.invitar };
        } else {
          console.log(`✅ Usuario ${usuario.nombre} - ${campo}: ${!usuario.metodos[campo]}`);
          return { 
            ...usuario, 
            metodos: { 
              ...usuario.metodos, 
              [campo]: !usuario.metodos[campo] 
            } 
          };
        }
      }
      return usuario;
    });
    setUsuarios(nuevosUsuarios);
  };

  // Manejar cambio de evento seleccionado
  const handleEventoChange = (idUsuario, eventoId) => {
    console.log(`🔄 Cambiando evento para usuario ID: ${idUsuario} a evento: ${eventoId}`);
    const nuevosUsuarios = usuarios.map(usuario => {
      if (usuario.id_usuario === idUsuario) {
        console.log(`✅ Usuario ${usuario.nombre} - Evento seleccionado: ${eventoId}`);
        return { ...usuario, eventoSeleccionado: eventoId };
      }
      return usuario;
    });
    setUsuarios(nuevosUsuarios);
  };

  // Manejar cambio de imagen
  const handleImagenChange = (idUsuario, file) => {
    console.log(`🔄 Cambiando imagen para usuario ID: ${idUsuario}`);
    const nuevosUsuarios = usuarios.map(usuario => {
      if (usuario.id_usuario === idUsuario) {
        console.log(`✅ Usuario ${usuario.nombre} - Imagen seleccionada: ${file ? file.name : 'ninguna'}`);
        return { ...usuario, imagen: file };
      }
      return usuario;
    });
    setUsuarios(nuevosUsuarios);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    setFiltros({ cedula: '', apellidos: '' });
    cargarUsuarios();
  };

  // Enviar invitaciones
  const handleEnviarInvitaciones = async () => {
    const usuariosParaInvitar = usuarios.filter(u => u.invitar && u.eventoSeleccionado);
    
    if (usuariosParaInvitar.length === 0) {
      alert('❌ Seleccione al menos un usuario y un evento para enviar invitaciones');
      return;
    }

    // Validar que cada usuario tenga al menos un método de envío seleccionado
    const usuariosSinMetodo = usuariosParaInvitar.filter(u => !u.metodos.whatsapp && !u.metodos.correo);
    if (usuariosSinMetodo.length > 0) {
      alert('❌ Todos los usuarios seleccionados deben tener al menos un método de envío (WhatsApp o Correo)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let exitosos = 0;
      let fallidos = 0;
      
      for (const usuario of usuariosParaInvitar) {
        try {
          const formData = new FormData();
          formData.append('cedula', usuario.cedula);
          formData.append('id_evento', usuario.eventoSeleccionado);
          
          // Determinar método de envío
          let id_metodo_envio = 1; // Por defecto correo
          if (usuario.metodos.whatsapp && usuario.metodos.correo) {
            id_metodo_envio = 3; // Ambos
          } else if (usuario.metodos.whatsapp) {
            id_metodo_envio = 2; // Solo WhatsApp
          }
          
          formData.append('id_metodo_envio', id_metodo_envio);
          formData.append('id_estado', '1'); // Pendiente
          
          if (usuario.imagen) {
            formData.append('imagen', usuario.imagen);
          }

          console.log(`📤 Enviando invitación para ${usuario.nombre} al evento ${usuario.eventoSeleccionado}`);

          const res = await fetch(`${API_BASE}/invitaciones`, {
            method: 'POST',
            body: formData
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.error(`❌ Error para ${usuario.nombre}:`, errorData);
            fallidos++;
          } else {
            const responseData = await res.json();
            console.log(`✅ Invitación enviada para ${usuario.nombre}:`, responseData);
            exitosos++;
          }
        } catch (err) {
          console.error(`❌ Error de conexión para ${usuario.nombre}:`, err);
          fallidos++;
        }
      }

      // Mostrar resultado
      if (exitosos > 0 && fallidos === 0) {
        alert(`✅ Todas las invitaciones se enviaron correctamente (${exitosos} enviadas)`);
        // Notificar que se enviaron invitaciones para actualizar otras páginas
        localStorage.setItem('lastInvitationSent', Date.now().toString());
        // Recargar la lista de usuarios para limpiar las selecciones
        cargarUsuarios();
        setFiltros({ cedula: '', apellidos: '' });
      } else if (exitosos > 0 && fallidos > 0) {
        alert(`⚠️ Se enviaron ${exitosos} invitaciones correctamente, pero ${fallidos} fallaron. Revisa la consola para más detalles.`);
        // Notificar que se enviaron invitaciones para actualizar otras páginas
        localStorage.setItem('lastInvitationSent', Date.now().toString());
        // Recargar la lista de usuarios para limpiar las selecciones
        cargarUsuarios();
        setFiltros({ cedula: '', apellidos: '' });
      } else {
        alert(`❌ No se pudo enviar ninguna invitación. Revisa la consola para más detalles.`);
      }
    } catch (err) {
      console.error('❌ Error general:', err);
      setError(`Error al enviar invitaciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    <div className="d-flex min-vh-100">
      {/* Sidebar - siempre visible en desktop, desplegable en móvil */}
      <div className={`d-none d-md-block`}>
        <Menu onNavigate={onNavigate} activeItem="eventos" />
      </div>
      {menuAbierto && (
        <div className="d-md-none position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }}>
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={() => setMenuAbierto(false)}></div>
          <div className="position-absolute top-0 start-0">
            <Menu onNavigate={onNavigate} activeItem="eventos" onClose={() => setMenuAbierto(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        {/* Header */}
        <Header />

        <main className="flex-grow-1 p-5">
        <div className="mb-2">
          <button className="lista-invitados-back-button" onClick={() => onNavigate('eventos')}>
            <i className="fa-solid fa-arrow-left me-2"></i>Volver
          </button>
        </div>
        <h1 className="lista-invitados-title">Selección de Invitados</h1>
        <h5 className="lista-invitados-subtitle">Seleccione usuarios y eventos para enviar invitaciones</h5>

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
              <input 
                type="text" 
                name="cedula"
                value={filtros.cedula}
                onChange={handleInputChange}
                className="form-control lista-invitados-filter-input" 
                placeholder="Ingrese cédula para buscar"
              />
            </div>
            <div className="col-12 col-md-6 col-lg-6">
              <label className="lista-invitados-filter-label">Apellido:</label>
              <input 
                type="text" 
                name="apellidos"
                value={filtros.apellidos}
                onChange={handleInputChange}
                className="form-control lista-invitados-filter-input" 
                placeholder="Filtrar por apellido"
              />
            </div>
          </div>
          <div className="row g-2 mt-2">
            <div className="col-12 col-md-6 col-lg-6 d-grid">
              <button 
                className="lista-invitados-btn-primary"
                onClick={() => buscarUsuario(filtros.cedula)}
                disabled={loading}
              >
                <i className="fa-solid fa-magnifying-glass me-2"></i>
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            <div className="col-12 col-md-6 col-lg-6 d-grid">
              <button 
                className="lista-invitados-btn-secondary"
                onClick={handleLimpiar}
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="lista-invitados-table-container mt-4">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead className="table-events-header">
                <tr>
                  <th>CÉDULA</th>
                  <th>NOMBRE</th>
                  <th>TELÉFONO</th>
                  <th>CORREO</th>
                  <th>EMPRESA</th>
                  <th>EVENTO</th>
                  <th>IMAGEN</th>
                  <th>MÉTODOS</th>
                  <th>INVITAR</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  usuarios
                    .filter(u => 
                      !filtros.apellidos || 
                      u.nombre.toLowerCase().includes(filtros.apellidos.toLowerCase())
                    )
                    .map((u, idx) => (
                    <tr key={u.id_usuario || idx}>
                      <td>{u.cedula}</td>
                      <td>{u.nombre}</td>
                      <td>{u.telefono || '-'}</td>
                      <td>
                        <a href={`mailto:${u.correo}`}>{u.correo}</a>
                      </td>
                      <td>{u.empresa || '-'}</td>
                      <td>
                        <select 
                          className="form-select form-select-sm"
                          value={u.eventoSeleccionado}
                          onChange={(e) => handleEventoChange(u.id_usuario, e.target.value)}
                        >
                          <option value="">Seleccionar evento</option>
                          {eventos.map(evento => (
                            <option key={evento.id} value={evento.id}>
                              {evento.nombreEvento} - {evento.fecha}
                            </option>
                          ))}
                        </select>
                        {u.eventoSeleccionado && (
                          <small className="text-success">
                            <i className="fa-solid fa-check-circle me-1"></i>
                            Evento seleccionado
                          </small>
                        )}
                      </td>
                      <td>
                        <input 
                          type="file" 
                          className="form-control form-control-sm"
                          accept="image/*"
                          onChange={e => handleImagenChange(u.id_usuario, e.target.files[0])} 
                        />
                        {u.imagen && (
                          <small className="text-success">
                            <i className="fa-solid fa-check-circle me-1"></i>
                            {u.imagen.name}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={u.metodos.whatsapp} 
                            onChange={() => handleCheckboxChange(u.id_usuario, 'whatsapp')} 
                          />
                          <label className="form-check-label small">
                            <i className="fa-brands fa-whatsapp me-1 text-success"></i>
                            WhatsApp
                          </label>
                        </div>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={u.metodos.correo} 
                            onChange={() => handleCheckboxChange(u.id_usuario, 'correo')} 
                          />
                          <label className="form-check-label small">
                            <i className="fa-solid fa-envelope me-1 text-primary"></i>
                            Correo
                          </label>
                        </div>
                        {(!u.metodos.whatsapp && !u.metodos.correo) && (
                          <small className="text-warning">
                            <i className="fa-solid fa-exclamation-triangle me-1"></i>
                            Seleccione un método
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="lista-invitados-checkbox-container">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={u.invitar} 
                            onChange={() => handleCheckboxChange(u.id_usuario, 'invitar')} 
                          />
                          <label className="lista-invitados-checkbox-label small">
                            <i className="fa-solid fa-paper-plane me-1 text-primary"></i>
                            Invitar
                          </label>
                        </div>
                        {u.invitar && (
                          <small className="text-success">
                            <i className="fa-solid fa-check-circle me-1"></i>
                            Listo para enviar
                          </small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen de selección */}
        {usuarios.some(u => u.invitar) && (
          <div className="alert alert-info mt-3">
            <h6><i className="fa-solid fa-info-circle me-2"></i>Resumen de selección:</h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Usuarios seleccionados:</strong> {usuarios.filter(u => u.invitar).length}
              </div>
              <div className="col-md-6">
                <strong>Con evento seleccionado:</strong> {usuarios.filter(u => u.invitar && u.eventoSeleccionado).length}
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <strong>Con métodos de envío:</strong> {usuarios.filter(u => u.invitar && (u.metodos.whatsapp || u.metodos.correo)).length}
              </div>
              <div className="col-md-6">
                <strong>Con imagen:</strong> {usuarios.filter(u => u.invitar && u.imagen).length}
              </div>
            </div>
          </div>
        )}

        {/* Acciones inferiores */}
        <div className="row lista-invitados-actions g-2 align-items-center mt-4">
          <div className="col-12 col-md-6">
            <button 
              className="lista-invitados-btn-primary" 
              onClick={() => onNavigate('new-user')}
              disabled={loading}
            >
              <i className="fa-solid fa-user-plus me-2"></i>Agregar nuevo usuario
            </button>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex gap-2 justify-content-md-end">
              <button 
                className="lista-invitados-btn-primary"
                onClick={handleEnviarInvitaciones}
                disabled={loading}
              >
                <i className="fa-solid fa-paper-plane me-2"></i>
                {loading ? 'Enviando...' : `Enviar Invitaciones (${usuarios.filter(u => u.invitar && u.eventoSeleccionado && (u.metodos.whatsapp || u.metodos.correo)).length})`}
              </button>
              <button 
                className="lista-invitados-btn-secondary"
                onClick={handleLimpiar}
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

export default ListaInvitados;

