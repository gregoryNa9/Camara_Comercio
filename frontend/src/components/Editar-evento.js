import React, { useState } from 'react';
import './style.css';
import Menu from './Menu';

function EditarEvento({ onNavigate }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formData, setFormData] = useState({
    nombreEvento: '',
    categoria: '',
    temaEvento: '',
    temaConferencia: '',
    fecha: '',
    lugar: '',
    horaIngreso: '',
    horaInicio: '',
    codigoVestimenta: '',
    organizadoPor: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = () => {
    console.log('Evento editado:', formData);
  };

  const handleLimpiar = () => {
    setFormData({
      nombreEvento: '',
      categoria: '',
      temaEvento: '',
      temaConferencia: '',
      fecha: '',
      lugar: '',
      horaIngreso: '',
      horaInicio: '',
      codigoVestimenta: '',
      organizadoPor: ''
    });
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
    <div className="d-flex flex-column min-vh-100 evento-form-container">
      {/* Header */}
      <Header />

      <div className="d-flex flex-grow-1">
        {/* Sidebar - siempre visible en desktop, desplegable en móvil */}
        <div className={`d-none d-md-block`}>
          <Menu onNavigate={onNavigate} activeItem="eventos" />
        </div>
        {menuAbierto && (
          <div className="d-md-none">
            <Menu onNavigate={onNavigate} activeItem="eventos" />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow-1 p-5">
        {/* Header */}
        <div className="mb-4">
          <h1 className="page-title mb-2">Editar Evento</h1>
          <button className="evento-back-button" onClick={() => onNavigate('eventos')}>  ← Volver </button>
        </div>

        {/* Form */}
        <div className="evento-form-card p-4">
          <form>
            <div className="mb-3">
              <label className="evento-form-label">Nombre del evento:</label>
              <input type="text" className="form-control evento-form-input" name="nombreEvento" value={formData.nombreEvento} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Categoría:</label>
              <input type="text" className="form-control evento-form-input" name="categoria" value={formData.categoria} onChange={handleInputChange}/>
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Tema del evento:</label>
              <input  type="text" className="form-control evento-form-input" name="temaEvento" value={formData.temaEvento} onChange={handleInputChange}  />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Tema de conferencia:</label>
              <input type="text" className="form-control evento-form-input" name="temaConferencia" value={formData.temaConferencia} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Fecha:</label>
              <input type="text" className="form-control evento-form-input" name="fecha" value={formData.fecha} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Lugar:</label>
              <input type="text" className="form-control evento-form-input" name="lugar" value={formData.lugar} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Hora de ingreso:</label>
              <input type="text" className="form-control evento-form-input" name="horaIngreso" value={formData.horaIngreso} onChange={handleInputChange}  />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Hora de inicio:</label>
              <input type="text" className="form-control evento-form-input" name="horaInicio" value={formData.horaInicio} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Código de vestimenta:</label>
              <input type="text" className="form-control evento-form-input" name="codigoVestimenta" value={formData.codigoVestimenta} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <label className="evento-form-label">Organizado por:</label>
              <input type="text" className="form-control evento-form-input" name="organizadoPor" value={formData.organizadoPor} onChange={handleInputChange}/>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="d-flex gap-3 mt-4">
            <button className="evento-btn-primary flex-grow-1" onClick={() => onNavigate('lista-invitados')}>
              <i className="fa-solid fa-clipboard-list me-2"></i> Lista de usuarios a invitar
            </button>

            <button className="evento-btn-primary flex-grow-1" onClick={handleGuardar}>
              <i className="fa-solid fa-floppy-disk me-2"></i> Guardar
            </button>

            <button className="evento-btn-secondary flex-grow-1" onClick={handleLimpiar}> Limpiar </button>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

export default EditarEvento;
