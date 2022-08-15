import * as THREE from 'three';

const velocimeter = document.getElementById('velocimeter');
// console.log(velocimeter);
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
    corpo: new THREE.MeshLambertMaterial({ color: parseInt("0x" + generateRandomHexa(), 16) }),
    corpo2: new THREE.MeshLambertMaterial({ color: parseInt("0x" + generateRandomHexa(), 16) }),
    comando: new THREE.MeshLambertMaterial({ opacity: 0.0, transparent: true, color: 0xffffff }),
    farol: new THREE.MeshLambertMaterial({ color: 0xffff00 }),
};

let atualLampada = 0;
const lampadas = [
    {
        color: 0xffff00,
        intensity: 7,
        distance: 25,
        angle: 0.20,
        penumbra: 1,
        decay: .5
    },
    {
        color: 0x0022ff,
        intensity: 20,
        distance: 50,
        angle: 0.1,
        penumbra: 0,
        decay: 0
    }

];


const carro = new THREE.Group();
const pneusFrontais = new THREE.Group();
const pneus = new THREE.Group();

for (let i = 0; i < 4; i++) {
    const pneu = new THREE.Mesh(geometries.pneu, materials.pneu);
    const roda = new THREE.Mesh(geometries.roda, materials.roda);

    pneu.position.set(
        i % 2 == 0 ? -1 : 1,
        i < 2 ? -1 : 1,
        .3);

    roda.position.set(
        pneu.position.x,
        pneu.position.y,
        .3);

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
    const { color, intensity, distance, angle, penumbra, decay } = lampadas[0];
    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);

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
sphere.position.set(10, 10, 0);

scene.add(sphere);

scene.add(carro)


camera.position.z = 25

// put the camera right behind the car



var aceleration = 0;
var carSpeed = 0;
const maxSpeed = .6;
var animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    carSpeed += aceleration;

    if (carSpeed > 0) {
        carSpeed -= speed / 8;
        if (carSpeed > maxSpeed)
            carSpeed = maxSpeed;
    }

    else if (carSpeed < 0) {
        carSpeed += speed / 8;
        if (carSpeed < -maxSpeed)
            carSpeed = -maxSpeed;
    }
    if (abs(carSpeed) < 0.01) carSpeed = 0;
    // console.log(carSpeed);

    if (abs(carro.position.x + direcao.x * carSpeed) < 48 && abs(carro.position.y + direcao.y * carSpeed) < 48) {

        carro.position.set(
            carro.position.x + direcao.x * carSpeed,
            carro.position.y + direcao.y * carSpeed,
            carro.position.z + direcao.z * carSpeed
        );
    }
    else {
        carSpeed = 0;
        aceleration = 0;
        console.log("hit the wall")
    }

    camera.position.set(
        carro.position.x,
        carro.position.y - 15,
        camera.position.z
    )

    camera.lookAt(carro.position);



    if (aceleration > 0) {
        aceleration -= speed / 4;
        if (aceleration > 1) aceleration = 1;
    } else if (aceleration < 0) {
        aceleration += speed / 4;
        if (aceleration < -1) aceleration = -1;
    }

    if (abs(aceleration) < .02) aceleration = 0;




    velocimeter.innerText = `${abs(carSpeed * 100).toFixed(2)} km/h`;
    for (const pneu of pneusFrontais.children) {
        pneu.rotation.x += carSpeed;
    }
    for (const pneu of pneus.children) {
        pneu.rotation.x += carSpeed;
    }
    console.log(`aceleration ${aceleration}, speed ${carSpeed}`)


};

const map = new Map();



const speed = .15;
const keyCodeMap = {
    37: () => camera.position.x -= speed,
    38: () => camera.position.y += speed,
    39: () => camera.position.x += speed,
    40: () => camera.position.y -= speed,
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

        aceleration -= speed / 2;


        const diff = resto.rotation.z - comando.rotation.z

        if (map[67]) keyCodeMap[67]();
        else if (map[90]) keyCodeMap[90]();

        if (diff > .01 || diff < -.01)
            if (diff > 0)
                resto.rotation.z -= speed
            else
                resto.rotation.z += speed
    },
    96: () => {

        atualLampada = (atualLampada + 1) % lampadas.length;
        const { color, intensity, distance, angle, penumbra, decay } = lampadas[atualLampada];
        farois.children.forEach(child => {
            if (child.isSpotLight) {
                child.color.set(color);
                child.intensity = intensity;
                child.distance = distance;
                child.angle = angle;
                child.penumbra = penumbra;
                child.decay = decay;
            }
        })

    }
}




function onKeyDown(event) {

    var keyCode = event.which;
    map[keyCode] = true;
    keyCodeMap[keyCode] && keyCodeMap[keyCode]();
    // console.log(keyCode);

}

function onKeyRelease(event) {
    var keyCode = event.which;
    map[keyCode] = false;

}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyRelease, false);

animate();


function generateRandomHexa() {

    var chars = "ABCDEF0123456789";
    var result = "";
    for (var i = 0; i < 6; i++)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;

}