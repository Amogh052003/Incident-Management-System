const fs = require("fs");
const path = require("path");

const openapi = require("../openapi");

const output = path.join(
  __dirname,
  "../docs/reference/openapi.json"
);

fs.mkdirSync(
  path.dirname(output),
  { recursive: true }
);

fs.writeFileSync(
  output,
  JSON.stringify(openapi, null, 2)
);

console.log(`OpenAPI specification generated → ${output}`);
