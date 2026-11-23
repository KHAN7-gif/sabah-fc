"""Local editing, export and reload without a backend or verification service."""
import os,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
os.chdir(Path(__file__).resolve().parents[1])
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=ThreadingHTTPServer(('127.0.0.1',0),Q);threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':393,'height':900});errors=[];api=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:api.append(r.url) if '/api/' in r.url else None)
 page.route('https://**',lambda r:r.abort())
 page.goto(f'http://127.0.0.1:{srv.server_port}',wait_until='networkidle')
 page.locator('.header-menu [data-page="admin"]').evaluate('(e)=>e.click()')
 assert page.locator('.local-editor-intro').is_visible()
 page.locator('[data-admin-demo]').click()
 if 'OFF' in page.locator('[data-toggle-admin]').inner_text():page.locator('[data-toggle-admin]').click()
 page.locator('#opponentForm [name=opponent]').fill('Local Test Team')
 page.locator('#opponentForm button').click()
 assert 'Local Test Team' in page.locator('.opponent-grid').inner_text()
 with page.expect_download() as event:page.locator('[data-export-current]').click()
 assert event.value.suggested_filename=='sabah-fc-data.json'
 assert 'Local Test Team' in Path(event.value.path()).read_text()
 page.reload(wait_until='networkidle')
 page.locator('.header-menu [data-page="admin"]').evaluate('(e)=>e.click()');page.locator('[data-admin-demo]').click()
 assert 'Local Test Team' in page.locator('.opponent-grid').inner_text()
 assert page.locator('#adminLoginForm').count()==0
 assert not api,api
 assert not errors,errors
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 print('Local editor: save, JSON export, reload recovery and no backend API requests passed')
 b.close()
srv.shutdown()
