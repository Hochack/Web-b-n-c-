// src/pages/Searchpage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../components/ProductList";
import { defaultCategories } from "../data/category";
import "./SearchPage.css";

const parseQuery = (search) => {
  const params = new URLSearchParams(search);
  return {
    keyword: params.get("q") || "",
    category: params.get("category") || "",
    priceSort: params.get("priceSort") || "",
    popularitySort: params.get("popularitySort") || "",
    timeSort: params.get("timeSort") || "",
  };
};

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [popularitySort, setPopularitySort] = useState("");
  const [timeSort, setTimeSort] = useState("");
  const [result, setResult] = useState([]);
  const [showOptions, setShowOptions] = useState(null);

  useEffect(() => {
    const { keyword, category, priceSort, popularitySort, timeSort } = parseQuery(location.search);
    setKeyword(keyword);
    setCategory(category);
    setPriceSort(priceSort);
    setPopularitySort(popularitySort);
    setTimeSort(timeSort);
    fetchData({ keyword, category, priceSort, popularitySort, timeSort });
  }, [location.search]);

  const buildSortBy = () => {
    const sortBy = [];
    if (priceSort) sortBy.push(`price-${priceSort}`);
    if (popularitySort) sortBy.push("sold");
    if (timeSort) sortBy.push(`${timeSort === "newest" ? "newest" : "oldest"}`);
    return sortBy;
  };

  const fetchData = async ({ keyword, category }) => {
    try {
      const query = new URLSearchParams();
      if (keyword) query.append("q", keyword);
      if (category) query.append("category", category);

      const sortByArray = buildSortBy();
      sortByArray.forEach((s) => query.append("sortBy", s));

      const queryString = query.toString();
      console.log("🔍 Gửi truy vấn:", queryString);

      const res = await fetch(`/api/products/search?${queryString}`);
      const data = await res.json();

      console.log("📦 Kết quả trả về:", data);
      setResult(data);
    } catch (err) {
      console.error("❌ Lỗi fetch:", err);
    }
  };

  const updateURL = ({ keyword, category, priceSort, popularitySort, timeSort }) => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (category) params.set("category", category);
    if (priceSort) params.set("priceSort", priceSort);
    if (popularitySort) params.set("popularitySort", popularitySort);
    if (timeSort) params.set("timeSort", timeSort);

    navigate(`/search?${params.toString()}`);
  };

  const onFilterSelect = (type, value) => {
    if (type === "price") setPriceSort(value);
    if (type === "popularity") setPopularitySort(value);
    if (type === "time") setTimeSort(value);

    updateURL({
      keyword,
      category,
      priceSort: type === "price" ? value : priceSort,
      popularitySort: type === "popularity" ? value : popularitySort,
      timeSort: type === "time" ? value : timeSort,
    });
    setShowOptions(null);
  };

  const onCategorySelect = (cat) => {
    setCategory(cat);
    updateURL({ keyword, category: cat, priceSort, popularitySort, timeSort });
    setShowOptions(null);
  };

  return (
    <div className="search-page">
      <div className="main_controls">
        {["price", "popularity", "time"].map((type) => {
          let label = "";
          if (type === "price") {
            label = "Lọc theo giá" + (priceSort ? `: ${priceSort === "asc" ? "Giá tăng dần" : "Giá giảm dần"}` : "");
          }
          if (type === "popularity") {
            label = "Lọc theo độ phổ biến" + (popularitySort ? ": Bán chạy" : "");
          }
          if (type === "time") {
            label = "Lọc theo thời gian" + (timeSort ? (timeSort === "newest" ? ": Mới nhất" : ": Cũ nhất") : "");
          }

          return (
            <div className="filter-group" key={type}>
              <button
                className="menu_btn filter"
                onClick={() => setShowOptions(showOptions === type ? null : type)}
              >
                {label} ▼
              </button>
              {(type === "price" && priceSort) ||
              (type === "popularity" && popularitySort) ||
              (type === "time" && timeSort) ? (
                <button className="reset-btn" onClick={() => onFilterSelect(type, "")}>❌</button>
              ) : null}

              {showOptions === type && (
                <div className="dropdown">
                  {type === "price" && (
                    <>
                      <div onClick={() => onFilterSelect("price", "asc")}>Giá tăng dần</div>
                      <div onClick={() => onFilterSelect("price", "desc")}>Giá giảm dần</div>
                    </>
                  )}
                  {type === "popularity" && (
                    <div onClick={() => onFilterSelect("popularity", "hot")}>Bán chạy</div>
                  )}
                  {type === "time" && (
                    <>
                      <div onClick={() => onFilterSelect("time", "newest")}>Mới nhất</div>
                      <div onClick={() => onFilterSelect("time", "oldest")}>Cũ nhất</div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="filter-group">
          <button
            className="menu_btn filter"
            onClick={() => setShowOptions(showOptions === "category" ? null : "category")}
          >
            Danh mục {category ? `: ${category}` : ""} ▼
          </button>
          {category && (
            <button className="reset-btn" onClick={() => onCategorySelect("")}>❌</button>
          )}
          {showOptions === "category" && (
            <div className="dropdown">
              {defaultCategories.map((cat) => (
                <div key={cat} onClick={() => onCategorySelect(cat)}>
                  {cat}
                </div>
              ))}
              <div onClick={() => onCategorySelect("")}>
                <em>❌ Xóa lọc danh mục</em>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="search-results">
        {result.length > 0 ? (
          <ProductList products={result} isSearchPage={true} />
        ) : (
          <div>Không có kết quả phù hợp.</div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
