import React, { useState } from 'react';

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  /*
    RECOMENDACIONES PARA CONECTAR EL BACKEND EN LOGIN
    - Define REACT_APP_API_BASE con la URL base de tu API.
      PowerShell: $env:REACT_APP_API_BASE='http://localhost:3000/api'; npm start
    - Endpoint recomendado: POST /api/auth/login
    - Estructura esperada del request: { usuario, password }
    - Estructura esperada del response: { success: true, token: "jwt_token", user: {...} }
    - Guarda el token en localStorage para futuras peticiones
    - Implementa manejo de errores (credenciales incorrectas, servidor no disponible)
  */
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      // Intentar autenticación con el backend
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar token si el backend lo devuelve
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        onLogin();
      } else {
        const errorData = await response.json();
        setMensaje(errorData.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      // Si el backend no está disponible, usar modo demo
      console.log('Backend no disponible, usando modo demo');
      if (usuario && password) {
        // Simular login exitoso para desarrollo
        onLogin();
      } else {
        setMensaje('Por favor ingrese usuario y contraseña');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#043474',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '80%', marginTop: '40px', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/logo.jpg" alt="Logo" style={{ width: '400px', marginBottom: '20px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80%' }}>
        
        <div style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '40px 30px',
          marginLeft: '60px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          minWidth: '320px'
        }}>
          <h2 style={{ textAlign: 'center', color: '#0a3972', marginBottom: '30px' }}>INICIO DE SESION</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          {mensaje && <p style={{ color: 'red', marginTop: '15px' }}>{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;