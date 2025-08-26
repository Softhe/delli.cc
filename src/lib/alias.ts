const KEY = "existing_crosshair_names_v1";

function load(): string[] {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return [];
    return JSON.parse(s);
  } catch {
    return [];
  }
}
function save(names: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(names));
  } catch {}
}

function randomSuffix(len = 5) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function ensureUniqueName(base: string) {
  const names = new Set(load());
  let candidate = base + randomSuffix(5);
  let tries = 0;
  while (names.has(candidate) && tries < 1000) {
    candidate = base + randomSuffix(5);
    tries++;
  }
  names.add(candidate);
  save(Array.from(names));
  return candidate;
}

/**
 * Format:
 * alias "crosshair_58h2b" "exec crosshair_58h2b.cfg"
 */
export function makeAlias(name: string, cfgFile: string) {
  return `alias "${name}" "exec ${cfgFile}"`;
}
