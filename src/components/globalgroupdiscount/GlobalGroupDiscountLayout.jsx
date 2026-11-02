import React, { useEffect, useState } from "react";

import YamlNavigationLayout from "../../layout/YamlNavigationLayout";
import GlobalGroupDiscountPage from "./GlobalGroupDiscountPage";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

export default function GlobalGroupDiscountLayout() {

    const [config, setConfig] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadSharedYaml() {

            try {

                const response = await fetch(
                    `${API_URL}/api/config?name=shared`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load shared YAML: ${response.status}`
                    );
                }

                const yamlConfig = await response.json();

                setConfig(yamlConfig);

            } catch (err) {

                console.error(err);
                setError(err.message);

            }

        }

        loadSharedYaml();

    }, []);

    if (error) {
        return <div>Error loading navigation: {error}</div>;
    }

    if (!config) {
        return <div>Loading...</div>;
    }

    return (
        <YamlNavigationLayout config={config}>
            <GlobalGroupDiscountPage />
        </YamlNavigationLayout>
    );

}