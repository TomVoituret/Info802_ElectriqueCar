const { soap } = require("strong-soap");
const http = require("http");

// Define the service implementation
const service = {
  HelloService: {
    Hello_Port: {
      sayHello: function (args, callback) {
        // Perform the logic to generate the greeting
        const firstName = args.firstName;
        const greeting = `Hello, ${firstName}!`;

        // Return the response
        const result = {
          greeting: greeting,
        };
        callback(null, result);
      },
    },
  },
};

// Read the WSDL file
const xml = require("fs").readFileSync("src/AdditionService.wsdl", "utf8");

// Create an HTTP server
const server = http.createServer(function (request, response) {
  response.end("404: Not Found: " + request.url);
});

// Listen on port 8000
server.listen(8000);

// Attach the SOAP service to the server
soap.listen(server, "/SayHello", service, xml);

console.log("SOAP server running at http://localhost:8000/SayHello?wsdl");
