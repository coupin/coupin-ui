export default app => [
  // require('./merchants'),
  require('./merchants/dashboard'),
  require('./merchants/auth'),
  require('./merchants/verify'),
  require('./merchants/rewardsList'),
  require('./merchants/reward'),
  require('./merchants/analytics'),
  require('./merchants/profile'),
].forEach(entry => entry.default(app));
