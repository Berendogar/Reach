# Reach — Case Study 10

**Student:** Beren Dogar
**Repository:** https://github.com/Berendogar/Reach
**Hosted URL:** https://reach-beren-dogar.onrender.com

## Architecture

```text
Browser --POST /--> server.js (Express) --> ping -c 1 -W 2 <host> --> card

Before: exec("ping -c 1 -W 2 " + host)                a shell runs the whole string
After:  execFile("ping", ["-c", "1", "-W", "2", host])  no shell
```

Node starts `ping` as a child process. The page only shows what `ping` printed. The form has one field, `host`.

- Host answers: **up**, with `1 packets transmitted, 1 received`.
- Host does not answer (for example `10.255.255.1`): **down**, with `0 received, 100% packet loss`.
- Name does not resolve: **down**, with `Name or service not known`.

The recent checks are two fixed rows in `server.js`, not live checks. The repo also has `desk.txt`, a desk note with a release code. The page does not link it, and Express only serves `public/`.

## Bug

OS command injection. The host was pasted into a shell command, so shell characters ran extra commands. To trigger it, check one of these hosts:

| Host | Card showed |
| --- | --- |
| `127.0.0.1; cat desk.txt` | up, then the desk note with `REACH-7741` |
| `127.0.0.1; uname -s` | up, then `Linux` |

Impact: critical. Anyone, without logging in, can run any command on the server.

The hosted app is patched. To reproduce, run the starter commit locally: `git checkout 0d114f4`, `npm install`, `npm start`.

## Patch

`ping` is started with an argument list, not a shell string, so `;` is just text. The host must also be a hostname or an IP address (`net.isIP`), so it cannot start with `-` and turn into a ping option. `127.0.0.1`, `::1`, and normal names still work.

On Render, `ping` first could not start because of its file capabilities. The Dockerfile removes them, so `ping` uses an unprivileged ICMP socket and checks work on the hosted app.

`node --test`: 6 passed.
