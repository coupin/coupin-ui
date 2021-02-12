export default app => [
  require('./auth'),
  require('./util'),
  require('./requests'),
  require('./auth'),
  require('./config'),
  require('./coupin'),
  require('./payment'),
  require('./reward'),
].forEach(entry => entry.default(app));
