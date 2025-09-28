import React, { useState, useEffect } from "react";
import "./style.css";
import Menu from "./Menu";

// 📊 Importar Chart.js y react-chartjs-2
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Registrar módulos necesarios
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

function Dashboard({ onNavigate }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
  
  // Estado menú
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // Estados para datos reales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalInvitados: 0,
    asistentesReales: 0,
    totalConfirmados: 0,
    eventosActivos: 0,
    invitacionesConfirmadas: 0,
    invitacionesNoConfirmadas: 0,
    safetyScore: 0
  });
  const [chartData, setChartData] = useState({
    invitacionesPorMes: [],
    confirmaciones: { confirmadas: 0, noConfirmadas: 0 }
  });

  // Cargar datos reales del backend
  useEffect(() => {
    let cancel = false;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");
        
        console.log("🔄 Cargando datos del dashboard...");
        
        // Cargar estadísticas
        const statsRes = await fetch(`${API_BASE}/reportes/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (!cancel) {
            setStats(statsData);
            console.log("📊 Estadísticas cargadas:", statsData);
          }
        } else {
          console.warn("⚠️ No se pudieron cargar las estadísticas");
        }

        // Cargar datos de gráficos
        const chartRes = await fetch(`${API_BASE}/reportes/chart-data`);
        if (chartRes.ok) {
          const chartData = await chartRes.json();
          if (!cancel) {
            setChartData(chartData);
            console.log("📈 Datos de gráficos cargados:", chartData);
          }
        } else {
          console.warn("⚠️ No se pudieron cargar los datos de gráficos");
        }

      } catch (e) {
        if (!cancel) {
          console.error("❌ Error cargando datos del dashboard:", e);
          setError("No se pudo cargar la información del dashboard.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { cancel = true; };
  }, [API_BASE]);

  // Datos para gráfico de línea (invitaciones por mes)
  const lineData = {
    labels: chartData.invitacionesPorMes.length > 0 
      ? chartData.invitacionesPorMes.map(item => {
          const date = new Date(item.mes + '-01');
          return date.toLocaleDateString('es-ES', { month: 'short' });
        })
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Invitaciones enviadas',
      data: chartData.invitacionesPorMes.length > 0 
        ? chartData.invitacionesPorMes.map(item => parseInt(item.total))
        : [0, 0, 0, 0, 0, 0],
      borderColor: '#009FE3',
      backgroundColor: 'rgba(0,159,227,0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const lineOptions = {
    responsive: true,
    plugins: { 
      legend: { display: false },
      title: {
        display: true,
        text: 'Invitaciones por mes'
      }
    },
    scales: { 
      y: { 
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de invitaciones'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      }
    }
  };

  // Datos para gráfico de dona (confirmaciones)
  const doughnutData = {
    labels: ['Confirmadas', 'No confirmadas'],
    datasets: [{
      data: [
        chartData.confirmaciones.confirmadas, 
        chartData.confirmaciones.noConfirmadas
      ],
      backgroundColor: ['#009FE3', '#E0E0E0'],
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: { 
      legend: { display: false }, 
      tooltip: { enabled: true } 
    }
  };

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
          <h1 className="page-title">Dashboard</h1>
          <h2 className="text-info fw-normal">Bienvenido, usuario</h2>

          {/* Mensaje de error */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Imagen principal */}
          <div className="col-12">
            <div
              id="dashboardCarousel"
              className="carousel slide shadow-sm"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner rounded">
                <div className="carousel-item active">
                  <img
                    src="/grupo.jpg"
                    className="d-block w-100 mb-3"
                    alt="Imagen 1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card bg-primary text-white shadow-sm">
                <div className="card-body text-center">
                  <i className="fa-solid fa-users fa-2x mb-2"></i>
                  <h4 className="card-title">{stats.totalInvitados}</h4>
                  <p className="card-text small">Total Invitados</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card bg-success text-white shadow-sm">
                <div className="card-body text-center">
                  <i className="fa-solid fa-check-circle fa-2x mb-2"></i>
                  <h4 className="card-title">{stats.totalConfirmados}</h4>
                  <p className="card-text small">Confirmados</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card bg-warning text-white shadow-sm">
                <div className="card-body text-center">
                  <i className="fa-solid fa-calendar-check fa-2x mb-2"></i>
                  <h4 className="card-title">{stats.asistentesReales}</h4>
                  <p className="card-text small">Asistentes Reales</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card bg-info text-white shadow-sm">
                <div className="card-body text-center">
                  <i className="fa-solid fa-calendar fa-2x mb-2"></i>
                  <h4 className="card-title">{stats.eventosActivos}</h4>
                  <p className="card-text small">Eventos Activos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fa-solid fa-chart-line me-2 text-primary"></i>
                    Invitaciones por mes
                  </h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-2 text-muted">Cargando datos...</p>
                    </div>
                  ) : (
                    <Line data={lineData} options={lineOptions} />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fa-solid fa-chart-pie me-2 text-primary"></i>
                    Estado de confirmaciones
                  </h5>
                </div>
                <div className="card-body text-center">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="bg-info text-white rounded mb-2 p-2">
                          <i className="fa-solid fa-check-circle me-1"></i>
                          Confirmadas<br />
                          <span className="fw-bold fs-5">{stats.totalConfirmados}</span>
                        </div>
                        <div className="bg-light text-primary rounded p-2">
                          <i className="fa-solid fa-clock me-1"></i>
                          Sin confirmar<br />
                          <span className="fw-bold fs-5">{stats.invitacionesNoConfirmadas}</span>
                        </div>
                      </div>
                      <div
                        className="mt-3 position-relative"
                        style={{ width: "150px", margin: "0 auto" }}
                      >
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                          <div className="fw-bold fs-4 text-primary">{stats.safetyScore}</div>
                          <div className="text-muted small">Safety Score</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen adicional */}
          <div className="row g-4 mt-2">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fa-solid fa-info-circle me-2 text-primary"></i>
                    Resumen del sistema
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle p-2 me-3">
                          <i className="fa-solid fa-percentage"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Tasa de confirmación</h6>
                          <p className="text-muted mb-0">
                            {stats.totalInvitados > 0 
                              ? ((stats.totalConfirmados / stats.totalInvitados) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-success text-white rounded-circle p-2 me-3">
                          <i className="fa-solid fa-chart-bar"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Eficiencia</h6>
                          <p className="text-muted mb-0">
                            {stats.asistentesReales > 0 
                              ? ((stats.asistentesReales / stats.totalConfirmados) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning text-white rounded-circle p-2 me-3">
                          <i className="fa-solid fa-calendar-alt"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Eventos activos</h6>
                          <p className="text-muted mb-0">{stats.eventosActivos} eventos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
