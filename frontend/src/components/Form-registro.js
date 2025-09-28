import React, { useState } from 'react';
import './style.css';

function FormRegistro({ onNavigate }) {
  const [formData, setFormData] = useState({
    // Datos del evento
    tituloEvento: '',
    descripcion: '',
    fechaEvento: '',
    hora: '',
    correo: '',
    telefono: '',
    // Datos del participante
    nombreApellido: '',
    empresaInstitucion: '',
    correoElectronico: '',
    telefonoParticipante: '',
    cargo: '',
    direccionCiudad: '',
    sectorEconomico: 'Productores / Agroindustria'
  });

  const [imagenEvento, setImagenEvento] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenEvento(file);
    }
  };

  const sectoresEconomicos = [
    'Productores / Agroindustria',
    'Industriales / Manufactureros',
    'Comerciantes / Distribuidores',
    'Importadores',
    'Exportadores',
    'Salud',
    'Servicios Empresariales',
    'Logistica y Transporte',
    'Finanzas y Seguros',
    'Tecnología e Innovación',
    'Turístico',
    'Servicios',
    'Otro'
  ];

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#e3f2fd' }}>
      {/* Header */}
      <div className="w-100">
        <header 
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ backgroundColor: '#043474' }}
        >
          <div className="d-flex align-items-center">
            <div 
              className="me-3"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                background: 'linear-gradient(45deg, #009FE3, #043474)',
                borderRadius: '4px'
              }}></div>
            </div>
            <h4 className="text-white mb-0 fw-bold">
              CÁMARA DE INDUSTRIAS Y PRODUCCIÓN DE SANTO DOMINGO
            </h4>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="p-4">
          {/* Sección de detalles del evento */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4 fw-bold">Event Details</h5>
              
              <div className="row">
                {/* Upload de imagen */}
                <div className="col-md-4 mb-3">
                  <div 
                    className="border border-2 border-dashed d-flex flex-column align-items-center justify-content-center p-4"
                    style={{ 
                      height: '200px', 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('imagenEvento').click()}
                  >
                    {imagenEvento ? (
                      <img 
                        src={URL.createObjectURL(imagenEvento)} 
                        alt="Imagen del evento" 
                        className="img-fluid"
                        style={{ maxHeight: '180px', borderRadius: '4px' }}
                      />
                    ) : (
                      <>
                        <i className="fa-solid fa-mountain-sun fa-3x text-muted mb-2"></i>
                        <span className="text-muted">Subir imagen</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="imagenEvento"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn w-100 mt-2"
                    style={{ backgroundColor: '#043474', color: 'white' }}
                    onClick={() => document.getElementById('imagenEvento').click()}
                  >
                    <i className="fa-solid fa-plus me-2"></i>Subir imagen
                  </button>
                </div>

                {/* Campos del evento */}
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Título del evento:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="tituloEvento"
                        value={formData.tituloEvento}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Descripción:</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Fecha del evento:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fechaEvento"
                        value={formData.fechaEvento}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Hora:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="hora"
                        value={formData.hora}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Correo:</label>
                      <input
                        type="email"
                        className="form-control"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Tu respuesta"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de información del participante */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title mb-4 fw-bold">Participant Information</h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    NOMBRE Y APELLIDO: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombreApellido"
                    value={formData.nombreApellido}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    EMPRESA O INSTITUCION: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="empresaInstitucion"
                    value={formData.empresaInstitucion}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    CORREO ELECTRONICO: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="correoElectronico"
                    value={formData.correoElectronico}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    TELEFONO: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefonoParticipante"
                    value={formData.telefonoParticipante}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    CARGO: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    DIRECCION DE ESTABLECIMIENTO / CIUDAD: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="direccionCiudad"
                    value={formData.direccionCiudad}
                    onChange={handleInputChange}
                    placeholder="Tu respuesta"
                    required
                  />
                </div>

                {/* Sector económico */}
                <div className="col-12">
                  <label className="form-label fw-semibold mb-3">
                    INDIQUE EL SECTOR ECONOMICO AL CUAL PERTENECE: <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    {sectoresEconomicos.map((sector, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="sectorEconomico"
                            id={`sector${index}`}
                            value={sector}
                            checked={formData.sectorEconomico === sector}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label" htmlFor={`sector${index}`}>
                            {sector}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button 
              className="btn d-flex align-items-center"
              style={{ backgroundColor: '#043474', color: 'white' }}
            >
              <i className="fa-solid fa-pen me-2"></i>Editar Preguntas
            </button>
            <button 
              className="btn d-flex align-items-center"
              style={{ backgroundColor: '#043474', color: 'white' }}
            >
              <i className="fa-solid fa-plus me-2"></i>Agregar Pregunta
            </button>
            <button 
              className="btn d-flex align-items-center"
              style={{ backgroundColor: '#043474', color: 'white' }}
            >
              <i className="fa-solid fa-floppy-disk me-2"></i>Guardar
            </button>
            <button 
              className="btn d-flex align-items-center"
              style={{ backgroundColor: '#6c757d', color: 'white' }}
            >
              Publicar
            </button>
            <button 
              className="btn d-flex align-items-center"
              style={{ backgroundColor: '#6c757d', color: 'white' }}
              onClick={() => onNavigate('eventos')}
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FormRegistro;
