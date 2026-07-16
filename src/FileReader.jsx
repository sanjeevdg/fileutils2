import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export default function FileReader() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const formData = new FormData();
        formData.append("file", acceptedFiles[0]);

        try {
            setLoading(true);
//http://localhost:8000/api/
            const res = await axios.post(
                "https://mypybackend.onrender.com/api/read-file",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setResponse(res.data);
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    return (
        <div style={{ padding: 40 }}>

            <div
                {...getRootProps()}
                style={{
                    border: "2px dashed gray",
                    borderRadius: 8,
                    padding: 60,
                    textAlign: "center",
                    cursor: "pointer",
                }}
            >
                <input {...getInputProps()} />

                {isDragActive
                    ? "Drop the file here..."
                    : "Drag a file here or click to select"}
            </div>

            {loading && (
                <p>Uploading...</p>
            )}

            {response && (
                <div style={{ marginTop: 30 }}>

                    <h3>{response.filename}</h3>

                    <p>
                        <b>Type:</b> {response.type}
                    </p>

                    <textarea
                        value={response.text}
                        readOnly
                        rows={20}
                        style={{
                            width: "100%",
                            fontFamily: "monospace",
                        }}
                    />
                </div>
            )}

        </div>
    );
}