const handleAnalyzeFile = async () => {
  if (!selectedFile) {
    setError("Please select a file first.");
    return;
  }

  setUploading(true);
  setError("");

  try {
    // Create FormData
    const formData = new FormData();

    // IMPORTANT:
    // This name "file" must match:
    // FastAPI -> file: UploadFile = File(...)
    formData.append("file", selectedFile);

    console.log("Uploading:", selectedFile.name);
    console.log("File type:", selectedFile.type);
    console.log("File size:", selectedFile.size);

    // Send file to FastAPI
    const response = await fetch(
      `${BACKEND_URL}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // Read backend response
    const data = await response.json();

    console.log("Backend response:", data);

    // Check backend error
    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        "File analysis failed."
      );
    }

    // =================================================
    // CSV RESPONSE
    // =================================================

    if (data.file_type === "csv") {
      console.log("CSV processed successfully");

      if (data.audit) {
        setAudit(data.audit);
      }

      setError("");

      // Optional success message
      alert(
        `CSV analyzed successfully!\nRows: ${
          data.rows || 0
        }`
      );
    }

    // =================================================
    // IMAGE RESPONSE
    // =================================================

    else if (data.file_type === "image") {
      console.log("Image uploaded successfully");

      setError("");

      alert(
        "Image uploaded successfully.\n" +
        "OCR processing can be connected next."
      );
    }

    // =================================================
    // AUDIO RESPONSE
    // =================================================

    else if (data.file_type === "audio") {
      console.log("Audio uploaded successfully");

      setError("");

      alert(
        "Audio uploaded successfully.\n" +
        "Speech-to-text processing can be connected next."
      );
    }

    // =================================================
    // UNKNOWN RESPONSE
    // =================================================

    else {
      console.log("Server response:", data);

      setError(
        data.message ||
        "File uploaded successfully."
      );
    }

  } catch (error) {

    console.error(
      "UPLOAD ERROR:",
      error
    );

    // Backend not running
    if (
      error instanceof TypeError &&
      error.message.includes("fetch")
    ) {
      setError(
        "Cannot connect to WealthBridge backend. " +
        "Please start FastAPI on port 8000."
      );
    } else {
      setError(
        error.message ||
        "Unable to upload the file."
      );
    }

  } finally {

    setUploading(false);

  }
};