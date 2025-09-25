import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import Menu from "./Menu";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Invitaciones({ onNavigate }) {
	const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";
	console.log("🌐 API_BASE configurado como:", API_BASE);

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
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Cargar invitaciones
	const fetchInvitaciones = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			console.log("🔍 Intentando cargar invitaciones desde:", `${API_BASE}/invitaciones`);
			const res = await fetch(`${API_BASE}/invitaciones`);
			console.log("📡 Respuesta del servidor:", res.status, res.statusText);
			if (!res.ok) throw new Error("Error al obtener invitaciones");
			const data = await res.json();
			console.log("📊 Datos recibidos:", data);
			setInvitaciones(data);
		} catch (err) {
			console.error("❌ Error al cargar invitaciones:", err);
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

	// Escuchar cambios en localStorage para actualizar invitaciones
	useEffect(() => {
		const handleStorageChange = () => {
			console.log("🔄 Actualizando invitaciones por cambio en localStorage");
			fetchInvitaciones();
		};

		// Escuchar cambios en localStorage
		window.addEventListener('storage', handleStorageChange);
		
		// También escuchar cambios en el mismo tab
		const interval = setInterval(() => {
			const lastInvitation = localStorage.getItem('lastInvitationSent');
			if (lastInvitation) {
				const lastTime = parseInt(lastInvitation);
				const now = Date.now();
				// Si la invitación se envió en los últimos 5 segundos, actualizar
				if (now - lastTime < 5000) {
					console.log("🔄 Invitación reciente detectada, actualizando lista");
					fetchInvitaciones();
					localStorage.removeItem('lastInvitationSent');
				}
			}
		}, 1000);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			clearInterval(interval);
		};
	}, [fetchInvitaciones]);

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

	// Validaciones robustas
	const validarCedula = (cedula) => {
		const cedulaLimpia = cedula.replace(/\D/g, '');
		return cedulaLimpia.length >= 7 && cedulaLimpia.length <= 13;
	};

	const validarEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validarTelefono = (telefono) => {
		const telefonoLimpio = telefono.replace(/\D/g, '');
		return telefonoLimpio.length >= 10;
	};

	const handleEnviarInvitacion = async () => {
		// Validaciones exhaustivas
		if (!filtros.cedula || !filtros.evento) {
			setError("❌ Debes ingresar la cédula y seleccionar un evento.");
			return;
		}

		if (!validarCedula(filtros.cedula)) {
			setError("❌ La cédula debe tener entre 7 y 13 dígitos.");
			return;
		}

		if (!metodosEnvio.whatsapp && !metodosEnvio.correo) {
			setError("❌ Debes seleccionar al menos un método de envío.");
			return;
		}

		// Validar datos del usuario si no existe
		if (!usuarioEncontrado) {
			setError("❌ Usuario no encontrado. Verifica la cédula o crea un nuevo usuario.");
			return;
		}

		// Validar email si se va a enviar por correo
		if (metodosEnvio.correo && !validarEmail(usuarioEncontrado.correo)) {
			setError("❌ El correo electrónico del usuario no es válido.");
			return;
		}

		// Validar teléfono si se va a enviar por WhatsApp
		if (metodosEnvio.whatsapp && (!usuarioEncontrado.telefono || !validarTelefono(usuarioEncontrado.telefono))) {
			setError("❌ El número de teléfono no es válido para WhatsApp.");
			return;
		}

		// Encontrar el evento seleccionado
		const eventoSeleccionado = eventos.find(e => e.nombreEvento === filtros.evento);
		if (!eventoSeleccionado) {
			setError("❌ Evento no encontrado.");
			return;
		}

		// Verificar si ya existe una invitación para este usuario y evento
		const invitacionExistente = invitaciones.find(inv => 
			inv.cedula === filtros.cedula && inv.evento === filtros.evento
		);
		if (invitacionExistente) {
			setError("❌ Este usuario ya tiene una invitación para este evento.");
			return;
		}

		try {
			setLoading(true);
			setError("");

			console.log("🚀 Iniciando envío de invitación...");
			console.log("👤 Usuario:", usuarioEncontrado.nombre);
			console.log("📧 Email:", usuarioEncontrado.correo);
			console.log("📱 Teléfono:", usuarioEncontrado.telefono);
			console.log("🎉 Evento:", eventoSeleccionado.nombreEvento);

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
			
			if (nuevaImagen) {
				formData.append("imagen", nuevaImagen);
				console.log("🖼️ Imagen adjunta:", nuevaImagen.name);
			}

			console.log("📤 Enviando datos al servidor...");
			const res = await fetch(`${API_BASE}/invitaciones`, {
				method: "POST",
				body: formData,
			});
			
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || "Error al enviar invitación");
			}

			const responseData = await res.json();
			console.log("✅ Respuesta del servidor:", responseData);

			// Actualizar la lista de invitaciones
			await fetchInvitaciones();
			
			// Limpiar formulario
			handleLimpiar();
			
			// Mostrar mensaje de éxito detallado
			let mensajeExito = "✅ " + responseData.message;
			if (responseData.envios) {
				const envios = responseData.envios;
				if (envios.email.enviado && envios.whatsapp.enviado) {
					mensajeExito += `\n📧 Email enviado a: ${envios.email.destinatario}\n📱 WhatsApp enviado a: ${envios.whatsapp.destinatario}`;
				} else if (envios.email.enviado) {
					mensajeExito += `\n📧 Email enviado a: ${envios.email.destinatario}`;
				} else if (envios.whatsapp.enviado) {
					mensajeExito += `\n📱 WhatsApp enviado a: ${envios.whatsapp.destinatario}`;
				}
			}
			
			setError(mensajeExito);
			setTimeout(() => setError(""), 5000);

		} catch (err) {
			console.error("❌ Error al enviar invitación:", err);
			setError(`❌ Error: ${err.message || "No se pudo enviar la invitación"}`);
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
				<Menu onNavigate={onNavigate} activeItem="invitaciones" />
			</div>
			{menuAbierto && (
				<div className="d-md-none position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }}>
					<div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={() => setMenuAbierto(false)}></div>
					<div className="position-absolute top-0 start-0">
						<Menu onNavigate={onNavigate} activeItem="invitaciones" onClose={() => setMenuAbierto(false)} />
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="main-content flex-grow-1 d-flex flex-column">
				{/* Header */}
				<Header />

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
							<div className="mt-3 p-3 bg-light rounded border border-success">
								<h6 className="text-success mb-3">
									<i className="fa-solid fa-user-check me-2"></i>
									Usuario encontrado:
								</h6>
								<div className="row">
									<div className="col-md-6">
										<p className="mb-2">
											<strong><i className="fa-solid fa-user me-2 text-primary"></i>Nombre:</strong> 
											<span className="ms-2">{usuarioEncontrado.nombre}</span>
										</p>
										<p className="mb-2">
											<strong><i className="fa-solid fa-id-card me-2 text-primary"></i>Cédula:</strong> 
											<span className="ms-2">{usuarioEncontrado.cedula}</span>
										</p>
									</div>
									<div className="col-md-6">
										<p className="mb-2">
											<strong><i className="fa-solid fa-envelope me-2 text-primary"></i>Correo:</strong> 
											<span className="ms-2">
												{usuarioEncontrado.correo}
												{validarEmail(usuarioEncontrado.correo) ? 
													<i className="fa-solid fa-check-circle text-success ms-2"></i> : 
													<i className="fa-solid fa-exclamation-triangle text-warning ms-2"></i>
												}
											</span>
										</p>
										<p className="mb-2">
											<strong><i className="fa-solid fa-phone me-2 text-primary"></i>Teléfono:</strong> 
											<span className="ms-2">
												{usuarioEncontrado.telefono || 'No registrado'}
												{usuarioEncontrado.telefono && validarTelefono(usuarioEncontrado.telefono) ? 
													<i className="fa-solid fa-check-circle text-success ms-2"></i> : 
													usuarioEncontrado.telefono ? 
													<i className="fa-solid fa-exclamation-triangle text-warning ms-2"></i> : null
												}
											</span>
										</p>
									</div>
								</div>
								{usuarioEncontrado.empresa && (
									<div className="row mt-2">
										<div className="col-md-6">
											<p className="mb-1">
												<strong><i className="fa-solid fa-building me-2 text-primary"></i>Empresa:</strong> 
												<span className="ms-2">{usuarioEncontrado.empresa}</span>
											</p>
										</div>
										<div className="col-md-6">
											<p className="mb-1">
												<strong><i className="fa-solid fa-briefcase me-2 text-primary"></i>Cargo:</strong> 
												<span className="ms-2">{usuarioEncontrado.cargo || 'No especificado'}</span>
											</p>
										</div>
									</div>
								)}
							</div>
						)}

						<div className="mt-3">
							<label className="form-label me-3 fw-bold">
								<i className="fa-solid fa-paper-plane me-2"></i>
								Métodos de envío:
							</label>
							<div className="form-check form-check-inline">
								<input
									type="checkbox"
									id="whatsapp"
									className="form-check-input"
									checked={metodosEnvio.whatsapp}
									disabled={loading}
									onChange={() =>
										setMetodosEnvio((prev) => ({
											...prev,
											whatsapp: !prev.whatsapp,
										}))
									}
								/>
								<label htmlFor="whatsapp" className="form-check-label">
									<i className="fa-brands fa-whatsapp me-1 text-success"></i>
									WhatsApp
									{usuarioEncontrado && usuarioEncontrado.telefono && !validarTelefono(usuarioEncontrado.telefono) && (
										<i className="fa-solid fa-exclamation-triangle text-warning ms-1" title="Número de teléfono inválido"></i>
									)}
								</label>
							</div>
							<div className="form-check form-check-inline">
								<input
									type="checkbox"
									id="correo"
									className="form-check-input"
									checked={metodosEnvio.correo}
									disabled={loading}
									onChange={() =>
										setMetodosEnvio((prev) => ({
											...prev,
											correo: !prev.correo,
										}))
									}
								/>
								<label htmlFor="correo" className="form-check-label">
									<i className="fa-solid fa-envelope me-1 text-primary"></i>
									Correo
									{usuarioEncontrado && !validarEmail(usuarioEncontrado.correo) && (
										<i className="fa-solid fa-exclamation-triangle text-warning ms-1" title="Correo electrónico inválido"></i>
									)}
								</label>
							</div>
						</div>

						<div className="mt-3">
							<label className="form-label">
								<i className="fa-solid fa-image me-2"></i>
								Subir Imagen (Opcional)
							</label>
							<input
								type="file"
								className="form-control"
								accept="image/*"
								disabled={loading}
								onChange={(e) => setNuevaImagen(e.target.files[0])}
							/>
							{nuevaImagen && (
								<div className="mt-2">
									<small className="text-success">
										<i className="fa-solid fa-check-circle me-1"></i>
										Archivo seleccionado: {nuevaImagen.name} ({(nuevaImagen.size / 1024).toFixed(1)} KB)
									</small>
								</div>
							)}
						</div>

						{/* Mensaje de error/éxito */}
						{error && (
							<div className={`alert ${error.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
								<pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
									{error}
								</pre>
							</div>
						)}

						<div className="mt-4">
							<Button 
								variant="success" 
								onClick={handleEnviarInvitacion}
								disabled={loading}
								className="me-2"
							>
								{loading ? (
									<>
										<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
										Enviando...
									</>
								) : (
									<>
										<i className="fa-solid fa-paper-plane me-2"></i>
										Enviar Invitación
									</>
								)}
							</Button>
							<Button 
								variant="secondary" 
								onClick={handleLimpiar}
								disabled={loading}
							>
								<i className="fa-solid fa-eraser me-2"></i>
								Limpiar
							</Button>
						</div>
					</div>

					{/* TABLA */}
					<div className="card shadow-sm">
						<div className="card-header text-white fw-bold d-flex justify-content-between align-items-center" style={{ backgroundColor: "#043474" }}>
							<span>Lista de Invitaciones</span>
							<button 
								className="btn btn-outline-light btn-sm"
								onClick={fetchInvitaciones}
								disabled={loading}
							>
								<i className="fa-solid fa-refresh me-1"></i>
								Actualizar
							</button>
						</div>
						<div className="card-body">
							{loading && (
								<div className="text-center py-3">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Cargando...</span>
									</div>
									<p className="mt-2 text-muted">Cargando invitaciones...</p>
								</div>
							)}
							{error && <div className="alert alert-danger">{error}</div>}
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
