// One Angular development proxy for every Spring Boot bounded context.
// Each teammate can select a local or deployed API without editing source files.
const target = process.env.RUMBO_API_URL || 'http://127.0.0.1:8080';
const previewKey = process.env.RUMBO_PREVIEW_KEY;

module.exports = {
  '/api': {
    target,
    changeOrigin: true,
    secure: true,
    ...(previewKey ? { headers: { 'X-Rumbo-Preview-Key': previewKey } } : {}),
  },
};
