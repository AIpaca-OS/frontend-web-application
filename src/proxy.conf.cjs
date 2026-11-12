// Only ng serve loads this file. The credential never enters the Angular bundle.
const localPassword = process.env.RUMBO_LOCAL_PASSWORD;

if (!localPassword) {
  throw new Error('Set RUMBO_LOCAL_PASSWORD before starting the local Routes proxy.');
}

module.exports = {
  '/api/v1/routes/**': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    headers: {
      Authorization: `Basic ${Buffer.from(`driver:${localPassword}`).toString('base64')}`,
    },
  },
};
