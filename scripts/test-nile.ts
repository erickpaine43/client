import { Nile } from "@niledatabase/server";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

console.log("Testing NileDB Connection...");
console.log("NILEDB_API_URL:", process.env.NILEDB_API_URL);
console.log("NILEDB_USER:", process.env.NILEDB_USER);
console.log("NILEDB_POSTGRES_URL available:", !!process.env.NILEDB_POSTGRES_URL);

async function testConnection() {
    try {
        const apiUrl = process.env.NILEDB_API_URL || "http://localhost:3005";
        const user = process.env.NILEDB_USER;
        const password = process.env.NILEDB_PASSWORD;

        console.log(`Fetching from ${apiUrl}/tenants with Basic Auth...`);
        const auth = Buffer.from(`${user}:${password}`).toString("base64");

        // Config: usually Nile runs on /v1/ ... depending on version.
        // Local NILE usually mimics cloud at root or /v1.
        // Let's try root first, then /v1.

        const endpoints = ["/tenants", "/v1/tenants", "/workspaces/test/databases/test/tenants"];

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(`${apiUrl}${endpoint}`, {
                    headers: {
                        "Authorization": `Basic ${auth}`,
                        "Content-Type": "application/json"
                    }
                });
                console.log(`Endpoint ${endpoint}: Status ${res.status}`);
                if (res.ok) {
                    console.log("Response:", await res.json());
                    break;
                } else {
                    console.log("Error:", await res.text());
                }
            } catch (e) {
                console.log(`Failed to fetch ${endpoint}:`, e.message);
            }
        }
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

testConnection();
