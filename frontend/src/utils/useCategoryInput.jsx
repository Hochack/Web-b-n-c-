// src/utils/useCategoryInput.js
import { useState, useRef } from "react";
import { defaultCategories } from "../data/category";
import "./useCategoryInput.css"

function normalize(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export default function useCategoryInput() {
    const [categoryInput, setCategoryInput] = useState("");
    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const justSelectedRef = useRef(false); // ✅ cờ để biết có vừa chọn gợi ý không

    const getSelectedCategories = () => {
        return categoryInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    };

    const updateSuggestions = (input) => {
        const parts = input.split(",");
        const lastPart = parts[parts.length - 1].trim();

        const existing = getSelectedCategories().map(normalize);
        const query = normalize(lastPart);

        if (!query) {
            setCategorySuggestions(
                defaultCategories.filter((c) => !existing.includes(normalize(c)))
            );
            return;
        }

        const filtered = defaultCategories
            .filter(
                (cat) =>
                    normalize(cat).includes(query) &&
                    !existing.includes(normalize(cat))
            )
            .sort((a, b) => {
                const aNorm = normalize(a);
                const bNorm = normalize(b);
                return aNorm.indexOf(query) - bNorm.indexOf(query);
            });

        setCategorySuggestions(filtered);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategoryInput(value);
        updateSuggestions(value);
        setShowSuggestions(true); // ✅ luôn show gợi ý khi đang gõ
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const parts = categoryInput.split(",");
            const lastPart = parts[parts.length - 1].trim();

            if (lastPart) {
                addCategory(lastPart);
            }
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        justSelectedRef.current = true; // ✅ đánh dấu là vừa chọn suggestion

        const parts = categoryInput.split(",");
        parts[parts.length - 1] = " " + suggestion;

        const uniqueParts = Array.from(
            new Set(
                parts
                    .map((p) => p.trim())
                    .filter((p) => p.length > 0)
            )
        );

        const newInput = uniqueParts.join(", ") + ", ";
        setCategoryInput(newInput);
        updateSuggestions(newInput);

        setShowSuggestions(true); // ✅ sau khi chọn vẫn show gợi ý tiếp

        if (!defaultCategories.includes(suggestion)) {
            defaultCategories.push(suggestion);
        }
    };

    const addCategory = (category) => {
        let parts = categoryInput.split(",").map((p) => p.trim());
        parts = parts.filter((p) => p.length > 0 && p.toLowerCase() !== category.toLowerCase());
        parts.push(category);

        const newInput = parts.join(", ") + ", ";
        setCategoryInput(newInput);
        updateSuggestions(newInput);
        setShowSuggestions(true); // ✅ Enter xong cũng show gợi ý tiếp

        if (!defaultCategories.includes(category)) {
            defaultCategories.push(category);
        }
    };

    const handleFocus = () => {
        updateSuggestions(categoryInput);
        setShowSuggestions(true);
    };

    const handleBlur = () => {
        if (justSelectedRef.current) {
            // Nếu vừa chọn suggestion → không tắt gợi ý
            justSelectedRef.current = false;
            return;
        }

        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return {
        categoryInput,
        categorySuggestions,
        handleCategoryChange,
        handleSelectSuggestion,
        handleKeyDown,
        handleFocus,
        handleBlur,
        showSuggestions,
    };
}
