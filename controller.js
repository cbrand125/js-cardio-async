const fs = require('fs').promises;
const db = require('./db');

exports.getHome = (request, response) => {
  response.writeHead(200, {
    'my-custom-header': 'This is a great API',
    'another-header': 'More metadata'
  });
  return response.end('Welcome to my server');
};

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

exports.notFound = async (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  response.end(await fs.readFile('404.html'));
};

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

exports.getRead = async (request, response, pathname) => {
  const file = pathname.split('/')[2];

  if (!file || !file.endsWith('.json')) {
    return this.notFound(request, response);
  }

  response.writeHead(200, {
    'Content-Type': 'application/json'
  });

  response.end(await fs.readFile(file));
};

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
