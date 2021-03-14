export default app => [
  // require('./merchants'),
  require('./merchants/dashboard'),
  require('./merchants/auth'),
  require('./merchants/verify'),
  require('./merchants/rewards'),
].forEach(entry => entry.default(app));
