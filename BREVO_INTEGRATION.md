# 🚀 Integración de Brevo - Guía Completa

## 📋 **¿Qué se ha implementado?**

### ✅ **Servicios Creados:**
- `src/services/brevoService.js` - Servicio principal de Brevo
- Configuración actualizada en `src/config/integrations.js`
- Nuevo endpoint: `POST /api/invitaciones/enviar-brevo`

### ✅ **Características Implementadas:**
- 📧 **Envío de emails** con plantillas HTML personalizadas
- 📱 **Envío de WhatsApp** (requiere configuración adicional)
- 🎨 **Plantillas dinámicas** con variables del sistema
- 📎 **Adjuntos automáticos** (códigos QR)
- 🔄 **Sistema de reintentos** automático
- 📊 **Logging detallado** de envíos

## 🔧 **Configuración Requerida**

### **1. Crear archivo `.env`:**
```bash
# Copiar el archivo de ejemplo
copy env.example .env
```

### **2. Configurar variables de Brevo:**
```env
# Reemplazar con tu API key real
BREVO_API_KEY=tu_api_key_de_brevo_aqui

# Configuración del remitente
BREVO_SENDER_NAME=Cámara de Industrias y Producciones de Santo Domingo
BREVO_SENDER_EMAIL=noreply@camaracomercio.com

# Para usar Brevo como proveedor por defecto
EMAIL_PROVIDER=brevo
```

## 📧 **Uso del Sistema**

### **Enviar Invitaciones con Brevo:**

**Endpoint:** `POST /api/invitaciones/enviar-brevo`

**Body:**
```json
{
  "invitacionIds": [1, 2, 3],
  "metodoEnvio": "email" // "email", "whatsapp", o "ambos"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Procesadas 3 invitaciones",
  "resultados": [
    {
      "id": 1,
      "email": {
        "success": true,
        "messageId": "brevo_message_id"
      },
      "whatsapp": null
    }
  ]
}
```

## 🎨 **Plantillas de Email**

### **Características de la Plantilla:**
- ✅ **Diseño responsive** (móvil y desktop)
- ✅ **Variables dinámicas**: `{{nombre}}`, `{{evento}}`, etc.
- ✅ **Código QR adjunto** automáticamente
- ✅ **Botones de acción** (confirmar asistencia)
- ✅ **Estilo profesional** con colores institucionales

### **Variables Disponibles:**
- `{{nombre}}` - Nombre del invitado
- `{{evento_nombre}}` - Nombre del evento
- `{{fecha_evento}}` - Fecha del evento
- `{{lugar_evento}}` - Lugar del evento
- `{{codigo_unico}}` - Código único de la invitación
- `{{confirmacion_url}}` - URL para confirmar asistencia
- `{{unsubscribe_url}}` - URL para cancelar suscripción

## 📱 **Configuración de WhatsApp (Opcional)**

### **Para habilitar WhatsApp:**
1. **Configurar en Brevo:**
   - Activar WhatsApp en tu cuenta Brevo
   - Crear plantilla de mensaje
   - Obtener `templateId` y `senderNumber`

2. **Agregar variables al `.env`:**
```env
BREVO_WHATSAPP_TEMPLATE_ID=tu_template_id
BREVO_WHATSAPP_SENDER=+1234567890
WHATSAPP_PROVIDER=brevo_whatsapp
```

## 🔄 **Integración con Frontend**

### **Ejemplo de uso desde React:**
```javascript
const enviarInvitaciones = async (invitacionIds, metodoEnvio) => {
  try {
    const response = await fetch('/api/invitaciones/enviar-brevo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitacionIds: invitacionIds,
        metodoEnvio: metodoEnvio
      })
    });
    
    const result = await response.json();
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎯 **Ventajas de Brevo vs Sistema Actual**

| Característica | Sistema Actual | Con Brevo |
|----------------|----------------|-----------|
| **Deliverability** | Gmail SMTP | ✅ Mejor |
| **Analytics** | ❌ No | ✅ Completo |
| **Plantillas** | Básicas | ✅ Profesionales |
| **WhatsApp** | API genérica | ✅ Business oficial |
| **Escalabilidad** | Limitada | ✅ Ilimitada |
| **Soporte** | ❌ No | ✅ 24/7 |

## 🚀 **Próximos Pasos**

1. **Configurar `.env`** con tu API key de Brevo
2. **Probar envío** de emails
3. **Configurar WhatsApp** (opcional)
4. **Integrar en frontend** para envío masivo
5. **Monitorear analytics** en Brevo

## 📞 **Soporte**

- **Documentación Brevo**: https://developers.brevo.com/
- **API Reference**: https://developers.brevo.com/reference
- **Soporte**: support@brevo.com

---

**¡Tu sistema ahora está listo para usar Brevo! 🎉**
