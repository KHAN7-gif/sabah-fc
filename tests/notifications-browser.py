"""Browser regression: actual UI/service-worker registration, mocked push subscription transport."""
import threading,json,base64
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
base='http://127.0.0.1:'+str(server.server_port)
public_key=base64.urlsafe_b64encode(bytes([4])+bytes(range(64))).decode().rstrip('=')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':393,'height':852},permissions=['notifications']);page=context.new_page();errors=[];requests=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.add_init_script("""window.__permissionRequests=0;window.__subscriptions=0;window.__sub=null;
 Notification.requestPermission=async()=>{window.__permissionRequests++;return 'granted'};
 PushManager.prototype.getSubscription=async()=>window.__sub;
 PushManager.prototype.subscribe=async()=>{window.__subscriptions++;window.__sub={endpoint:'https://fcm.googleapis.com/fcm/send/test',keys:{p256dh:'test-key',auth:'test-auth'},toJSON(){return {endpoint:this.endpoint,keys:this.keys}},async unsubscribe(){window.__sub=null;return true}};return window.__sub};""")
 def api(route):
  requests.append((route.request.method,route.request.url))
  if route.request.url.endswith('/config'):route.fulfill(status=200,content_type='application/json',body=json.dumps({'available':True,'publicKey':public_key}))
  else:route.fulfill(status=200,content_type='application/json',body='{"subscribed":true}')
 page.route('**/api/notifications/**',api);page.route('https://www.youtube-nocookie.com/**',lambda route:route.fulfill(body=''))
 page.goto(base,wait_until='domcontentloaded');page.locator('[data-notifications-open]').wait_for();assert page.evaluate('window.__permissionRequests')==0
 page.locator('[data-notifications-open]').click();page.locator('[data-notification-enable]:enabled').wait_for();assert page.evaluate('window.__permissionRequests')==0
 page.locator('[data-notification-enable]').click();page.locator('[data-notification-disable]').wait_for(state='visible');assert page.evaluate('window.__permissionRequests')==1;assert page.evaluate('window.__subscriptions')==1
 page.screenshot(path='/tmp/sabah-kickoff-notifications-mobile.png')
 page.locator('.notification-close').click();page.locator('.mobile-bottom-nav [data-page=matches]').click();page.locator('[data-notifications-open]').click();page.locator('[data-notification-status]').filter(has_text='aktif pada telefon').wait_for()
 page.locator('[data-notification-disable]').click();page.locator('[data-notification-status]').filter(has_text='dimatikan').wait_for();assert any(method=='DELETE' for method,url in requests)
 page.locator('.notification-close').click()
 for width,height in [(320,740),(393,852),(820,1180),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert page.locator('[data-notifications-open]').is_visible()
 page.goto(base+'/?match=ref%3A6',wait_until='domcontentloaded');page.locator('.match-detail').wait_for();assert 'Kelantan' in page.locator('.match-detail').inner_text()
 # A missing Cloudflare binding is shown honestly; no permission prompt occurs.
 missing=context.new_page();missing.route('**/api/notifications/config',lambda route:route.fulfill(status=503,content_type='application/json',body='{"available":false,"error":"Servis notifikasi belum diaktifkan oleh admin."}'))
 missing.goto(base,wait_until='domcontentloaded');missing.locator('[data-notifications-open]').click();missing.locator('[data-notification-status]').filter(has_text='belum diaktifkan').wait_for();assert missing.locator('[data-notification-enable]').is_disabled()
 # iPhone browser mode explains installation rather than offering a broken permission action.
 ios=browser.new_context(viewport={'width':393,'height':852},user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1');iphone=ios.new_page();iphone.goto(base,wait_until='domcontentloaded');iphone.locator('[data-notifications-open]').click();iphone.locator('[data-notification-status]').filter(has_text='Tambah ke Skrin Utama').wait_for();assert iphone.locator('[data-notification-enable]').is_disabled()
 assert not errors,errors
 print('PASS: explicit opt-in, real service-worker registration, subscribe/unsubscribe, dialog across rerenders, mobile/tablet/desktop layout, match deep link, missing backend and iPhone install guidance');browser.close()
server.shutdown()
