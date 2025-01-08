import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabase/server";
export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const router = useRouter();
  const { query } = router.query;

  useEffect(() => {
    if (query) {
      fetchVehicles(query);
    }
  }, [query]);

  /**
   * Fetch vehicles from the database using the query parameter.
   */
  const fetchVehicles = async (searchTerm) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .or(`vin.ilike.%${searchTerm}%,plates.ilike.%${searchTerm}%`);

      if (error) {
        console.error("Error fetching vehicles:", error);
      } else {
        setVehicles(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div className="container">
      <h1>Search Results</h1>
      {vehicles.length > 0 ? (
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
              <button
                className="vehicle-button"
                onClick={() => router.push(`/vehicle/${vehicle.id}`)}
              >
                Add Maintenance Record
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No vehicles found for the search term "{query}".</p>
      )}
    </div>
  );
}
