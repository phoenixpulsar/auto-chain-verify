use chrono::Utc;
use near_sdk::serde_json::json;
use near_workspaces::types::{AccountId, NearToken};
use near_workspaces::sandbox;
use tokio::test as tokio_test; // rename for clarity if desired

/// Represents the same struct defined in your contract if you want to parse JSON directly.
/// Adjust the fields to match your MaintenanceRecord.
#[derive(serde::Deserialize, Debug)]
pub struct MaintenanceRecord {
    pub date: String,
    pub description: String,
    pub mechanic_id: AccountId,
    pub hash: String,
}

#[tokio_test]
async fn test_maintenance_contract() -> Result<(), Box<dyn std::error::Error>> {
    // 1) Set up sandbox environment
    let sandbox = sandbox().await?;

    // 2) Get the "root" account of the sandbox
    let root = sandbox.root_account()?;

    // 3) Create subaccounts for testing
    let owner = create_subaccount(&root, "owner").await?;
    let alice = create_subaccount(&root, "alice").await?;

    // 4) Compile the contract in the current directory (assuming Cargo.toml in `./`)
    let wasm_bytes = near_workspaces::compile_project("./").await?;
    let contract_account = create_subaccount(&root, "maintenance_contract").await?;

    // 5) Deploy the contract to `maintenance_contract.<root>`
    let contract = contract_account.deploy(&wasm_bytes).await?.unwrap();

    // 6) Initialize the contract
    let init_result = contract
        .call("init")
        .args_json(json!({
            "owner": owner.id()
        }))
        .transact()
        .await?;
    assert!(init_result.is_success(), "Contract initialization failed");

    // 7) Add a record (calling from the owner, if your contract requires that)
    let add_record_result = owner
        .call(contract.id(), "add_record")
        .args_json(json!({
            "vehicle_id": "VIN-ABC123",
            "date": "2025-01-25",
            "description": "Engine check",
            "mechanic_id": "mechanic.testnet",
            "hash": "sha256-of-enginecheck"
        }))
        .deposit(NearToken::from_near(0)) // no deposit needed unless your logic requires
        .transact()
        .await?;
    assert!(
        add_record_result.is_success(),
        "Failed to add maintenance record"
    );

    // 8) Retrieve the records to verify
    let records_view = contract
        .view("get_records")
        .args_json(json!({
            "vehicle_id": "VIN-ABC123"
        }))
        .await?;
    // The contract returns Option<Vec<MaintenanceRecord>>, so let's parse it carefully
    let maybe_records: Option<Vec<MaintenanceRecord>> = records_view.json()?;

    // 9) Assertions on the returned record(s)
    let records = maybe_records.expect("No records found for VIN-ABC123");
    assert_eq!(records.len(), 1, "Should have exactly one record");

    let record = &records[0];
    assert_eq!(record.date, "2025-01-25");
    assert_eq!(record.description, "Engine check");
    assert_eq!(record.mechanic_id.as_str(), "mechanic.testnet");
    assert_eq!(record.hash, "sha256-of-enginecheck");

    // 10) (Optional) Test unauthorized usage if your contract has access control
    // e.g., if your contract requires only the owner can add records,
    // attempt a record addition from alice and expect failure:
    /*
    let unauthorized_result = alice
        .call(contract.id(), "add_record")
        .args_json(json!({
            "vehicle_id": "VIN-XYZ999",
            "date": "2025-02-01",
            "description": "Unauthorized check",
            "mechanic_id": "another_mech.testnet",
            "hash": "sha256-unauth"
        }))
        .deposit(0)
        .transact()
        .await?;

    // If there's a require! check, we'd expect unauthorized_result.is_failure()
    assert!(unauthorized_result.is_failure());
    */

    Ok(())
}

/// Utility for creating subaccounts with initial balances.
async fn create_subaccount(
    root: &near_workspaces::Account,
    name: &str,
) -> Result<near_workspaces::Account, Box<dyn std::error::Error>> {
    const TEN_NEAR: NearToken = NearToken::from_near(10);
    let subaccount = root
        .create_subaccount(name)
        .initial_balance(TEN_NEAR)
        .transact()
        .await?
        .unwrap();
    Ok(subaccount)
}
