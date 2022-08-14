import * as THREE from 'three';

const PI = 3.141592653589793;
function abs(x) {
    return x < 0 ? -x : x;
}

const scene = new THREE.Scene();

const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
scene.add(hemisphereLight);



const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 1, 1),
    new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load('../textures/floor.jpg') })
);
scene.add(floor);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometries = {
    pneu: new THREE.BoxGeometry(1, 1, 1, 8),
    corpo: new THREE.BoxGeometry(3, 4, 1),
    farol: new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8),
};

const materials = {
    pneu: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    corpo: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    comando: new THREE.MeshBasicMaterial({ opacity: 0.0, transparent: true, color: 0xffffff }),
    farol: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
};


const carro = new THREE.Group();
const pneusFrontais = new THREE.Group();
const pneus = new THREE.Group();

for (let i = 0; i < 4; i++) {
    const pneu = new THREE.Mesh(geometries.pneu, materials.pneu);

    pneu.position.set(
        i % 2 == 0 ? -1 : 1,
        i < 2 ? -1 : 1,
        0);

    if (i < 2) pneusFrontais.add(pneu);
    else pneus.add(pneu);
}

const corpo = new THREE.Mesh(geometries.corpo, materials.corpo);

const farois = new THREE.Group();
for (let i = 0; i < 2; i++) {
    const farol = new THREE.Mesh(geometries.farol, materials.farol);
    const light = new THREE.SpotLight(0xffff00, 10, 200, 0.22, 1, 1, 0.7);
    light.castShadow = true;
    farol.position.set(
        i % 2 == 0 ? -1 : 1,
        -2,
        1);
    light.position.set(
        i % 2 == 0 ? -1 : 1,
        -2,
        1);


    farois.add(light);
    farois.add(farol);
}

// scene.add(light);

corpo.position.z = 1

const resto = new THREE.Group();

resto.add(farois);

resto.add(pneus);
resto.add(corpo);

carro.add(resto);


const seguidor = new THREE.Mesh(geometries.pneu, materials.comando);
const guia = new THREE.Mesh(geometries.pneu, materials.comando);
const seguidorP = new THREE.Vector3();
const guiaP = new THREE.Vector3();


var direcao = new THREE.Vector3();

const comando = new THREE.Group();


pneus.add(seguidor);
comando.add(guia)


comando.add(pneusFrontais)


carro.add(comando)
seguidor.position.y = -1

guia.position.y = -3

//reflexive sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 5, 64),
    new THREE.MeshStandardMaterial({ color: 0x444445 })
)
sphere.position.set(1, 1, 1);

scene.add(sphere);

scene.add(carro)


camera.position.z = 30


var aceleration = 0;
var carSpeed = 0;

var animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    carro.position.set(
        carro.position.x + direcao.x * carSpeed,
        carro.position.y + direcao.y * carSpeed,
        carro.position.z + direcao.z * carSpeed
    );



    if (aceleration > 0) {
        aceleration -= speed / 2;
        if (aceleration > 1) aceleration = 1;
    } else if (aceleration < 0) {
        aceleration += speed / 2;
        if (aceleration < -1) aceleration = -1;
    }

    if (abs(aceleration) < 0.05) aceleration = 0;

    carSpeed += aceleration;

    if (carSpeed > 0) {
        carSpeed -= speed / 8;
        if (carSpeed > .5)
            carSpeed = .5;
    }

    else if (carSpeed < 0) {
        carSpeed += speed / 8;
        if (carSpeed < -.5)
            carSpeed = -.5;
    }
    if (abs(carSpeed) < 0.05) carSpeed = 0;

    for (const pneu of pneusFrontais.children) {
        pneu.rotation.x += carSpeed;
    }
    for (const pneu of pneus.children) {
        pneu.rotation.x += carSpeed;
    }
    // console.log(`aceleration ${aceleration}, speed ${carSpeed}`)


};

const map = new Map();



const speed = .15;
const keyCodeMap = {
    37: () => carro.rotation.x -= speed,
    38: () => carro.rotation.y += speed,
    39: () => carro.rotation.x += speed,
    40: () => carro.rotation.y -= speed,
    65: () => carro.rotation.z += speed,
    68: () => carro.rotation.z -= speed,
    90: () => {


        if (comando.rotation.z - resto.rotation.z <= -.3) return;
        comando.rotation.z -= speed * 2

    },
    67: () => {
        if (comando.rotation.z - resto.rotation.z >= .3) return;
        comando.rotation.z += speed * 2

    },
    87: () => {
        guia.getWorldPosition(guiaP)
        seguidor.getWorldPosition(seguidorP)

        direcao.set(
            guiaP.x - seguidorP.x,
            guiaP.y - seguidorP.y,
            guiaP.z - seguidorP.z)
        direcao.normalize()

        aceleration += speed;
        if (aceleration < .2) aceleration = .2;
        const diff = resto.rotation.z - comando.rotation.z

        if (map[67]) keyCodeMap[67]();
        else if (map[90]) keyCodeMap[90]();


        if (diff > .01 || diff < -.01)
            if (diff > 0)
                resto.rotation.z -= speed
            else
                resto.rotation.z += speed

    },
    83: () => {

        guia.getWorldPosition(guiaP)
        seguidor.getWorldPosition(seguidorP)

        direcao.set(
            guiaP.x - seguidorP.x,
            guiaP.y - seguidorP.y,
            guiaP.z - seguidorP.z)

        direcao.normalize()

        aceleration -= speed;
        if (aceleration > -.2) aceleration = -.2;

        const diff = resto.rotation.z - comando.rotation.z

        if (map[67]) keyCodeMap[67]();
        else if (map[90]) keyCodeMap[90]();

        if (diff > .01 || diff < -.01)
            if (diff > 0)
                resto.rotation.z -= speed
            else
                resto.rotation.z += speed
    }
}




function onKeyDown(event) {

    var keyCode = event.which;
    map[keyCode] = true;
    keyCodeMap[keyCode] && keyCodeMap[keyCode]();


}

function onKeyRelease(event) {
    var keyCode = event.which;
    map[keyCode] = false;

}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyRelease, false);

animate();