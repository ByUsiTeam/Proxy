package miao.byusi.proxy_client;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;

import com.alibaba.fastjson.JSON;

import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.alibaba.fastjson.JSONObject;
import com.king.app.dialog.AppDialog;
import com.king.app.dialog.AppDialogConfig;
import com.king.app.updater.AppUpdater;
import com.king.app.updater.http.OkHttpManager;
import com.tencent.smtt.export.external.interfaces.PermissionRequest;
import com.tencent.smtt.export.external.interfaces.SslError;
import com.tencent.smtt.export.external.interfaces.SslErrorHandler;
import com.tencent.smtt.sdk.WebChromeClient;
import com.tencent.smtt.sdk.WebSettings;
import com.tencent.smtt.sdk.WebViewClient;

import android.view.Menu;
import android.widget.Toast;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

import miao.byusi.proxy_client.config.ConstConfig;
import miao.byusi.proxy_client.service.ProxyService;
import miao.byusi.proxy_client.service.UserService;
import miao.byusi.proxy_client.util.SharedPreferencesUtil;

import static miao.byusi.proxy_client.config.ConstConfig.URL;

public class MainActivity extends AppCompatActivity {

    private com.tencent.smtt.sdk.WebView webView;
    private static final int LOCAL_PORT = 10240;
    private static final int SERVICE_START_DELAY = 2000;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= 21) {
            getWindow().setStatusBarColor(Color.parseColor("#6273cd"));
        }
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        // 检查网络连接
        if (!isNetworkConnected()) {
            showNetworkErrorDialog();
            return;
        }

        // 显示关于对话框（如果需要）
        if (SharedPreferencesUtil.getBoolean(getApplicationContext(), ConstConfig.ABOUT, true)) {
            createAboutAlert().show();
        }

        // 初始化 WebView
        initWebView();

        // 检查更新
        checkUpdate();

        // 启动服务并加载页面
        startWebAndLoadPage();
    }

    /**
     * 初始化 WebView 设置
     */
    @SuppressLint("SetJavaScriptEnabled")
    private void initWebView() {
        webView = findViewById(R.id.webView);
        WebSettings ws = webView.getSettings();

        // 基础设置
        ws.setJavaScriptEnabled(true);
        ws.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        ws.setLoadsImagesAutomatically(true);
        ws.setJavaScriptCanOpenWindowsAutomatically(true);
        ws.setUseWideViewPort(true);
        ws.setLoadWithOverviewMode(true);
        ws.setGeolocationEnabled(true);
        ws.setAppCacheEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDefaultTextEncodingName("utf-8");

        // 缩放设置
        ws.setSupportZoom(true);
        ws.setBuiltInZoomControls(true);
        ws.setDisplayZoomControls(false); // 隐藏缩放控件

        // 混合内容设置（解决 HTTPS 页面加载 HTTP 资源的问题）
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ws.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setInitialScale(100);
        webView.requestFocus();

        // 设置 WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(com.tencent.smtt.sdk.WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedSslError(com.tencent.smtt.sdk.WebView view, SslErrorHandler handler, SslError error) {
                // 处理 SSL 错误（开发环境可以接受所有证书）
                handler.proceed();
            }

            @Override
            public void onPageFinished(com.tencent.smtt.sdk.WebView view, String url) {
                super.onPageFinished(view, url);
                // 页面加载完成后的处理
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, "页面加载完成", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });

        // 设置 WebChromeClient
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // 自动授予权限
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });
    }

    /**
     * 启动服务并加载页面
     */
    private void startWebAndLoadPage() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkFloat();
        }

        // 启动服务
        Intent intent = new Intent(getApplicationContext(), ProxyService.class);
        getApplicationContext().startService(intent);

        // 显示启动提示
        Toast.makeText(getApplicationContext(), "服务启动中，请稍候...", Toast.LENGTH_LONG).show();

        // 延迟加载 WebView，等待服务完全启动
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                loadLocalWebPage();
            }
        }, SERVICE_START_DELAY);
    }

    /**
     * 加载本地 Web 页面
     */
    private void loadLocalWebPage() {
        String localIp = getLocalIpAddress();
        if (localIp.equals("0.0.0.0")) {
            if (isEmulator()) {
                localIp = "127.0.0.1";
            }
        }

        final String url = "http://" + localIp + ":" + LOCAL_PORT;
        android.util.Log.d("MainActivity", "Loading URL: " + url);

        // 先用 OkHttp 测试连接
        testConnectionWithOkHttp(localIp, new ConnectionCallback() {
            @Override
            public void onSuccess() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        webView.loadUrl(url);
                    }
                });
            }

            @Override
            public void onFailure(String error) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, 
                            "服务连接失败，请检查服务是否已启动: " + error, 
                            Toast.LENGTH_LONG).show();
                        // 仍然尝试加载，可能 WebView 有不同的网络策略
                        webView.loadUrl(url);
                    }
                });
            }
        });
    }

    /**
     * 获取设备的局域网 IP 地址
     */
    private String getLocalIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
                 en.hasMoreElements();) {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses();
                     enumIpAddr.hasMoreElements();) {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress() && inetAddress instanceof Inet4Address) {
                        return inetAddress.getHostAddress();
                    }
                }
            }
        } catch (SocketException ex) {
            ex.printStackTrace();
        }
        return "127.0.0.1"; // 降级方案
    }

    /**
     * 检查是否为模拟器
     */
    private boolean isEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk".equals(Build.PRODUCT);
    }

    /**
     * 连接回调接口
     */
    private interface ConnectionCallback {
        void onSuccess();
        void onFailure(String error);
    }

    /**
     * 用 OkHttp 测试本地服务连接
     */
    private void testConnectionWithOkHttp(String ip, ConnectionCallback callback) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                okhttp3.OkHttpClient client = null;
                okhttp3.Response response = null;
                try {
                    client = new okhttp3.OkHttpClient.Builder()
                            .connectTimeout(3, java.util.concurrent.TimeUnit.SECONDS)
                            .build();

                    okhttp3.Request request = new okhttp3.Request.Builder()
                            .url("http://" + ip + ":" + LOCAL_PORT)
                            .head() // 使用 HEAD 请求减少数据传输
                            .build();

                    response = client.newCall(request).execute();
                    if (response.isSuccessful()) {
                        callback.onSuccess();
                    } else {
                        callback.onFailure("HTTP " + response.code());
                    }
                } catch (java.net.ConnectException e) {
                    callback.onFailure("连接被拒绝，请确保服务已启动");
                } catch (java.net.SocketTimeoutException e) {
                    callback.onFailure("连接超时");
                } catch (Exception e) {
                    callback.onFailure(e.getMessage());
                } finally {
                    if (response != null) {
                        response.close();
                    }
                }
            }
        }).start();
    }

    /**
     * 检查网络连接
     */
    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    /**
     * 显示网络错误对话框
     */
    private void showNetworkErrorDialog() {
        new AlertDialog.Builder(this)
                .setTitle("网络错误")
                .setMessage("请检查网络连接后重试")
                .setPositiveButton("确定", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        finish();
                    }
                })
                .setCancelable(false)
                .show();
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private void checkFloat() {
        if (!Settings.canDrawOverlays(this)) {
            AppDialogConfig config = new AppDialogConfig();
            config.setTitle("Proxy-Client服务启动提示")
                    .setOk("确定")
                    .setContent("Android系统机制原因，为了让服务后台保活，需要开启悬浮窗权限。开启权限后请重启APP")
                    .setOnClickOk(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            // 没有悬浮窗权限，跳转申请
                            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                            startActivity(intent);
                            AppDialog.INSTANCE.dismissDialogFragment(getSupportFragmentManager());
                        }
                    });
            AppDialog.INSTANCE.showDialogFragment(getSupportFragmentManager(), config);
        }
    }

    private void checkUpdate() {
        new UserService().getVersion(new VersionHandler());
    }

    private void update(String content) {
        AppDialogConfig config = new AppDialogConfig();
        config.setTitle("Proxy-Client更新提示")
                .setOk("升级")
                .setContent(content)
                .setOnClickOk(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        new AppUpdater.Builder()
                                .serUrl(URL + "/app/download")
                                .setFilename("Proxy-Client" + System.currentTimeMillis() + ".apk")
                                .build(getApplicationContext())
                                .setHttpManager(OkHttpManager.getInstance())
                                .start();
                        AppDialog.INSTANCE.dismissDialogFragment(getSupportFragmentManager());
                    }
                });
        AppDialog.INSTANCE.showDialogFragment(getSupportFragmentManager(), config);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_about) {
            createAboutAlert().show();
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    public AlertDialog createAboutAlert() {
        LayoutInflater factory = LayoutInflater.from(this);
        final View view = factory.inflate(R.layout.about, null);
        return new AlertDialog.Builder(MainActivity.this)
                .setIcon(R.mipmap.ic_launcher)
                .setTitle("关于")
                .setView(view)
                .setNegativeButton("好的，我知道了", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int whichButton) {
                        SharedPreferencesUtil.putBoolean(getApplicationContext(), ConstConfig.ABOUT, false);
                    }
                })
                .create();
    }

    /**
     * 处理返回键，支持 WebView 后退
     */
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    class RegHandler extends Handler {
        private AlertDialog alertDialog;

        public RegHandler(AlertDialog alertDialog) {
            this.alertDialog = alertDialog;
        }

        @Override
        public void handleMessage(@NonNull Message msg) {
            if (msg.what == 1) {
                Toast.makeText(MainActivity.this, msg.obj.toString(), Toast.LENGTH_SHORT).show();
                alertDialog.dismiss();
            } else if (msg.what == -1) {
                Toast.makeText(getApplicationContext(), msg.obj.toString(), Toast.LENGTH_LONG).show();
            }
        }
    }

    class VersionHandler extends Handler {
        private String getAppVersionCode(Context context) {
            try {
                PackageManager pm = context.getPackageManager();
                PackageInfo pi = pm.getPackageInfo(context.getPackageName(), 0);
                return pi.versionName;
            } catch (Exception ignored) {
            }
            return null;
        }

        @Override
        public void handleMessage(@NonNull Message msg) {
            if (msg.what == 1) {
                try {
                    Object obj = msg.obj;
                    if (obj != null) {
                        JSONObject jsonObject = JSON.parseObject(obj.toString());
                        String versionCode = jsonObject.getString("versionCode");
                        if (!versionCode.trim().equals(getAppVersionCode(getApplicationContext()).trim())) {
                            update("当前版本：" + getAppVersionCode(getApplicationContext()) + 
                                   "\n最新版本：" + versionCode + 
                                   "\n" + jsonObject.getString("updateContent"));
                        }
                    }
                } catch (Throwable e) {
                    Toast.makeText(getApplicationContext(), "检查更新失败", Toast.LENGTH_LONG).show();
                }
            } else if (msg.what == -1) {
                Toast.makeText(getApplicationContext(), msg.obj.toString(), Toast.LENGTH_LONG).show();
            }
        }
    }
}