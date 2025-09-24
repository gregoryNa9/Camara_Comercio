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
	const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);

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
				setUsuarioEncontrado(usuario);
				// Extraer apellido del nombre completo
				const nombreCompleto = usuario.nombre || "";
				const partes = nombreCompleto.split(" ");
				const apellido = partes.length > 1 ? partes[partes.length - 1] : "";
				
				setFiltros((prev) => ({
					...prev,
					apellidos: apellido,
				}));
			} else {
				setUsuarioEncontrado(null);
				setFiltros((prev) => ({ ...prev, apellidos: "" }));
			}
		} catch {
			setUsuarioEncontrado(null);
			setFiltros((prev) => ({ ...prev, apellidos: "" }));
		}
	};

	const handleLimpiar = () => {
		setFiltros({ cedula: "", evento: "", apellidos: "" });
		setMetodosEnvio({ whatsapp: false, correo: false });
		setNuevaImagen(null);
		setUsuarioEncontrado(null);
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
			// Encontrar el evento seleccionado para obtener su ID
			const eventoSeleccionado = eventos.find(e => e.nombreEvento === filtros.evento);
			if (!eventoSeleccionado) {
				alert("Evento no encontrado.");
				return;
			}

			const formData = new FormData();
			formData.append("cedula", filtros.cedula);
			formData.append("id_evento", eventoSeleccionado.id);
			
			// Determinar método de envío
			let id_metodo_envio = 1; // Por defecto correo
			if (metodosEnvio.whatsapp && metodosEnvio.correo) {
				id_metodo_envio = 3; // Ambos
			} else if (metodosEnvio.whatsapp) {
				id_metodo_envio = 2; // Solo WhatsApp
			}
			
			formData.append("id_metodo_envio", id_metodo_envio);
			formData.append("id_estado", 1); // Estado pendiente
			
			if (nuevaImagen) formData.append("imagen", nuevaImagen);

			const res = await fetch(`${API_BASE}/invitaciones`, {
				method: "POST",
				body: formData,
			});
			
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Error al enviar invitación");
			}

			await fetchInvitaciones();
			handleLimpiar();
			alert("Invitación enviada correctamente");
		} catch (err) {
			console.error(err);
			alert(err.message || "Error al enviar invitación");
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
									placeholder="Ingrese la cédula del invitado"
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
									placeholder="Se autocompleta al ingresar la cédula"
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
										<option key={evento.id} value={evento.nombreEvento}>
											{evento.nombreEvento} - {evento.fecha}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Información del usuario encontrado */}
						{usuarioEncontrado && (
							<div className="mt-3 p-3 bg-light rounded">
								<h6 className="text-success mb-2">
									<i className="fa-solid fa-user-check me-2"></i>
									Usuario encontrado:
								</h6>
								<div className="row">
									<div className="col-md-6">
										<p className="mb-1"><strong>Nombre:</strong> {usuarioEncontrado.nombre}</p>
										<p className="mb-1"><strong>Cédula:</strong> {usuarioEncontrado.cedula}</p>
									</div>
									<div className="col-md-6">
										<p className="mb-1"><strong>Correo:</strong> {usuarioEncontrado.correo}</p>
										<p className="mb-1"><strong>Teléfono:</strong> {usuarioEncontrado.telefono || 'No registrado'}</p>
									</div>
								</div>
							</div>
						)}

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
							<div className="table-responsive">
								<table className="table table-bordered table-hover">
									<thead className="table-primary">
										<tr>
											<th>Nombre</th>
											<th>Cédula</th>
											<th>Correo</th>
											<th>Evento</th>
											<th>Fecha Evento</th>
											<th>Código Único</th>
											<th>Métodos</th>
											<th>Acciones</th>
										</tr>
									</thead>
									<tbody>
										{invitaciones.length === 0 ? (
											<tr>
												<td colSpan="8" className="text-center text-muted">
													No hay invitaciones registradas
												</td>
											</tr>
										) : (
											invitaciones.map((inv) => (
												<tr key={inv.id_invitacion}>
													<td>{inv.nombre}</td>
													<td>{inv.cedula}</td>
													<td>{inv.correo}</td>
													<td>{inv.evento}</td>
													<td>{inv.fecha_evento}</td>
													<td>
														<span className="badge bg-primary">{inv.codigo_unico}</span>
													</td>
													<td>
														{inv.id_metodo_envio === 1 && <span className="badge bg-success">Correo</span>}
														{inv.id_metodo_envio === 2 && <span className="badge bg-success">WhatsApp</span>}
														{inv.id_metodo_envio === 3 && (
															<>
																<span className="badge bg-success me-1">Correo</span>
																<span className="badge bg-success">WhatsApp</span>
															</>
														)}
													</td>
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
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					{/* MODALES */}
					<Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
						<Modal.Header closeButton>
							<Modal.Title>Detalle de Invitación</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{invitacionSeleccionada && (
								<div>
									<div className="row">
										<div className="col-md-6">
											<h6 className="text-primary">Información del Invitado</h6>
											<p><strong>Nombre:</strong> {invitacionSeleccionada.nombre}</p>
											<p><strong>Cédula:</strong> {invitacionSeleccionada.cedula}</p>
											<p><strong>Correo:</strong> {invitacionSeleccionada.correo}</p>
											<p><strong>Teléfono:</strong> {invitacionSeleccionada.telefono || 'No registrado'}</p>
											<p><strong>Empresa:</strong> {invitacionSeleccionada.empresa || 'No registrada'}</p>
											<p><strong>Cargo:</strong> {invitacionSeleccionada.cargo || 'No registrado'}</p>
										</div>
										<div className="col-md-6">
											<h6 className="text-primary">Información del Evento</h6>
											<p><strong>Evento:</strong> {invitacionSeleccionada.evento}</p>
											<p><strong>Categoría:</strong> {invitacionSeleccionada.categoria}</p>
											<p><strong>Fecha:</strong> {invitacionSeleccionada.fecha_evento}</p>
											<p><strong>Lugar:</strong> {invitacionSeleccionada.lugar}</p>
											<p><strong>Código Único:</strong> 
												<span className="badge bg-primary ms-2">{invitacionSeleccionada.codigo_unico}</span>
											</p>
											<p><strong>Métodos de Envío:</strong>{" "}
												{invitacionSeleccionada.id_metodo_envio === 1 && <span className="badge bg-success">Correo</span>}
												{invitacionSeleccionada.id_metodo_envio === 2 && <span className="badge bg-success">WhatsApp</span>}
												{invitacionSeleccionada.id_metodo_envio === 3 && (
													<>
														<span className="badge bg-success me-1">Correo</span>
														<span className="badge bg-success">WhatsApp</span>
													</>
												)}
											</p>
											<p><strong>Fecha de Envío:</strong> {new Date(invitacionSeleccionada.fecha_envio).toLocaleString()}</p>
										</div>
									</div>
									{invitacionSeleccionada.qr_url && (
										<div className="mt-3 text-center">
											<h6 className="text-primary">Código QR</h6>
											<img src={invitacionSeleccionada.qr_url} alt="QR Code" className="img-fluid" style={{maxWidth: '200px'}} />
										</div>
									)}
								</div>
							)}
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
