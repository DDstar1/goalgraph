"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function UploadExePage() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [executables, setExecutables] = useState([]);

  useEffect(() => {
    fetchLatestExecutable();
  }, []);

  async function fetchLatestExecutable() {
    const { data, error } = await supabase
      .from("z_site_executables_meta")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .limit(1);

    if (!error) setExecutables(data);
  }

  const handleUpload = async () => {
    if (!file) return setMessage("❌ Please select a file.");
    if (!description.trim()) return setMessage("❌ Description is required.");

    setUploading(true);
    setMessage("🔄 Uploading...");
    setProgress(0);

    try {
      // 🔐 Get signed upload URL from API route
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `${file.name}`,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const { url, error } = await res.json();
      if (!res.ok || !url) throw new Error(error || "Failed to get signed URL");

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 204) {
          setMessage("✅ Upload complete. Saving description...");

          // Generate a signed download URL (valid for e.g. 1 day = 86400 seconds)
          const { data: downloadData, error: downloadError } =
            await supabase.storage
              .from("executables")
              .createSignedUrl(`${file.name}`, 86400);

          if (downloadError)
            throw new Error("Failed to get file URL: " + downloadError.message);

          const downloadUrl = downloadData.signedUrl;

          await supabase
            .from("z_site_executables_meta")
            .delete()
            .neq("name", "");

          const { error: insertError } = await supabase
            .from("z_site_executables_meta")
            .insert({
              name: file.name,
              description,
              uploaded_at: new Date().toISOString(),
              url: downloadUrl,
            });

          if (insertError) throw new Error(insertError.message);

          setMessage("✅ File and description saved!");
          setFile(null);
          setDescription("");
          setProgress(0);
          fetchLatestExecutable();
        } else {
          setMessage("❌ Upload failed.");
        }

        setUploading(false);
      };

      xhr.onerror = () => {
        setMessage("❌ Network error.");
        setUploading(false);
      };

      xhr.open("PUT", url);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      xhr.send(file);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Upload Worker `.exe` File
        </h1>

        <input
          type="file"
          accept=".exe"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full mb-4 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <textarea
          placeholder="Enter description (required)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-24 p-2 mb-4 border rounded-md text-sm"
          required
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading || !description.trim()}
          className={`w-full py-2 px-4 rounded text-white font-semibold transition ${
            uploading || !file || !description.trim()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-4 mt-6 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {message && (
          <p className="mt-6 text-sm font-medium text-gray-800">{message}</p>
        )}
      </div>

      <div className="mt-12 w-full max-w-lg bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Latest Uploaded Executable
        </h2>
        {executables.length > 0 ? (
          <div className="text-left text-sm space-y-2 text-gray-700">
            <p>
              <strong>Name:</strong>{" "}
              <a
                href={executables[0].url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {executables[0].name}
              </a>
            </p>
            <p>
              <strong>Description:</strong> {executables[0].description}
            </p>
            <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(executables[0].uploaded_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
