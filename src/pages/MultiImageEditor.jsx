
import React, { useEffect, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    CircularProgress,
    Alert
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { getAuthHeaders } from "../utils/auth";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


export default function MultiImageEditor({
    open,
    onClose,
    entity,
    recordId,
    field = "images",
    images = [],
    maxImages = 10,
    onImagesChange
}) {

    const [files, setFiles] = useState([]);

    const [previews, setPreviews] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [removing, setRemoving] = useState("");

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    // --------------------------------------------------
    // CREATE FILE PREVIEWS
    // --------------------------------------------------

    useEffect(() => {

        const urls = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setPreviews(urls);

        return () => {
            urls.forEach(item => {
                URL.revokeObjectURL(item.url);
            });
        };

    }, [files]);


    // --------------------------------------------------
    // RESET WHEN DIALOG OPENS
    // --------------------------------------------------

    useEffect(() => {

        if (open) {
            setFiles([]);
            setMessage("");
            setError("");
        }

    }, [open]);


    // --------------------------------------------------
    // SELECT FILES
    // --------------------------------------------------

    const handleFileChange = (event) => {

        const selected = Array.from(
            event.target.files || []
        );

        event.target.value = "";

        if (!selected.length) return;

        setError("");
        setMessage("");

        const availableSlots =
            maxImages - images.length - files.length;

        if (availableSlots <= 0) {

            setError(
                `You can add at most ${maxImages} images.`
            );

            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        const accepted = [];

        let rejected = 0;

        selected.forEach(file => {

            if (
                !allowedTypes.includes(file.type) ||
                file.size === 0 ||
                file.size > 5 * 1024 * 1024 ||
                accepted.length >= availableSlots
            ) {
                rejected++;
                return;
            }

            accepted.push(file);

        });

        if (rejected > 0) {

            setMessage(
                `${rejected} file(s) skipped. Check image type, 5 MB limit and maximum image count.`
            );

        }

        setFiles(previous => [
            ...previous,
            ...accepted
        ]);

    };


    // --------------------------------------------------
    // REMOVE A SELECTED FILE BEFORE UPLOAD
    // --------------------------------------------------

    const removeSelectedFile = (file) => {

        setFiles(previous =>
            previous.filter(item => item !== file)
        );

    };


    // --------------------------------------------------
    // UPLOAD IMAGES
    // --------------------------------------------------

    const handleUpload = async () => {

        if (!files.length) return;

        if (!recordId) {

            setError(
                "Cannot save images: record ID is missing."
            );

            return;
        }

        setUploading(true);
        setError("");
        setMessage("");

        try {

            const body = new FormData();

            files.forEach(file => {
                body.append("files", file);
            });

            // Upload to Cloudinary.
            const uploadResponse = await fetch(
                `${API_URL}/api/${entity}/images/upload`,
                {
                    method: "POST",
                    headers: {
                        ...getAuthHeaders()
                    },
                    body
                }
            );

            const uploadResult =
                await uploadResponse.json();

            if (!uploadResponse.ok) {

                throw new Error(
                    uploadResult.detail ||
                    "Image upload failed."
                );
            }

            const uploadedUrls =
                uploadResult.images || [];

            const updatedImages = [
                ...images,
                ...uploadedUrls
            ];

            // Persist the URLs in the selected JSON field.
            const saveResponse = await fetch(
                `${API_URL}/api/${entity}/${recordId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({
                        [field]: updatedImages
                    })
                }
            );

            const saveResult =
                await saveResponse.json();

            if (!saveResponse.ok) {

                throw new Error(
                    saveResult.detail ||
                    "Images uploaded but record update failed."
                );
            }

            onImagesChange(updatedImages);

            setFiles([]);

            setMessage(
                `${uploadedUrls.length} image(s) uploaded successfully.`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setUploading(false);

        }
    };


    // --------------------------------------------------
    // REMOVE EXISTING IMAGE
    // --------------------------------------------------

    const handleRemoveImage = async (url) => {

        if (!recordId) return;

        setRemoving(url);
        setError("");
        setMessage("");

        try {

            const params = new URLSearchParams({
                url,
                field
            });

            const response = await fetch(
                `${API_URL}/api/${entity}/${recordId}/images?${params}`,
                {
                    method: "DELETE",
                    headers: {
                        ...getAuthHeaders()
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Could not remove image."
                );
            }

            onImagesChange(result.images || []);

            setMessage("Image removed successfully.");

        } catch (err) {

            setError(err.message);

        } finally {

            setRemoving("");

        }
    };


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (

        <Dialog
                open={open}
                onClose={uploading ? undefined : onClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2
                    }
                }}
            >

            <DialogTitle
                sx={{
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderBottom: 1,
                    borderColor: "divider",
                    fontWeight: 600
                }}
            >
                Manage Images – {field}
            </DialogTitle>

            <DialogContent dividers>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {images.length} of {maxImages} images
                </Typography>


                {/* EXISTING IMAGES */}

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 3
                    }}
                >

                    {images.map((url, index) => (

                        <Box
                            key={`${url}-${index}`}
                            sx={{
                                position: "relative",
                                width: 120,
                                p: 0.5,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor: "background.default"
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
                                        width: 110,
                                        height: 110,
                                        objectFit: "cover",
                                        borderRadius: 1
                                    }}
                                />

                            </Box>

                            <IconButton
                                size="small"
                                color="error"
                                disabled={Boolean(removing)}
                                title="Remove image"
                                onClick={() =>
                                    handleRemoveImage(url)
                                }
                                sx={{
                                    position: "absolute",
                                    top: -8,
                                    right: 0,
                                    bgcolor: "background.paper",
                                    boxShadow: 1
                                }}
                            >

                                {removing === url
                                    ? <CircularProgress size={16} />
                                    : <DeleteIcon fontSize="small" />
                                }

                            </IconButton>

                        </Box>

                    ))}

                </Box>


                {/* PENDING PREVIEWS */}

                {previews.length > 0 && (

                    <>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1 }}
                        >
                            Selected images
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                                mb: 2
                            }}
                        >

                            {previews.map((item, index) => (

                                <Box
                                    key={`${item.file.name}-${index}`}
                                    sx={{
                                        position: "relative",
                                        width: 120,
                                        p: 0.5,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                        bgcolor: "background.default"
                                    }}
                                >

                                    <Box
                                        component="img"
                                        src={item.url}
                                        alt={item.file.name}
                                        sx={{
                                            width: 110,
                                            height: 110,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                            opacity: 0.8
                                        }}
                                    />

                                    <IconButton
                                        size="small"
                                        color="error"
                                        disabled={uploading}
                                        onClick={() =>
                                            removeSelectedFile(item.file)
                                        }
                                        sx={{
                                            position: "absolute",
                                            top: -8,
                                            right: -5,
                                            bgcolor: "background.paper",
                                            color: "error.main",
                                            boxShadow: 2,

                                            "&:hover": {
                                                bgcolor: "action.hover",
                                                color: "error.main"
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>

                                    <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{
                                            overflowWrap: "anywhere"
                                        }}
                                    >
                                        {item.file.name}
                                    </Typography>

                                </Box>

                            ))}

                        </Box>
                    </>

                )}


                {/* SELECT FILES */}

                <Button
                        variant="outlined"
                        component="label"
                        disabled={
                            uploading ||
                            images.length + files.length >= maxImages
                        }
                        sx={{
                            borderColor: "primary.main",
                            color: "primary.main",

                            "&:hover": {
                                bgcolor: "action.hover",
                                borderColor: "primary.main"
                            }
                        }}
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
                            Uploading images and saving record...
                        </Typography>

                    </Box>

                )}


                {message && (

                    <Alert
                        severity="success"
                        sx={{ mt: 2 }}
                    >
                        {message}
                    </Alert>

                )}


                {error && (

                    <Alert
                        severity="error"
                        sx={{ mt: 2 }}
                    >
                        {error}
                    </Alert>

                )}

            </DialogContent>


            <DialogActions
                    sx={{
                        bgcolor: "background.default",
                        borderTop: 1,
                        borderColor: "divider",
                        p: 2
                    }}
                >

                    <Button
                        onClick={onClose}
                        disabled={uploading}
                        color="inherit"
                    >
                        Close
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={
                            uploading ||
                            files.length === 0
                        }
                    >
                        Upload {files.length > 0
                            ? `(${files.length})`
                            : ""
                        }
                    </Button>

                </DialogActions>

        </Dialog>
    );
}
