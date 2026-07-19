import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { getDB, requestToPromise, STORE_SETTINGS } from "./connection";

// settingsストアは単一レコードのみを保持する固定キー
const SETTINGS_KEY = "default";

type SettingsRecord = Settings & { key: string };

/**
 * 出題設定を取得する。未保存の場合は初期値を返す。
 */
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const tx = db.transaction(STORE_SETTINGS, "readonly");
  const store = tx.objectStore(STORE_SETTINGS);
  const record = await requestToPromise<SettingsRecord | undefined>(store.get(SETTINGS_KEY));

  if (!record) {
    return DEFAULT_SETTINGS;
  }

  const { key: _key, ...settings } = record;
  return settings;
}

/**
 * 出題設定を保存する
 */
export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_SETTINGS, "readwrite");
  const record: SettingsRecord = { key: SETTINGS_KEY, ...settings };
  tx.objectStore(STORE_SETTINGS).put(record);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
