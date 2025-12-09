import { createSignal, For, Show } from "solid-js";
import Papa from "papaparse";
import { db } from "../db/firebase";
import { doc, writeBatch } from "firebase/firestore";
import "../styles/Import.css";

export default function ImportCSV() {
  const [info, setInfo] = createSignal({
    phase: "idle",
    fileName: "",
    rows: [],
    mergedRows: [],
    progress: 0,
    result: null,
    error: "",
    mergeInfo: null,
  });

  const parseFile = (file) => {
    if (!file) return;

    setInfo({
      phase: "idle",
      fileName: file.name,
      rows: [],
      progress: 0,
      result: null,
      error: ""
    })

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data.length) return setInfo((s) => ({ ...s, error: "Fichier vide ou mal formaté." }))
        const clean = results.data.map((row) => {
          const product = {
            SUPPLIER: (row.SUPPLIER || "").trim(),
            SUPPLIER_CODE: (row.SUPPLIER_CODE || "").trim(),
            BRAND: (row.BRAND || "").trim(),
            PRODUCT: (row.PRODUCT || "").trim(),
            SKU: (row.SKU || "").trim(),
          }
          return { ...product, id: crypto.randomUUID() }
        })

        setInfo((s) => ({ ...s, rows: clean, phase: "ready" }))
      },
      error: (err) => {
        console.error("Erreur de parsing:", err)
        setInfo((s) => ({ ...s, error: "Impossible de lire le CSV." }))
      }
    })
  }

  const handleFile = (e) => parseFile(e.target.files?.[0])
  const handleDrop = (e) => {
    e.preventDefault()
    parseFile(e.dataTransfer?.files?.[0])
  }

  async function uploadInBatches(data) {
    const chunkSize = 500;
    let success = 0, failed = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + chunkSize);

      for (const row of chunk) {
        try {
          const ref = doc(db, "products", row.id);
          batch.set(ref, row, { merge: false });
        } catch (e) {
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

      setInfo((info) => ({
        ...info,
        progress: Math.round(((i + chunk.length) / data.length) * 100)
      }));
    }

    return { success, failed };
  }

  const handleUpload = async () => {
    const rows = state().rows;
    if (!rows.length) return alert("Aucune donnée à envoyer.");
    setInfo((s) => ({ ...s, phase: "uploading", progress: 0 }));

    const result = await uploadInBatches(rows);
    setInfo((s) => ({ ...s, phase: "done", result, progress: 100 }));
  };

  const handleCancel = () => {
    setInfo({
      phase: "idle",
      fileName: "",
      rows: [],
      progress: 0,
      result: null,
      error: "",
    });
  };

  return (
    <div>
      <h1>Importer des produits</h1>

      <Show when={info().phase === "idle"}>
        <label
          id="import-input"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p>
            Ajouter un fichier au format <b>.CSV</b> en cliquant ici ou en
            glissant le fichier dans la zone
          </p>
          <input
            className="invisible"
            type="file"
            accept=".csv"
            onChange={handleFile}
          />
        </label>
      </Show>

      <Show when={info().phase === 'ready'}>
        <section className="import-preview">
          <h2>Aperçu de {info().fileName}</h2>
          <div class="table-container card">
            <header>
              <For each={Object.keys((info().rows[0]) || {})}>
                {(key) => <h3>{key}</h3>}
              </For>
            </header>
            <ul>
              <For each={info().rows.slice(0, 10)}>
                {(row) => (
                  <li>
                    <ul className="row">
                      <For each={Object.values(row)}>
                        {(value) => <li>{String(value)}</li>}
                      </For>
                    </ul>
                  </li>
                )}
              </For>
            </ul>
          </div>

          <p>{info().rows.length} produits prêts à être envoyés.</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button class="btn" onClick={handleUpload}>
              Sauvegarder
            </button>
            <button class="btn btn--ghost" onClick={handleReset}>
              Annuler
            </button>
          </div>
        </section>
      </Show >

      < Show when={info().phase === "uploading"} >
        <p>Import en cours... {info().progress}%</p>
        <progress value={info().progress} max="100" />
      </Show >

      < Show when={info().phase === "done"} >
        <p>
          Terminé : {info().result?.success || 0} succès,{" "}
          {info().result?.failed || 0} erreurs.
        </p>
      </Show >

      < Show when={info().error} >
        <p>{info().error}</p>
      </Show >
    </div >
  );
}