import serve from 'serve';

const server = serve('/var/www/frontend/Fanjava/Frontend/tsena/dist', {
  port: 5173,  // ou ton port
  single: true
});

console.log('Frontend running on http://0.0.0.0:3000');
