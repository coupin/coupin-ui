export default app => [
  require('./apiUrl'),
].forEach(entry => entry.default(app));
