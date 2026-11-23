"""Turnstile UI recovery with mocked challenges; does not bypass live verification."""
import os
from pathlib import Path
os.chdir(Path(__file__).resolve().parents[1])
import threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),Q);threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [393,1440]:
  page=b.new_page(viewport={'width':width,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://**',lambda r:r.abort())
  page.route('**/api/admin/session',lambda r:r.fulfill(status=200 if r.request.method=='GET' else 401,json={'authenticated':False,'turnstileSiteKey':'test-only-site-key'}))
  attempts=[0]
  def script(route):
   attempts[0]+=1
   if attempts[0]==1: route.abort();return
   route.fulfill(content_type='application/javascript',body="window.turnstile={render:(target,options)=>{window.testTurnstile=options;return 'mock-widget'},reset:()=>{window.testResets=(window.testResets||0)+1},remove:()=>{}}")
  page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',script)
  page.goto(f'http://127.0.0.1:{srv.server_port}',wait_until='networkidle')
  page.locator('.header-menu [data-page="admin"]').evaluate('(e)=>e.click()')
  retry=page.locator('[data-admin-retry]');retry.wait_for(state='visible')
  submit=page.locator('#adminLoginForm [type=submit]');assert submit.is_disabled()
  page.locator('#adminLoginEmail').fill('test@example.com');page.locator('#adminLoginPassword').fill('mock-password')
  retry.click();page.wait_for_function('window.testTurnstile')
  assert page.locator('#adminLoginEmail').input_value()=='test@example.com'
  page.evaluate("window.testTurnstile.callback('mock-token')");assert submit.is_enabled()
  page.evaluate('window.testTurnstile["expired-callback"]()');assert submit.is_disabled();assert retry.is_visible()
  retry.click();assert page.evaluate('window.testResets')==1
  page.evaluate("window.testTurnstile.callback('new-mock-token')")
  submit.click();retry.wait_for(state='visible');assert submit.is_disabled()
  assert page.locator('#adminLoginPassword').input_value()==''
  assert page.locator('#adminLoginEmail').input_value()=='test@example.com'
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  print(f'{width}px: loader retry, token expiry, failed login and disabled submit verified with mocked Turnstile')
  page.close()
 b.close()
srv.shutdown()
