const Usuario = require("./Usuario");
const Invitacion = require("./Invitacion");
const Confirmacion = require("./Confirmacion");
const Evento = require("./Eventos");

// Definir relaciones
Usuario.hasMany(Invitacion, { foreignKey: 'id_usuario', as: 'Invitaciones' });
Invitacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'Usuario' });

Invitacion.hasOne(Confirmacion, { foreignKey: 'id_invitacion', as: 'Confirmacion' });
Confirmacion.belongsTo(Invitacion, { foreignKey: 'id_invitacion', as: 'Invitacion' });

Evento.hasMany(Invitacion, { foreignKey: 'id_evento', as: 'Invitaciones' });
Invitacion.belongsTo(Evento, { foreignKey: 'id_evento', as: 'Evento' });

module.exports = {
    Usuario,
    Invitacion,
    Confirmacion,
    Evento
};
