import threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
s=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=str(ROOT)));threading.Thread(target=s.serve_forever,daemon=True).start()
script=(ROOT/'android-tv/assets/tv-remote.js').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1920,'height':1080});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.route('https://www.youtube-nocookie.com/**',lambda r:r.fulfill(status=200,body=''))
 page.goto('http://127.0.0.1:'+str(s.server_port),wait_until='domcontentloaded');page.locator('header [data-page=home]').wait_for()
 assert page.locator('#app>header').is_visible() # Regular website remains unchanged.
 page.evaluate(script)
 assert page.locator('.tv-focused').count()==1;assert not page.locator('#app>header').is_visible()
 tabs=['home','matches','standing','stats','players','about','admin']
 assert page.locator('.tv-menu button').count()==len(tabs)
 assert page.locator('.tv-focused').get_attribute('data-tv-page')=='home'
 page.evaluate("window.SabahTVRemote.move('down')");assert page.locator('.tv-focused').get_attribute('data-tv-page')=='matches';page.evaluate('window.SabahTVRemote.activate()');page.locator('.match-centre').wait_for()
 assert page.locator('.tv-menu [aria-current=page]').get_attribute('data-tv-page')=='matches'
 page.evaluate("window.SabahTVRemote.move('right')");assert page.locator('#app>main .tv-focused').count()==1
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('[data-open-match]'));window.SabahTVRemote.activate()");page.locator('.match-detail').wait_for()
 assert page.locator('.tv-menu [aria-current=page]').get_attribute('data-tv-page')=='matches'
 assert page.evaluate('window.SabahTVRemote.back()') is True;page.locator('.match-centre').wait_for()
 page.evaluate('window.SabahTVRemote.back()');page.evaluate('window.SabahTVRemote.back()');assert page.locator('.club-home').is_visible()
 for tab in tabs:
  page.locator('[data-tv-page='+tab+']').click();page.wait_for_timeout(70)
  assert page.locator('.tv-menu [aria-current=page]').get_attribute('data-tv-page')==tab
  assert page.locator('.tv-sidebar').count()==1
 page.locator('[data-tv-page=players]').click();page.locator('.squad-page').wait_for()
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('[data-tv-page=players]'));window.SabahTVRemote.move('right')");assert page.locator('.tv-focused').get_attribute('id')=='squadSearch'
 assert page.evaluate('window.SabahTVRemote.activate()')=='keyboard'
 page.evaluate("window.SabahTVRemote.move('left')");assert page.locator('.tv-focused').get_attribute('data-tv-page')=='players'
 # Replaced web content preserves sidebar focus; detail Back controls remain reachable.
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('[data-player-number]'));window.SabahTVRemote.activate()");page.locator('.squad-profile').wait_for()
 assert page.locator('.tv-menu [aria-current=page]').get_attribute('data-tv-page')=='players'
 page.screenshot(path='/tmp/sabah-tv-profile.png',full_page=True)
 assert page.evaluate('window.SabahTVRemote.back()') is True;page.locator('.squad-page').wait_for()
 # Android handles native selectors/keyboard, and YouTube playback is handed off externally.
 page.evaluate("document.body.insertAdjacentHTML('beforeend','<select id=tvTestSelect><option>A</option><option>B</option></select>');window.SabahTVRemote.focus(document.getElementById('tvTestSelect'))");assert page.evaluate('window.SabahTVRemote.activate()')=='select'
 page.evaluate("const frame=document.createElement('iframe');frame.id='tvFrame';frame.src='https://www.youtube-nocookie.com/embed/omGVkNQH4Hs';document.body.appendChild(frame);window.SabahTVRemote.focus(frame)");assert page.evaluate('window.SabahTVRemote.activate()')=='external:https://www.youtube.com/watch?v=omGVkNQH4Hs'
 # Modal navigation cannot escape into the sidebar.
 page.evaluate("document.body.insertAdjacentHTML('beforeend','<dialog id=tvDialog><button>Close</button></dialog>');document.getElementById('tvDialog').showModal()")
 page.evaluate("window.SabahTVRemote.move('left')");assert page.locator('#tvDialog .tv-focused').count()==1
 assert page.evaluate('window.SabahTVRemote.back()') is True
 page.locator('#tvTestSelect').evaluate('(e)=>e.remove()');page.locator('#tvFrame').evaluate('(e)=>e.remove()');page.locator('#tvDialog').evaluate('(e)=>e.remove()')
 for w,h in [(1920,1080),(1280,720),(960,540)]:
  page.set_viewport_size({'width':w,'height':h})
  for tab in tabs:
   page.locator('[data-tv-page='+tab+']').click();page.wait_for_timeout(50)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(w,tab,'overflow')
   if tab=='home':
    assert page.locator('.schedule-club strong').first.evaluate("e=>getComputedStyle(e).color")=='rgb(238, 240, 246)'
   if tab=='standing':
    assert page.locator('.standing-table th').first.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgb(41, 44, 53)'
   if w==1920:page.screenshot(path='/tmp/sabah-tv-'+tab+'.png')
   assert page.locator('.tv-sidebar').bounding_box()['x']==0
   assert page.locator('#app>main').bounding_box()['x']>=page.locator('.tv-sidebar').bounding_box()['width']
   assert page.locator('[data-tv-page=admin]').bounding_box()['y']+page.locator('[data-tv-page=admin]').bounding_box()['height']<h
 page.set_viewport_size({'width':1920,'height':1080});page.locator('[data-tv-page=players]').click();page.screenshot(path='/tmp/sabah-tv-preview.png')
 # Native onPageFinished can inject before the async portal has rendered its header.
 early=b.new_page(viewport={'width':1280,'height':720});early.on('pageerror',lambda e:errors.append(str(e)))
 early.add_init_script("document.addEventListener('DOMContentLoaded',()=>{"+script+"});")
 early.goto('http://127.0.0.1:'+str(s.server_port),wait_until='domcontentloaded')
 early.locator('.tv-menu [data-tv-page=players]').wait_for();assert early.locator('.tv-menu button').count()==7
 early.locator('[data-tv-page=players]').click();early.locator('.squad-page').wait_for();early.close()
 assert not errors,errors
 print('PASS: all 7 sidebar tabs, active state, D-pad sidebar/content navigation, modal focus, match/player Back, keyboard/select handling, YouTube handoff, and all-page 1080p/720p/540p layout');b.close()
s.shutdown()
