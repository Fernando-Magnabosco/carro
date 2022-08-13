import * as THREE from 'three';

function abs(x) {
    return x < 0 ? -x : x;
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pneuMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const corpoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const comandoMaterial = new THREE.MeshBasicMaterial({ opacity: 0.0, transparent: true, color: 0xffffff });
const farolMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const pneuGeometry = new THREE.BoxGeometry(1, 1, 1);
const corpoGeometry = new THREE.BoxGeometry(3, 4, 1);
const farolGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

const carro = new THREE.Group();
const pneusFrontais = new THREE.Group();
const pneus = new THREE.Group();

for (let i = 0; i < 4; i++) {
    const pneu = new THREE.Mesh(pneuGeometry, pneuMaterial);
    pneu.position.x = i % 2 == 0 ? -1 : 1;
    pneu.position.y = i < 2 ? -1 : 1;

    if (i < 2) pneusFrontais.add(pneu);
    else pneus.add(pneu);
}

const corpo = new THREE.Mesh(corpoGeometry, corpoMaterial)
const farol0 = new THREE.Mesh(farolGeometry, farolMaterial)
const farol1 = new THREE.Mesh(farolGeometry, farolMaterial)

farol0.position.x = -1
farol0.position.y = -2
farol1.position.y = -2
farol1.position.x = 1
farol0.position.z = 1
farol1.position.z = 1
corpo.position.z = 1

const resto = new THREE.Group();

resto.add(farol0);
resto.add(farol1);
resto.add(pneus);
resto.add(corpo);

carro.add(resto);


const seguidor = new THREE.Mesh(pneuGeometry, comandoMaterial);
const guia = new THREE.Mesh(pneuGeometry, comandoMaterial);

const seguidorb = new THREE.Mesh(pneuGeometry, comandoMaterial);


const seguidorP = new THREE.Vector3();
const guiaP = new THREE.Vector3();


var direcao = new THREE.Vector3();

const comando = new THREE.Group();
const comandob = new THREE.Group();

pneus.add(seguidor);
pneus.add(seguidorb);

comando.add(pneusFrontais)
comando.add(guia)


carro.add(comando)
seguidor.position.y = -1

guia.position.y = -3






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
    )

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


}

function onKeyRelease(event) {
    var keyCode = event.which;
    map[keyCode] = false;

}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyRelease, false);

animate();