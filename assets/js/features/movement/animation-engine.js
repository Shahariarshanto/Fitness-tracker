(function (w) {
  var A = w.ASAN = w.ASAN || {};
  A.POSES = A.POSES || {};
  A.C = { hl: '#E8590C', hl2: '#1C7ED6', body: 'var(--mu,#8a8f98)', bd: 'var(--bd,#d0d4da)', fill: 'var(--card,#fff)' };
  A._o = A._o || [];
  var NS = 'http://www.w3.org/2000/svg';
  var RM = w.matchMedia && w.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function ease(x) { return (1 - Math.cos(Math.PI * x)) / 2; }
  function lerp(a, b, e) { return (a || 0) + ((b || 0) - (a || 0)) * e; }
  function at(P, t) {
    var k = P.k, i = 0;
    while (i < k.length - 2 && t > k[i + 1].t) i++;
    var a = k[i], b = k[i + 1];
    var x = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 1, e = ease(x);
    return { j: a.j.map(function (v, n) { return v + (b.j[n] - v) * e; }), sp: lerp(a.sp, b.sp, e), sx: lerp(a.sx, b.sx, e), ch: lerp(a.ch, b.ch, e) };
  }
  function col(P, part) {
    if ((P.hl || []).indexOf(part) >= 0) return A.C.hl;
    if ((P.hl2 || []).indexOf(part) >= 0) return A.C.hl2;
    return A.C.body;
  }
  function seg(p, a, b, c) { return 'M' + p[a] + ' ' + p[a + 1] + 'L' + p[b] + ' ' + p[b + 1] + 'L' + p[c] + ' ' + p[c + 1]; }
  function mk(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  function limb(s, color, op) {
    return mk('path', { fill: 'none', stroke: color, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op }, s);
  }
  function draw(o, t) {
    var q = at(o.P, t), p = q.j;
    o.aB.setAttribute('d', seg(p, 2, 10, 12));
    o.lB.setAttribute('d', seg(p, 4, 18, 20));
    o.aA.setAttribute('d', seg(p, 2, 6, 8));
    o.lA.setAttribute('d', seg(p, 4, 14, 16));
    var cx = (p[2] + p[4]) / 2 + 2 * q.sx, cy = (p[3] + p[5]) / 2 + 2 * q.sp;
    o.sp.setAttribute('d', 'M' + p[2] + ' ' + p[3] + 'Q' + cx + ' ' + cy + ' ' + p[4] + ' ' + p[5]);
    o.nk.setAttribute('x1', p[2]); o.nk.setAttribute('y1', p[3]);
    o.nk.setAttribute('x2', p[0]); o.nk.setAttribute('y2', p[1]);
    o.hd.setAttribute('cx', p[0]); o.hd.setAttribute('cy', p[1]);
    if (o.lg) {
      var len = Math.hypot(p[4] - p[2], p[5] - p[3]);
      o.lg.setAttribute('cx', p[2] + (p[4] - p[2]) * 0.42 + q.sx);
      o.lg.setAttribute('cy', p[3] + (p[5] - p[3]) * 0.42 + q.sp);
      o.lg.setAttribute('rx', Math.max(0.5, q.ch));
      o.lg.setAttribute('ry', len * 0.3);
    }
  }
  A.mount = function (el) {
    var id = el.getAttribute('data-id'), P = A.POSES[id];
    if (!P || el.querySelector('svg[data-asan="' + id + '"]')) return;
    el.innerHTML = '';
    var s = mk('svg', { viewBox: '0 0 80 60', width: 84, height: 63, 'aria-hidden': 'true', 'data-asan': id, style: 'display:block;max-width:100%' }, el);
    mk('line', { x1: 4, y1: 55, x2: 76, y2: 55, stroke: A.C.bd, 'stroke-width': 1.5, 'stroke-linecap': 'round' }, s);
    (P.props || []).forEach(function (q) { mk('line', { x1: q[0], y1: q[1], x2: q[2], y2: q[3], stroke: A.C.bd, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, s); });
    var sh = P.flat ? 1 : 0.55, o = { P: P, el: el };
    o.aB = limb(s, col(P, 'arms'), sh);
    o.lB = limb(s, col(P, 'legs'), sh);
    if (P.lung) o.lg = mk('ellipse', { fill: A.C.hl2, 'fill-opacity': 0.18, stroke: A.C.hl2, 'stroke-width': 1 }, s);
    o.sp = mk('path', { fill: 'none', stroke: col(P, 'spine'), 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    o.nk = mk('line', { stroke: col(P, 'neck'), 'stroke-width': 3.2, 'stroke-linecap': 'round' }, s);
    o.aA = limb(s, col(P, 'arms'), 1);
    o.lA = limb(s, col(P, 'legs'), 1);
    o.hd = mk('circle', { r: 5.5, fill: A.C.fill, stroke: col(P, 'neck'), 'stroke-width': 2.5 }, s);
    A._o.push(o);
    draw(o, RM ? (P.still || 0.5) : 0);
  };
  A.mountAll = function (sel) {
    document.querySelectorAll(sel || '.fg').forEach(A.mount);
    if (!A._on && !RM) {
      A._on = true;
      (function loop(ts) {
        A._o = A._o.filter(function (o) { return document.body.contains(o.el); });
        A._o.forEach(function (o) { draw(o, (ts % o.P.dur) / o.P.dur); });
        w.requestAnimationFrame(loop);
      })(0);
    }
  };

})(window);
