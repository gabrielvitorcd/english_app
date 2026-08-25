// Passo 2d — teste de fumaca do build ffmpeg.wasm, rodando em Node.
//
// Valida o contrato do Passo 1 contra um arquivo real: demux, decode de video/
// audio, encode H.264+AAC, mux MP4 e extracao de legenda para .srt.
//
// Uso:  node scripts/smoke-test.mjs <arquivo-de-video>
// Ex.:  node scripts/smoke-test.mjs frontend/public/videos/friends/friends1x01.mkv
//
// Observacao: em Node usamos NODEFS para dar ao filesystem virtual acesso ao
// disco. No browser o equivalente e WORKERFS (monta um File sem copiar tudo
// para a memoria) — ambos foram incluidos no link.
import { mkdtempSync, mkdirSync, copyFileSync, statSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("uso: node scripts/smoke-test.mjs <arquivo-de-video>");
  process.exit(2);
}

const ROOT = resolve(import.meta.dirname, "..");
const { default: createFFmpeg } = await import(
  join(ROOT, "frontend/src/vendor/ffmpeg/ffmpeg.js")
);

// O MEMFS nao ve o disco real: monta um diretorio de trabalho via NODEFS.
const work = mkdtempSync(join(tmpdir(), "ffwasm-"));
const inName = basename(input);
copyFileSync(resolve(input), join(work, inName));

// x264 com threads > 1 crasha no wasm ("null function or function signature
// mismatch"). Forcar single-thread e obrigatorio. Ver docs/transcoding/02-build.md.
const SINGLE_THREAD = ["-threads", "1", "-x264-params", "threads=1:sliced-threads=0"];

async function run(label, args) {
  const out = [];
  const Module = await createFFmpeg({
    print: (t) => out.push(t),
    printErr: (t) => out.push(t),
    noExitRuntime: true,
  });
  Module.FS.mkdir("/work");
  Module.FS.mount(Module.FS.filesystems.NODEFS, { root: work }, "/work");

  let code = 0;
  try {
    code = Module.callMain(args) ?? 0;
  } catch (e) {
    console.log(`  ✗ ${label}: ${e.message ?? e}`);
    return { ok: false, log: out };
  }
  const failed = code !== 0;
  console.log(`  ${failed ? "✗" : "✓"} ${label}`);
  return { ok: !failed, log: out };
}

console.log(`\nArquivo: ${input}\nTrabalho: ${work}\n`);

// 1. Demux + identificacao de streams (só copia, sem re-encode)
const probe = await run("demux + copy para MP4", [
  "-hide_banner", "-i", `/work/${inName}`, "-t", "5", "-c", "copy",
  "-y", "/work/copy.mp4",
]);
for (const l of probe.log) {
  if (/^\s*(Input #|Stream #|  Duration)/.test(l)) console.log(`      ${l.trim()}`);
}

// 2. Transcodificacao completa: o caminho que o app vai usar de verdade.
//    +faststart move o moov atom para o inicio — necessario para o <video>
//    comecar a tocar sem baixar o arquivo inteiro.
const trans = await run("transcode H.264 + AAC (faststart)", [
  "-hide_banner", "-i", `/work/${inName}`, "-t", "5",
  "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
  ...SINGLE_THREAD,
  "-c:a", "aac", "-b:a", "128k",
  "-movflags", "+faststart",
  "-y", "/work/out.mp4",
]);

// 3. Legenda: embutida no container -> .srt puro, formato que o useSrt le.
const sub = await run("extrai legenda embutida -> .srt", [
  "-hide_banner", "-i", `/work/${inName}`, "-map", "0:s:0", "-c:s", "srt",
  "-y", "/work/legenda.srt",
]);

// --- resultados ---
console.log("\nArtefatos:");
let allOk = probe.ok && trans.ok;
for (const f of ["copy.mp4", "out.mp4", "legenda.srt"]) {
  try {
    const size = statSync(join(work, f)).size;
    // um MP4 de ~48 bytes e so o header: encode falhou silenciosamente
    const suspect = f.endsWith(".mp4") && size < 1024;
    if (suspect) allOk = false;
    console.log(`  ${suspect ? "✗" : "✓"} ${f.padEnd(14)} ${(size / 1024).toFixed(0)} KB`);
  } catch {
    if (f !== "legenda.srt") allOk = false;   // legenda pode nao existir no arquivo
    console.log(`  – ${f.padEnd(14)} nao gerado`);
  }
}

// Confirma que o faststart funcionou: moov deve aparecer antes do mdat.
try {
  const head = readFileSync(join(work, "out.mp4")).subarray(0, 4096).toString("latin1");
  const moov = head.indexOf("moov"), mdat = head.indexOf("mdat");
  const ok = moov !== -1 && (mdat === -1 || moov < mdat);
  if (!ok) allOk = false;
  console.log(`  ${ok ? "✓" : "✗"} faststart      moov ${ok ? "no inicio" : "NAO esta no inicio"}`);
} catch { /* out.mp4 nao existe; ja reportado acima */ }

// Primeiros cues, para inspecao visual do formato.
try {
  const srt = readFileSync(join(work, "legenda.srt"), "utf8").trim();
  if (srt) console.log("\nPrimeiros cues:\n" + srt.split("\n").slice(0, 4).map(l => "  " + l).join("\n"));
} catch { /* sem legenda embutida */ }

rmSync(work, { recursive: true, force: true });
console.log(`\n${allOk ? "OK — pipeline validado." : "FALHOU — ver acima."}`);
process.exit(allOk ? 0 : 1);
