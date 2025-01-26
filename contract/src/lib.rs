use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    env,
    near_bindgen,
    serde::{Deserialize, Serialize},
    store::iterable_map::IterableMap,
    AccountId, PanicOnDefault,
};
use schemars::{JsonSchema, gen::SchemaGenerator};

/// A single maintenance record for a vehicle.
///
/// - We override how `mechanic_id` is handled in JSON Schema using `#[schemars(with = "String")]`
///   because `AccountId` doesn't implement `JsonSchema` by default.
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone, JsonSchema)]
#[serde(crate = "near_sdk::serde")]
pub struct MaintenanceRecord {
    pub date: String,
    pub description: String,

    // Tells `schemars` to represent `AccountId` as a simple String in the generated schema
    #[schemars(with = "String")]
    pub mechanic_id: AccountId,

    pub hash: String,
}

/// Main contract structure, storing multiple maintenance records per vehicle.
///
/// - Using `IterableMap<K, V>` from `near_sdk::store::iterable_map` to avoid deprecation.
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MaintenanceContract {
    /// Maps `vehicle_id` → a `Vec` of `MaintenanceRecord`.
    records: IterableMap<String, Vec<MaintenanceRecord>>,
    /// The owner of this contract (optional usage).
    owner: AccountId,
}

#[near_bindgen]
impl MaintenanceContract {
    /// Initialize the contract. Must be called once.
    #[init]
    pub fn new(owner: AccountId) -> Self {
        env::log_str("Initializing MaintenanceContract using IterableMap...");
        Self {
            // Provide a unique prefix for storing data.
            records: IterableMap::new(b"m"),
            owner,
        }
    }

    /// Add a record for a specific `vehicle_id`.
    /// E.g. `"VIN-ABC123"`, date, description, mechanic's AccountId, and an optional hash.
    pub fn add_record(
        &mut self,
        vehicle_id: String,
        date: String,
        description: String,
        mechanic_id: AccountId,
        hash: String,
    ) {
        // Example of optional access control:
        // if env::predecessor_account_id() != self.owner {
        //     env::panic_str("Only the owner can add records.");
        // }

        // `IterableMap::get(key)` returns `Option<&V>`. So we `cloned()` it to get `Option<V>`.
        let mut existing = self.records.get(&vehicle_id).cloned().unwrap_or_default();

        // Append a new record.
        existing.push(MaintenanceRecord {
            date,
            description,
            mechanic_id,
            hash,
        });

        // Insert back. `IterableMap::insert(key, value)` takes owned types, not references.
        self.records.insert(vehicle_id, existing);

        env::log_str("Maintenance record added.");
    }

    /// Returns `Some(Vec<MaintenanceRecord>)` if records exist, else `None`.
    pub fn get_records(&self, vehicle_id: String) -> Option<Vec<MaintenanceRecord>> {
        // `cloned()` moves data out of the Option<&Vec<T>> into Option<Vec<T>>.
        self.records.get(&vehicle_id).cloned()
    }

    /// Example method if you want to see who the owner is.
    pub fn get_owner(&self) -> AccountId {
        self.owner.clone()
    }
}
