const fetch = require('node-fetch');

async function testConfirmacionConAcompanantes() {
    try {
        console.log('🧪 Probando confirmación con acompañantes...\n');
        
        // Datos de prueba
        const codigoInvitacion = 'EV678JP02';
        const datosConfirmacion = {
            nombre: 'FRANCO ESCAMILLA',
            correo: 'franco@test.com',
            telefono: '0962986909',
            cargo: 'Gerente',
            direccion: 'Zaruma 4',
            acompanantes: [
                {
                    nombre: 'MARIA GONZALEZ',
                    correo: 'maria@test.com',
                    telefono: '0998765432',
                    cargo: 'Asistente'
                },
                {
                    nombre: 'CARLOS RODRIGUEZ',
                    correo: 'carlos@test.com',
                    telefono: '0987654321',
                    cargo: 'Coordinador'
                }
            ]
        };
        
        console.log('📋 Datos de confirmación:');
        console.log(`- Principal: ${datosConfirmacion.nombre} (${datosConfirmacion.correo})`);
        console.log(`- Acompañantes: ${datosConfirmacion.acompanantes.length}`);
        datosConfirmacion.acompanantes.forEach((acompanante, index) => {
            console.log(`  ${index + 1}. ${acompanante.nombre} (${acompanante.correo})`);
        });
        
        console.log('\n🚀 Enviando confirmación...');
        
        const response = await fetch(`http://localhost:8080/api/invitaciones/confirmar/${codigoInvitacion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosConfirmacion)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Confirmación exitosa!');
            console.log('📧 Emails enviados:');
            console.log(`- Principal: ${datosConfirmacion.correo}`);
            datosConfirmacion.acompanantes.forEach((acompanante, index) => {
                console.log(`- Acompañante ${index + 1}: ${acompanante.correo}`);
            });
        } else {
            console.log('❌ Error en la confirmación:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testConfirmacionConAcompanantes();
