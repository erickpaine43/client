import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createNileConfig } from '../niledb/config';

// Create database connections for each service
const nileConfig = createNileConfig();

// OLTP Database (main transactional database)
const oltpConnection = postgres(nileConfig.databases.oltp.url);
export const oltpDb = drizzle(oltpConnection);

// OLAP Database (analytics and reporting)
const olapConnection = postgres(nileConfig.databases.olap.url);
export const olapDb = drizzle(olapConnection);

// Messages Database (message queue and notifications)
const messagesConnection = postgres(nileConfig.databases.messages.url);
export const messagesDb = drizzle(messagesConnection);

// Queue Database (job queues and background tasks)
const queueConnection = postgres(nileConfig.databases.queue.url);
export const queueDb = drizzle(queueConnection);

// Graceful shutdown
export async function closeDatabaseConnections(): Promise<void> {
  await Promise.all([
    oltpConnection.end(),
    olapConnection.end(),
    messagesConnection.end(),
    queueConnection.end(),
  ]);
}