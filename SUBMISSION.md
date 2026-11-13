# Reach — Case Study 10

**Student:** Beren Dogar
**Repository:** https://github.com/Berendogar/Reach

```text
Browser form POST /
        |
        v
Express server.js
        |
        +-- ping -c 1 -W 2 <host>     a child process, not the page
        +-- recent rows in server.js  two examples, not live checks
        +-- desk.txt                  not linked
```

The form takes one string. Node is the process that starts `ping`. If ping exits 0 the card says up and shows the ping text. If the name does not resolve, the card says down and shows the error, `Name or service not known`.

The recent table is just those two rows. The page does not link `desk.txt`. That file is a desk note sitting in the repo.

## Bug

The host is pasted into a shell command. This came back up, and the reply included the desk note after the ping lines:

```text
127.0.0.1; cat desk.txt
```

The semicolon ran a second command.

## Patch

The host has to be a hostname or an IPv4 address. `ping` is started with an argument list, not a shell string, so `;` is not a command. `127.0.0.1` still comes back up. A name that does not resolve still comes back down.

`node --test`: 5 passed.
