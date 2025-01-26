use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::UnorderedMap,
    env, near_bindgen,
    serde::{Deserialize, Serialize},
    AccountId, PanicOnDefault,
};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct MaintenanceRecord {
    pub date: String,
    pub description: String,
    pub mechanic_id: AccountId,
    pub hash: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct VehicleContract {
    records: UnorderedMap<String, Vec<MaintenanceRecord>>,
    owner: AccountId,
}

#[near_bindgen]
impl VehicleContract {
    /// Initialize the contract with an `owner`.
    #[init]
    pub fn init(owner: AccountId) -> Self {
        Self {
            records: UnorderedMap::new(b"r".to_vec()),
            owner,
        }
    }

    /// Add a record.  
    /// (Optionally require env::predecessor_account_id() == self.owner for access control.)
    pub fn add_record(
        &mut self,
        vehicle_id: String,
        date: String,
        description: String,
        mechanic_id: AccountId,
        hash: String,
    ) {
        let mut vehicle_records = self.records.get(&vehicle_id).unwrap_or_default();
        vehicle_records.push(MaintenanceRecord {
            date,
            description,
            mechanic_id,
            hash,
        });
        self.records.insert(&vehicle_id, &vehicle_records);
    }

    /// Retrieve records for a given vehicle ID.
    pub fn get_records(&self, vehicle_id: String) -> Option<Vec<MaintenanceRecord>> {
        self.records.get(&vehicle_id)
    }
}
