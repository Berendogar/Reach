# Reach

Case Study 10, Beren Dogar. The architecture, the bug, and the patch are in
[SUBMISSION.md](SUBMISSION.md).

Is a club host up? Type a hostname or an IP. Reach pings it once and keeps the reply.

Express and a static page. No database.

## Features

- Check one host
- Recent example checks
- Health check at `/health`

## Run locally

Node 18+. `ping` must be on the PATH (`iputils-ping` on Debian and Ubuntu).

```bash
npm install
npm start
```

Open http://localhost:3000.

## Run with Docker

```bash
docker compose up --build
```

The image installs `ping`. The app listens on port 3000.

## Project layout

```
server.js         Routes and the check
public/           Styles
desk.txt          A desk note the page does not show
```

## Assignment notes

Host this somewhere your classmates and instructor can reach. Walk the running app until you can explain:

- what process sends the check
- what the form accepts
- what a reply looks like when the host answers and when it does not
- what else is in the repo that the page does not link

Then look for a security defect in the running system, document how to trigger it, and patch it without breaking a normal host check. Submit the hosted URL, a short architecture sketch, the writeup, and the patched repo.
