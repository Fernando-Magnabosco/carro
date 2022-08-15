import * as THREE from 'three';

const PI = 3.141592653589793;
function abs(x) {
    return x < 0 ? -x : x;
}

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(200, 500, 300);
scene.add(directionalLight);



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
    pneu: new THREE.CylinderGeometry(.8, .8, .7, 8, 8, false),
    roda: new THREE.CylinderGeometry(.4, .4, 1, 8, 8, false),
    corpo: new THREE.BoxGeometry(3, 4, 1),
    corpo2: new THREE.BoxGeometry(2.75, 2, 1.5),
    farol: new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8),
};


const materials = {
    pneu: new THREE.MeshLambertMaterial({ color: 0x000000 }),
    roda: new THREE.MeshLambertMaterial({ color: 0x888888 }),
    corpo: new THREE.MeshLambertMaterial({ color: 0xDE5959 }),
    corpo2: new THREE.MeshLambertMaterial({ color: 0xFA7B64 }),
    comando: new THREE.MeshLambertMaterial({ opacity: 0.0, transparent: true, color: 0xffffff }),
    farol: new THREE.MeshLambertMaterial({ color: 0xffff00 }),
};


const carro = new THREE.Group();
const pneusFrontais = new THREE.Group();
const pneus = new THREE.Group();

for (let i = 0; i < 4; i++) {
    const pneu = new THREE.Mesh(geometries.pneu, materials.pneu);
    const roda = new THREE.Mesh(geometries.roda, materials.roda);

    pneu.position.set(
        i % 2 == 0 ? -1 : 1,
        i < 2 ? -1 : 1,
        0);

    roda.position.set(
        pneu.position.x,
        pneu.position.y,
        0);

    pneu.rotation.z = PI / 2;
    roda.rotation.z = PI / 2;


    if (i < 2) {
        pneusFrontais.add(pneu);
        pneusFrontais.add(roda);
    }
    else {
        pneus.add(pneu);
        pneus.add(roda);
    }
}

const corpo = new THREE.Mesh(geometries.corpo, materials.corpo);
const corpo2 = new THREE.Mesh(geometries.corpo2, materials.corpo2);

const seguidor = new THREE.Mesh(geometries.pneu, materials.comando);
const guia = new THREE.Mesh(geometries.pneu, materials.comando);
const seguidorP = new THREE.Vector3();
const guiaP = new THREE.Vector3();

const lightGuia = new THREE.Mesh(geometries.pneu, materials.comando);


const farois = new THREE.Group();
for (let i = 0; i < 2; i++) {
    const farol = new THREE.Mesh(geometries.farol, materials.farol);
    const light = new THREE.SpotLight(0xffff00, 7, 25, 0.20, 1, 0.5);
    light.castShadow = true;
    farol.position.set(
        i % 2 == 0 ? -1 : 1,
        -2,
        1);
    light.position.set(
        i % 2 == 0 ? -1 : 1,
        1,
        1);

    light.target = lightGuia;

    farois.add(light);
    farois.add(farol);
}

// scene.add(light);

corpo.position.z = 1
corpo2.position.z = 2;

const resto = new THREE.Group();


resto.add(farois);
resto.add(pneus);
resto.add(corpo);
resto.add(corpo2);
carro.add(resto);





var direcao = new THREE.Vector3();

const comando = new THREE.Group();


pneus.add(seguidor);
pneus.add(lightGuia);
comando.add(guia);



comando.add(pneusFrontais)


carro.add(comando)
seguidor.position.y = -1

guia.position.y = -3
lightGuia.position.y = -20;


//reflexive sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 5, 64),
    new THREE.MeshStandardMaterial({ color: 0x444445 })
)
sphere.position.set(0, 0, 0);

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

    camera.position.set(
        carro.position.x,
        carro.position.y,
        camera.position.z);


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
    console.log(keyCode);

}

function onKeyRelease(event) {
    var keyCode = event.which;
    map[keyCode] = false;

}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyRelease, false);

animate();