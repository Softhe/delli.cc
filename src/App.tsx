import React, { useEffect, useMemo, useState } from "react";
import { decodeCrosshair } from "./lib/decodeCrosshair";
import { CrosshairPreview } from "./components/CrosshairPreview";
import { makeCfgFromDecoded } from "./lib/generateCfg";
import { makeAlias, ensureUniqueName } from "./lib/alias";

type Decoded = ReturnType<typeof decodeCrosshair> extends Promise<infer T>
  ? T
  : any;

export default function App() {
  const [shareCode, setShareCode] = useState("");
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("crosshair_58h2b");
  const [aliasName, setAliasName] = useState<string>("crosshair_58h2b");
  const [cfgContent, setCfgContent] = useState<string>("");

  // Debounced decode when shareCode changes
  useEffect(() => {
    const t = setTimeout(async () => {
      setError(null);
      setDecoded(null);
      if (!shareCode.trim()) return;
      try {
        const d = await decodeCrosshair(shareCode.trim());
        setDecoded(d);
      } catch (e: any) {
        setError("Invalid share code or unsupported format.");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [shareCode]);

  // Generate a unique filename/alias when decoded changes first time
  useEffect(() => {
    if (!decoded) return;
    const base = "crosshair_";
    const unique = ensureUniqueName(base);
    setFilename(unique);
    setAliasName(unique);
  }, [decoded]);

  // Build CFG content from decoded
  useEffect(() => {
    if (!decoded) {
      setCfgContent("");
      return;
    }
    setCfgContent(makeCfgFromDecoded(decoded));
  }, [decoded]);

  const aliasLine = useMemo(() => {
    return makeAlias(aliasName, `${filename}.cfg`);
  }, [aliasName, filename]);

  const download = () => {
    if (!cfgContent || !filename) return;
    const blob = new Blob([cfgContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.cfg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wrap">
      <header className="header">
        <h1>Crosshair Code → CFG</h1>
        <p className="sub">Convert, preview, and export clean configs.</p>
      </header>

      <section className="panel">
        <label htmlFor="sharecode" className="label">
          Crosshair share code
        </label>
        <input
          id="sharecode"
          className="input"
          placeholder="e.g. CSGO-xxxx-xxxx-xxxx-xxxx-xxxx"
          value={shareCode}
          onChange={(e) => setShareCode(e.target.value)}
          spellCheck={false}
        />
        {error && <div className="error">{error}</div>}
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-title">Preview</div>
          <div className="preview-box">
            <CrosshairPreview decoded={decoded} />
          </div>
          <div className="hint">
            Live preview updates as you paste a valid share code.
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Output</div>

          <div className="row">
            <label className="label">Filename</label>
            <input
              className="input"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="row">
            <label className="label">Alias</label>
            <input
              className="input"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="alias">
            Alias line (paste into autoexec.cfg):
            <pre className="code">{aliasLine}</pre>
          </div>

          <div className="cfg">
            Config preview:
            <pre className="code">{cfgContent || "// Waiting for a code..."}</pre>
          </div>

          <div className="actions">
            <button
              className="btn"
              onClick={download}
              disabled={!cfgContent || !filename}
            >
              Download {filename}.cfg
            </button>
          </div>

          <div className="hint">
            After downloading, place the file in cfg/ and use the alias in your
            autoexec:
            <pre className="code small">{aliasLine}</pre>
            Then in-game console: type {aliasName}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>Dark, minimal UI. No tracking. Works offline after first load.</span>
      </footer>
    </div>
  );
}
