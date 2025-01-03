import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/server";

// import "@/styles/globals.css";
export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  /**
   * Fetch vehicles from the database.
   * If a query (searchTerm) is provided,
   * filter by VIN or plates.
   */
  const fetchVehicles = async (query = "") => {
    try {
      let request = supabase.from("vehicles").select("*");

      if (query) {
        // Filter by either VIN or plates
        request = request.or(`vin.ilike.%${query}%,plates.ilike.%${query}%`);
      }

      const { data, error } = await request;

      if (error) {
        console.error("Error fetching vehicles:", error);
      } else {
        setVehicles(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  /**
   * Handle submission of the search form.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(searchTerm);
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

      {/* Vehicles Grid */}
      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <h2 className="vehicle-title">
              {vehicle.make} {vehicle.model}
            </h2>
            <p className="vehicle-info">
              <strong>VIN:</strong> {vehicle.vin}
            </p>
            <p className="vehicle-info">
              <strong>Plates:</strong> {vehicle.plates}
            </p>
            <button className="vehicle-button">Add Maintenance Record</button>
          </div>
        ))}
      </div>
    </div>
  );
}
