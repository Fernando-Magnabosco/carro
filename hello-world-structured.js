var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pneuMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const corpoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const comandoMaterial = new THREE.MeshBasicMaterial({ opacity: 0.0, transparent: true, color: 0xffffff });

const pneuGeometry = new THREE.BoxGeometry(1, 1, 1);
const corpoGeometry = new THREE.BoxGeometry(4, 3, 1);



const carro = new THREE.Group();

const pneuEF = new THREE.Mesh(pneuGeometry, pneuMaterial);
const pneuET = new THREE.Mesh(pneuGeometry, pneuMaterial);
const pneuDF = new THREE.Mesh(pneuGeometry, pneuMaterial);
const pneuDT = new THREE.Mesh(pneuGeometry, pneuMaterial);

const seguidor = new THREE.Mesh(pneuGeometry, pneuMaterial);
const guia = new THREE.Mesh(pneuGeometry, pneuMaterial);
const direcao = new THREE.Vector3(0, 0, 0);

const corpo = new THREE.Mesh(corpoGeometry, corpoMaterial)

pneuEF.position.x = -1
pneuET.position.x = 1

pneuEF.position.y = -1
pneuET.position.y = -1

pneuDF.position.x = -1
pneuDT.position.x = 1

pneuDF.position.y = 1
pneuDT.position.y = 1


seguidor.position.x = -1
seguidor.position.y = 0

guia.position.x = -3
guia.position.y = 0

const rodasFrontais = new THREE.Group();
const comando = new THREE.Group();

rodasFrontais.add(pneuEF)
rodasFrontais.add(pneuDF)
rodasFrontais.add(seguidor)

comando.add(rodasFrontais)
comando.add(guia)


corpo.position.z = 1



carro.add(rodasFrontais);
carro.add(pneuET);
carro.add(pneuDT);



carro.add(corpo)

scene.add(comando)

scene.add(carro)


camera.position.z = 10




var animate = function () {
    requestAnimationFrame(animate);



    renderer.render(scene, camera);
};



function onKeyDown(event) {
    var keyCode = event.which;
    var speed = .1;

    console.log('keyCode', keyCode);
    console.log(rodasFrontais.rotation.z)
    if (keyCode == 38) {
        carro.rotation.y += speed;
    } else if (keyCode == 40) {
        carro.rotation.y -= speed;
    } else if (keyCode == 37) {
        carro.rotation.x -= speed;
    } else if (keyCode == 39) {
        carro.rotation.x += speed;
    } else if (keyCode == 65) {
        carro.rotation.z += speed;
    } else if (keyCode == 68) {
        carro.rotation.z -= speed;
    } else if (keyCode == 67) {
        if (comando.rotation.z >= .3) return;
        comando.rotation.z += speed
    } else if (keyCode == 90) {
        if (comando.rotation.z <= -.3) return;
        comando.rotation.z -= speed
    } else if (keyCode == 87) {

        console.log(guia.position)
        direcao.x = guia.position.x - seguidor.position.x
        direcao.y = guia.position.y - seguidor.position.y
        direcao.z = guia.position.z - seguidor.position.z

        direcao.normalize()

        carro.position.x += direcao.x * speed
        carro.position.y += direcao.y * speed
        carro.position.z += direcao.z * speed


    } else if (keyCode == 83) {

        console.log(direcao.x, direcao.y, direcao.z)
        direcao.x = seguidor.position.x - guia.position.x
        direcao.y = seguidor.position.y - guia.position.y
        direcao.z = seguidor.position.z - guia.position.z

        direcao.normalize()
        direcao.multiplyScalar(-1)

        console.log(direcao)
        carro.position.x -= direcao.x * speed
        carro.position.y -= direcao.y * speed
        carro.position.z -= direcao.z * speed


    }
};


animate();

document.addEventListener("keydown", onKeyDown, false);