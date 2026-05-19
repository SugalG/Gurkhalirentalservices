const concurrently = require("concurrently");

concurrently(
  [
    {
      command: "npm run start:dev --prefix llc-backend",
      name: "backend",
      prefixColor: "blue",
    },
    {
      command: "npm run dev --prefix llc-frontend",
      name: "frontend",
      prefixColor: "green",
    },
  ],
  {
    killOthersOn: ["failure", "success"],
    restartTries: 0,
  }
).result.catch((error) => {
  process.exit(typeof error === "number" ? error : 1);
});
