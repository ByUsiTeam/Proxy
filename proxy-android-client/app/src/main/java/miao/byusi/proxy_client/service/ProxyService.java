package miao.byusi.proxy_client.service;


import android.Android;
import android.annotation.SuppressLint;
import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Toast;


import miao.byusi.proxy_client.R;
import miao.byusi.proxy_client.util.SharedPreferencesUtil;

import java.util.UUID;


public class ProxyService extends Service {

    //定义浮动窗口布局
    LinearLayout mFloatLayout;
    WindowManager.LayoutParams wmParams;
    //创建浮动窗口设置布局参数的对象
    WindowManager mWindowManager;

    ImageView mFloatView;

    private boolean longClick=false;

    private void openToast() {
        mFloatView.setImageResource(R.drawable.run);
    }


    @SuppressLint({"ClickableViewAccessibility", "RtlHardcoded"})
    private void createFloatView() {
        wmParams = new WindowManager.LayoutParams();
        //获取WindowManagerImpl.CompatModeWrapper
        mWindowManager = (WindowManager) getApplication().getSystemService(WINDOW_SERVICE);
        //设置window type
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            wmParams.type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            wmParams.type = WindowManager.LayoutParams.TYPE_SYSTEM_ALERT;
        }
        //设置图片格式，效果为背景透明
        wmParams.format = PixelFormat.RGBA_8888;
        //设置浮动窗口不可聚焦（实现操作除浮动窗口外的其他可见窗口的操作）
        wmParams.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
        //调整悬浮窗显示的停靠位置为左侧置顶
        wmParams.gravity = Gravity.LEFT | Gravity.TOP;
        wmParams.x = 0;
        wmParams.y = 200;
        //设置悬浮窗口长宽数据
        wmParams.width = WindowManager.LayoutParams.WRAP_CONTENT;
        wmParams.height = WindowManager.LayoutParams.WRAP_CONTENT;
//        wmParams.format = PixelFormat.TRANSPARENT;
        //获取浮动窗口视图所在布局
        mFloatLayout = (LinearLayout) LayoutInflater.from(getApplication()).inflate(R.layout.open, null);
        //添加mFloatLayout
        try {
            mWindowManager.addView(mFloatLayout, wmParams);
        } catch (Throwable e) {
            e.printStackTrace();
        }
        //浮动窗口按钮
        mFloatView = mFloatLayout.findViewById(R.id.float_id);
        mFloatLayout.measure(View.MeasureSpec.makeMeasureSpec(0,
                View.MeasureSpec.UNSPECIFIED), View.MeasureSpec
                .makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
        //设置监听浮动窗口的触摸移动
        mFloatView.setOnTouchListener((v, event) -> {
            if (longClick) {
                //getRawX是触摸位置相对于屏幕的坐标，getX是相对于按钮的坐标
                wmParams.x = (int) event.getRawX() - mFloatView.getMeasuredWidth() / 2;
                //25为状态栏的高度
                wmParams.y = (int) event.getRawY() - mFloatView.getMeasuredHeight() / 2 - getStatusBarHeight();
                //刷新
                mWindowManager.updateViewLayout(mFloatLayout, wmParams);
            }
            return false;
        });
        mFloatView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View view) {
                Toast.makeText(getApplicationContext(), "你可以移动了", Toast.LENGTH_SHORT).show();
                longClick = true;
                return false;
            }
        });
        mFloatView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                longClick=false;
                Toast.makeText(getApplicationContext(), "Proxy服务10240已经启动....", Toast.LENGTH_SHORT).show();
            }
        });

    }

    public int getStatusBarHeight() {
        int result = 0;
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }


    @Override
    public void onCreate() {
        Log.i("Kathy", "onCreate - Thread ID = " + Thread.currentThread().getId());
        super.onCreate();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            createFloatView();
            String device_id = SharedPreferencesUtil.getString(getApplicationContext(), "DEVICE_ID", UUID.randomUUID().toString().replace("-", ""));
            SharedPreferencesUtil.putString(getApplicationContext(),"DEVICE_ID",device_id);
            new Thread(()->{
                Android.start("https://pro.cdifit.cn",10240L,"15.0", device_id);
            }).start();
        } catch (Throwable e) {
        }
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }


    @Override
    public void onDestroy() {

        if (mFloatLayout != null) {
            mWindowManager.removeView(mFloatLayout);
        }
        super.onDestroy();
    }

}