# Base de datos del piloto

[⬅ Volver al README](../README.md)

Este proyecto usa **exclusivamente el puerto 5544** para su base de datos
PostgreSQL, a través del contenedor `piloto-pbd-db` definido en
[`docker-compose.yml`](../docker-compose.yml) (raíz del repositorio).

```bash
docker compose up -d piloto-pbd-db
```

`DATABASE_URL` en `backend/.env` debe apuntar siempre a `localhost:5544`.

## Por qué esto importa

Esta máquina también tiene otros contenedores Postgres de proyectos ajenos
(por ejemplo, `postgres-dev` en el puerto 5433). Si `DATABASE_URL` llega a
apuntar a un puerto distinto de 5544, las migraciones y el seed de Prisma
pueden terminar aplicándose sobre la base de datos equivocada. Esto ya
ocurrió una vez durante el desarrollo: se corrigió, pero quedó como
recordatorio de usar siempre el puerto canónico 5544 para este piloto.

Antes de correr `prisma migrate` o `prisma db seed`, verifica:

```bash
docker ps --filter "name=piloto-pbd-db"
```

y confirma que el mapeo de puertos mostrado sea `0.0.0.0:5544->5432/tcp`.

## Documentación relacionada

- [⬅ README principal](../README.md) — puesta en marcha del piloto.
- [docs/registro-evidencias-OE4.md](registro-evidencias-OE4.md) — control DES-01 (cifrado en tránsito API↔PostgreSQL vía SSL).
