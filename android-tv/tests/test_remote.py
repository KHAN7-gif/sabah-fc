import threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
class Q(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
s=ThreadingHTTPServer(('127.0.0.1',8000),partial(Q,directory=str(ROOT)));threading.Thread(target=s.serve_forever,daemon=True).start()
script=(ROOT/'android-tv/assets/tv-remote.js').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1920,'height':1080});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.route('https://www.youtube-nocookie.com/**',lambda r:r.fulfill(status=200,body=''))
 page.goto('http://127.0.0.1:8000',wait_until='domcontentloaded');page.locator('header [data-page=home]').wait_for();page.evaluate(script)
 assert page.locator('.tv-focused').count()==1;assert not page.locator('header [data-page=admin]').is_visible()
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('header [data-page=home]'));window.SabahTVRemote.move('right')");assert page.locator('.tv-focused').get_attribute('data-page')=='matches';page.evaluate('window.SabahTVRemote.activate()');page.locator('.match-centre').wait_for()
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('[data-open-match]'));window.SabahTVRemote.activate()");page.locator('.match-detail').wait_for();assert page.evaluate('window.SabahTVRemote.back()') is True;page.locator('.match-centre').wait_for();assert page.evaluate('window.SabahTVRemote.back()') is True;assert page.locator('.club-home').is_visible()
 page.evaluate("window.SabahTVRemote.focus(document.querySelector('header [data-page=players]'));window.SabahTVRemote.activate()");page.locator('.squad-page').wait_for();page.evaluate("window.SabahTVRemote.focus(document.getElementById('squadSearch'))");assert page.evaluate('window.SabahTVRemote.activate()')=='keyboard'
 # TV-native OK hands select and YouTube playback to Android rather than relying on cross-origin synthetic input.
 page.evaluate("document.body.insertAdjacentHTML('beforeend','<select id=tvTestSelect><option>A</option><option>B</option></select>');window.SabahTVRemote.focus(document.getElementById('tvTestSelect'))");assert page.evaluate('window.SabahTVRemote.activate()')=='select'
 page.evaluate("const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/omGVkNQH4Hs';document.body.appendChild(frame);window.SabahTVRemote.focus(frame)");assert page.evaluate('window.SabahTVRemote.activate()')=='external:https://www.youtube.com/watch?v=omGVkNQH4Hs'
 for w,h in [(1920,1080),(1280,720),(960,540)]:
  page.set_viewport_size({'width':w,'height':h});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.locator('#tvTestSelect').evaluate('(e)=>e.remove()');page.locator('iframe').evaluate('(e)=>e.remove()');page.evaluate("window.SabahTVRemote.focus(document.querySelector('header [data-page=players]'))");page.screenshot(path='/tmp/sabah-tv-preview.png');assert not errors,errors
 print('PASS: spatial D-pad navigation, OK, match/player navigation, Back, keyboard/select handling, YouTube handoff and 1080p/720p layout');b.close()
s.shutdown()
