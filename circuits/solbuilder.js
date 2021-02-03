require("dotenv").config();

const { execSync } = require("child_process");
const fs = require("fs");

const circuitName = process.argv[2];

// TODO: add an option to generate with entropy for production keys

if (process.argv.length !== 3) {
  console.log("usage");
  console.log(
    "builder circuits"
  );
  process.exit(1);
}

const cwd = process.cwd();

process.chdir(cwd + "/circuits/keys/" + circuitName);

try {
  execSync("npx snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol", {
    stdio: "inherit",
  });
  execSync("mkdir -p " + cwd + "/contracts/verifiers/" + circuitName, {
    stdio: "inherit",
  });
  fs.copyFileSync(
    "verifier.sol",
    cwd +
      "/contracts/verifiers/" +
      circuitName +
      "/verifer.sol"
  );
} catch (error) {
  console.log(error);
  process.exit(1);
}
