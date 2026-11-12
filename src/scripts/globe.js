// Hero globe: a dot-matrix earth lit by the real position of the sun right now,
// with arcs from Clark (where Offsure's team works) to the markets it serves.
import * as THREE from 'three';
import gsap from 'gsap';
import landDots from '../data/land-dots.json';

const D2R = Math.PI / 180;
const NAVY = new THREE.Vector3(1 / 255, 65 / 255, 94 / 255);
const ORANGE = new THREE.Vector3(239 / 255, 75 / 255, 38 / 255);

const toVec = (lat, lon, r = 1) =>
  new THREE.Vector3(
    Math.cos(lat * D2R) * Math.sin(lon * D2R) * r,
    Math.sin(lat * D2R) * r,
    Math.cos(lat * D2R) * Math.cos(lon * D2R) * r,
  );

const toLatLon = (v) => ({
  lat: Math.asin(THREE.MathUtils.clamp(v.y / v.length(), -1, 1)) / D2R,
  lon: Math.atan2(v.x, v.z) / D2R,
});

// Direction from the earth's centre to the sun, in the globe's own coordinates.
function sunDirection(date) {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = (date.getTime() - yearStart) / 864e5;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return toVec(declination, (12 - hours) * 15);
}

const sphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormalV;
    varying vec3 vPos;
    void main() {
      vNormalV = normalize(normalMatrix * normal);
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uSun;
    varying vec3 vNormalV;
    varying vec3 vPos;
    void main() {
      float day = smoothstep(-0.14, 0.14, dot(normalize(vPos), uSun));
      float rim = 1.0 - max(vNormalV.z, 0.0);
      vec3 col = mix(vec3(0.79, 0.86, 0.895), vec3(1.0), day);
      col = mix(col, vec3(0.70, 0.80, 0.85), pow(rim, 2.2) * 0.9);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

const dotShader = {
  vertexShader: /* glsl */ `
    uniform float uSize;
    uniform float uReveal;
    uniform vec3 uSun;
    attribute float aDist;
    varying float vAlpha;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float facing = normalize(normalMatrix * position).z;
      float day = smoothstep(-0.1, 0.1, dot(normalize(position), uSun));
      float reveal = smoothstep(aDist, aDist + 0.14, uReveal * 1.14);
      vAlpha = mix(0.4, 1.0, day) * smoothstep(0.0, 0.3, facing) * reveal;
      gl_PointSize = uSize * (0.6 + 0.4 * smoothstep(0.0, 0.6, facing)) * (0.4 + 0.6 * reveal);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.36, d) * vAlpha;
      if (a < 0.01) discard;
      gl_FragColor = vec4(uColor, a);
    }`,
};

const arcShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uDraw;
    uniform float uTime;
    uniform float uOffset;
    uniform float uActive;
    varying vec2 vUv;
    void main() {
      if (vUv.x > uDraw) discard;
      float head = fract(uTime * 0.2 + uOffset) * 1.4 - 0.2;
      float pulse = smoothstep(0.16, 0.0, abs(head - vUv.x));
      float a = max(mix(0.42, 1.0, uActive), pulse);
      gl_FragColor = vec4(uColor, a);
    }`,
};

export function createGlobe(el, { reducedMotion = false } = {}) {
  const canvas = el.querySelector('canvas');
  const cities = JSON.parse(el.dataset.cities);
  const home = cities.find((c) => c.home);
  const homeVec = toVec(home.lat, home.lon);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    el.classList.add('is-unsupported');
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.z = 4.8;
  const globe = new THREE.Group();
  scene.add(globe);

  const sun = { value: sunDirection(new Date()) };

  // Body
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.ShaderMaterial({ ...sphereShader, uniforms: { uSun: sun } }),
  );
  globe.add(sphere);

  // Land dots
  const count = landDots.length / 2;
  const positions = new Float32Array(count * 3);
  const dists = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const v = toVec(landDots[i * 2] / 100, landDots[i * 2 + 1] / 100, 1.004);
    positions.set([v.x, v.y, v.z], i * 3);
    dists[i] = v.angleTo(homeVec) / Math.PI;
  }
  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dotGeometry.setAttribute('aDist', new THREE.BufferAttribute(dists, 1));
  const dotUniforms = {
    uSize: { value: 4 },
    uReveal: { value: 0 },
    uSun: sun,
    uColor: { value: NAVY },
  };
  const dots = new THREE.Points(
    dotGeometry,
    new THREE.ShaderMaterial({ ...dotShader, uniforms: dotUniforms, transparent: true, depthWrite: false }),
  );
  globe.add(dots);

  // Arcs from Clark
  const time = { value: 0 };
  const arcs = cities
    .filter((c) => !c.home)
    .map((city, i) => {
      const end = toVec(city.lat, city.lon);
      const angle = homeVec.angleTo(end);
      const lift = 0.05 + 0.2 * (angle / Math.PI);
      const points = [];
      for (let k = 0; k <= 48; k++) {
        const t = k / 48;
        // Step along the great circle between the two cities.
        const s = Math.sin(angle);
        const a = Math.sin((1 - t) * angle) / s;
        const b = Math.sin(t * angle) / s;
        const p = new THREE.Vector3(homeVec.x * a + end.x * b, homeVec.y * a + end.y * b, homeVec.z * a + end.z * b);
        points.push(p.multiplyScalar(1.006 + lift * Math.sin(Math.PI * t)));
      }
      const uniforms = {
        uColor: { value: ORANGE },
        uDraw: { value: 0 },
        uTime: time,
        uOffset: { value: i * 0.27 },
        uActive: { value: 0 },
      };
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.0044, 6, false),
        new THREE.ShaderMaterial({ ...arcShader, uniforms, transparent: true, depthWrite: false }),
      );
      globe.add(mesh);
      // Where to turn the globe when this city is picked. Nearby cities fit in view together
      // with Clark, so centre between them; far ones get the city itself, a little left of centre.
      const mid = toLatLon(homeVec.clone().add(end));
      const look = angle < 1.4 ? { lat: mid.lat, lon: mid.lon + 8 } : { lat: city.lat * 0.6, lon: city.lon + 22 };
      return { id: city.id, uniforms, mesh, look };
    });

  // Labels
  const pins = cities.map((c) => ({
    id: c.id,
    el: el.querySelector(`[data-pin="${c.id}"]`),
    vec: toVec(c.lat, c.lon, 1.01),
  }));

  // View state: the latitude/longitude facing the camera.
  const rest = { lat: 0, lon: 149 };
  const view = { lat: rest.lat, lon: rest.lon - 55 };
  const target = { ...rest };
  let focusId = null;
  let dragging = false;
  let velocity = 0;
  let swayClock = 0;

  const shortestLon = (to, from) => from + ((((to - from) % 360) + 540) % 360) - 180;

  function focus(id) {
    focusId = id;
    for (const arc of arcs) {
      gsap.to(arc.uniforms.uActive, { value: arc.id === id ? 1 : 0, duration: 0.4, overwrite: true });
    }
    for (const pin of pins) pin.el?.classList.toggle('is-active', pin.id === id);
    if (!id) return;
    const arc = arcs.find((a) => a.id === id);
    const to = arc ? arc.look : { lat: home.lat, lon: home.lon + 12 };
    target.lat = THREE.MathUtils.clamp(to.lat, -45, 50);
    target.lon = shortestLon(to.lon, view.lon);
  }

  // Dragging
  let lastX = 0;
  let lastY = 0;
  const degPerPx = () => 150 / el.clientWidth;

  function onDown(e) {
    dragging = true;
    velocity = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');
  }

  function onMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    target.lon -= dx * degPerPx();
    target.lat = THREE.MathUtils.clamp(target.lat + dy * degPerPx(), -55, 60);
    velocity = -dx * degPerPx();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    // Wherever the visitor leaves the globe becomes its new resting view.
    rest.lat = target.lat;
    swayClock = 0;
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // Sizing
  function resize() {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    dotUniforms.uSize.value = Math.max(2.2, h * dpr * 0.0062);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(el);
  resize();

  let visible = true;
  const intersection = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  intersection.observe(el);

  const world = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  let lastSun = 0;

  function render(_, deltaMs) {
    if (!visible || document.hidden) return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    time.value += dt;

    if (time.value - lastSun > 60) {
      lastSun = time.value;
      sun.value.copy(sunDirection(new Date()));
    }

    if (!dragging) {
      if (Math.abs(velocity) > 0.01) {
        target.lon += velocity;
        velocity *= 0.94;
        rest.lon = target.lon;
      } else if (!focusId && !reducedMotion) {
        swayClock += dt;
        target.lon = rest.lon + Math.sin(swayClock * 0.16) * 10;
        target.lat += (rest.lat - target.lat) * 0.02;
      }
    }

    const ease = 1 - Math.exp(-dt * (dragging ? 18 : 3.2));
    view.lon += (target.lon - view.lon) * ease;
    view.lat += (target.lat - view.lat) * ease;
    globe.rotation.set(view.lat * D2R, -view.lon * D2R, 0);
    globe.updateMatrixWorld();

    renderer.render(scene, camera);

    const w = el.clientWidth;
    const h = el.clientHeight;
    const left = el.getBoundingClientRect().left;
    for (const pin of pins) {
      if (!pin.el) continue;
      world.copy(pin.vec).applyMatrix4(globe.matrixWorld);
      toCamera.copy(camera.position).sub(world).normalize();
      const facing = world.clone().normalize().dot(toCamera);
      const shown = facing > 0.12 && dotUniforms.uReveal.value > 0.5;
      pin.el.classList.toggle('is-visible', shown);
      if (!shown) continue;
      world.project(camera);
      const x = (world.x * 0.5 + 0.5) * w;
      const y = (-world.y * 0.5 + 0.5) * h;
      const flip = left + x + pin.el.offsetWidth + 16 > window.innerWidth;
      pin.el.classList.toggle('pin--flip', flip);
      pin.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${flip ? '-100%' : '0'}, -50%)`;
    }
  }
  gsap.ticker.add(render);

  // Intro: land spreads outward from Clark, then the arcs draw.
  if (reducedMotion) {
    dotUniforms.uReveal.value = 1;
    arcs.forEach((a) => (a.uniforms.uDraw.value = 1));
    view.lon = rest.lon;
  } else {
    gsap.to(dotUniforms.uReveal, { value: 1, duration: 2.4, ease: 'power2.out', delay: 0.25 });
    arcs.forEach((a, i) => {
      gsap.to(a.uniforms.uDraw, { value: 1, duration: 1.5, ease: 'power2.inOut', delay: 1 + i * 0.16 });
    });
  }
  el.classList.add('is-ready');

  function destroy() {
    gsap.ticker.remove(render);
    resizeObserver.disconnect();
    intersection.disconnect();
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    scene.traverse((obj) => {
      obj.geometry?.dispose();
      obj.material?.dispose();
    });
    renderer.dispose();
  }

  return { focus, destroy };
}
