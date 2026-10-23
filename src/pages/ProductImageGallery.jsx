
import React, { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Dialog,
    IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

export default function ProductImageGallery({
    images = [],
    productName = "Product",
    height = 260
}) {
    const validImages = Array.isArray(images)
        ? images.filter(
            image =>
                typeof image === "string" &&
                image.trim() !== ""
        )
        : [];

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setSelectedIndex(0);
        setImageErrors({});
        setOpen(false);
    }, [images]);

    const selectedImage = validImages[selectedIndex];

    const markImageError = (url) => {
        setImageErrors(previous => ({
            ...previous,
            [url]: true
        }));
    };

    const renderPlaceholder = (message) => (
        <Box
            sx={{
                height,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                color: "text.secondary",
                borderRadius: 1
            }}
        >
            <Typography variant="body2">
                {message}
            </Typography>
        </Box>
    );

    if (validImages.length === 0) {
        return renderPlaceholder("No images available");
    }

    const usableImages = validImages.filter(
        url => !imageErrors[url]
    );

    if (usableImages.length === 0) {
        return renderPlaceholder("Images unavailable");
    }

    return (
        <Box sx={{ width: "100%" }}>
            {/* Main image */}
            <Box
                sx={{
                    height,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    cursor: selectedImage ? "zoom-in" : "default"
                }}
                onClick={() => {
                    if (selectedImage && !imageErrors[selectedImage]) {
                        setOpen(true);
                    }
                }}
            >
                {selectedImage && !imageErrors[selectedImage] ? (
                    <Box
                        component="img"
                        src={selectedImage}
                        alt={productName}
                        onError={() => markImageError(selectedImage)}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                        }}
                    />
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Image unavailable
                    </Typography>
                )}
            </Box>

            {/* Thumbnail strip */}
            {validImages.length > 1 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 1,
                        pb: 0
                    }}
                >
                    {validImages.map((url, index) => (
                        <Box
                            key={`${url}-${index}`}
                            onClick={() => setSelectedIndex(index)}
                            sx={{
                                flex: "0 0 64px",
                                height: 64,
                                border: 2,
                                borderColor:
                                    selectedIndex === index
                                        ? "primary.main"
                                        : "divider",
                                borderRadius: 1,
                                overflow: "hidden",
                                cursor: "pointer",
                                opacity: imageErrors[url] ? 0.4 : 1
                            }}
                        >
                            <Box
                                component="img"
                                src={url}
                                alt={`${productName} image ${index + 1}`}
                                onError={() => markImageError(url)}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Enlarged image */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="lg"
            >
                <Box sx={{ position: "relative", p: 2 }}>
                    <IconButton
                        onClick={() => setOpen(false)}
                        aria-label="Close image"
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: "background.paper"
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {selectedImage && !imageErrors[selectedImage] && (
                        <Box
                            component="img"
                            src={selectedImage}
                            alt={productName}
                            sx={{
                                display: "block",
                                maxWidth: "85vw",
                                maxHeight: "80vh",
                                objectFit: "contain"
                            }}
                        />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
}
