export default app => [
  // require('./merchants'),
  require('./merchants/dashboard'),
  require('./merchants/auth'),
  require('./merchants/verify'),
].forEach(entry => entry.default(app));
