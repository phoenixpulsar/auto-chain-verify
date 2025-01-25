import { useState } from "react";
import { useRouter } from "next/router";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?query=${searchTerm.trim()}`);
    }
  };

  return (
    <div>
      <h1>Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by ID, VIN, Plates, Model, or Year"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}
