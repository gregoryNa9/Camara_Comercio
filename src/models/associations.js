const Usuario = require("./Usuario");
const Invitacion = require("./Invitacion");
const Confirmacion = require("./Confirmacion");
const Evento = require("./Eventos");
const EstadoInvitacion = require("./EstadoInvitacion");
const Acompanante = require("./Acompanante");

// Definir relaciones
Usuario.hasMany(Invitacion, { foreignKey: 'id_usuario', as: 'Invitaciones' });
Invitacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'Usuario' });

Invitacion.hasOne(Confirmacion, { foreignKey: 'id_invitacion', as: 'Confirmacion' });
Confirmacion.belongsTo(Invitacion, { foreignKey: 'id_invitacion', as: 'Invitacion' });

Evento.hasMany(Invitacion, { foreignKey: 'id_evento', as: 'Invitaciones' });
Invitacion.belongsTo(Evento, { foreignKey: 'id_evento', as: 'Evento' });

EstadoInvitacion.hasMany(Invitacion, { foreignKey: 'id_estado', as: 'Invitaciones' });
Invitacion.belongsTo(EstadoInvitacion, { foreignKey: 'id_estado', as: 'EstadoInvitacion' });

Confirmacion.hasMany(Acompanante, { foreignKey: 'id_confirmacion', as: 'Acompanantes' });
Acompanante.belongsTo(Confirmacion, { foreignKey: 'id_confirmacion', as: 'Confirmacion' });

module.exports = {
    Usuario,
    Invitacion,
    Confirmacion,
    Evento,
    EstadoInvitacion,
    Acompanante
};
