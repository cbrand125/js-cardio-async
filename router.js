const url = require('url');
const {
  getHome,
  getStatus,
  patchSet,
  notFound,
  postWrite,
  getProp,
  patchRemove,
  deleteFile,
  postMerge,
  getRead,
  postUnion,
  postIntersect,
  postDifference,
  postReset
} = require('./controller');

/**
 * decides how to route a request using the path and query parameters
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
function handleRoutes(request, response) {
  const parsedUrl = url.parse(request.url, true);
  const { query } = parsedUrl;
  const { pathname } = parsedUrl;

  if (pathname === '/' && request.method === 'GET') {
    return getHome(request, response);
  }

  if (pathname === '/status' && request.method === 'GET') {
    return getStatus(request, response);
  }

  if (pathname === '/set' && request.method === 'PATCH') {
    return patchSet(request, response, query);
  }

  if (pathname.startsWith('/write') && request.method === 'POST') {
    return postWrite(request, response, pathname);
  }

  if (pathname === '/get' && request.method === 'GET') {
    return getProp(request, response, query);
  }

  if (pathname === '/remove' && request.method === 'PATCH') {
    return patchRemove(request, response, query);
  }

  if (pathname === '/delete' && request.method === 'DELETE') {
    return deleteFile(request, response, query);
  }

  if (pathname === '/merge' && request.method === 'POST') {
    return postMerge(request, response);
  }

  if (pathname.startsWith('/read') && request.method === 'GET') {
    return getRead(request, response, pathname);
  }

  if (pathname === '/union' && request.method === 'POST') {
    return postUnion(request, response, query);
  }

  if (pathname === '/intersect' && request.method === 'POST') {
    return postIntersect(request, response, query);
  }

  if (pathname === '/difference' && request.method === 'POST') {
    return postDifference(request, response, query);
  }

  if (pathname === '/reset' && request.method === 'POST') {
    return postReset(request, response);
  }

  return notFound(request, response);
}

module.exports = handleRoutes;
