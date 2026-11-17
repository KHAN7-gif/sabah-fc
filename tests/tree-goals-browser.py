"""Tree Goals navigation, moved records, independent filters and responsive layout."""
import threading
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
        for width in (393, 820, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 900})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('https://**', lambda route: route.abort())
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            menu = page.locator('.header-menu')
            ids = menu.locator('[data-page]').evaluate_all('els => els.map(e => e.dataset.page)')
            assert ids.index('tree-goals') + 1 == ids.index('about')
            page.locator('.header-menu-btn').click()
            menu.locator('[data-page="tree-goals"]').click()
            assert page.locator('.stats-heading h2').inner_text() == 'Tree Goals'
            total = page.locator('.stats-goal-row').count()
            assert total > 0
            search = page.locator('#threeGoalPlayer')
            search.fill('no-such-player-xyz')
            assert page.locator('.stats-goal-row:visible').count() == 0
            assert page.locator('[data-goal-empty]').is_visible()
            search.fill('')
            assert page.locator('.stats-goal-row:visible').count() == total
            page.locator('button[data-goal-half="first"]').click()
            first = page.locator('.stats-goal-row:visible').count()
            page.locator('button[data-goal-half="second"]').click()
            second = page.locator('.stats-goal-row:visible').count()
            assert first + second == total
            page.locator('button[data-goal-half="all"]').click()
            matchday = page.locator('#threeGoalMatchday option').nth(1).get_attribute('value')
            page.locator('#threeGoalMatchday').select_option(matchday)
            assert page.locator('.stats-goal-row:visible').count() > 0
            assert page.locator('.stats-goal-row:visible').evaluate_all('(els) => els.every(e => e.dataset.goalMatchday === document.querySelector("#threeGoalMatchday").value)')
            page.locator('#threeGoalMatchday').select_option('all')
            page.locator('#threeGoalLeague').select_option('fa')
            assert page.locator('#threeGoalLeague').input_value() == 'fa'
            menu.locator('[data-page="stats"]').evaluate('(e) => e.click()')
            assert page.locator('[data-stats-category="three-goal"]').count() == 0
            assert page.locator('#threeGoalPlayer').count() == 0
            page.locator('[data-stats-competition="league"]').click()
            menu.locator('[data-page="tree-goals"]').evaluate('(e) => e.click()')
            assert page.locator('#threeGoalLeague').input_value() == 'fa'
            page.locator('#threeGoalLeague').select_option('all')
            assert page.locator('.stats-goal-row:visible').count() == total
            assert page.locator('.mobile-bottom-nav button').count() == 5
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert not errors, errors
            print(f'PASS {width}px: Tree Goals before About; {total} goal records; player, half, matchday and league filters; independent Stats; bottom tabs preserved')
            page.close()
        browser.close()
finally:
    server.shutdown()
