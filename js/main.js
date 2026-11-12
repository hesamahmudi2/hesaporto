const header = document.querySelector('.site-header');
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const threeCanvas = document.querySelector('.three-canvas');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20));

// A small procedural Three.js scene: no model files, textures, or heavy post-processing.
const startThreeScene = async () => {
  if (!threeCanvas || !window.matchMedia('(min-width: 761px) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const shape = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 1),
      new THREE.MeshStandardMaterial({ color: 0xd85b3f, roughness: .68, metalness: .08, flatShading: true })
    );
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.48, 1),
      new THREE.MeshBasicMaterial({ color: 0xd8e86c, wireframe: true, transparent: true, opacity: .42 })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, .012, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x1d2925, transparent: true, opacity: .28 })
    );
    const heroObject = new THREE.Group();
    heroObject.add(shape, wire, ring);
    heroObject.position.set(2.2, 1.2, 0);
    heroObject.rotation.set(.18, -.3, .15);

    const aboutObject = new THREE.Group();
    const aboutShape = new THREE.Mesh(
      new THREE.TorusKnotGeometry(.78, .22, 64, 10),
      new THREE.MeshStandardMaterial({ color: 0xd8e86c, roughness: .6, metalness: .1, flatShading: true })
    );
    const aboutRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, .012, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xd85b3f, transparent: true, opacity: .55 })
    );
    aboutObject.add(aboutShape, aboutRing);
    aboutObject.position.set(-3, -3.5, -.3);
    aboutObject.rotation.set(.5, -.4, .2);

    const workObject = new THREE.Group();
    const workShape = new THREE.Mesh(
      new THREE.DodecahedronGeometry(.95, 0),
      new THREE.MeshStandardMaterial({ color: 0x253b37, roughness: .5, metalness: .15, flatShading: true })
    );
    const workWire = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.12, 0),
      new THREE.MeshBasicMaterial({ color: 0xd8e86c, wireframe: true, transparent: true, opacity: .65 })
    );
    workObject.add(workShape, workWire);
    workObject.position.set(3, -9, .2);
    workObject.rotation.set(-.4, .4, -.2);
    scene.add(heroObject, aboutObject, workObject);
    scene.add(new THREE.AmbientLight(0xfff7e8, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollOffset = window.scrollY;
    let running = true;
    let frame;
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const onPointer = (event) => {
      pointer.targetX = (event.clientX / window.innerWidth - .5) * 2;
      pointer.targetY = (event.clientY / window.innerHeight - .5) * 2;
    };
    const onScroll = () => { scrollOffset = window.scrollY; };
    const animate = (time) => {
      if (!running) return;
      pointer.x += (pointer.targetX - pointer.x) * .045;
      pointer.y += (pointer.targetY - pointer.y) * .045;
      const vh = window.innerHeight;
      const progress = scrollOffset / Math.max(document.documentElement.scrollHeight - vh, 1);
      heroObject.rotation.x += .0012;
      heroObject.rotation.y += .003;
      heroObject.rotation.x += (pointer.y * .002);
      heroObject.rotation.z += (pointer.x * .0008);
      heroObject.position.y = 1.2 + Math.sin(time * .0007) * .08 - progress * 2.4;
      heroObject.position.x = 2.2 + pointer.x * .12 - progress * 1.8;
      heroObject.children[2].rotation.x = time * .00018;
      heroObject.children[2].rotation.y = time * .00025;

      aboutShape.rotation.x += .002;
      aboutShape.rotation.y += .0035;
      aboutObject.rotation.z += .001;
      aboutObject.position.y = -3.5 + progress * 8 + pointer.y * .12;
      aboutObject.position.x = -3 + pointer.x * .15 + progress * 1.2;
      aboutObject.children[1].rotation.z = -time * .00035;

      workShape.rotation.x -= .0018;
      workShape.rotation.y += .0025;
      workObject.rotation.z -= .001;
      workObject.position.y = -9 + progress * 10.5;
      workObject.position.x = 3 - progress * 2 + pointer.x * .12;

      heroObject.visible = progress < .55;
      aboutObject.visible = progress > .08 && progress < .86;
      workObject.visible = progress > .34;
      const fade = Math.min(1, Math.max(0, (progress - .88) * 8));
      workObject.traverse((object) => { if (object.material) object.material.opacity = object.material.transparent ? 1 - fade : object.material.opacity; });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(animate);
      else cancelAnimationFrame(frame);
    });
    requestAnimationFrame(animate);
  } catch (error) {
    threeCanvas.hidden = true;
    console.warn('Three.js scene unavailable; keeping the CSS artwork visible.', error);
  }
};
startThreeScene();

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? '×' : '☰';
});

document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = '☰';
}));

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeToggle.textContent = dark ? '☀' : '◐';
  themeToggle.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
});

const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

document.querySelectorAll('.ripple').forEach(button => button.addEventListener('click', (event) => {
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
  circle.classList.add('ripple-circle');
  circle.addEventListener('animationend', () => circle.remove());
  button.appendChild(circle);
}));

// A lightweight cursor accent for pointer devices only. Touchscreens keep the native cursor.
if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-custom-cursor');
  window.addEventListener('pointermove', (event) => {
    cursorDot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursorRing.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });
  document.querySelectorAll('a, button, .project-card, .coming-soon-card').forEach((element) => {
    element.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}
