(function(){
  var c = document.getElementById('wave');
  if(!c) return;
  var ctx = c.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, dpr = 1, phase = 0;

  function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function size(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // one arterial pressure pulse: systolic upstroke, dicrotic notch, diastolic decay
  function pulse(t){
    if(t < 0 || t >= 1) return 0;
    var sys = Math.exp(-Math.pow((t - 0.13) / 0.075, 2));
    var dic = 0.34 * Math.exp(-Math.pow((t - 0.34) / 0.085, 2));
    var run = 0.30 * Math.exp(-t * 3.4);
    return sys + dic + run;
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    var base = h * 0.82, amp = h * 0.60, period = 118;

    ctx.beginPath();
    for(var x = 0; x <= w; x++){
      var t = ((x + phase) % period) / period;
      var y = base - pulse(t) * amp;
      if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = css('--trace');
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // fade the leading edge so the trace enters rather than starting abruptly
    var g = ctx.createLinearGradient(0, 0, w * 0.22, 0);
    g.addColorStop(0, css('--ground')); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, w * 0.22, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(){ phase += 0.85; draw(); requestAnimationFrame(loop); }

  size(); draw();
  window.addEventListener('resize', function(){ size(); draw(); });
  if(!reduce) requestAnimationFrame(loop);
})();

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  document.querySelectorAll('.draw-path').forEach(function(p){
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });

  var targets = document.querySelectorAll('.card, .stat, .node, .step, .tier, .link, .q, .person, .diagram, .chain, .tablewrap, .menu-card');
  targets.forEach(function(el, i){
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 5) * 55) + 'ms';
  });

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      entry.target.classList.add('in');
      entry.target.querySelectorAll('.draw-path').forEach(function(p){ p.style.strokeDashoffset = '0'; });
      io.unobserve(entry.target);
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});

  targets.forEach(function(el){ io.observe(el); });
})();
