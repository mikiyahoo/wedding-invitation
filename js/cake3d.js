/* ============================================================
   3D Wedding Cake — three.js (loaded from CDN in index.html)
   Three smooth white tiers, piped edges, ivory pearls, a gold
   ribbon and ring topper, on a warm brown-gold stand.
   Falls back to a cake emoji if three.js is unavailable.
   ============================================================ */
(function () {
  "use strict";

  /* ── palette ───────────────────────────────────────────── */
  var ICING_1 = 0xfffdf8;   // bottom tier
  var ICING_2 = 0xfffaf2;   // middle tier
  var ICING_3 = 0xfff7ec;   // top tier
  var PIPING  = 0xffffff;   // piped edges
  var PEARL   = 0xfaf1e2;   // ivory pearls
  var GOLD    = 0xc9a24a;   // ribbon, topper rings
  var STAND   = 0x9c7440;   // brown-gold cake stand

  /* tier geometry: [radius, height, bottomY] */
  var TIERS = [
    { r: 0.75, h: 0.55, y: 0.00, color: ICING_1 },
    { r: 0.55, h: 0.45, y: 0.55, color: ICING_2 },
    { r: 0.36, h: 0.35, y: 1.00, color: ICING_3 }
  ];

  function icing(color) {
    return new THREE.MeshStandardMaterial({
      color: color, roughness: 0.68, metalness: 0.0, envMapIntensity: 0.55
    });
  }
  function metal(color, rough) {
    return new THREE.MeshStandardMaterial({
      color: color, roughness: rough, metalness: 0.85, envMapIntensity: 1.0
    });
  }

  /* A soft studio gradient so the gold has something to reflect. */
  function buildEnvironment(renderer) {
    try {
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var g = c.getContext("2d");
      var grad = g.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.55, "#f7edde");
      grad.addColorStop(1, "#d6c2a4");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);

      var cube = new THREE.CubeTexture([c, c, c, c, c, c]);
      cube.needsUpdate = true;
      var pmrem = new THREE.PMREMGenerator(renderer);
      var env = pmrem.fromCubemap(cube).texture;
      pmrem.dispose();
      return env;
    } catch (e) {
      return null;
    }
  }

  function buildCake() {
    var cake = new THREE.Group();

    /* ── stand ───────────────────────────────────────────── */
    var standTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.05, 72),
      metal(STAND, 0.42)
    );
    standTop.position.y = -0.025;
    cake.add(standTop);

    var standEdge = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.028, 18, 72),
      metal(STAND, 0.38)
    );
    standEdge.rotation.x = Math.PI / 2;
    standEdge.position.y = -0.025;
    cake.add(standEdge);

    var standStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.26, 0.14, 48),
      metal(STAND, 0.45)
    );
    standStem.position.y = -0.12;
    cake.add(standStem);

    var standFoot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.05, 56),
      metal(STAND, 0.45)
    );
    standFoot.position.y = -0.21;
    cake.add(standFoot);

    /* ── tiers ───────────────────────────────────────────── */
    TIERS.forEach(function (t, i) {
      var body = new THREE.Mesh(
        new THREE.CylinderGeometry(t.r, t.r, t.h, 72, 1, false),
        icing(t.color)
      );
      body.position.y = t.y + t.h / 2;
      cake.add(body);

      // piped border where the tier meets what is below it
      var base = new THREE.Mesh(
        new THREE.TorusGeometry(t.r - 0.012, 0.042, 20, 72),
        icing(PIPING)
      );
      base.rotation.x = Math.PI / 2;
      base.position.y = t.y + 0.042;
      cake.add(base);

      // softened top edge
      var rim = new THREE.Mesh(
        new THREE.TorusGeometry(t.r - 0.018, 0.026, 18, 72),
        icing(PIPING)
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = t.y + t.h - 0.014;
      cake.add(rim);

      // ivory pearls around the upper tiers where they sit on the one below
      if (i > 0) {
        var count = 22;
        var pearlGeo = new THREE.SphereGeometry(0.028, 18, 14);
        var pearlMat = icing(PEARL);
        for (var p = 0; p < count; p++) {
          var a = (p / count) * Math.PI * 2;
          var pearl = new THREE.Mesh(pearlGeo, pearlMat);
          pearl.position.set(Math.cos(a) * (t.r + 0.028), t.y + 0.018, Math.sin(a) * (t.r + 0.028));
          cake.add(pearl);
        }
      }
    });

    /* ── gold ribbon around the bottom tier ──────────────── */
    var ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.757, 0.757, 0.055, 72, 1, true),
      metal(GOLD, 0.3)
    );
    ribbon.position.y = 0.155;
    cake.add(ribbon);

    /* ── topper: two interlocking rings ──────────────────── */
    var topper = new THREE.Group();
    var ringGeo = new THREE.TorusGeometry(0.095, 0.017, 20, 64);

    var ringA = new THREE.Mesh(ringGeo, metal(GOLD, 0.22));
    ringA.position.set(-0.045, 0.1, 0);
    ringA.rotation.set(0, -0.32, -0.16);
    topper.add(ringA);

    var ringB = new THREE.Mesh(ringGeo, metal(GOLD, 0.22));
    ringB.position.set(0.045, 0.1, 0.012);
    ringB.rotation.set(0, 0.32, 0.16);
    topper.add(ringB);

    var pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, 0.09, 24),
      metal(GOLD, 0.3)
    );
    pin.position.y = 0.02;
    topper.add(pin);

    topper.position.y = TIERS[2].y + TIERS[2].h;
    cake.add(topper);

    cake.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });

    return cake;
  }

  function initCake(container) {
    if (!container) return;

    if (typeof THREE === "undefined") {
      container.innerHTML = '<div class="cake-fallback">&#127874;</div>';
      return;
    }

    var w = container.clientWidth || 300;
    var h = container.clientHeight || 300;

    var scene = new THREE.Scene();

    // Framing was solved by projecting the model's extreme points: with this
    // camera the cake spans NDC y -0.83..+0.85 and x +/-0.75, so the stand rim
    // and the topper both keep a clear margin inside the square canvas.
    var camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 20);
    camera.position.set(2.45, 2.20, 3.35);
    camera.lookAt(0, 0.58, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    var env = buildEnvironment(renderer);
    if (env) scene.environment = env;

    /* ── lighting ────────────────────────────────────────── */
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0xd8c3a2, 0.55));
    scene.add(new THREE.AmbientLight(0xfff2df, 0.28));

    var keyLight = new THREE.DirectionalLight(0xfffaf0, 1.65);
    keyLight.position.set(1.6, 3.1, 2.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 9;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0012;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0xf7e3cb, 0.5);
    fillLight.position.set(-2.6, 1.4, 1.3);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0xffe9c6, 0.42);
    rimLight.position.set(-0.6, 1.2, -2.8);
    scene.add(rimLight);

    /* ── cake + contact shadow ───────────────────────────── */
    var cake = buildCake();
    scene.add(cake);

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.ShadowMaterial({ opacity: 0.16 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.24;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ── animation ───────────────────────────────────────── */
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var BASE_Y = 0.06;   // lifts the cake clear of the lower edge
    cake.position.y = BASE_Y;

    (function animate() {
      if (!still) {
        cake.rotation.y += 0.005;
        cake.position.y = BASE_Y + Math.sin(Date.now() * 0.001) * 0.025;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    })();

    window.addEventListener("resize", function () {
      var nw = container.clientWidth || 300;
      var nh = container.clientHeight || 300;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    initCake(document.getElementById("cake3dContainer"));
  });
})();
