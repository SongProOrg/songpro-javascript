import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>/src"],
  moduleDirectories: ["node_modules"],
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
