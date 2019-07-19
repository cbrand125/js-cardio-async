const fs = require('fs').promises;
const db = require('./db');

/**
 * ends response with the home page
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
exports.getHome = (request, response) => {
  response.writeHead(200, {
    'my-custom-header': 'This is a great API',
    'another-header': 'More metadata'
  });
  return response.end('Welcome to my server');
};

/**
 * ends the response with the status page
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
exports.getStatus = (request, response) => {
  const status = {
    up: true,
    owner: 'Cody Brand',
    timestamp: Date.now()
  };

  response.writeHead(200, {
    'Content-Type': 'application/json'
  });

  return response.end(JSON.stringify(status));
};

/**
 * performs the requested set operation before ending the response with the operation results
 * set changes a piece of data inside of an existing file
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for file, key, and value
 * @param {string} file name of JSON file to operate on
 * @param {string} key what piece to set in the file
 * @param {string} value what information to input into the file's key
 */
exports.patchSet = (request, response, { file, key, value }) => {
  if (!file || !key || !value) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.set(file, key, value)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * ends the response with the 'not found' page
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
exports.notFound = async (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  response.end(await fs.readFile('404.html'));
};

/**
 * performs the requested write operation and ends with response with the results
 * write creates a new file using the body of the request
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {string} pathname the path of the request without the prefix ip/port
 *                          this should end in the name of the file to be created
 */
exports.postWrite = (request, response, pathname) => {
  const file = pathname.split('/')[2];
  const data = [];

  if (!file || !file.endsWith('.json')) {
    return this.notFound(request, response);
  }

  request.on('data', chunk => data.push(chunk));
  request.on('end', async () => {
    let body;
    try {
      body = JSON.parse(data);
    } catch (err) {
      response.writeHead(400);
      response.end(err.message);
    }

    db.createFile(file, body)
      .then(result => {
        response.writeHead(201);
        response.end(result);
      })
      .catch(err => {
        response.writeHead(400);
        response.end(err.message);
      });
  });
};

/**
 * performs the requested get operation before ending the response with the operation results
 * get returns a piece of data inside of an existing file
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for file and key
 * @param {string} file name of JSON file to operate on
 * @param {string} key what piece to get in the file
 */
exports.getProp = (request, response, { file, key }) => {
  if (!file || !key) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.get(file, key)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested remove operation before ending the response with the operation results
 * remove deletes a piece of data inside of an existing file
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for file, key
 * @param {string} file name of JSON file to operate on
 * @param {string} key what piece to remove in the file
 */
exports.patchRemove = (request, response, { file, key }) => {
  if (!file || !key) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.remove(file, key)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested delete operation and ends with response with the results
 * deletes an existing file
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {string} pathname the path of the request without the prefix ip/port
 *                          this should end in the name of the file to be deleted
 */
exports.deleteFile = (request, response, { file }) => {
  if (!file || !file.endsWith('.json')) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.deleteFile(file)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested merge operation before ending the response with the operation results
 * merge collects all information from every existing json file and saves it in a new merged.json
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
exports.postMerge = (request, response) => {
  db.mergeData()
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested read operation and ends with response with the results
 * reads an existing file
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {string} pathname the path of the request without the prefix ip/port
 *                          this should end in the name of the file to be read
 */
exports.getRead = async (request, response, pathname) => {
  const file = pathname.split('/')[2];
  if (!file || !file.endsWith('.json')) {
    return this.notFound(request, response);
  }

  response.writeHead(200, {
    'Content-Type': 'application/json'
  });

  let fileText;
  try {
    fileText = await fs.readFile(file);
  } catch {
    return this.notFound(request, response);
  }
  response.end(fileText);
};

/**
 * performs the requested union operation before ending the response with the operation results
 * union determines all keys from the given files with no repeats
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for fileA and fileB
 * @param {string} fileA name of JSON file to compare
 * @param {string} fileB name of other JSON file to compare
 */
exports.postUnion = (request, response, { fileA, fileB }) => {
  if (
    !fileA ||
    !fileA.endsWith('.json') ||
    !fileB ||
    !fileB.endsWith('.json')
  ) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.union(fileA, fileB)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested intersect operation before ending the response with the operation results
 * intersect determines all keys that the given files have in common
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for fileA and fileB
 * @param {string} fileA name of JSON file to compare
 * @param {string} fileB name of other JSON file to compare
 */
exports.postIntersect = (request, response, { fileA, fileB }) => {
  if (
    !fileA ||
    !fileA.endsWith('.json') ||
    !fileB ||
    !fileB.endsWith('.json')
  ) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.intersect(fileA, fileB)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested difference operation before ending the response with the operation results
 * difference determines all keys that the files do not have in common
 * @param {Request} request http request object
 * @param {Response} response http response object
 * @param {Object} query destructure containing query parameters for fileA and fileB
 * @param {string} fileA name of JSON file to compare
 * @param {string} fileB name of other JSON file to compare
 */
exports.postDifference = (request, response, { fileA, fileB }) => {
  if (
    !fileA ||
    !fileA.endsWith('.json') ||
    !fileB ||
    !fileB.endsWith('.json')
  ) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.difference(fileA, fileB)
    .then(result => {
      response.writeHead(200);
      response.end(result);
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};

/**
 * performs the requested reset operation before ending the response with the operation results
 * reset puts post.json, scott.json, andrew.json, and log.txt back to their original form
 * @param {Request} request http request object
 * @param {Response} response http response object
 */
exports.postReset = (request, response) => {
  db.reset()
    .then(() => {
      response.writeHead(200);
      response.end('Reset Successful');
    })
    .catch(err => {
      response.writeHead(400);
      response.end(err.message);
    });
};
