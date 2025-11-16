const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');

const FAILURE_WINDOW_MS = 30_000;
const BASE_COOLDOWN_MS = 10_000;

let failureTimestamps = [];
let circuitOpenUntil = 0;

function nowMs() {
  return Date.now();
}

function isCircuitOpen() {
  return nowMs() < circuitOpenUntil;
}

function recordFailure() {
  const now = nowMs();
  failureTimestamps.push(now);

  failureTimestamps = failureTimestamps.filter((ts) => now - ts <= FAILURE_WINDOW_MS);

  if (failureTimestamps.length >= 3) {
    const extraFailures = failureTimestamps.length - 2;
    const cooldown = BASE_COOLDOWN_MS * extraFailures;

    circuitOpenUntil = now + cooldown;
  }
}

function recordSuccess() {
  failureTimestamps = [];
  circuitOpenUntil = 0;
}

fastify.get('/getUsers', async (request, reply) => {
  const resp = await fetch('http://event.com/getUsers');
  const data = await resp.json();
  reply.send(data);
});

fastify.post('/addEvent', async (request, reply) => {
  l;
  if (isCircuitOpen()) {
    const retryAfterMs = circuitOpenUntil - Date.now();

    return reply.code(503).send({
      error: 'ServiceUnavailable',
      message: 'Event service is temporarily unavailable. Please try again later.',
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    });
  }

  try {
    const resp = await fetch('http://event.com/addEvent', {
      method: 'POST',
      body: JSON.stringify({
        id: Date.now(),
        ...request.body,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      recordFailure();

      return reply.code(502).send({
        error: 'BadGateway',
        message: 'Failed to add event due to upstream service error.',
        upstreamStatus: resp.status,
      });
    }

    const data = await resp.json();

    recordSuccess();

    return reply.send(data);
  } catch (err) {
    recordFailure();

    request.log?.error(err, 'Error calling http://event.com/addEvent');

    return reply.code(502).send({
      error: 'BadGateway',
      message: 'Failed to add event due to upstream service error.',
    });
  }
});

fastify.get('/getEvents', async (request, reply) => {
  const resp = await fetch('http://event.com/getEvents');
  const data = await resp.json();
  reply.send(data);
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
  const { id } = request.params;
  const user = await fetch('http://event.com/getUserById/' + id);
  const userData = await user.json();
  const userEvents = userData.events;

  const events = await Promise.all(
    userEvents.map((eventId) =>
      fetch('http://event.com/getEventById/' + eventId).then((res) => res.json()),
    ),
  );

  reply.send(events);
});

fastify.listen({ port: 3000 }, (err) => {
  listenMock();
  if (err) {
    fastify.log.error(err);
    process.exit();
  }
});
