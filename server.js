// server.js

import startServer from "./index.js";

export default {
  async fetch(request, env) {
    startServer();
    // return new Response("Hello world");
  },
};
