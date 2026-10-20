(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.body.classList.add("loading");

  // safety: never leave the page stuck behind the loader
  setTimeout(() => {
    const el = document.getElementById("loader");
    if (el) el.remove();
    document.body.classList.remove("loading");
  }, 5000);

  $("#year").textContent = new Date().getFullYear();

  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

  const gl = initGL($("#gl"));

  function initGL(canvas) {
    const ctx = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!ctx) { canvas.remove(); return null; }
    const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    const fs = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);
for(int i=0;i<6;i++){v+=a*n(p);p=R*p*2.03;a*=.5;}return v;}
void main(){
vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
vec2 mm=(m-.5*r)/r.y;
vec2 p=uv*1.5+vec2(0.,s*.9);
p+=(uv-mm)*.06*exp(-length(uv-mm)*2.);
float T=t*.045;
vec2 q=vec2(fbm(p+T),fbm(p+vec2(5.2,1.3)-T));
vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+T*1.4),fbm(p+3.*q+vec2(8.3,2.8)-T*.8));
float f=fbm(p+3.4*w);
float d=length(uv-mm);
float lamp=exp(-d*2.6);
float c=abs(fract(f*11.-t*.04)-.5);
float contour=smoothstep(.05,0.,c)*smoothstep(.32,.72,f);
float ridge=pow(smoothstep(.42,1.,f),2.6);
vec3 soul=vec3(.37,.9,1.);
vec3 col=vec3(.012,.017,.024);
col+=soul*ridge*(.38+lamp*.9);
col+=soul*contour*(.18+lamp*.85);
col+=vec3(.5,.35,1.)*pow(q.y,5.)*.12;
col*=1.-.55*smoothstep(.35,1.25,length(uv*vec2(.85,1.)));
col*=k;
col=col/(1.+col);
col=pow(col,vec3(.9));
col+=(h(gl_FragCoord.xy+fract(t))-.5)*.025;
gl_FragColor=vec4(col,1.);
}`;
    const sh = (type, src) => { const o = ctx.createShader(type); ctx.shaderSource(o, src); ctx.compileShader(o); return o; };
    const prog = ctx.createProgram();
    ctx.attachShader(prog, sh(ctx.VERTEX_SHADER, vs));
    ctx.attachShader(prog, sh(ctx.FRAGMENT_SHADER, fs));
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) { canvas.remove(); return null; }
    ctx.useProgram(prog);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(prog, "a");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    const u = Object.fromEntries(["r", "t", "m", "s", "k"].map(x => [x, ctx.getUniformLocation(prog, x)]));
    const state = { scroll: 0, brightness: 0, mx: pointer.x, my: pointer.y, scale: 1 };

    const resize = () => {
      state.scale = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth > 1600 ? .6 : .75);
      canvas.width = Math.round(innerWidth * state.scale);
      canvas.height = Math.round(innerHeight * state.scale);
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener("resize", resize);

    let visible = true;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
    const start = performance.now();
    const frame = now => {
      requestAnimationFrame(frame);
      if (!visible) return;
      state.mx += (pointer.x - state.mx) * .06;
      state.my += (pointer.y - state.my) * .06;
      ctx.uniform2f(u.r, canvas.width, canvas.height);
      ctx.uniform1f(u.t, reduce ? 20 : (now - start) / 1000);
      ctx.uniform2f(u.m, state.mx * state.scale, (innerHeight - state.my) * state.scale);
      ctx.uniform1f(u.s, state.scroll);
      ctx.uniform1f(u.k, state.brightness);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(frame);
    return state;
  }

  if (fine && !reduce) {
    document.documentElement.classList.add("has-cursor");
    const cur = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring");
    const rp = { x: pointer.x, y: pointer.y };
    const loop = () => {
      rp.x += (pointer.x - rp.x) * .16;
      rp.y += (pointer.y - rp.y) * .16;
      dot.style.transform = `translate(${pointer.x}px,${pointer.y}px)`;
      ring.style.transform = `translate(${rp.x}px,${rp.y}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$("[data-hover], .card").forEach(el => {
      el.addEventListener("pointerenter", () => cur.classList.add("hover"));
      el.addEventListener("pointerleave", () => cur.classList.remove("hover"));
    });
  }

  if (!hasGsap) {
    $("#loader").remove();
    document.body.classList.remove("loading");
    if (gl) gl.brightness = 1;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  const words = $("#manifestoText");
  words.innerHTML = words.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");

  gsap.set(".hero-title .line > span, .contact-title .line > span", { yPercent: 115 });
  gsap.set(".reveal-up", { y: 24, autoAlpha: 0 });
  gsap.set(".top", { autoAlpha: 0, y: -10 });

  const counter = { v: 0 };
  const num = $("#loaderNum"), bar = $("#loaderBar");
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

  gsap.to(counter, {
    v: 100, duration: reduce ? .2 : 1.8, ease: "power2.inOut",
    onUpdate: () => { num.textContent = Math.round(counter.v); bar.style.width = counter.v + "%"; },
    onComplete: () => {
      Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => {
        gsap.timeline()
          .to("#loader", { yPercent: -100, duration: 1.1, ease: "power4.inOut" })
          .add(intro, "-=.45");
      });
    }
  });

  function intro() {
    $("#loader").remove();
    document.body.classList.remove("loading");
    lenis && lenis.start();
    if (gl) gsap.to(gl, { brightness: 1, duration: 2.4, ease: "power2.out" });
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(".hero-title .line > span", { yPercent: 0, duration: 1.6, stagger: .11, onComplete: () => gsap.set(".hero-title .line", { overflow: "visible" }) })
      .to(".top", { autoAlpha: 1, y: 0, duration: 1 }, .3)
      .to(".reveal-up", { y: 0, autoAlpha: 1, duration: 1.2, stagger: .08 }, .5);
    build();
  }

  function build() {
    if (gl) {
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: self => { gl.scroll = self.progress * 3; }
      });
      gsap.to(gl, {
        brightness: .45, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top top", scrub: true }
      });
    }

    gsap.to(".hero-title", {
      yPercent: -18, autoAlpha: .2, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.to("#manifestoText .w", {
      opacity: 1, stagger: .08, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 45%", scrub: true }
    });

    $$(".label, .h2, .network-lead").forEach(el => {
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      const track = $("#track");
      const dist = () => track.scrollWidth - (innerWidth - track.offsetLeft) + innerWidth * .08;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: ".work", pin: ".work-pin", start: "top top", end: () => "+=" + dist(),
          scrub: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            gsap.set("#workProgress", { scaleX: self.progress });
            gsap.set(".work-head", { autoAlpha: Math.max(0, 1 - self.progress * 7), x: -self.progress * 280 });
          }
        }
      });
      $$(".card").forEach(card => {
        gsap.from(card.querySelector(".card-art"), {
          scale: 1.25, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true }
        });
      });
    });
    mm.add("(max-width: 860px)", () => {
      $$(".card").forEach(card => gsap.from(card, { y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 90%" } }));
    });

    $$("#diagram .wires path:not([stroke-dasharray])").forEach(p => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    const dtl = gsap.timeline({ scrollTrigger: { trigger: ".diagram", start: "top 75%" } });
    dtl.from("#diagram .node", { scale: 0, transformOrigin: "50% 50%", autoAlpha: 0, duration: .9, stagger: .12, ease: "back.out(1.6)" })
      .to("#diagram .wires path:not([stroke-dasharray])", { strokeDashoffset: 0, duration: 1.2, stagger: .15, ease: "power2.inOut" }, .3)
      .from("#diagram .wires path[stroke-dasharray], #diagram .packets", { autoAlpha: 0, duration: .8 }, 1.2);

    $$(".fact b").forEach(b => {
      const v = { n: 0 }, end = +b.dataset.count;
      b.textContent = "0";
      gsap.to(v, { n: end, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 90%" }, onUpdate: () => { b.textContent = Math.round(v.n); } });
      gsap.from(b.parentElement, { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: b, start: "top 92%" } });
    });

    gsap.from(".rule", { y: 40, autoAlpha: 0, duration: 1, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: ".rules", start: "top 80%" } });

    gsap.to(".contact-title .line > span", {
      yPercent: 0, duration: 1.4, stagger: .12, ease: "expo.out",
      onComplete: () => gsap.set(".contact-title .line", { overflow: "visible" }),
      scrollTrigger: { trigger: ".contact", start: "top 60%" }
    });
    gsap.from(".magnet", { scale: 0, rotate: -40, duration: 1.2, ease: "back.out(1.5)", scrollTrigger: { trigger: ".contact", start: "top 40%" } });
    gsap.from(".contact-info", {
      y: 30, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".contact", start: "top 50%" }
    });

    if (fine && !reduce) {
      $$("[data-tilt]").forEach(card => {
        const rx = gsap.quickTo(card, "rotationX", { duration: .6, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: .6, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointermove", e => {
          const b = card.getBoundingClientRect();
          ry(((e.clientX - b.left) / b.width - .5) * 10);
          rx(-((e.clientY - b.top) / b.height - .5) * 10);
        });
        card.addEventListener("pointerleave", () => { rx(0); ry(0); });
      });

      const mag = $(".magnet"), inner = $(".magnet-inner");
      const mx = gsap.quickTo(mag, "x", { duration: .8, ease: "elastic.out(1,.4)" });
      const my = gsap.quickTo(mag, "y", { duration: .8, ease: "elastic.out(1,.4)" });
      const ix = gsap.quickTo(inner, "x", { duration: .8, ease: "elastic.out(1,.4)" });
      const iy = gsap.quickTo(inner, "y", { duration: .8, ease: "elastic.out(1,.4)" });
      addEventListener("pointermove", e => {
        const b = mag.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        const near = Math.hypot(dx, dy) < b.width * 1.1;
        mx(near ? dx * .35 : 0); my(near ? dy * .35 : 0);
        ix(near ? dx * .15 : 0); iy(near ? dy * .15 : 0);
      }, { passive: true });
    }

    ScrollTrigger.refresh();
  }
})();
