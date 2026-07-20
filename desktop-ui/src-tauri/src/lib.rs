use std::{process::Child, sync::Mutex};

#[cfg(not(debug_assertions))]
use std::{
    fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
};

use tauri::{Manager, WindowEvent};

#[cfg(all(not(debug_assertions), target_os = "windows"))]
use std::os::windows::process::CommandExt;

struct BackendState(Mutex<Option<Child>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            app.manage(BackendState(Mutex::new(None)));

            #[cfg(not(debug_assertions))]
            start_packaged_backend(app.handle())?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if matches!(event, WindowEvent::CloseRequested { .. }) {
                stop_packaged_backend(window.app_handle());
            }
        })
        .invoke_handler(tauri::generate_handler![open_external_url])
        .run(tauri::generate_context!())
        .expect("error while running Pilot desktop shell");
}

#[cfg(not(debug_assertions))]
fn start_packaged_backend(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if is_backend_running() {
        return Ok(());
    }

    let backend_exe = find_backend_exe(app)?;
    let data_root = pilot_data_root()?;
    let config_dir = ensure_dir(data_root.join("config"))?;
    let notes_dir = ensure_dir(data_root.join("notes"))?;
    let history_dir = ensure_dir(data_root.join("history"))?;
    let logs_dir = ensure_dir(data_root.join("logs"))?;
    let profile_dir = ensure_dir(data_root.join("browser-profile"))?;
    let cache_dir = ensure_dir(data_root.join("cache"))?;

    let mut command = Command::new(&backend_exe);
    command
        .current_dir(backend_exe.parent().unwrap_or_else(|| Path::new(".")))
        .env("PILOT_DATA_DIR", &data_root)
        .env("PILOT_CONFIG_DIR", &config_dir)
        .env("PILOT_NOTES_DIR", &notes_dir)
        .env("PILOT_HISTORY_DIR", &history_dir)
        .env("PILOT_LOGS_DIR", &logs_dir)
        .env("PILOT_PROFILE_DIR", &profile_dir)
        .env("PILOT_CACHE_DIR", &cache_dir)
        .env("PILOT_BACKEND_HOST", "127.0.0.1")
        .env("PILOT_BACKEND_PORT", "8000")
        .env("PILOT_BACKEND_ACCESS_LOG", "0")
        .env("PYTHONUTF8", "1")
        .env("PYTHONIOENCODING", "utf-8")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);

    let child = command.spawn()?;
    let state = app.state::<BackendState>();
    *state.0.lock().map_err(|_| "Backend state lock failed")? = Some(child);

    Ok(())
}

fn stop_packaged_backend(app: &tauri::AppHandle) {
    let state = app.state::<BackendState>();
    let child = state
        .0
        .lock()
        .ok()
        .and_then(|mut child_slot| child_slot.take());

    if let Some(mut child) = child {
        let _ = child.kill();
        let _ = child.wait();
    }
}

#[cfg(not(debug_assertions))]
fn is_backend_running() -> bool {
    std::net::TcpStream::connect(("127.0.0.1", 8000)).is_ok()
}

#[cfg(not(debug_assertions))]
fn find_backend_exe(app: &tauri::AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let resource_dir = app.path().resource_dir()?;
    let candidates = [
        resource_dir
            .join("resources")
            .join("pilot-backend")
            .join("pilot-backend.exe"),
        resource_dir.join("pilot-backend").join("pilot-backend.exe"),
    ];

    candidates
        .into_iter()
        .find(|path| path.exists())
        .ok_or_else(|| "Packaged backend executable was not found in Tauri resources.".into())
}

#[cfg(not(debug_assertions))]
fn pilot_data_root() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let local_app_data = std::env::var_os("LOCALAPPDATA")
        .ok_or("LOCALAPPDATA is not available on this system.")?;
    ensure_dir(PathBuf::from(local_app_data).join("Pilot"))
}

#[cfg(not(debug_assertions))]
fn ensure_dir(path: PathBuf) -> Result<PathBuf, Box<dyn std::error::Error>> {
    fs::create_dir_all(&path)?;
    Ok(path)
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
