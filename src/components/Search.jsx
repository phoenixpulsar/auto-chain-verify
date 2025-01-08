import { useState } from "react";
import { useRouter } from "next/router";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  /**
   * Handle submission of the search form.
   * Redirects to /vehicles with the search term as a query parameter.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/vehicles?query=${searchTerm}`);
    }
  };

  return (
    <div className="container">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          placeholder="Search by VIN or Plates"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
}
