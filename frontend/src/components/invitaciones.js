import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Menu from "./Menu";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Invitaciones({ onNavigate }) {
	const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

	// Estados
	const [filtros, setFiltros] = useState({ cedula: "", evento: "", apellidos: "" });
	const [invitaciones, setInvitaciones] = useState([]);
	const [eventos, setEventos] = useState([]);
	const [metodosEnvio, setMetodosEnvio] = useState({ whatsapp: false, correo: false });
	const [nuevaImagen, setNuevaImagen] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Estado menú
	const [menuAbierto, setMenuAbierto] = useState(false);

	// Modales
	const [invitacionSeleccionada, setInvitacionSeleccionada] = useState(null);
	const [showViewModal, setShowViewModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Cargar invitaciones
	const fetchInvitaciones = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			const res = await fetch(`${API_BASE}/invitaciones`);
			if (!res.ok) throw new Error("Error al obtener invitaciones");
			const data = await res.json();
			setInvitaciones(data);
		} catch {
			setError("No se pudo cargar las invitaciones.");
		} finally {
			setLoading(false);
		}
	}, [API_BASE]);

	const fetchEventos = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE}/eventos`);
			if (!res.ok) throw new Error("Error al obtener eventos");
			const data = await res.json();
			setEventos(data);
		} catch (err) {
			console.error(err);
		}
	}, [API_BASE]);

	useEffect(() => {
		fetchInvitaciones();
		fetchEventos();
	}, [fetchInvitaciones, fetchEventos]);

	// Filtros
	const handleChangeFiltro = (e) => {
		const { name, value } = e.target;
		setFiltros((prev) => ({ ...prev, [name]: value }));
		if (name === "cedula" && value.trim() !== "") buscarUsuario(value);
	};

	const buscarUsuario = async (cedula) => {
		try {
			const res = await fetch(`${API_BASE}/usuarios/cedula/${cedula}`);
			if (res.ok) {
				const usuario = await res.json();
				setFiltros((prev) => ({
					...prev,
					apellidos: usuario?.nombre?.split(" ").pop() || "",
				}));
			} else {
				setFiltros((prev) => ({ ...prev, apellidos: "" }));
			}
		} catch {
			setFiltros((prev) => ({ ...prev, apellidos: "" }));
		}
	};

	const handleLimpiar = () => {
		setFiltros({ cedula: "", evento: "", apellidos: "" });
		setMetodosEnvio({ whatsapp: false, correo: false });
		setNuevaImagen(null);
	};

	const handleEnviarInvitacion = async () => {
		if (!filtros.cedula || !filtros.evento) {
			alert("Debes ingresar la cédula y el evento.");
			return;
		}
		if (!metodosEnvio.whatsapp && !metodosEnvio.correo) {
			alert("Debes seleccionar al menos un método de envío.");
			return;
		}

		try {
			const codigoAlfa = `${filtros.evento
				.slice(0, 2)
				.toUpperCase()}${filtros.cedula.slice(-3)}${filtros.cedula
					.charAt(0)
					.toUpperCase()}${filtros.apellidos.charAt(0).toUpperCase()}`;

			const formData = new FormData();
			formData.append("cedula", filtros.cedula);
			formData.append("evento", filtros.evento);
			formData.append("codigo_unico", codigoAlfa);
			formData.append(
				"metodos_envio",
				JSON.stringify(
					Object.keys(metodosEnvio).filter((k) => metodosEnvio[k])
				)
			);
			if (nuevaImagen) formData.append("imagen", nuevaImagen);

			const res = await fetch(`${API_BASE}/invitaciones`, {
				method: "POST",
				body: formData,
			});
			if (!res.ok) throw new Error("Error al enviar invitación");

			await fetchInvitaciones();
			handleLimpiar();
		} catch (err) {
			console.error(err);
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
		<div className="d-flex flex-column min-vh-100 bg-light">
			{/* Header superior */}
			<Header />

			<div className="d-flex flex-grow-1">
				{/* Sidebar - siempre visible en desktop, desplegable en móvil */}
				<div className={`d-none d-md-block`}>
					<Menu onNavigate={onNavigate} activeItem="invitaciones" />
				</div>
				{menuAbierto && (
					<div className="d-md-none">
						<Menu onNavigate={onNavigate} activeItem="invitaciones" />
					</div>
				)}

				{/* Contenido principal */}
				<main className="flex-grow-1 p-5">
					<h2 className="text-primary fw-bold mb-3">Gestión de Invitaciones</h2>

					{/* FORMULARIO */}
					<div className="card p-4 shadow-sm mb-4">
						<h5 className="fw-bold text-secondary mb-3">Enviar Invitación</h5>
						<div className="row g-3">
							<div className="col-md-4">
								<label className="form-label">Cédula</label>
								<input
									type="text"
									name="cedula"
									value={filtros.cedula}
									onChange={handleChangeFiltro}
									className="form-control"
								/>
							</div>
							<div className="col-md-4">
								<label className="form-label">Apellidos</label>
								<input
									type="text"
									name="apellidos"
									value={filtros.apellidos}
									readOnly
									className="form-control"
								/>
							</div>
							<div className="col-md-4">
								<label className="form-label">Evento</label>
								<select
									name="evento"
									value={filtros.evento}
									onChange={handleChangeFiltro}
									className="form-select"
								>
									<option value="">Seleccione un evento</option>
									{eventos.map((evento) => (
										<option key={evento.id_evento} value={evento.nombre}>
											{evento.nombre}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="mt-3">
							<label className="form-label me-3 fw-bold">
								Métodos de envío:
							</label>
							<div className="form-check form-check-inline">
								<input
									type="checkbox"
									id="whatsapp"
									className="form-check-input"
									checked={metodosEnvio.whatsapp}
									onChange={() =>
										setMetodosEnvio((prev) => ({
											...prev,
											whatsapp: !prev.whatsapp,
										}))
									}
								/>
								<label htmlFor="whatsapp" className="form-check-label">
									WhatsApp
								</label>
							</div>
							<div className="form-check form-check-inline">
								<input
									type="checkbox"
									id="correo"
									className="form-check-input"
									checked={metodosEnvio.correo}
									onChange={() =>
										setMetodosEnvio((prev) => ({
											...prev,
											correo: !prev.correo,
										}))
									}
								/>
								<label htmlFor="correo" className="form-check-label">
									Correo
								</label>
							</div>
						</div>

						<div className="mt-3">
							<label className="form-label">Subir Imagen</label>
							<input
								type="file"
								className="form-control"
								onChange={(e) => setNuevaImagen(e.target.files[0])}
							/>
						</div>

						<div className="mt-4">
							<Button variant="success" onClick={handleEnviarInvitacion}>
								Enviar
							</Button>{" "}
							<Button variant="secondary" onClick={handleLimpiar}>
								Limpiar
							</Button>
						</div>
					</div>

					{/* TABLA */}
					<div className="card shadow-sm">
						<div className="card-header text-white fw-bold" style={{ backgroundColor: "#043474" }}>
							Lista de Invitaciones
						</div>
						<div className="card-body">
							{loading && <p>Cargando...</p>}
							{error && <p className="text-danger">{error}</p>}
							<table className="table table-bordered table-hover">
								<thead className="table-primary">
									<tr>
										<th>Cédula</th>
										<th>Evento</th>
										<th>Código Único</th>
										<th>Métodos</th>
										<th>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{invitaciones.map((inv) => (
										<tr key={inv.id_invitacion}>
											<td>{inv.cedula}</td>
											<td>{inv.evento}</td>
											<td>{inv.codigo_unico}</td>
											<td>{inv.metodos_envio?.join(", ")}</td>
											<td>
												<Button
													size="sm"
													variant="info"
													onClick={() => {
														setInvitacionSeleccionada(inv);
														setShowViewModal(true);
													}}
												>
													Ver
												</Button>{" "}
												<Button
													size="sm"
													variant="warning"
													onClick={() => {
														setInvitacionSeleccionada(inv);
														setShowEditModal(true);
													}}
												>
													Editar
												</Button>{" "}
												<Button
													size="sm"
													variant="danger"
													onClick={() => {
														setInvitacionSeleccionada(inv);
														setShowDeleteModal(true);
													}}
												>
													Eliminar
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* MODALES */}
					<Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Detalle de Invitación</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>
								<strong>Cédula:</strong> {invitacionSeleccionada?.cedula}
							</p>
							<p>
								<strong>Evento:</strong> {invitacionSeleccionada?.evento}
							</p>
							<p>
								<strong>Código Único:</strong> {invitacionSeleccionada?.codigo_unico}
							</p>
							<p>
								<strong>Métodos:</strong>{" "}
								{invitacionSeleccionada?.metodos_envio?.join(", ")}
							</p>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setShowViewModal(false)}>
								Cerrar
							</Button>
						</Modal.Footer>
					</Modal>

					{/* Modal de Edición */}
					<Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
						<Modal.Header closeButton>
							<Modal.Title>Editar Invitación</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Funcionalidad de edición en desarrollo...</p>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setShowEditModal(false)}>
								Cancelar
							</Button>
							<Button variant="primary">
								Guardar Cambios
							</Button>
						</Modal.Footer>
					</Modal>

					{/* Modal de Eliminación */}
					<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Confirmar Eliminación</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>¿Estás seguro de que deseas eliminar esta invitación?</p>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
								Cancelar
							</Button>
							<Button variant="danger">
								Eliminar
							</Button>
						</Modal.Footer>
					</Modal>

				</main>
			</div>
		</div>
	);
}

export default Invitaciones;
