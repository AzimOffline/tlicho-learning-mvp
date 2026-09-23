import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const run = (command, args, options = {}) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
      ...options,
    });
    child.on("error", rejectRun);
    child.on("exit", (code) =>
      code === 0
        ? resolveRun()
        : rejectRun(new Error(`${command} exited with code ${code ?? 1}`))
    );
  });

const findBundledJdk = async () => {
  const root = resolve(projectRoot, ".mobile-tools", "jdk21");
  try {
    for (const entry of await readdir(root)) {
      const candidate = join(root, entry);
      if ((await stat(candidate)).isDirectory()) return candidate;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

const javaHome = (await findBundledJdk()) ?? process.env.JAVA_HOME;
if (!javaHome) {
  throw new Error(
    "Java 21 is required. Set JAVA_HOME or place a portable JDK under .mobile-tools/jdk21/."
  );
}

await run(process.execPath, [
  resolve(projectRoot, "scripts", "build-mobile-web.mjs"),
]);
await run(process.execPath, [
  "--import",
  pathToFileURL(resolve(projectRoot, "scripts", "tsx-userinfo-workaround.mjs"))
    .href,
  resolve(projectRoot, "node_modules", "@capacitor", "cli", "bin", "capacitor"),
  "sync",
  "android",
]);

const androidRoot = resolve(projectRoot, "android");
const isWindows = process.platform === "win32";
const gradleCommand = isWindows
  ? (process.env.ComSpec ?? "cmd.exe")
  : resolve(androidRoot, "gradlew");
const gradleArgs = isWindows
  ? ["/d", "/s", "/c", "gradlew.bat assembleDebug"]
  : ["assembleDebug"];
await run(gradleCommand, gradleArgs, {
  cwd: androidRoot,
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    GRADLE_USER_HOME: resolve(
      process.env.USERPROFILE ?? projectRoot,
      ".gradle"
    ),
    ANDROID_HOME:
      process.env.ANDROID_HOME ??
      resolve(process.env.LOCALAPPDATA ?? "", "Android", "Sdk"),
  },
});

const outputDirectory = resolve(projectRoot, "dist");
const outputApk = resolve(outputDirectory, "Tlicho-Learning-debug.apk");
await mkdir(outputDirectory, { recursive: true });
await cp(
  resolve(
    androidRoot,
    "app",
    "build",
    "outputs",
    "apk",
    "debug",
    "app-debug.apk"
  ),
  outputApk,
  { force: true }
);

console.log(`APK ready: ${outputApk}`);
