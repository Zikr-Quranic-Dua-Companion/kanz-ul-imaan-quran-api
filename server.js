// server.js

import startServer from "./index.js";

export default {
  async fetch(request, env) {
    // Call startServer() here or wherever appropriate
    startServer();

    // Respond to the fetch request
    return new Response("Hello world");
  }
};
