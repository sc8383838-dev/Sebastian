// ============================================================
// ESCENA
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x000000);


// ============================================================
// CÁMARA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

camera.position.set(
    0,
    0,
    25
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.7
    )
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("scene")
    .appendChild(
        renderer.domElement
    );


// ============================================================
// LUCES
// ============================================================

scene.add(
    new THREE.AmbientLight(
        0xffd36a,
        0.5
    )
);

const centralLight =
    new THREE.PointLight(
        0xffb300,
        7,
        40
    );

centralLight.position.set(
    0,
    0,
    5
);

scene.add(
    centralLight
);


// ============================================================
// UNIVERSO 3D
// ============================================================

const universe =
    new THREE.Group();

scene.add(
    universe
);


// ============================================================
// CONTROLES 3D
// ============================================================

let targetRotationX = 0;
let targetRotationY = 0;

let currentRotationX = 0;
let currentRotationY = 0;

let targetZoom = 25;
let currentZoom = 25;

let dragging = false;

let previousX = 0;
let previousY = 0;


// ============================================================
// MOUSE
// ============================================================

window.addEventListener(
    "mousedown",
    (event) => {

        dragging = true;

        previousX =
            event.clientX;

        previousY =
            event.clientY;
    }
);


window.addEventListener(
    "mouseup",
    () => {

        dragging = false;
    }
);


window.addEventListener(
    "mousemove",
    (event) => {

        if (!dragging)
            return;

        const dx =
            event.clientX -
            previousX;

        const dy =
            event.clientY -
            previousY;

        targetRotationY +=
            dx * 0.004;

        targetRotationX +=
            dy * 0.003;

        targetRotationX =
            THREE.MathUtils.clamp(
                targetRotationX,
                -1,
                1
            );

        previousX =
            event.clientX;

        previousY =
            event.clientY;
    }
);


// ============================================================
// ZOOM
// ============================================================

window.addEventListener(
    "wheel",
    (event) => {

        targetZoom +=
            event.deltaY * 0.012;

        targetZoom =
            THREE.MathUtils.clamp(
                targetZoom,
                17,
                38
            );
    },
    {
        passive: true
    }
);


// ============================================================
// TOUCH
// ============================================================

let lastTouchX = 0;
let lastTouchY = 0;
let lastTouchDistance = null;


function getTouchDistance(
    touches
) {

    const dx =
        touches[0].clientX -
        touches[1].clientX;

    const dy =
        touches[0].clientY -
        touches[1].clientY;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


window.addEventListener(
    "touchstart",
    (event) => {

        if (
            event.touches.length === 1
        ) {

            lastTouchX =
                event.touches[0].clientX;

            lastTouchY =
                event.touches[0].clientY;
        }

        if (
            event.touches.length === 2
        ) {

            lastTouchDistance =
                getTouchDistance(
                    event.touches
                );
        }
    },
    {
        passive: true
    }
);


window.addEventListener(
    "touchmove",
    (event) => {

        if (
            event.touches.length === 1
        ) {

            const x =
                event.touches[0].clientX;

            const y =
                event.touches[0].clientY;

            const dx =
                x - lastTouchX;

            const dy =
                y - lastTouchY;

            targetRotationY +=
                dx * 0.005;

            targetRotationX +=
                dy * 0.0035;

            targetRotationX =
                THREE.MathUtils.clamp(
                    targetRotationX,
                    -1,
                    1
                );

            lastTouchX = x;
            lastTouchY = y;
        }

        if (
            event.touches.length === 2
        ) {

            const distance =
                getTouchDistance(
                    event.touches
                );

            if (
                lastTouchDistance !== null
            ) {

                targetZoom +=
                    (
                        lastTouchDistance -
                        distance
                    ) * 0.025;

                targetZoom =
                    THREE.MathUtils.clamp(
                        targetZoom,
                        17,
                        38
                    );
            }

            lastTouchDistance =
                distance;
        }
    },
    {
        passive: true
    }
);


window.addEventListener(
    "touchend",
    () => {

        lastTouchDistance =
            null;
    }
);


// ============================================================
// ESTRELLAS DEL UNIVERSO
// ============================================================

const starCount =
    window.innerWidth < 700
        ? 2200
        : 4300;

const starGeometry =
    new THREE.BufferGeometry();

const starPositions =
    new Float32Array(
        starCount * 3
    );


for (
    let i = 0;
    i < starCount;
    i++
) {

    const radius =
        THREE.MathUtils.randFloat(
            20,
            75
        );

    const theta =
        Math.random() *
        Math.PI * 2;

    const phi =
        Math.acos(
            THREE.MathUtils.randFloat(
                -1,
                1
            )
        );

    starPositions[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

    starPositions[i * 3 + 1] =
        radius *
        Math.cos(phi);

    starPositions[i * 3 + 2] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);
}


starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        starPositions,
        3
    )
);


const starMaterial =
    new THREE.PointsMaterial({

        color: 0xffe89a,

        size: 0.065,

        transparent: true,

        opacity: 0.85,

        blending:
            THREE.AdditiveBlending
    });


const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(
    stars
);


// ============================================================
// ESTRELLAS GRANDES
// ============================================================

function createStarShape(
    scale = 1
) {

    const group =
        new THREE.Group();

    const outer =
        new THREE.Shape();

    const points = 5;

    const outerRadius = 0.34;
    const innerRadius = 0.13;


    for (
        let i = 0;
        i < points * 2;
        i++
    ) {

        const angle =
            i *
            Math.PI /
            points -
            Math.PI / 2;

        const radius =
            i % 2 === 0
                ? outerRadius
                : innerRadius;

        const x =
            Math.cos(angle) *
            radius;

        const y =
            Math.sin(angle) *
            radius;


        if (i === 0) {

            outer.moveTo(
                x,
                y
            );

        } else {

            outer.lineTo(
                x,
                y
            );
        }
    }


    outer.closePath();


    const geometry =
        new THREE.ShapeGeometry(
            outer
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffe36a,

            transparent: true,

            opacity: 0.9,

            side:
                THREE.DoubleSide,

            blending:
                THREE.AdditiveBlending

        });


    const star =
        new THREE.Mesh(
            geometry,
            material
        );


    star.scale.setScalar(
        scale
    );


    group.add(
        star
    );


    return group;
}


const decorativeStars = [

    [-11, 7, 4, 1.0],
    [-6, 5, 6, 0.65],
    [-1, 8, 5, 0.8],
    [5, 7, 4, 0.65],
    [11, 7, 5, 1.0],

    [-12, 1, 5, 0.7],
    [12, 1, 5, 0.7],

    [-11, -5, 5, 0.9],
    [-6, -7, 5, 0.65],
    [6, -7, 5, 0.65],
    [11, -5, 5, 0.9],

    [-4, 2, 6, 0.45],
    [4, 2, 6, 0.5]

];


const starObjects = [];


decorativeStars.forEach(
    (data) => {

        const star =
            createStarShape(
                data[3]
            );

        star.position.set(
            data[0],
            data[1],
            data[2]
        );

        universe.add(
            star
        );

        starObjects.push({

            object: star,

            offset:
                Math.random() *
                Math.PI * 2

        });
    }
);


// ============================================================
// PARTÍCULAS DORADAS
// ============================================================

const particleCount =
    window.innerWidth < 700
        ? 1300
        : 2600;

const particleGeometry =
    new THREE.BufferGeometry();

const particlePositions =
    new Float32Array(
        particleCount * 3
    );


for (
    let i = 0;
    i < particleCount;
    i++
) {

    const radius =
        THREE.MathUtils.randFloat(
            4,
            15
        );

    const angle =
        Math.random() *
        Math.PI * 2;


    particlePositions[i * 3] =
        Math.cos(angle) *
        radius;

    particlePositions[i * 3 + 1] =
        THREE.MathUtils.randFloatSpread(
            10
        );

    particlePositions[i * 3 + 2] =
        Math.sin(angle) *
        radius;
}


particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        particlePositions,
        3
    )
);


const particleMaterial =
    new THREE.PointsMaterial({

        color: 0xffc400,

        size: 0.065,

        transparent: true,

        opacity: 0.72,

        blending:
            THREE.AdditiveBlending

    });


const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );

universe.add(
    particles
);


// ============================================================
// POLVO / NIEBLA AMARILLA TENUE
// ============================================================

function createDustCloud(
    x,
    y,
    z,
    width,
    height,
    amount
) {

    const geometry =
        new THREE.BufferGeometry();

    const positions =
        new Float32Array(
            amount * 3
        );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        positions[i * 3] =
            x +
            THREE.MathUtils.randFloatSpread(
                width
            );

        positions[i * 3 + 1] =
            y +
            THREE.MathUtils.randFloatSpread(
                height
            );

        positions[i * 3 + 2] =
            z +
            THREE.MathUtils.randFloatSpread(
                4
            );
    }


    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({

            color: 0xdca900,

            size: 0.12,

            transparent: true,

            opacity: 0.055,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    const cloud =
        new THREE.Points(
            geometry,
            material
        );


    universe.add(
        cloud
    );


    return cloud;
}


const dust1 =
    createDustCloud(
        -10,
        5,
        -2,
        10,
        5,
        550
    );


const dust2 =
    createDustCloud(
        10,
        4,
        -3,
        9,
        5,
        500
    );


const dust3 =
    createDustCloud(
        -8,
        -5,
        -2,
        11,
        4,
        450
    );


const dust4 =
    createDustCloud(
        8,
        -5,
        -3,
        10,
        4,
        450
    );


// ============================================================
// AGUJERO NEGRO
// ============================================================

const blackHole =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            4.05,
            64,
            64
        ),

        new THREE.MeshBasicMaterial({
            color: 0x000000
        })
    );

universe.add(
    blackHole
);


// ============================================================
// HALO
// ============================================================

const halo =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            5.15,
            64,
            64
        ),

        new THREE.MeshBasicMaterial({

            color: 0x120b02,

            transparent: true,

            opacity: 0.5,

            side:
                THREE.BackSide

        })
    );

universe.add(
    halo
);


// ============================================================
// ARO PRINCIPAL
// ============================================================

const disk =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            5.05,
            0.55,
            24,
            180
        ),

        new THREE.MeshBasicMaterial({

            color: 0xffc400,

            transparent: true,

            opacity: 0.95,

            blending:
                THREE.AdditiveBlending

        })
    );

disk.rotation.x =
    0.95;

universe.add(
    disk
);


// ============================================================
// ARO EXTERIOR
// ============================================================

const ring =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            5.65,
            0.055,
            12,
            180
        ),

        new THREE.MeshBasicMaterial({

            color: 0xffe36a,

            transparent: true,

            opacity: 0.95,

            blending:
                THREE.AdditiveBlending

        })
    );

ring.rotation.x =
    0.95;

universe.add(
    ring
);


// ============================================================
// SEGUNDO ARO
// ============================================================

const ring2 =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            6.1,
            0.035,
            10,
            180
        ),

        new THREE.MeshBasicMaterial({

            color: 0xff9f00,

            transparent: true,

            opacity: 0.8,

            blending:
                THREE.AdditiveBlending

        })
    );

ring2.rotation.x =
    0.95;

universe.add(
    ring2
);


// ============================================================
// GEOMETRÍAS DE LAS FLORES
// ============================================================

const petalGeometry =
    new THREE.SphereGeometry(
        1,
        12,
        8
    );

petalGeometry.scale(
    0.30,
    0.62,
    0.12
);


const centerGeometry =
    new THREE.SphereGeometry(
        0.48,
        20,
        20
    );


const stemGeometry =
    new THREE.CylinderGeometry(
        0.075,
        0.11,
        2.7,
        10
    );


const leafGeometry =
    new THREE.SphereGeometry(
        1,
        10,
        7
    );

leafGeometry.scale(
    0.55,
    0.20,
    0.12
);


// ============================================================
// MATERIALES DE FLORES
// ============================================================

const petalMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xffc107,

        roughness: 0.55
    });


const petalLightMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xffd83d,

        roughness: 0.5
    });


const centerMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x4b1b05,

        roughness: 0.9
    });


const stemMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x236000,

        roughness: 0.85
    });


const leafMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x397500,

        roughness: 0.8
    });


// ============================================================
// CREAR FLOR
// ============================================================

function createFlower(
    scale = 1
) {

    const flower =
        new THREE.Group();

    flower.scale.setScalar(
        scale
    );


    // TALLO

    const stem =
        new THREE.Mesh(
            stemGeometry,
            stemMaterial
        );

    stem.position.y =
        -1.35;

    flower.add(
        stem
    );


    // CENTRO

    const center =
        new THREE.Mesh(
            centerGeometry,
            centerMaterial
        );

    center.position.y =
        0.35;

    flower.add(
        center
    );


    // PÉTALOS

    const petalCount =
        16;


    for (
        let i = 0;
        i < petalCount;
        i++
    ) {

        const angle =
            (
                i /
                petalCount
            ) *
            Math.PI * 2;


        const petal =
            new THREE.Mesh(

                petalGeometry,

                i % 2 === 0
                    ? petalMaterial
                    : petalLightMaterial
            );


        const radius =
            0.62;


        petal.position.set(

            Math.cos(angle) *
            radius,

            0.35 +
            Math.sin(angle) *
            radius,

            0

        );


        petal.rotation.z =
            -angle +
            Math.PI / 2;


        flower.add(
            petal
        );
    }


    // HOJA IZQUIERDA

    const leftLeaf =
        new THREE.Mesh(
            leafGeometry,
            leafMaterial
        );

    leftLeaf.position.set(
        -0.42,
        -0.85,
        0
    );

    leftLeaf.rotation.z =
        -0.45;

    flower.add(
        leftLeaf
    );


    // HOJA DERECHA

    const rightLeaf =
        new THREE.Mesh(
            leafGeometry,
            leafMaterial
        );

    rightLeaf.position.set(
        0.42,
        -0.55,
        0
    );

    rightLeaf.rotation.z =
        0.45;

    flower.add(
        rightLeaf
    );


    return flower;
}


// ============================================================
// FLORES POR TODO EL PLANO
// ============================================================

const flowerPositions = [

    [-13, 7, 7, 0.55],
    [-8, 8, 5, 0.65],
    [-3, 9, 6, 0.52],
    [3, 9, 6, 0.58],
    [8, 8, 5, 0.62],
    [13, 7, 7, 0.55],

    [-14, 3, 6, 0.62],
    [14, 3, 6, 0.62],

    [-14, -2, 7, 0.58],
    [14, -2, 7, 0.58],

    [-13, -7, 6, 0.65],
    [-8, -8, 5, 0.58],
    [-3, -9, 7, 0.55],
    [3, -9, 7, 0.55],
    [8, -8, 5, 0.62],
    [13, -7, 6, 0.65],

    [-11, 5, 2, 0.48],
    [-7, 6, 1, 0.42],
    [-2, 7, 2, 0.46],
    [2, 7, 2, 0.46],
    [7, 6, 1, 0.42],
    [11, 5, 2, 0.48],

    [-11, 0, 3, 0.52],
    [11, 0, 3, 0.52],

    [-10, -4, 2, 0.46],
    [-6, -5, 1, 0.42],
    [6, -5, 1, 0.42],
    [10, -4, 2, 0.46],

    [-12, 8, -5, 0.38],
    [-5, 8, -6, 0.34],
    [5, 8, -6, 0.34],
    [12, 8, -5, 0.38],

    [-14, 0, -4, 0.40],
    [14, 0, -4, 0.40],

    [-12, -7, -5, 0.38],
    [-5, -7, -6, 0.34],
    [5, -7, -6, 0.34],
    [12, -7, -5, 0.38]

];


const flowers = [];


flowerPositions.forEach(
    (data) => {

        const flower =
            createFlower(
                data[3]
            );


        flower.position.set(
            data[0],
            data[1],
            data[2]
        );


        flower.rotation.z =
            THREE.MathUtils.randFloat(
                -0.15,
                0.15
            );

        flower.rotation.y =
            THREE.MathUtils.randFloat(
                -0.35,
                0.35
            );


        universe.add(
            flower
        );


        flowers.push({

            object: flower,

            baseY: data[1],

            offset:
                Math.random() *
                Math.PI * 2

        });
    }
);


// ============================================================
// RAMOS
// ============================================================

function createBouquet(
    scale = 1
) {

    const bouquet =
        new THREE.Group();

    bouquet.scale.setScalar(
        scale
    );


    const stemPositions = [
        -0.7,
        -0.35,
        0,
        0.35,
        0.7
    ];


    stemPositions.forEach(
        (x) => {

            const stem =
                new THREE.Mesh(
                    stemGeometry,
                    stemMaterial
                );

            stem.position.set(
                x,
                -1.2,
                0
            );

            stem.rotation.z =
                x * 0.12;

            bouquet.add(
                stem
            );
        }
    );


    const bouquetFlowers = [

        [-0.70, 0.65, 0.55],
        [-0.35, 0.88, 0.58],
        [0, 1.00, 0.62],
        [0.35, 0.88, 0.58],
        [0.70, 0.65, 0.55],

        [-0.45, 0.35, 0.48],
        [0, 0.42, 0.52],
        [0.45, 0.35, 0.48]

    ];


    bouquetFlowers.forEach(
        (data) => {

            const flower =
                createFlower(
                    data[2]
                );

            flower.position.set(
                data[0],
                data[1],
                0
            );

            bouquet.add(
                flower
            );
        }
    );


    return bouquet;
}


const bouquetData = [

    [-12.5, 7.2, 4, 0.45, -0.15],
    [12.5, 7.2, 4, 0.45, 0.15],

    [-13.5, -0.5, 3, 0.42, -0.10],
    [13.5, -0.5, 3, 0.42, 0.10],

    [-10.5, -7.0, 4, 0.42, -0.12],
    [10.5, -7.0, 4, 0.42, 0.12],

    [-14, 4.5, -4, 0.30, -0.20],
    [14, 4.5, -4, 0.30, 0.20]

];


const bouquets = [];


bouquetData.forEach(
    (data) => {

        const bouquet =
            createBouquet(
                data[3]
            );


        bouquet.position.set(
            data[0],
            data[1],
            data[2]
        );


        bouquet.rotation.z =
            data[4];


        universe.add(
            bouquet
        );


        bouquets.push({

            object: bouquet,

            baseY: data[1],

            offset:
                Math.random() *
                Math.PI * 2

        });
    }
);


// ============================================================
// FRASES
// ============================================================

const messages = [

    "Te amo mucho molicita",

    "Feliz dia de las flores amarillas",

    "que te paces un lindo dia",

    "un regalo de molicito muy wonito",

    "te amo tanto",

    "eres la flor de mi vida",

    "brillas tanto como el sol",

    "eres mi persona favorita",

    "gracias por existir",

    "tú haces todo más bonito",

    "mi lugar favorito siempre serás tú",

    "la vida es más linda contigo",

    "te quiero muchísimo",

    "gracias por llenar mi vida de color",

    "hoy, mañana y siempre",

    "mi corazón siempre florece contigo",

    "eres mi rayito de sol",

    "contigo todo es más bonito"

];


const textPositions = [

    [-7.0, 3.0, 5],
    [-7.2, -0.2, 4],
    [7.0, 2.0, 5],
    [0, 6.2, 4],
    [-6.0, -2.5, 5],
    [6.2, -2.8, 5],
    [0, -6.3, 5],

    [-12, 5.2, 4],
    [12, 5.0, 4],

    [-12, -1.5, 5],
    [12, -1.3, 5],

    [-8, -6.0, 5],
    [8, -6.0, 5],

    [-3.5, 6.8, 3],
    [3.8, 6.6, 3],

    [-11, -5.5, 2],
    [11, -5.5, 2],

    [0, 8.0, 2]

];


function createTextSprite(
    message
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        1200;

    canvas.height =
        220;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.font =
        "bold 58px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.shadowColor =
        "#ffe66d";

    ctx.shadowBlur =
        30;


    ctx.fillStyle =
        "#fff1a3";


    ctx.fillText(
        message,
        canvas.width / 2,
        canvas.height / 2
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(
        6.3,
        1.15,
        1
    );


    return sprite;
}

// ============================================================
// TÍTULO PRINCIPAL
// ============================================================

function createMainTitle() {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 1800;
    canvas.height = 560;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // PRIMERAS DOS LÍNEAS - AMARILLO
    // ========================================================

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
        "bold italic 112px Georgia";


    ctx.shadowColor =
        "#ffb300";

    ctx.shadowBlur =
        45;

    ctx.fillStyle =
        "#fff3a0";


    ctx.fillText(
        "Feliz dia de las",
        canvas.width / 2,
        125
    );


    ctx.fillText(
        "flores amarillas",
        canvas.width / 2,
        255
    );


    // ========================================================
    // TERCERA LÍNEA - MOLICITA
    // ========================================================

    ctx.font =
        "bold italic 125px Georgia";


    // Brillo rosado

    ctx.shadowColor =
        "#ff4fa3";

    ctx.shadowBlur =
        50;


    // Color principal

    ctx.fillStyle =
        "#ff8fc7";


    ctx.fillText(
        "Molicita",
        canvas.width / 2,
        405
    );


    // Brillo interior adicional

    ctx.shadowColor =
        "#ffb7df";

    ctx.shadowBlur =
        22;

    ctx.fillStyle =
        "#ffd1e9";

    ctx.fillText(
        "Molicita",
        canvas.width / 2,
        405
    );


    // ========================================================
    // TEXTURA
    // ========================================================

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    const title =
        new THREE.Sprite(
            material
        );


    title.scale.set(
        11.5,
        3.6,
        1
    );


    title.position.set(
        0,
        0,
        6.2
    );


    universe.add(
        title
    );


    return title;
}


// ============================================================
// CREAR TÍTULO
// ============================================================

const mainTitle =
    createMainTitle();

const textSprites = [];


messages.forEach(
    (message, index) => {

        const sprite =
            createTextSprite(
                message
            );


        sprite.position.set(
            textPositions[index][0],
            textPositions[index][1],
            textPositions[index][2]
        );


        universe.add(
            sprite
        );


        textSprites.push({

            object: sprite,

            baseY:
                textPositions[index][1],

            offset:
                Math.random() *
                Math.PI * 2

        });
    }
);


// ============================================================
// ❤️ CORAZONES BRILLANTES
// ============================================================

function createHeart(
    scale = 1
) {

    const group =
        new THREE.Group();


    // --------------------------------------------------------
    // FORMA DEL CORAZÓN
    // La punta queda hacia ABAJO
    // --------------------------------------------------------

    const shape =
        new THREE.Shape();


    shape.moveTo(
        0,
        -0.95
    );


    // LÓBULO IZQUIERDO

    shape.bezierCurveTo(
        -0.35,
        -0.55,

        -1.25,
        -0.15,

        -1.15,
        0.55
    );


    shape.bezierCurveTo(
        -1.05,
        1.25,

        -0.25,
        1.25,

        0,
        0.55
    );


    // LÓBULO DERECHO

    shape.bezierCurveTo(
        0.25,
        1.25,

        1.05,
        1.25,

        1.15,
        0.55
    );


    shape.bezierCurveTo(
        1.25,
        -0.15,

        0.35,
        -0.55,

        0,
        -0.95
    );


    const geometry =
        new THREE.ShapeGeometry(
            shape
        );


    // --------------------------------------------------------
    // HALO EXTERIOR
    // --------------------------------------------------------

    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffc400,

            transparent: true,

            opacity: 0.16,

            side:
                THREE.DoubleSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite: false

        });


    const glow =
        new THREE.Mesh(
            geometry,
            glowMaterial
        );


    glow.scale.set(
        1.22,
        1.22,
        1.22
    );


    group.add(
        glow
    );


    // --------------------------------------------------------
    // CORAZÓN PRINCIPAL
    // --------------------------------------------------------

    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffd84d,

            transparent: true,

            opacity: 0.92,

            side:
                THREE.DoubleSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite: false

        });


    const heart =
        new THREE.Mesh(
            geometry,
            material
        );


    group.add(
        heart
    );


    // --------------------------------------------------------
    // BRILLO INTERIOR
    // --------------------------------------------------------

    const innerMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffffb3,

            transparent: true,

            opacity: 0.22,

            side:
                THREE.DoubleSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite: false

        });


    const inner =
        new THREE.Mesh(
            geometry,
            innerMaterial
        );


    inner.scale.set(
        0.78,
        0.78,
        0.78
    );


    group.add(
        inner
    );


    // --------------------------------------------------------
    // TAMAÑO ORIGINAL
    // --------------------------------------------------------

    group.scale.setScalar(
        scale
    );


    group.userData.baseScale =
        scale;


    return group;
}


// ============================================================
// POSICIONES DE LOS CORAZONES
// ============================================================

const heartPositions = [

    [-10.0, 5.8, 5, 0.55],
    [-4.0, 5.0, 6, 0.42],
    [4.0, 5.3, 6, 0.48],
    [10.0, 5.8, 5, 0.55],

    [-11.5, 2.0, 6, 0.42],
    [11.5, 2.0, 6, 0.42],

    [-9.5, -2.0, 6, 0.50],
    [9.5, -2.0, 6, 0.50],

    [-10.0, -5.5, 5, 0.58],
    [-4.0, -6.0, 6, 0.42],
    [4.0, -6.0, 6, 0.42],
    [10.0, -5.5, 5, 0.58],

    [-5.5, 1.0, 6, 0.38],
    [5.5, 1.0, 6, 0.38]

];


const hearts = [];


heartPositions.forEach(
    (data) => {

        const heart =
            createHeart(
                data[3]
            );


        heart.position.set(
            data[0],
            data[1],
            data[2]
        );


        // ----------------------------------------------------
        // INCLINACIÓN SUAVE
        // Nunca se ponen de cabeza
        // ----------------------------------------------------

        heart.rotation.z =
            THREE.MathUtils.randFloat(
                -0.12,
                0.12
            );


        universe.add(
            heart
        );


        hearts.push({

            object:
                heart,

            baseY:
                data[1],

            offset:
                Math.random() *
                Math.PI * 2,

            baseScale:
                data[3]

        });

    }
);


// ============================================================
// CHISPAS DEL ARO
// ============================================================

const sparkCount =
    700;


const sparkGeometry =
    new THREE.BufferGeometry();


const sparkPositions =
    new Float32Array(
        sparkCount * 3
    );


for (
    let i = 0;
    i < sparkCount;
    i++
) {

    const angle =
        Math.random() *
        Math.PI * 2;

    const radius =
        THREE.MathUtils.randFloat(
            4.5,
            7.2
        );


    sparkPositions[i * 3] =
        Math.cos(angle) *
        radius;

    sparkPositions[i * 3 + 1] =
        THREE.MathUtils.randFloatSpread(
            2.5
        );

    sparkPositions[i * 3 + 2] =
        Math.sin(angle) *
        radius;
}


sparkGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        sparkPositions,
        3
    )
);


const sparkMaterial =
    new THREE.PointsMaterial({

        color: 0xffd000,

        size: 0.085,

        transparent: true,

        opacity: 0.9,

        blending:
            THREE.AdditiveBlending

    });


const sparks =
    new THREE.Points(
        sparkGeometry,
        sparkMaterial
    );

universe.add(
    sparks
);


// ============================================================
// ANIMACIÓN
// ============================================================

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        clock.getElapsedTime();


    // --------------------------------------------------------
    // MOVIMIENTO 3D
    // --------------------------------------------------------

    currentRotationX +=
        (
            targetRotationX -
            currentRotationX
        ) * 0.055;


    currentRotationY +=
        (
            targetRotationY -
            currentRotationY
        ) * 0.055;


    currentZoom +=
        (
            targetZoom -
            currentZoom
        ) * 0.08;


    universe.rotation.x =
        currentRotationX;

    universe.rotation.y =
        currentRotationY;


    camera.position.z =
        currentZoom;


    // --------------------------------------------------------
    // AROS
    // --------------------------------------------------------

    disk.rotation.z =
        time * 0.10;

    ring.rotation.z =
        -time * 0.06;

    ring2.rotation.z =
        time * 0.04;


    // --------------------------------------------------------
    // ESTRELLAS
    // --------------------------------------------------------

    stars.rotation.y =
        time * 0.004;


    starObjects.forEach(
        (data) => {

            data.object.rotation.z =
                time * 0.25 +
                data.offset;


            const pulse =
                1 +
                Math.sin(
                    time * 2 +
                    data.offset
                ) * 0.12;


            data.object.scale.setScalar(
                pulse
            );

        }
    );


    // --------------------------------------------------------
    // PARTÍCULAS
    // --------------------------------------------------------

    particles.rotation.y =
        time * 0.018;

    sparks.rotation.y =
        time * 0.10;


    // --------------------------------------------------------
    // POLVO
    // --------------------------------------------------------

    dust1.rotation.z =
        Math.sin(
            time * 0.10
        ) * 0.04;


    dust2.rotation.z =
        Math.cos(
            time * 0.12
        ) * 0.04;


    dust3.rotation.z =
        Math.sin(
            time * 0.08
        ) * 0.05;


    dust4.rotation.z =
        Math.cos(
            time * 0.09
        ) * 0.05;


    // --------------------------------------------------------
    // FLORES
    // --------------------------------------------------------

    flowers.forEach(
        (data) => {

            data.object.position.y =
                data.baseY +
                Math.sin(
                    time * 0.6 +
                    data.offset
                ) * 0.10;


            data.object.rotation.y +=
                0.0004;

        }
    );


    // --------------------------------------------------------
    // RAMOS
    // --------------------------------------------------------

    bouquets.forEach(
        (data) => {

            data.object.position.y =
                data.baseY +
                Math.sin(
                    time * 0.5 +
                    data.offset
                ) * 0.12;


            data.object.rotation.y +=
                0.0003;

        }
    );


    // --------------------------------------------------------
    // FRASES
    // --------------------------------------------------------

    textSprites.forEach(
        (data) => {

            data.object.position.y =
                data.baseY +
                Math.sin(
                    time * 0.5 +
                    data.offset
                ) * 0.10;

        }
    );


    // --------------------------------------------------------
    // ❤️ CORAZONES
    // --------------------------------------------------------

    hearts.forEach(
        (data) => {

            // Movimiento flotante
            data.object.position.y =
                data.baseY +
                Math.sin(
                    time * 0.8 +
                    data.offset
                ) * 0.16;


            // Pulso suave
            const pulse =
                1 +
                Math.sin(
                    time * 1.8 +
                    data.offset
                ) * 0.08;


            // Conserva el tamaño individual
            data.object.scale.setScalar(
                data.baseScale *
                pulse
            );

        }
    );


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    renderer.render(
        scene,
        camera
    );
}


animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ============================================================
// QUITAR PANTALLA DE CARGA
// ============================================================

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                const loading =
                    document.getElementById(
                        "loading"
                    );


                if (loading) {

                    loading.style.opacity =
                        "0";


                    setTimeout(
                        () => {

                            loading.style.display =
                                "none";

                        },
                        700
                    );
                }

            },
            800
        );
    }
);