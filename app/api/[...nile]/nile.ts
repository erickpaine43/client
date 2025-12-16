import { Nile } from "@niledatabase/server";
import { nextJs } from "@niledatabase/nextjs";

// Map NileDB local env vars to standard Nile SDK env vars
if (!process.env.NILE_URL && process.env.NILEDB_API_URL) {
  process.env.NILE_URL = process.env.NILEDB_API_URL;
}

const nile = await Nile({
  debug: true,
  user: process.env.NILEDB_USER,
  password: process.env.NILEDB_PASSWORD,
  db: {
    connectionString: process.env.NILEDB_POSTGRES_URL,
  },
  extensions: [nextJs],
});

export { nile };
