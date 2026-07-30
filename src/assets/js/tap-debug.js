/*
 * On-device tap diagnostic — iPad/iOS has no console, so this renders one.
 *
 * Enable:  add ?tapdebug=1 to the URL  (persists via localStorage for the session)
 * Disable: add ?tapdebug=0 to the URL
 *
 * What it answers:
 *   1. Is something invisible sitting on top of the link? (elementFromPoint vs
 *      the element you aimed at — this is the #1 cause of "links do nothing")
 *   2. Does the tap reach `document`? iOS only bubbles clicks from elements it
 *      considers clickable, and Bootstrap's dropdown/modal handlers are all
 *      delegated on `document`.
 *   3. Is a full-viewport blocker present? (stale .modal-backdrop, stuck
 *      ngx-spinner, anything fixed/absolute covering the screen)
 *   4. How many jQuery handlers have piled up on <body>'s children?
 */
(function () {
	'use strict';

	var params = new URLSearchParams(window.location.search);
	if (params.get('tapdebug') === '0') {
		try { localStorage.removeItem('tapDebug'); } catch (e) { }
		return;
	}
	if (params.get('tapdebug') === '1') {
		try { localStorage.setItem('tapDebug', '1'); } catch (e) { }
	}
	var enabled = params.get('tapdebug') === '1';
	try { enabled = enabled || localStorage.getItem('tapDebug') === '1'; } catch (e) { }
	if (!enabled) {
		return;
	}

	var MAX_LINES = 200;
	var lines = [];
	var panel, logEl, paused = false;
	var lastPointer = { x: 0, y: 0 };
	var sawDocumentClick = false;

	function describe(el) {
		if (!el) return 'null';
		if (el === document) return 'document';
		if (el === document.documentElement) return '<html>';
		if (el === document.body) return '<body>';
		if (!el.tagName) return String(el);
		var s = el.tagName.toLowerCase();
		if (el.id) s += '#' + el.id;
		if (el.className && typeof el.className === 'string') {
			var cls = el.className.trim().split(/\s+/).slice(0, 4).join('.');
			if (cls) s += '.' + cls;
		}
		var text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
		if (text) s += ' "' + text + '"';
		return s;
	}

	function log(msg, level) {
		if (paused) return;
		var t = new Date().toISOString().substr(11, 12);
		lines.push({ t: t, msg: msg, level: level || 'info' });
		if (lines.length > MAX_LINES) lines.shift();
		render();
	}

	function render() {
		if (!logEl) return;
		var html = '';
		for (var i = lines.length - 1; i >= 0; i--) {
			var l = lines[i];
			var color = l.level === 'bad' ? '#ff6b6b'
				: l.level === 'good' ? '#51cf66'
					: l.level === 'warn' ? '#ffd43b' : '#dee2e6';
			html += '<div style="color:' + color + ';border-bottom:1px solid #2b2b2b;padding:2px 0">'
				+ '<span style="color:#868e96">' + l.t + '</span> ' + escapeHtml(l.msg) + '</div>';
		}
		logEl.innerHTML = html;
	}

	function escapeHtml(s) {
		return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	/* ---------- the important check: what is actually on top? ---------- */

	function inspectPoint(x, y, intended) {
		var top = document.elementFromPoint(x, y);
		if (!top) {
			log('elementFromPoint(' + x + ',' + y + ') = null (outside viewport?)', 'warn');
			return;
		}
		if (top === intended || (intended && intended.contains && intended.contains(top)) ||
			(top.contains && top.contains(intended))) {
			log('topmost OK: ' + describe(top), 'good');
			return;
		}
		log('INTERCEPTED by ' + describe(top) + ' (you aimed at ' + describe(intended) + ')', 'bad');

		// Walk up from the interceptor so we can name the culprit.
		var el = top, depth = 0;
		while (el && el !== document.body && depth < 4) {
			var cs = getComputedStyle(el);
			if (cs.position === 'fixed' || cs.position === 'absolute') {
				log('   blocker: ' + describe(el) + ' pos=' + cs.position
					+ ' z=' + cs.zIndex + ' opacity=' + cs.opacity
					+ ' pe=' + cs.pointerEvents, 'bad');
			}
			el = el.parentElement;
			depth++;
		}
	}

	/* ---------- overlay census ---------- */

	function scan() {
		var vw = window.innerWidth, vh = window.innerHeight;
		var found = 0;

		var backdrops = document.querySelectorAll('.modal-backdrop');
		var openModals = document.querySelectorAll('.modal.show');
		log('scan: .modal-backdrop=' + backdrops.length
			+ ' .modal.show=' + openModals.length
			+ ' body.modal-open=' + document.body.classList.contains('modal-open'),
			backdrops.length > openModals.length ? 'bad' : 'info');

		if (backdrops.length > openModals.length) {
			log('   STALE BACKDROP: a .modal-backdrop with no open modal is '
				+ 'transparent but still covers the whole screen at z-index 1040.', 'bad');
		}

		// Anything covering most of the viewport and still accepting taps.
		var all = document.body.querySelectorAll('*');
		for (var i = 0; i < all.length; i++) {
			var el = all[i];
			var cs = getComputedStyle(el);
			if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
			if (cs.pointerEvents === 'none' || cs.display === 'none' || cs.visibility === 'hidden') continue;
			var r = el.getBoundingClientRect();
			if (r.width * r.height < vw * vh * 0.75) continue;
			if (r.top > 5 || r.left > 5) continue;
			found++;
			log('   COVERS SCREEN: ' + describe(el) + ' z=' + cs.zIndex
				+ ' opacity=' + cs.opacity + ' bg=' + cs.backgroundColor, 'bad');
		}
		if (!found && backdrops.length <= openModals.length) {
			log('   no full-screen blocker found', 'good');
		}

		// jQuery handler pile-up (the Bootstrap-on-iOS leak).
		if (window.jQuery) {
			var $ = window.jQuery;
			var total = 0, detail = [];
			$(document.body).children().each(function () {
				var ev = $._data ? $._data(this, 'events') : null;
				if (!ev) return;
				var n = 0;
				for (var k in ev) n += ev[k].length;
				if (n) { total += n; detail.push(describe(this) + '=' + n); }
			});
			log('   jQuery handlers on body children: ' + total
				+ (detail.length ? ' [' + detail.join(', ') + ']' : ''),
				total > 30 ? 'bad' : 'info');
			log('   jQuery version(s): ' + $.fn.jquery, 'info');
		} else {
			log('   jQuery not on window', 'warn');
		}
	}

	/* ---------- event tracing ---------- */

	function bindTracing() {
		// Capture phase on window fires no matter what handlers exist downstream.
		window.addEventListener('pointerdown', function (e) {
			lastPointer = { x: e.clientX, y: e.clientY };
			log('pointerdown @' + Math.round(e.clientX) + ',' + Math.round(e.clientY)
				+ ' -> ' + describe(e.target));
			inspectPoint(e.clientX, e.clientY, e.target);
		}, true);

		window.addEventListener('touchstart', function (e) {
			var t = e.touches[0];
			if (!t) return;
			lastPointer = { x: t.clientX, y: t.clientY };
			log('touchstart @' + Math.round(t.clientX) + ',' + Math.round(t.clientY)
				+ ' -> ' + describe(e.target));
		}, true);

		window.addEventListener('click', function (e) {
			sawDocumentClick = false;
			log('click (capture) -> ' + describe(e.target), 'good');
			// Give the bubble-phase listener a tick to fire.
			setTimeout(function () {
				if (!sawDocumentClick) {
					log('   click did NOT reach document — iOS will not bubble taps from '
						+ 'elements it does not treat as clickable (no href / no cursor:pointer). '
						+ 'Bootstrap dropdown + modal handlers are delegated on document, so they '
						+ 'never run.', 'bad');
				}
			}, 0);
		}, true);

		document.addEventListener('click', function () {
			sawDocumentClick = true;
			log('   click reached document', 'good');
		}, false);

		// Did anything call preventDefault on the tap?
		window.addEventListener('click', function (e) {
			if (e.defaultPrevented) {
				log('   click.defaultPrevented = true', 'warn');
			}
		}, false);
	}

	/* ---------- panel ---------- */

	function buildPanel() {
		panel = document.createElement('div');
		panel.setAttribute('data-tap-debug', '1');
		panel.style.cssText = [
			'position:fixed', 'left:0', 'right:0', 'bottom:0', 'height:42vh',
			'z-index:2147483647', 'background:rgba(10,10,10,0.94)', 'color:#dee2e6',
			'font:11px/1.35 ui-monospace,Menlo,monospace', 'display:flex',
			'flex-direction:column', 'border-top:2px solid #f3933d'
		].join(';');

		var bar = document.createElement('div');
		bar.style.cssText = 'display:flex;gap:6px;padding:6px;background:#1a1a1a;flex:0 0 auto;align-items:center';

		function btn(label, fn) {
			var b = document.createElement('button');
			b.textContent = label;
			b.style.cssText = 'padding:7px 11px;font:600 12px system-ui;background:#f3933d;'
				+ 'color:#111;border:0;border-radius:5px';
			b.addEventListener('click', function (e) {
				e.stopPropagation();
				fn(b);
			});
			bar.appendChild(b);
			return b;
		}

		btn('Scan', scan);
		btn('Clear', function () { lines = []; render(); });
		btn('Pause', function (b) {
			paused = !paused;
			b.textContent = paused ? 'Resume' : 'Pause';
		});
		btn('Unstick', function () {
			var $ = window.jQuery;
			var n = document.querySelectorAll('.modal-backdrop').length;
			document.querySelectorAll('.modal-backdrop').forEach(function (el) { el.remove(); });
			document.body.classList.remove('modal-open');
			document.body.style.paddingRight = '';
			if ($) {
				$('.dropdown-menu.show').removeClass('show').parent().removeClass('show');
				$(document.body).children().off('mouseover', null, $.noop);
			}
			log('Unstick: removed ' + n + ' backdrop(s), cleared modal-open + dropdowns. '
				+ 'If links work now, a stale overlay was the cause.', 'warn');
		});
		btn('Hide', function () { panel.style.display = 'none'; });

		var note = document.createElement('span');
		note.textContent = '?tapdebug=0 to turn off';
		note.style.cssText = 'color:#868e96;font:10px system-ui;margin-left:auto';
		bar.appendChild(note);

		logEl = document.createElement('div');
		logEl.style.cssText = 'flex:1 1 auto;overflow-y:auto;padding:6px;-webkit-overflow-scrolling:touch';

		panel.appendChild(bar);
		panel.appendChild(logEl);
		document.body.appendChild(panel);
	}

	function start() {
		buildPanel();
		bindTracing();
		log('tap-debug ready. UA: ' + navigator.userAgent, 'warn');
		log('viewport ' + window.innerWidth + 'x' + window.innerHeight
			+ ' dpr=' + window.devicePixelRatio
			+ ' touchpoints=' + navigator.maxTouchPoints
			+ ' ontouchstart=' + ('ontouchstart' in document.documentElement), 'warn');
		scan();
		// Re-scan periodically so a blocker that appears mid-session is caught.
		setInterval(function () {
			if (paused) return;
			var backdrops = document.querySelectorAll('.modal-backdrop').length;
			var openModals = document.querySelectorAll('.modal.show').length;
			if (backdrops > openModals) {
				log('AUTO: stale backdrop appeared (' + backdrops + ' backdrop vs '
					+ openModals + ' open modal)', 'bad');
			}
		}, 2000);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else {
		start();
	}
})();
