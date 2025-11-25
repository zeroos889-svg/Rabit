console.log("Starting test...");

import("./server/_core/index.ts")
  .then(() => {
    console.log("Module loaded successfully");
  })
  .catch((err) => {
    console.error("Failed to load module:", err);
    process.exit(1);
  });
