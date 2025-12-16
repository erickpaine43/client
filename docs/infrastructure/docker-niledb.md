# Nile DB — Local Setup with Docker Compose

This guide explains how to run **Nile DB (Postgres + Nile extensions)** locally using **Docker Compose**, based on the [official Nile documentation](https://www.thenile.dev/docs/getting-started/postgres_docker).

---

## 1. Requirements

Before you begin, make sure you have:

- **Docker** installed
- **Docker Compose** available (`docker compose` command)
- Optionally: **psql** (PostgreSQL client) installed locally

---

## 2. Create `docker-compose.yml`

In your project directory (for example, `~/Desktop/Works/client`), create a file named **`docker-compose.yml`** with the following content:

```yaml
services:
  niledb-oltp:
    image: ghcr.io/niledatabase/testingcontainer:latest
    ports:
      - "5443:5432" # Map host port 5443 → container port 5432
      - "3000:3000" # Optional: Nile Auth / API port
    environment:
      NILE_TESTING_DB_NAME: oltp
      NILE_TESTING_DB_ID: 01000000-0000-7000-8000-000000000000
      NILE_TESTING_DB_USER: 00000000-0000-0000-0000-000000000000
      NILE_TESTING_DB_PASSWORD: password
    volumes:
      - nile_oltp_data:/var/lib/postgresql/data # Optional persistent storage

  niledb-olap:
    image: ghcr.io/niledatabase/testingcontainer:latest
    ports:
      - "5444:5432"
      - "3001:3000"
    environment:
      NILE_TESTING_DB_NAME: olap
      NILE_TESTING_DB_ID: 02000000-0000-7000-8000-000000000000
      NILE_TESTING_DB_USER: 00000000-0000-0000-0000-000000000000
      NILE_TESTING_DB_PASSWORD: password
    volumes:
      - nile_olap_data:/var/lib/postgresql/data

  niledb-messages:
    image: ghcr.io/niledatabase/testingcontainer:latest
    ports:
      - "5445:5432"
      - "3002:3000"
    environment:
      NILE_TESTING_DB_NAME: messages
      NILE_TESTING_DB_ID: 03000000-0000-7000-8000-000000000000
      NILE_TESTING_DB_USER: 00000000-0000-0000-0000-000000000000
      NILE_TESTING_DB_PASSWORD: password
    volumes:
      - nile_messages_data:/var/lib/postgresql/data

  niledb-queue:
    image: ghcr.io/niledatabase/testingcontainer:latest
    ports:
      - "5446:5432"
      - "3003:3000"
    environment:
      NILE_TESTING_DB_NAME: queue
      NILE_TESTING_DB_ID: 04000000-0000-7000-8000-000000000000
      NILE_TESTING_DB_USER: 00000000-0000-0000-0000-000000000000
      NILE_TESTING_DB_PASSWORD: password
    volumes:
      - nile_queue_data:/var/lib/postgresql/data

volumes:
  nile_oltp_data:
  nile_olap_data:
  nile_messages_data:
  nile_queue_data:
```

> If you already have a local PostgreSQL instance running on port 5432, we use **port 5443** on the host to avoid conflicts.

---

## 3. Start the container

Run:

```bash
sudo docker compose up -d
```

You should see Docker pulling the image and starting the container.

To confirm it's running:

```bash
sudo docker ps
```

Expected output:

```
CONTAINER ID   IMAGE                                          COMMAND                  STATUS         PORTS
5af61f770f4c   ghcr.io/niledatabase/testingcontainer:latest   "/usr/bin/supervisord"   Up 2 minutes   0.0.0.0:5443->5432/tcp, 0.0.0.0:3000->3000/tcp
```

---

## 4. Check container logs (optional)

If you want to verify the initialization logs:

```bash
sudo docker logs client-niledb-oltp-1
```

Look for:

```
database system is ready to accept connections
```

---

## 5. Connect to Nile DB

### Option A — From your local terminal

Use `psql` if it's installed locally:

```bash
psql -h localhost -p 5443 -U 00000000-0000-0000-0000-000000000000 -d oltp
```

When prompted for a password, enter:

```
password
```

If successful, you'll see:

```
psql (16.x)
Type "help" for help.

oltp=#
```

Now you can test the connection:

```sql
SELECT NOW();
\dt
```

### Option B — From inside the container

If you don't have `psql` installed locally:

1. Enter the container shell:

   ```bash
   sudo docker exec -it client-niledb-oltp-1 bash
   ```

2. Inside the container, connect to the database:
   ```bash
   psql -U 00000000-0000-0000-0000-000000000000 -d oltp
   ```

Password: `password`

---

### Option C — Using a GUI client (optional)

You can connect to Nile DB using graphical tools like:

- **DBeaver**
- **pgAdmin**
- **TablePlus**
- **Beekeeper Studio**

Configuration example:

```
Host: localhost
Port: 5443
User: 00000000-0000-0000-0000-000000000000
Password: password
Database: oltp
```

---

## 6. Stopping and cleaning up

To stop the container:

```bash
sudo docker compose down
```

To remove all data volumes (start fresh):

```bash
sudo docker compose down -v
```

---

## ⚡ Optional — Quick connection command

You can add a shortcut command to a Makefile:

**Makefile**

```makefile
db-connect-oltp:
	psql -h localhost -p 5443 -U 00000000-0000-0000-0000-000000000000 -d oltp

db-connect-olap:
	psql -h localhost -p 5444 -U 00000000-0000-0000-0000-000000000000 -d olap

db-connect-messages:
	psql -h localhost -p 5445 -U 00000000-0000-0000-0000-000000000000 -d messages

db-connect-queue:
	psql -h localhost -p 5446 -U 00000000-0000-0000-0000-000000000000 -d queue
```

Then simply run:

```bash
make db-connect-oltp
```

---

## Summary

| Database | Port | API Port | Name |
| -------- | ---- | -------- | ---- |
| OLTP | 5443 | 3000 | oltp |
| OLAP | 5444 | 3001 | olap |
| Messages | 5445 | 3002 | messages |
| Queue | 5446 | 3003 | queue |
| User | 00000000-0000-0000-0000-000000000000 | | |
| Password | password | | |
| Image | `ghcr.io/niledatabase/testingcontainer:latest` | | |
---
