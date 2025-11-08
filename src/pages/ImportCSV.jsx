import { createSignal, For, Show } from "solid-js";
import Papa from "papaparse";
import { db } from "../db/firebase";
import { doc, writeBatch } from "firebase/firestore";
import "../styles/Import.css";

export default function ImportCSV() {
  const [fileName, setFileName] = createSignal("");
  const [rows, setRows] = createSignal([]);
  const [mergedRows, setMergedRows] = createSignal([]);
  const [progress, setProgress] = createSignal(0);
  const [uploading, setUploading] = createSignal(false);
  const [result, setResult] = createSignal(null);
  const [error, setError] = createSignal("");
  const [mergeInfo, setMergeInfo] = createSignal(null);

  // 🔹 Crée un ID propre et stable à partir du nom du produit
  function makeIdFromName(name) {
    return name
      .toLowerCase()
      .normalize("NFD") // retire les accents
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // 🔹 Nettoyage automatique d'une ligne (retire espaces, accents, lowercase si besoin)
  function normalizeRow(row) {
    const clean = {};

    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string") {
        clean[key.trim()] = value;
        continue;
      }

      let v = value.trim();
      v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // normalisation pour les codes identifiants
      if (["psu", "article_no", "barcode", "sku"].includes(key.toLowerCase())) {
        v = v.replace(/\s+/g, "").toLowerCase();
      }

      clean[key.trim()] = v;
    }

    return clean;
  }

  // 🔹 Fusionne les lignes ayant le même PRODUCT
  function mergeProducts(rows) {
    const map = new Map();

    for (const row of rows) {
      const name = (row.PRODUCT || "").trim();
      if (!name) continue;
      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, { ...row });
      } else {
        const existing = map.get(key);
        for (const k of Object.keys(row)) {
          if (!existing[k] && row[k]) existing[k] = row[k];
        }
      }
    }

    return Array.from(map.values());
  }

  // 🔹 Lecture du fichier CSV
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);
    setRows([]);
    setMergedRows([]);
    setMergeInfo(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) {
          setError("Le fichier CSV est vide ou mal formaté.");
          return;
        }

        // normalisation
        const normalized = results.data.map(normalizeRow);
        setRows(normalized);

        // fusion par PRODUCT
        const merged = mergeProducts(normalized);
        setMergedRows(
          merged.map((r) => ({
            ...r,
            id: crypto.randomUUID(),
          }))
        );

        const diff = normalized.length - merged.length;
        setMergeInfo({
          total: normalized.length,
          merged: merged.length,
          diff,
        });
      },
      error: (err) => {
        console.error("Erreur de parsing:", err);
        setError("Impossible de lire le fichier CSV.");
      },
    });
  };

  // 🔹 Upload en batch vers Firestore
  async function uploadInBatches(data) {
    const chunkSize = 500;
    let success = 0;
    let failed = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + chunkSize);

      for (const row of chunk) {
        try {
          const id = row.id || crypto.randomUUID();
          const ref = doc(db, "produits", id);
          batch.set(ref, row, { merge: true });
        } catch (e) {
          console.error("Erreur de format:", e);
          failed++;
        }
      }

      try {
        await batch.commit();
        success += chunk.length;
      } catch (e) {
        console.error("Erreur batch:", e);
        failed += chunk.length;
      }

      const ratio = ((i + chunk.length) / data.length) * 100;
      setProgress(ratio.toFixed(1));
    }

    return { success, failed };
  }

  // 🔹 Lancement upload complet
  const handleUpload = async () => {
    const data = mergedRows();
    if (!data.length) return alert("Aucune donnée à envoyer.");
    setUploading(true);
    setProgress(0);

    const result = await uploadInBatches(data);

    setResult(result);
    setUploading(false);
    setProgress(100);
  };

  // 🔹 Interface
  return (
    <div>
      <h2>Importer un fichier CSV</h2>

      <input type="file" accept=".csv" onChange={handleFile} />

      <Show when={fileName()}>
        <p>Fichier sélectionné : {fileName()}</p>
      </Show>

      <Show when={error()}>
        <p style="color:red;">{error()}</p>
      </Show>

      <Show when={mergeInfo()}>
        <p>
          <b>{mergeInfo().total}</b> lignes initiales,{" "}
          <b>{mergeInfo().merged}</b> produits uniques.{" "}
          <Show when={mergeInfo().diff > 0}>
            ({mergeInfo().diff} doublons fusionnés)
          </Show>
        </p>
      </Show>

      <Show when={mergedRows().length && !uploading()}>
        <p>{mergedRows().length} produits prêts à être importés.</p>
        <button onClick={handleUpload}>Envoyer vers Firebase</button>
      </Show>

      <Show when={uploading()}>
        <div>
          <p>Import en cours... {progress()}%</p>
          <progress
            value={progress()}
            max="100"
            style="width:100%;"
          ></progress>
        </div>
      </Show>

      <Show when={result()}>
        <p>
          ✅ {result().success} succès — ⚠️ {result().failed} erreurs
        </p>
      </Show>

      <Show when={mergedRows().length && !uploading()}>
        <h3>Aperçu des premières lignes fusionnées :</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <For each={Object.keys(mergedRows()[0] || {})}>
                  {(key) => <th>{key}</th>}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={mergedRows().slice(0, 10)}>
                {(row) => (
                  <tr>
                    <For each={Object.values(row)}>
                      {(value) => <td>{value}</td>}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
}
