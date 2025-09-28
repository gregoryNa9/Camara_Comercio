const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Evento = require("../models/Eventos");
const Invitacion = require("../models/Invitacion");
const Confirmacion = require("../models/Confirmacion");
const Usuario = require("../models/Usuario");

// Obtener estadísticas generales
exports.getStats = async (req, res) => {
    try {
        // Contar eventos activos
        const eventosActivos = await Evento.count({
            where: { estado_evento: 'Activo' }
        });

        // Contar invitaciones totales en eventos activos
        const totalInvitados = await Invitacion.count({
            include: [{
                model: Evento,
                as: 'Evento',
                where: { estado_evento: 'Activo' },
                attributes: []
            }]
        });

        // Contar confirmaciones en eventos activos
        const totalConfirmados = await Confirmacion.count({
            include: [{
                model: Invitacion,
                as: 'Invitacion',
                include: [{
                    model: Evento,
                    as: 'Evento',
                    where: { estado_evento: 'Activo' },
                    attributes: []
                }],
                attributes: []
            }]
        });

        // Contar asistentes reales (confirmaciones con fecha de confirmación)
        const asistentesReales = await Confirmacion.count({
            where: {
                fecha_confirmacion: {
                    [Op.not]: null
                }
            },
            include: [{
                model: Invitacion,
                as: 'Invitacion',
                include: [{
                    model: Evento,
                    as: 'Evento',
                    where: { estado_evento: 'Activo' },
                    attributes: []
                }],
                attributes: []
            }]
        });

        // Calcular invitaciones no confirmadas
        const invitacionesNoConfirmadas = totalInvitados - totalConfirmados;

        // Calcular safety score (porcentaje de confirmaciones)
        const safetyScore = totalInvitados > 0 ? 
            ((totalConfirmados / totalInvitados) * 10).toFixed(1) : 0;

        res.json({
            totalInvitados,
            asistentesReales,
            totalConfirmados,
            invitacionesNoConfirmadas,
            eventosActivos,
            safetyScore: parseFloat(safetyScore)
        });

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ 
            message: "Error al obtener estadísticas", 
            error: error.message 
        });
    }
};

// Obtener datos para gráficos
exports.getChartData = async (req, res) => {
    try {
        // Datos de invitados por mes (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const invitacionesPorMes = await Invitacion.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('fecha_envio'), '%Y-%m'), 'mes'],
                [sequelize.fn('COUNT', sequelize.col('id_invitacion')), 'total']
            ],
            where: {
                fecha_envio: {
                    [Op.gte]: sixMonthsAgo
                }
            },
            include: [{
                model: Evento,
                as: 'Evento',
                where: { estado_evento: 'Activo' },
                attributes: []
            }],
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('fecha_envio'), '%Y-%m')],
            order: [[sequelize.fn('DATE_FORMAT', sequelize.col('fecha_envio'), '%Y-%m'), 'ASC']]
        });

        // Datos de confirmaciones vs no confirmadas
        const totalInvitados = await Invitacion.count({
            include: [{
                model: Evento,
                as: 'Evento',
                where: { estado_evento: 'Activo' },
                attributes: []
            }]
        });

        const totalConfirmados = await Confirmacion.count({
            include: [{
                model: Invitacion,
                as: 'Invitacion',
                include: [{
                    model: Evento,
                    as: 'Evento',
                    where: { estado_evento: 'Activo' },
                    attributes: []
                }],
                attributes: []
            }]
        });

        res.json({
            invitacionesPorMes,
            confirmaciones: {
                confirmadas: totalConfirmados,
                noConfirmadas: totalInvitados - totalConfirmados
            }
        });

    } catch (error) {
        console.error("Error al obtener datos de gráficos:", error);
        res.status(500).json({ 
            message: "Error al obtener datos de gráficos", 
            error: error.message 
        });
    }
};

// Obtener top usuarios más invitados
exports.getTopUsuarios = async (req, res) => {
    try {
        const topUsuarios = await Usuario.findAll({
            attributes: [
                'id_usuario',
                'nombre',
                'empresa',
                [sequelize.fn('COUNT', sequelize.col('Invitaciones.id_invitacion')), 'totalInvitaciones']
            ],
            include: [{
                model: Invitacion,
                as: 'Invitaciones',
                include: [{
                    model: Evento,
                    as: 'Evento',
                    where: { estado_evento: 'Activo' },
                    attributes: []
                }],
                attributes: [],
                required: false // LEFT JOIN para incluir usuarios sin invitaciones
            }],
            group: ['Usuario.id_usuario'],
            order: [[sequelize.fn('COUNT', sequelize.col('Invitaciones.id_invitacion')), 'DESC']],
            limit: 10
        });

        // Mapear los resultados para asegurar que totalInvitaciones sea un número
        const topUsuariosMapeados = topUsuarios.map(usuario => ({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            empresa: usuario.empresa,
            totalInvitaciones: parseInt(usuario.dataValues.totalInvitaciones) || 0
        }));

        res.json(topUsuariosMapeados);

    } catch (error) {
        console.error("Error al obtener top usuarios:", error);
        res.status(500).json({ 
            message: "Error al obtener top usuarios", 
            error: error.message 
        });
    }
};

// Obtener reportes generales
exports.getAll = async (req, res) => {
    try {
        const reportes = await Usuario.findAll({
            attributes: [
                'id_usuario',
                'nombre',
                'empresa',
                [sequelize.fn('COUNT', sequelize.col('Invitaciones.id_invitacion')), 'eventosAsistidos']
            ],
            include: [{
                model: Invitacion,
                as: 'Invitaciones',
                include: [{
                    model: Evento,
                    as: 'Evento',
                    where: { estado_evento: 'Activo' },
                    attributes: []
                }],
                attributes: [],
                required: false // LEFT JOIN para incluir usuarios sin invitaciones
            }],
            group: ['Usuario.id_usuario'],
            order: [[sequelize.fn('COUNT', sequelize.col('Invitaciones.id_invitacion')), 'DESC']]
        });

        // Mapear los resultados para asegurar que eventosAsistidos sea un número
        const reportesMapeados = reportes.map(reporte => ({
            id_usuario: reporte.id_usuario,
            nombre: reporte.nombre,
            empresa: reporte.empresa,
            eventosAsistidos: parseInt(reporte.dataValues.eventosAsistidos) || 0
        }));

        res.json(reportesMapeados);

    } catch (error) {
        console.error("Error al obtener reportes:", error);
        res.status(500).json({ 
            message: "Error al obtener reportes", 
            error: error.message 
        });
    }
};
