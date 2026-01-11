// Script to send admin invitation automatically
(async () => {
  try {
    console.log('Enviando invitación admin...');

    const response = await fetch('/api/admin/send-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'maikekaisurfhouse@gmail.com',
        invitedBy: 'Sistema Mai Ke Kai'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Invitación enviada exitosamente!');
      console.log('Resultado:', result);
      console.log('El cliente debería recibir el email en breve.');
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('Asegúrate de que el servidor esté corriendo en localhost:3000');
  }
})();