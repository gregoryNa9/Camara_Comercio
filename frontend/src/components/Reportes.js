import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './style.css';
import Menu from './Menu';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reportes({ onNavigate }) {
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

  // Sidebar abierto por defecto
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [filtros, setFiltros] = useState({ tipoEvento: '', fechaEvento: '' });
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats] = useState({
    totalInvitados: '#total_invitados',
    asistentes: '#Asistentes-reales',
    confirmados: '#total_registrados',
    eventosTotales: '#eventos-total',
    top10Invitados: '#10_mas-invitados',
    top10Asisten: '#10 mas_asisten',
    invitacionesConfirmadas: 300,
    invitacionesNoConfirmadas: 200,
    safetyScore: 9.3
  });

  const tiposEvento = ['Macroevento', 'Adicional', 'Especial'];

  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        let dataReportes = [];
        try {
          const res = await fetch(`${API_BASE}/reportes`);
          if (res.ok) dataReportes = await res.json();
        } catch { }
        if (!dataReportes || dataReportes.length === 0) {
          // Datos de respaldo
          dataReportes = [
            { id: 1, nombre: 'JUAN ALAN PEREZ ZAMBRANO', empresa: 'PRONACA', eventos: 10 },
            { id: 2, nombre: 'ANA LUCIA RODRIGUEZ ESPINOZA', empresa: 'PRONACA', eventos: 5 },
            { id: 3, nombre: 'ANTHONY GEOVANNY MEJIA GAIBOR', empresa: 'POLACA', eventos: 7 },
            { id: 4, nombre: 'RONALD JOSUE PURUNCAJAS GONZALEZ', empresa: 'POLACA', eventos: 9 }
          ];
        }
        if (!cancel) setReportes(dataReportes);
      } catch (e) {
        if (!cancel) setError('No se pudo cargar la información.');
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    load();
    return () => { cancel = true; };
  }, [API_BASE, setError]);

  const handleInputChange = e => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  const handleBuscar = () => { };
  const handleLimpiar = () => setFiltros({ tipoEvento: '', fechaEvento: '' });

  const lineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Invitados',
      data: [100, 200, 150, 250, 180, 300],
      borderColor: '#009FE3',
      backgroundColor: 'rgba(0,159,227,0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const lineOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: false } }, scales: { y: { beginAtZero: true } } };

  const doughnutData = {
    labels: ['Confirmadas', 'No confirmadas'],
    datasets: [{
      data: [stats.invitacionesConfirmadas, stats.invitacionesNoConfirmadas],
      backgroundColor: ['#009FE3', '#E0E0E0'],
      borderWidth: 0
    }]
  };

  const doughnutOptions = { cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } };

  const Header = () => (
    <header className="d-flex justify-content-between align-items-center p-3 text-white" style={{ backgroundColor: '#043474' }}>
      <button className="btn btn-outline-light" onClick={() => setMenuAbierto(!menuAbierto)}>
        <i className="fa-solid fa-bars"></i>
      </button>
      <img src="/logo.jpg" alt="Logo" style={{ height: '50px' }} />
    </header>
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <div className="d-flex flex-grow-1">
        {/* Sidebar desplegable */}
        {menuAbierto && <Menu onNavigate={onNavigate} activeItem="reportes" />}

        {/* Contenido principal */}
        <main className="flex-grow-1 p-5">
          <h2 className="text-primary fw-bold mb-3">Reportes</h2>

          {/* Filtros */}
          <div className="bg-white rounded shadow-sm p-3 mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-auto">
                <div className="mb-2 fw-bold text-info">Filtros</div>
              </div>
            </div>
            <div className="row g-2 mt-1">
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label">Tipo de evento:</label>
                <select className="form-select" name="tipoEvento" value={filtros.tipoEvento} onChange={handleInputChange}>
                  <option value="">Seleccionar tipo</option>
                  {tiposEvento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label">Fecha del evento:</label>
                <input type="text" className="form-control" placeholder="dd/mm/aaaa" name="fechaEvento" value={filtros.fechaEvento} onChange={handleInputChange} />
              </div>
              <div className="col-lg-4 d-grid">
                <button className="btn btn-primary d-none d-lg-block h-70 mb-1" onClick={handleBuscar}>
                  <i className="fa-solid fa-magnifying-glass me-1"></i>Buscar
                </button>
                <button className="btn btn-outline-secondary d-none d-lg-block h-70" onClick={handleLimpiar}>
                  <i className="fa-solid fa-eraser me-1"></i>Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="stats-card equal-card"><h6 className="mb-1">Invitados</h6><h4 className="text-primary m-0">{stats.totalInvitados}</h4></div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="stats-card equal-card"><h6 className="mb-1">Asistentes</h6><h4 className="text-primary m-0">{stats.asistentes}</h4></div>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="stats-card equal-card"><h6 className="mb-1">Confirmados</h6><h4 className="text-primary m-0">{stats.confirmados}</h4></div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-8">
              <div className="stats-card">
                <h6 className="mb-3">Estado de invitados por evento</h6>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
            <div className="col-12 col-xl-4">
              <div className="stats-card d-flex flex-column justify-content-center align-items-center">
                <Doughnut data={doughnutData} options={doughnutOptions} style={{ maxHeight: '200px', maxWidth: '200px' }} />
                <div className="position-absolute text-center">
                  <h3 className="text-primary fw-bold">{stats.safetyScore}</h3>
                  <small className="text-muted">Total Score</small>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 text-center">
                  <thead className="table-events-header">
                    <tr>
                      <th className="text-white border-0">NOMBRE COMPLETO</th>
                      <th className="text-white border-0">EMPRESA</th>
                      <th className="text-white border-0">EVENTOS ASISTIDOS</th>
                      <th className="text-white border-0">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan="4" className="text-center py-4">Cargando...</td></tr>}
                    {!loading && reportes.map(item => (
                      <tr key={item.id}>
                        <td className="border-0">{item.nombre}</td>
                        <td className="border-0">{item.empresa}</td>
                        <td className="border-0">{item.eventos}</td>
                        <td className="border-0">
                          <button className="btn btn-link btn-ver-mas" onClick={() => onNavigate('historial')}>
                            <i className="fa-solid fa-eye me-1"></i>Historial
                          </button>
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
    </div>
  );
}

export default Reportes;
