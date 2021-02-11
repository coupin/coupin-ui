export default app => [
  require('./home')
].forEach(entry => entry.default(app));
