#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_external_url])
        .run(tauri::generate_context!())
        .expect("error while running Pilot desktop shell");
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("Only secure web links can be opened.".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("rundll32")
            .args(["url.dll,FileProtocolHandler", url.as_str()])
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(url.as_str())
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(url.as_str())
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}
