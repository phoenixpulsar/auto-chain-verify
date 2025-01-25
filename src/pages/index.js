import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabase/server";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const router = useRouter();
  const searchParam = router.query.query;

  useEffect(() => {
    if (searchParam) {
      fetchVehicles(searchParam);
    }
  }, [searchParam]);

  const fetchVehicles = async (searchTerm) => {
    try {
      const cleanSearchTerm = searchTerm.trim();
      if (!cleanSearchTerm) {
        setVehicles([]);
        return;
      }

      const numericValue = Number(cleanSearchTerm);
      const isNumeric = !isNaN(numericValue);

      // Base query
      let query = supabase
        .from("vehicles")
        .select("id, vin, model, make, year, plates");

      if (isNumeric) {
        // If user typed a purely numeric string, do EXACT match on numeric columns
        // but also do partial match on text columns
        // e.g., searching for "888888" will match vin.ilike.%888888%
        const orFilter = [
          `id.eq.${numericValue}`, // e.g. id = 888888
          `year.eq.${numericValue}`, // e.g. year = 888888
          `vin.ilike.%${cleanSearchTerm}%`, // partial match on VIN
          `model.ilike.%${cleanSearchTerm}%`,
          `make.ilike.%${cleanSearchTerm}%`,
          `plates.ilike.%${cleanSearchTerm}%`,
        ].join(",");

        query = query.or(orFilter);
      } else {
        // If user typed something non-numeric, do partial match on text columns:
        // vin, model, make, plates (and if you want partial numeric for year or id, you need a view or RPC)
        const orFilter = [
          `vin.ilike.%${cleanSearchTerm}%`,
          `model.ilike.%${cleanSearchTerm}%`,
          `make.ilike.%${cleanSearchTerm}%`,
          `plates.ilike.%${cleanSearchTerm}%`,
        ].join(",");

        query = query.or(orFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
        return;
      }

      setVehicles(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      setVehicles([]);
    }
  };

  return (
    <div>
      <h1>Vehicles</h1>
      <p>Search param: {searchParam}</p>
      {vehicles.length === 0 ? (
        <p>No vehicles found.</p>
      ) : (
        vehicles.map((v) => (
          <div key={v.id}>
            <h2>
              {v.make} {v.model} ({v.year}) [ID: {v.id}]
            </h2>
            <p>VIN: {v.vin}</p>
            <p>Plates: {v.plates}</p>
          </div>
        ))
      )}
    </div>
  );
}
