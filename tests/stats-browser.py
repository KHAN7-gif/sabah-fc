"""Stats search, source links, partial durations and responsive layout."""
import os
from pathlib import Path
os.chdir(Path(__file__).resolve().parents[1])
import threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [393,820,1440]:
  page=b.new_page(viewport={'width':width,'height':900});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.route('https://**',lambda r:r.abort())
  page.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
  page.locator('.header-menu [data-page="stats"]').evaluate('(e)=>e.click()')
  page.locator('[data-stats-category="minutes"]').click()
  search=page.locator('#statsPlayerSearch');search.fill('dominic')
  assert page.locator('[data-stats-search]:visible').count()==1
  assert page.locator('.stats-leader-score b').inner_text()=='798'
  assert page.locator('#statsPlayerSearch').evaluate('(e)=>e===document.activeElement')
  search.fill('no-such-player');assert page.locator('[data-stats-search]:visible').count()==0
  assert 'Tiada pemain' in page.locator('[data-stats-search-status]').inner_text()
  search.fill('farhan');page.locator('[data-stats-competition="fa"]').click()
  assert page.locator('#statsPlayerSearch').input_value()=='farhan'
  assert page.locator('[data-stats-search]:visible .stats-pending').count()==1
  page.locator('.stats-method summary').click();assert page.locator('.stats-method p').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  search.fill('');page.locator('[data-stats-category="ga"]').click();page.locator('#statsPlayerSearch').fill('park')
  assert page.locator('[data-stats-search]:visible').count()==1
  page.locator('[data-stats-category="minutes"]').click();page.locator('#statsPlayerSearch').fill('dominic')
  page.locator('[data-stats-search]:visible').click();page.locator('#profile-minutes-tab').click();page.locator('[data-minutes-competition="fa"]').click()
  assert page.locator('.minutes-source').count()==2
  assert page.locator('.minutes-source').first.get_attribute('rel')=='noopener noreferrer'
  assert not errors,errors
  print(f'{width}px: search, no results, retained filters, pending label, source links and layout passed')
  page.close()
 b.close()
server.shutdown()
