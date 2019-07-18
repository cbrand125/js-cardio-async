const url = require('url');
const {
  getHome,
  getStatus,
  patchSet,
  notFound,
  postWrite
} = require('./controller');

function handleRoutes(request, response) {
  const parsedUrl = url.parse(request.url, true);
  const { pathname } = parsedUrl;

  if (pathname === '/' && request.method === 'GET') {
    return getHome(request, response);
  }

  if (pathname === '/status' && request.method === 'GET') {
    return getStatus(request, response);
  }

  if (pathname === '/set' && request.method === 'PATCH') {
    return patchSet(request, response, parsedUrl.query);
  }

  if (pathname.startsWith('/write') && request.method === 'POST') {
    return postWrite(request, response, pathname);
  }

  return notFound(request, response);
}

module.exports = handleRoutes;
