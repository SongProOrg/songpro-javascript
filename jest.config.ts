import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  preset: "ts-jest",
};

export default config;
