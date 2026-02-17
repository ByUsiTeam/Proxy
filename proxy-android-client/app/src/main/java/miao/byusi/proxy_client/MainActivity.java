package miao.byusi.proxy_client;

import android.Android;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
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

import com.alibaba.fastjson.JSONObject;
import com.king.app.dialog.AppDialog;
import com.king.app.dialog.AppDialogConfig;
import com.king.app.updater.AppUpdater;
import com.king.app.updater.http.OkHttpManager;
import com.tencent.smtt.export.external.interfaces.PermissionRequest;
import com.tencent.smtt.export.external.interfaces.SslError;
import com.tencent.smtt.export.external.interfaces.SslErrorHandler;
import com.tencent.smtt.export.external.interfaces.WebResourceRequest;
import com.tencent.smtt.sdk.WebChromeClient;
import com.tencent.smtt.sdk.WebSettings;
import com.tencent.smtt.sdk.WebViewClient;


import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import android.view.Menu;
import android.webkit.WebView;
import android.widget.Toast;

import miao.byusi.proxy_client.config.ConstConfig;
import miao.byusi.proxy_client.service.ProxyService;
import miao.byusi.proxy_client.service.UserService;
import miao.byusi.proxy_client.util.SharedPreferencesUtil;


import static miao.byusi.proxy_client.config.ConstConfig.URL;

public class MainActivity extends AppCompatActivity {


    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= 21) {
            getWindow().setStatusBarColor(Color.parseColor("#6273cd"));
        }
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        if (SharedPreferencesUtil.getBoolean(getApplicationContext(), ConstConfig.ABOUT, true)) {
            createAboutAlert().show();
        }
        checkUpdate();
        startWeb();
        com.tencent.smtt.sdk.WebView   webView = findViewById(R.id.webView);
        WebSettings ws = webView.getSettings();
        ws.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);//设置布局，会引起WebView的重新布局（relayout）,默认值NARROW_COLUMNS
        ws.setLoadsImagesAutomatically(true);//自动加载图片资源
        ws.setJavaScriptCanOpenWindowsAutomatically(true);
        ws.setJavaScriptEnabled(true);//执行javascript脚本
        ws.setUseWideViewPort(true);//支持HTML的“viewport”标签或者使用wide viewport
        ws.setLoadWithOverviewMode(true);//缩小内容以适应屏幕宽度
        ws.setGeolocationEnabled(true);//启用定位
        ws.setAppCacheEnabled(true);

        //设置可以支持缩放
        webView.getSettings().setSupportZoom(true);
//设置true,才能让Webivew支持<meta>标签的viewport属性
        webView.getSettings().setUseWideViewPort(true);
//设置出现缩放工具
        webView.getSettings().setBuiltInZoomControls(true);
//最小缩放等级
        webView.setInitialScale(100);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setSupportZoom(true);
        webView.getSettings().setBuiltInZoomControls(true);
        webView.getSettings().setDefaultZoom(WebSettings.ZoomDensity.FAR);
        webView.getSettings().setUseWideViewPort(true);
        webView.setPadding(0, 0, 0, 0);

        ws.setDomStorageEnabled(true);//启用DOM存储API
        ws.setDefaultTextEncodingName("utf-8");//设置编码格式
        webView.requestFocus();
        webView.canGoForward();
        webView.canGoBack();
        // 设置加载网页后，如果继续用本软件加载网页
        webView.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
        Toast.makeText(getApplicationContext(),"服务启动中请稍等",Toast.LENGTH_LONG).show();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.loadUrl("http://127.0.0.1:10240");
            }
        }, 1000);
    }

    private void startWeb() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            checkFloat();
        }
        Intent intent = new Intent(getApplicationContext(), ProxyService.class);
        getApplicationContext().startService(intent);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private void checkFloat(){
        if(!Settings.canDrawOverlays(this)){
            AppDialogConfig config = new AppDialogConfig();
            config.setTitle("Proxy-Client服务启动提示")
                    .setOk("确定")
                    .setContent("android系统机制原因、为了让服务后台保活、HP将开启悬浮权限，让它就可以长活.开启权限后请重启APP")
                    .setOnClickOk(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            //没有悬浮窗权限,跳转申请
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
                                .setHttpManager(OkHttpManager.getInstance())//不设置HttpManager时，默认使用HttpsURLConnection下载，如果使用OkHttpClient实现下载，需依赖okhttp库
                                .start();
                        AppDialog.INSTANCE.dismissDialogFragment(getSupportFragmentManager());
                    }
                });
        AppDialog.INSTANCE.showDialogFragment(getSupportFragmentManager(), config);
    }


    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_about:
                createAboutAlert().show();
                break;
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
                            update("当前版本：" + getAppVersionCode(getApplicationContext()) + "\n最新版本：" + versionCode + "\n" + jsonObject.getString("updateContent"));
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
