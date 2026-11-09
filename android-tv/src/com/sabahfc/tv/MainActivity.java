package com.sabahfc.tv;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONTokener;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final String HOME = "https://sabah-fc.pages.dev/";
    private WebView web;
    private FrameLayout root;
    private LinearLayout errorPanel;
    private ProgressBar progress;
    private View video;
    private WebChromeClient.CustomViewCallback videoCallback;
    private String remoteScript;
    private boolean pageFailed;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        root = new FrameLayout(this); root.setBackgroundColor(Color.rgb(11,33,68)); setContentView(root);
        web = new WebView(this); web.setBackgroundColor(Color.rgb(244,247,251));
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false); settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false); settings.setDisplayZoomControls(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SabahFCTV/1.1");
        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new FrameLayout.LayoutParams(-1,6));
        buildErrorPanel();
        try (InputStream in = getAssets().open("tv-remote.js"); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096]; int count;
            while ((count=in.read(buffer))!=-1) out.write(buffer,0,count);
            remoteScript = new String(out.toByteArray(),StandardCharsets.UTF_8);
        } catch (Exception e) { remoteScript = "void 0"; }
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap icon) {
                pageFailed=false; progress.setVisibility(View.VISIBLE); errorPanel.setVisibility(View.GONE);
            }
            @Override public void onPageFinished(WebView view,String url) {
                progress.setVisibility(View.GONE);
                if (!pageFailed && isPortal(Uri.parse(url))) view.evaluateJavascript(remoteScript,null);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri=request.getUrl();
                if (isPortal(uri)) return false;
                openExternal(uri); return true;
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error) {
                if (request.isForMainFrame()) showError();
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,android.webkit.WebResourceResponse response) {
                if(request.isForMainFrame() && response.getStatusCode()>=400)showError();
            }
            @Override public void onReceivedSslError(WebView view,android.webkit.SslErrorHandler handler,android.net.http.SslError error) {
                handler.cancel(); if(error.getUrl().equals(view.getUrl()))showError();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view,int value) { progress.setProgress(value); }
            @Override public void onShowCustomView(View view,CustomViewCallback callback) {
                if (video!=null) { callback.onCustomViewHidden(); return; }
                video=view; videoCallback=callback; root.addView(video,new FrameLayout.LayoutParams(-1,-1)); web.setVisibility(View.GONE);
            }
            @Override public void onHideCustomView() { hideVideo(); }
        });
        web.setFocusable(true); web.setFocusableInTouchMode(true); web.requestFocus();
        web.loadUrl(HOME);
    }
    private boolean isPortal(Uri uri) { return "https".equals(uri.getScheme()) && "sabah-fc.pages.dev".equals(uri.getHost()); }
    private void openExternal(Uri uri) {
        if (!"https".equals(uri.getScheme())) { Toast.makeText(this,"Pautan tidak disokong",Toast.LENGTH_SHORT).show(); return; }
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
        catch (ActivityNotFoundException e) { Toast.makeText(this,"Pasang aplikasi YouTube atau pelayar untuk pautan ini",Toast.LENGTH_LONG).show(); }
    }
    private void buildErrorPanel() {
        errorPanel=new LinearLayout(this);errorPanel.setOrientation(LinearLayout.VERTICAL);errorPanel.setGravity(android.view.Gravity.CENTER);errorPanel.setBackgroundColor(Color.rgb(11,33,68));
        TextView title=new TextView(this);title.setText("Sabah FC TV");title.setTextColor(Color.WHITE);title.setTextSize(30);errorPanel.addView(title);
        TextView message=new TextView(this);message.setText("Laman belum dapat dimuatkan. Semak Internet TV dan cuba semula.");message.setTextColor(Color.LTGRAY);message.setTextSize(18);message.setPadding(30,20,30,20);errorPanel.addView(message);
        Button retry=new Button(this);retry.setText("Cuba semula");retry.setOnClickListener(new View.OnClickListener(){@Override public void onClick(View v){web.setVisibility(View.VISIBLE);web.loadUrl(HOME);web.requestFocus();}});errorPanel.addView(retry);
        Button network=new Button(this);network.setText("Tetapan rangkaian");network.setOnClickListener(new View.OnClickListener(){@Override public void onClick(View v){try{startActivity(new Intent(android.provider.Settings.ACTION_WIFI_SETTINGS));}catch(ActivityNotFoundException e){startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS));}}});errorPanel.addView(network);
        root.addView(errorPanel,new FrameLayout.LayoutParams(-1,-1));errorPanel.setVisibility(View.GONE);
    }
    private void showError() { pageFailed=true;progress.setVisibility(View.GONE);errorPanel.setVisibility(View.VISIBLE);errorPanel.getChildAt(2).requestFocus(); }
    private void hideVideo() { if(video!=null){root.removeView(video);video=null;web.setVisibility(View.VISIBLE);if(videoCallback!=null){videoCallback.onCustomViewHidden();videoCallback=null;}web.requestFocus();} }
    @Override public boolean onKeyDown(int code,KeyEvent event) {
        if(video!=null || errorPanel.getVisibility()==View.VISIBLE) return super.onKeyDown(code,event);
        String direction=code==KeyEvent.KEYCODE_DPAD_UP?"up":code==KeyEvent.KEYCODE_DPAD_DOWN?"down":code==KeyEvent.KEYCODE_DPAD_LEFT?"left":code==KeyEvent.KEYCODE_DPAD_RIGHT?"right":null;
        if(direction!=null){web.evaluateJavascript("window.SabahTVRemote&&window.SabahTVRemote.move('"+direction+"')",null);return true;}
        if(code==KeyEvent.KEYCODE_DPAD_CENTER || code==KeyEvent.KEYCODE_ENTER){
            web.evaluateJavascript("window.SabahTVRemote?window.SabahTVRemote.activate():''",new android.webkit.ValueCallback<String>(){@Override public void onReceiveValue(String value){
                try {
                    Object parsed=new JSONTokener(value).nextValue();String action=parsed instanceof String?(String)parsed:"";
                    if(action.equals("keyboard")){web.requestFocus();((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(web,InputMethodManager.SHOW_IMPLICIT);}
                    else if(action.equals("select")){web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_ENTER));web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_ENTER));}
                    else if(action.startsWith("external:"))openExternal(Uri.parse(action.substring(9)));
                } catch(Exception ignored) { }
            }});return true;
        }
        return super.onKeyDown(code,event);
    }
    @Override public void onBackPressed() {
        if(video!=null){hideVideo();return;}
        if(errorPanel.getVisibility()==View.VISIBLE){finish();return;}
        web.evaluateJavascript("window.SabahTVRemote?window.SabahTVRemote.back():false",new android.webkit.ValueCallback<String>(){@Override public void onReceiveValue(String value){if(!"true".equals(value)){if(web.canGoBack())web.goBack();else finish();}}});
    }
    @Override protected void onPause(){web.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.dispatchEvent(new Event('focus'))",null);}}
    @Override protected void onDestroy(){if(web!=null){web.stopLoading();root.removeView(web);web.destroy();}super.onDestroy();}
}
