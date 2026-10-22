
import React, { useEffect, useState } from "react";

import {
    Box,
    Button,
    Typography,
    IconButton,
    CircularProgress
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function ImagesRenderer({
    widget,
    context = {},
    handlers = {}
}) {
    const props = widget?.props || {};
    const field = props.field || "images";
    const formData = context?.formData || {};
    const inventoryId = formData.id;

    const maxImages = Math.max(
        1,
        Math.min(10, Number(props.maxImages) || 10)
    );

    const existingImages = Array.isArray(formData[field])
        ? formData[field]
        : [];

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [pendingRemoval, setPendingRemoval] = useState([]);

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        return () => {
            previews.forEach(item => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [previews]);

    const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:8000";

    const updateImages = (images) => {
        handlers?.updateField?.(field, images);
    };

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files || []);

        // Allow selecting the same file again later.
        event.target.value = "";

        if (files.length === 0) return;

        const availableSlots =
            maxImages - existingImages.length - previews.length;

        if (availableSlots <= 0) {
            setMessage(`You can add at most ${maxImages} images.`);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        const acceptedFiles = [];
        let rejectedCount = 0;

        for (const file of files) {
            if (
                !allowedTypes.includes(file.type) ||
                file.size === 0 ||
                file.size > 5 * 1024 * 1024
            ) {
                rejectedCount++;
                continue;
            }

            if (
                acceptedFiles.length < availableSlots
            ) {
                acceptedFiles.push(file);
            } else {
                rejectedCount++;
            }
        }

        if (rejectedCount > 0) {
            setMessage(
                `${rejectedCount} file(s) skipped. Check the image type, 5 MB limit, and maximum image count.`
            );
        } else {
            setMessage("");
        }

        if (acceptedFiles.length === 0) return;

        const previewItems = acceptedFiles.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setPreviews(previous => [
            ...previous,
            ...previewItems
        ]);

        setUploading(true);

        try {
            const body = new FormData();

            acceptedFiles.forEach(file => {
                body.append("files", file);
            });

            const response = await fetch(
                `${apiUrl}/api/inventory/images/upload`,
                {
                    method: "POST",
                    body
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Image upload failed."
                );
            }

            const uploadedUrls = result.images || [];

            // Append URLs to the current form value.
            const currentImages = Array.isArray(
                context?.formData?.[field]
            )
                ? context.formData[field]
                : [];

            updateImages([
                ...currentImages,
                ...uploadedUrls
            ]);

            setPreviews(previous =>
                previous.filter(
                    item => !acceptedFiles.includes(item.file)
                )
            );

            setMessage(
                `${uploadedUrls.length} image(s) uploaded successfully.`
            );
        } catch (error) {
            setPreviews(previous =>
                previous.filter(
                    item => !acceptedFiles.includes(item.file)
                )
            );

            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (url) => {
        if (!window.confirm("Remove this image?")) {
            return;
        }

        // Images already saved against an inventory record
        // can be removed through the existing DELETE endpoint.
        if (inventoryId) {
            try {
                const response = await fetch(
                    `${apiUrl}/api/inventory/${inventoryId}/images?url=${encodeURIComponent(url)}`,
                    { method: "DELETE" }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.detail || "Could not remove image."
                    );
                }

                updateImages(result.images || []);
                setMessage("Image removed successfully.");
            } catch (error) {
                setMessage(error.message);
            }

            return;
        }

        // For a new, unsaved record, remove the URL from form state.
        // The Cloudinary file itself can be cleaned up separately.
        updateImages(
            existingImages.filter(image => image !== url)
        );

        setMessage("Image removed from the form.");
    };

    return (
        <Box sx={{ width: "100%", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {props.label || widget.title || "Multiple Images"}
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 2
                }}
            >
                {existingImages.map((url, index) => (
                    <Box
                        key={`${url}-${index}`}
                        sx={{
                            position: "relative",
                            width: 110
                        }}
                    >
                        <Box
                            component="a"
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Box
                                component="img"
                                src={url}
                                alt={`Image ${index + 1}`}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                    borderRadius: 1
                                }}
                            />
                        </Box>

                        <IconButton
                            size="small"
                            color="error"
                            title="Remove image"
                            onClick={() => handleRemoveImage(url)}
                            sx={{
                                position: "absolute",
                                top: -8,
                                right: 0,
                                bgcolor: "background.paper",
                                boxShadow: 1
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}

                {previews.map((item, index) => (
                    <Box
                        key={`${item.file.name}-${index}`}
                        sx={{
                            position: "relative",
                            width: 110
                        }}
                    >
                        <Box
                            component="img"
                            src={item.previewUrl}
                            alt={item.file.name}
                            sx={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 1,
                                opacity: 0.7
                            }}
                        />

                        <Typography
                            variant="caption"
                            display="block"
                            sx={{ maxWidth: 100, overflowWrap: "anywhere" }}
                        >
                            {item.file.name}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Button
                variant="outlined"
                component="label"
                disabled={
                    uploading ||
                    existingImages.length + previews.length >= maxImages
                }
            >
                Choose Images

                <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                />
            </Button>

            {uploading && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 2
                    }}
                >
                    <CircularProgress size={18} />
                    <Typography variant="body2">
                        Uploading images to Cloudinary...
                    </Typography>
                </Box>
            )}

            {message && (
                <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                    color={
                        message.toLowerCase().includes("successfully")
                            ? "success.main"
                            : "text.secondary"
                    }
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
}
