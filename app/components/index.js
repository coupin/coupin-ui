export default app => [
  // require('./merchants'),
  require('./merchants/dashboard'),
  require('./merchants/auth'),
  require('./merchants/verify'),
  require('./merchants/rewardsList'),
].forEach(entry => entry.default(app));
