use chrono::Utc;
use near_sdk::serde_json::json;
use near_workspaces::sandbox;
use near_workspaces::types::{AccountId, NearToken};
use tokio::test as tokio_test;

/// Local struct matching `MaintenanceRecord` for JSON deserialization in the test.
#[derive(serde::Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct MaintenanceRecord {
    pub date: String,
    pub description: String,
    pub mechanic_id: AccountId,
    pub hash: String,
}

#[tokio_test]
async fn test_vehicle_maintenance() -> Result<(), Box<dyn std::error::Error>> {
    // 1) Start local sandbox
    let now = Utc::now();
    let sandbox = sandbox().await?;

    // 2) Root account
    let root = sandbox.root_account()?;

    // 3) Create contract subaccount
    let contract_acc = root
        .create_subaccount("maintenance-contract")
        .initial_balance(NearToken::from_near(10))
        .transact()
        .await?
        .unwrap();

    // 4) Compile the contract from the project root
    let wasm_bytes = near_workspaces::compile_project("./").await?;

    // 5) Deploy
    let contract = contract_acc.deploy(&wasm_bytes).await?.unwrap();

    // 6) Create an owner account
    let owner_acc = root
        .create_subaccount("owner")
        .initial_balance(NearToken::from_near(10))
        .transact()
        .await?
        .unwrap();

    // 7) Init contract with owner
    let init_res = contract
        .call("new")
        .args_json(json!({ "owner": owner_acc.id() }))
        .transact()
        .await?;
    assert!(init_res.is_success(), "Initialization failed.");

    // 8) Another user, e.g. a "mechanic" or just someone who can add a record
    let alice = root
        .create_subaccount("alice")
        .initial_balance(NearToken::from_near(10))
        .transact()
        .await?
        .unwrap();

    // 9) Add a record
    let add_res = alice
        .call(contract.id(), "add_record")
        .args_json(json!({
            "vehicle_id": "VIN-ABC123",
            "date": "2025-01-25",
            "description": "Engine tune-up",
            "mechanic_id": "mechanic.testnet",
            "hash": "sha256hash-abc"
        }))
        .transact()
        .await?;
    assert!(add_res.is_success(), "add_record call failed");

    // 10) Retrieve the records
    let get_call = contract
        .view("get_records")
        .args_json(json!({"vehicle_id": "VIN-ABC123"}))
        .await?;
    let maybe_records: Option<Vec<MaintenanceRecord>> = get_call.json()?;
    assert!(maybe_records.is_some(), "No records found for VIN-ABC123");

    let records = maybe_records.unwrap();
    assert_eq!(records.len(), 1);
    let record = &records[0];
    assert_eq!(record.date, "2025-01-25");
    assert_eq!(record.description, "Engine tune-up");
    assert_eq!(record.mechanic_id.as_str(), "mechanic.testnet");
    assert_eq!(record.hash, "sha256hash-abc");

    println!("Test completed at: {}", now);
    Ok(())
}
