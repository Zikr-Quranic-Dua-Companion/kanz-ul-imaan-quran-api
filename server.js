// server.js

import startServer from "./index.js";
import http from "http";  // Import the built-in http module

const requestListener = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/") {
    startServer();
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello world");
  } else if (url.pathname === "/another-endpoint") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("This is another endpoint");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
};

const server = http.createServer(requestListener); // Create the server

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
