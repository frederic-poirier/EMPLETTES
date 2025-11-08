import Papa from "papaparse"

function handleFileUpload(event) {
  const file = event.target.files[0];
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(results.data)
      await importToFirestore(results.data)
    }
  })
}