import React, { useState, useCallback } from 'react';
import './style.css';
import Menu from './Menu';

function NewEvento({ onNavigate }) {
  const [formData, setFormData] = useState({
    nombreEvento: '',
    categoria: '',
    temaEvento: '',
    temaConferencia: '',
    fecha: '',
    lugar: '',
    horaInicio: '',
    horaFin: '',
    codigoVestimenta: '',
    organizadoPor: '',
    estado: ''
  });

  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const horariosInicio = ["08:00", "11:00", "14:00", "17:00", "20:00"];

  const [mensaje, setMensaje] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleGuardar = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Error al guardar el evento");

      const data = await response.json();
      console.log("✅ Evento creado:", data);

      setMensaje("Evento guardado correctamente ✅");

      setTimeout(() => {
        onNavigate("eventos");
      }, 1500);

    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje("Error al guardar el evento ❌");
    }
  }, [formData, onNavigate]);

  const handleLimpiar = useCallback(() => {
    setFormData({
      nombreEvento: '',
      categoria: '',
      temaEvento: '',
      temaConferencia: '',
      fecha: '',
      lugar: '',
      horaInicio: '',
      horaFin: '',
      codigoVestimenta: '',
      organizadoPor: '',
      estado: ''
    });
    setMensaje(null);
  }, []);

  return (
    <div className="d-flex min-vh-100 evento-form-container">
      <Menu onNavigate={onNavigate} activeItem="eventos" />

      <main className="flex-grow-1 p-5">
        <div className="mb-4">
          <h1 className="page-title mb-2">Nuevo Evento</h1>
          <button className="evento-back-button" onClick={() => onNavigate('eventos')}>
            <i className="fa-solid fa-arrow-left me-2"></i>Volver
          </button>
        </div>

        <div className="evento-form-card">
          <div className="card-body p-4">
            <form>
              <div className="row g-4">
                {/* Nombre del Evento */}
                <div className="col-md-6">
                  <label className="evento-form-label">Nombre del Evento</label>
                  <input
                    type="text"
                    name="nombreEvento"
                    className="form-control"
                    value={formData.nombreEvento}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Categoría */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="evento-form-label">Categoría:</label>
                    <select
                      className="form-control evento-form-input"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Seleccione un estado
                      </option>
                      <option value="Macroevento">Macroevento</option>
                      <option value="Adicional">Adicional</option>
                    </select>
                  </div>
                </div>
                {/* Tema del Evento */}
                <div className="col-md-6">
                  <label className="evento-form-label">Tema del Evento</label>
                  <input
                    type="text"
                    name="temaEvento"
                    className="form-control"
                    value={formData.temaEvento}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Tema de la Conferencia */}
                <div className="col-md-6">
                  <label className="evento-form-label">Tema de la Conferencia</label>
                  <input
                    type="text"
                    name="temaConferencia"
                    className="form-control"
                    value={formData.temaConferencia}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Fecha */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="evento-form-label">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      className="form-control evento-form-input"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      min={hoy}
                    />
                  </div>
                </div>
                {/* Lugar */}
                <div className="col-md-6">
                  <label className="evento-form-label">Lugar</label>
                  <input
                    type="text"
                    name="lugar"
                    className="form-control"
                    value={formData.lugar}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Hora de Inicio */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="evento-form-label">Hora de Inicio</label>
                    <select
                      className="form-control evento-form-input"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Ajustamos automáticamente la hora final si es necesario
                        const idx = horariosInicio.indexOf(e.target.value);
                        const horariosFin = horariosInicio.slice(idx + 1);
                        setFormData(prev => ({
                          ...prev,
                          horaFin: horariosFin[0] || ""
                        }));
                      }}
                    >
                      <option value="">Seleccionar</option>
                      {horariosInicio.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Hora de Fin */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="evento-form-label">Hora de Fin</label>
                    <select
                      className="form-control evento-form-input"
                      name="horaFin"
                      value={formData.horaFin}
                      onChange={handleInputChange}
                      disabled={!formData.horaInicio} // No habilitado si no se selecciona hora inicio
                    >
                      <option value="">Seleccionar</option>
                      {formData.horaInicio &&
                        (() => {
                          const [hInicio] = formData.horaInicio.split(":").map(Number);
                          const opciones = [];
                          // Generamos horas desde horaInicio + 3 hasta 21:00 en intervalos de 1 hora
                          for (let h = hInicio + 3; h <= 21; h++) {
                            const hh = h.toString().padStart(2, "0");
                            opciones.push(`${hh}:00`);
                          }
                          return opciones.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ));
                        })()
                      }
                    </select>
                  </div>
                </div>
                {/* Código de Vestimenta */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="evento-form-label">Código de Vestimenta:</label>
                    <select
                      className="form-control evento-form-input"
                      name="codigoVestimenta"
                      value={formData.codigoVestimenta}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Seleccione un estado
                      </option>
                      <option value="Formal">Formal</option>
                      <option value="Casual">Casual</option>
                      <option value="Informal">Informal</option>
                      <option value="Deportivo">Deportivo</option>
                      <option value="Temático">Temático</option>
                    </select>
                  </div>
                </div>
                {/* Organizado Por */}
                <div className="col-md-6">
                  <label className="evento-form-label">Organizado Por</label>
                  <input
                    type="text"
                    name="organizadoPor"
                    className="form-control"
                    value={formData.organizadoPor}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Estado del Evento */}
                <div className="col-md-6">
                  <label className="evento-form-label">Estado</label>
                  <select
                    name="estado"
                    className="form-control"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Seleccione un estado
                    </option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}

        <div className="row evento-action-buttons g-2 mt-3">
          <div className="col-12 col-md-6 col-lg-3 d-grid">
            <button type="button" className="evento-btn-primary" onClick={() => onNavigate('lista-invitados')}>
              <i className="fa-solid fa-clipboard-list me-2"></i>Lista de usuarios a invitar
            </button>
          </div>
          <div className="col-12 col-md-6 col-lg-3 d-grid">
            <button type="button" className="evento-btn-primary" onClick={handleGuardar}>
              <i className="fa-solid fa-floppy-disk me-2"></i>Guardar
            </button>
          </div>
          <div className="col-12 col-md-6 col-lg-3 d-grid">
            <button type="button" className="evento-btn-secondary" onClick={handleLimpiar}>
              Limpiar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NewEvento;
