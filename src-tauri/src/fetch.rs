use tauri::api::http::{ClientBuilder, HttpRequestBuilder};
#[tauri::command]
pub async fn fetch(options: HttpRequestBuilder) -> serde_json::value::Value {
    let client = ClientBuilder::new().build().unwrap();
    let response = client.send(options).await.unwrap();
    let body = response.read().await.unwrap();
    return body.data;
}
