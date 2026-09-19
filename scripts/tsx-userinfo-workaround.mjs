import os from "node:os";

// Some sandboxed Windows runtimes throw from os.userInfo(), which tsx uses only
// to name its temporary directory. Preserve the native value everywhere else.
try {
  os.userInfo();
} catch {
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || "codex",
    homedir: os.homedir(),
    shell: null,
  });
}
