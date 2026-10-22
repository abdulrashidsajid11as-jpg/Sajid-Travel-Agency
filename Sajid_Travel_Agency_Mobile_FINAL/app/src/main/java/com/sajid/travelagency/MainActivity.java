package com.sajid.travelagency;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.content.ContentValues;
import android.widget.Toast;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
  private static final int PICK_BACKUP_FILE = 4101;
  private static final int SAVE_BACKUP_FILE = 4102;
  private ValueCallback<Uri[]> filePathCallback;
  private String pendingBackupJson;
  private String pendingFileMime = "application/json";
  private String pendingFileName = "sajid-travel-backup.json";
  private WebView web;
  private SQLiteDatabase appDb;

  @Override public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    appDb = openOrCreateDatabase("sajid_travel_mobile.db", MODE_PRIVATE, null);
    appDb.execSQL("CREATE TABLE IF NOT EXISTS app_storage (storage_key TEXT PRIMARY KEY, storage_value TEXT NOT NULL)");
    web = new WebView(this);
    WebSettings settings = web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(true);
    web.addJavascriptInterface(new BackupBridge(), "AndroidBridge");
    web.addJavascriptInterface(new StorageBridge(), "NativeStorage");
    web.setWebViewClient(new WebViewClient());
    web.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (filePathCallback != null) filePathCallback.onReceiveValue(null);
        filePathCallback = callback;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        try { startActivityForResult(intent, PICK_BACKUP_FILE); }
        catch (Exception e) { filePathCallback = null; callback.onReceiveValue(null); Toast.makeText(MainActivity.this, "Backup file picker unavailable", Toast.LENGTH_LONG).show(); }
        return true;
      }
    });
    setContentView(web);
    if (savedInstanceState == null) web.loadUrl("file:///android_asset/index.html");
    else web.restoreState(savedInstanceState);
  }


  private class StorageBridge {
    @JavascriptInterface public String getItem(String key) {
      try (Cursor c = appDb.rawQuery("SELECT storage_value FROM app_storage WHERE storage_key=?", new String[]{key})) {
        return c.moveToFirst() ? c.getString(0) : null;
      } catch (Exception e) { return null; }
    }
    @JavascriptInterface public boolean setItem(String key, String value) {
      if (key == null || value == null) return false;
      try { ContentValues cv = new ContentValues(); cv.put("storage_key", key); cv.put("storage_value", value); return appDb.insertWithOnConflict("app_storage", null, cv, SQLiteDatabase.CONFLICT_REPLACE) != -1; } catch (Exception ignored) { return false; }
    }
    @JavascriptInterface public boolean removeItem(String key) { try { return appDb.delete("app_storage", "storage_key=?", new String[]{key}) >= 0; } catch (Exception ignored) { return false; } }
  }

  private class BackupBridge {
    @JavascriptInterface public void saveBackup(String json) {
      saveTextFile(json, "sajid-travel-backup.json", "application/json");
    }
    @JavascriptInterface public void saveTextFile(String content, String filename, String mimeType) {
      if (content == null) content = "";
      pendingBackupJson = content;
      pendingFileMime = (mimeType == null || mimeType.trim().isEmpty()) ? "text/plain" : mimeType;
      pendingFileName = (filename == null || filename.trim().isEmpty()) ? "sajid-travel-export.txt" : filename.replaceAll("[/\\\\:*?\"<>|]", "_");
      runOnUiThread(() -> {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(pendingFileMime);
        intent.putExtra(Intent.EXTRA_TITLE, pendingFileName);
        try { startActivityForResult(intent, SAVE_BACKUP_FILE); }
        catch (Exception e) { Toast.makeText(MainActivity.this, "فایل نه شو خوندي کېدای / Could not open file save", Toast.LENGTH_LONG).show(); }
      });
    }
  }

  @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == PICK_BACKUP_FILE && filePathCallback != null) {
      Uri[] results = (resultCode == RESULT_OK && data != null && data.getData() != null) ? new Uri[]{data.getData()} : null;
      filePathCallback.onReceiveValue(results); filePathCallback = null;
    } else if (requestCode == SAVE_BACKUP_FILE && resultCode == RESULT_OK && data != null && data.getData() != null) {
      try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
        if (out == null) throw new IllegalStateException("No output stream");
        out.write((pendingBackupJson == null ? "{}" : pendingBackupJson).getBytes(StandardCharsets.UTF_8));
        Toast.makeText(this, "فایل خوندي شو / File saved successfully", Toast.LENGTH_LONG).show();
      } catch (Exception e) { Toast.makeText(this, "فایل خوندي نه شو / File save failed", Toast.LENGTH_LONG).show(); }
      pendingBackupJson = null;
      pendingFileMime = "application/json";
      pendingFileName = "sajid-travel-backup.json";
    }
  }

  @Override protected void onSaveInstanceState(Bundle outState) { super.onSaveInstanceState(outState); if (web != null) web.saveState(outState); }
  @Override public void onBackPressed() { if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
