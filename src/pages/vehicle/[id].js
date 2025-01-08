import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabase/server";

export default function VehicleDetails({ vehicle }) {
  const router = useRouter();
  const { id } = router.query;

  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [serviceDescription, setServiceDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      fetchMaintenanceRecords();
    }
  }, [vehicle]);

  // Fetch maintenance records for the vehicle
  const fetchMaintenanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("vehicle_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaintenanceRecords(data);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
    }
  };

  // Dummy function to simulate blockchain interaction
  const addToBlockchain = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          resolve("dummy_blockchain_hash_123456789");
        } else {
          reject(new Error("Failed to add to blockchain"));
        }
      }, 1000);
    });
  };

  // Add a new maintenance record
  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the dummy blockchain interaction
      const blockchainHash = await addToBlockchain();

      // Insert the new record into the database
      const { error } = await supabase.from("maintenance_records").insert([
        {
          vehicle_id: id,
          service_description: serviceDescription,
          hash: blockchainHash,
        },
      ]);

      if (error) throw error;

      // Refresh the maintenance records and clear the form
      await fetchMaintenanceRecords();
      setServiceDescription("");
    } catch (error) {
      console.error("Error adding maintenance record:", error);
    } finally {
      setLoading(false);
    }
  };

  // If the page is not yet generated (fallback mode), display a loader
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // If no vehicle is found, display an error message
  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <h1>
        {vehicle.make} {vehicle.model}
      </h1>
      <p>
        <strong>VIN:</strong> {vehicle.vin}
      </p>
      <p>
        <strong>Plates:</strong> {vehicle.plates}
      </p>
      <p>
        <strong>Year:</strong> {vehicle.year}
      </p>
      <p>
        <strong>Color:</strong> {vehicle.color}
      </p>

      {/* Add Maintenance Record Form */}
      <form onSubmit={handleAddMaintenance} style={{ marginTop: "20px" }}>
        <h2>Add Maintenance Record</h2>
        <textarea
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          placeholder="Enter service description"
          required
          style={{
            width: "100%",
            height: "80px",
            marginBottom: "10px",
            padding: "10px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Record"}
        </button>
      </form>

      {/* Maintenance Records */}
      <h2>Maintenance Records</h2>
      {maintenanceRecords.length > 0 ? (
        <ul>
          {maintenanceRecords.map((record) => (
            <li key={record.id} style={{ marginBottom: "10px" }}>
              <p>
                <strong>Description:</strong> {record.service_description}
              </p>
              <p>
                <strong>Blockchain Hash:</strong> {record.blockchain_hash}
              </p>
              <p>
                <strong>Added On:</strong>{" "}
                {new Date(record.created_at).toLocaleString()}
              </p>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No maintenance records found.</p>
      )}
    </div>
  );
}

// Fetch data at build time for static generation
export async function getStaticProps({ params }) {
  const { id } = params;
  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching vehicle:", error);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      vehicle,
    },
    revalidate: 60,
  };
}

// Define dynamic paths to pre-render
export async function getStaticPaths() {
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id");

  if (error) {
    console.error("Error fetching paths:", error);
    return { paths: [], fallback: true };
  }

  const paths = vehicles.map((vehicle) => ({
    params: { id: vehicle.id.toString() },
  }));

  return {
    paths,
    fallback: true,
  };
}
