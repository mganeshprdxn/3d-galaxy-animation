import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { AdditiveBlending, Float32BufferAttribute } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400,
    closed: true
})

const textureLoader = new THREE.TextureLoader()
const shape = textureLoader.load('/particleShape/1.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


//Galaxy Generator

const parameters = {}

parameters.count = 40000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 8
parameters.spin = 1
parameters.randomness = 0.3
parameters.randomnessPower = 5
parameters.stars = 100000
parameters.starColor = '#37182a'
parameters.insideColor = '#627fd9'
parameters.outsideColor = '#bbaeed'

gui.add(parameters, 'count').min(100).max(100000).step(100).onChange(generateGalaxy).name('stars in galaxy')
gui.add(parameters, 'stars').min(0).max(100000).step(100).onChange(generateBgStars).name('background stars')
gui.addColor(parameters, 'starColor').onChange(generateBgStars).name('color of stars')
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onChange(generateGalaxy).name('size of stars in galaxy')
gui.add(parameters, 'radius').min(1).max(10).step(1).onChange(generateGalaxy).name('radius of galaxy')
gui.add(parameters, 'branches').min(1).max(10).step(1).onChange(generateGalaxy).name('branches in galaxy')
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onChange(generateGalaxy).name('spin of the galaxy')
gui.add(parameters, 'randomness').min(0).max(2).step(0.01).onChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(1).onChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onChange(generateGalaxy).name('color of core')
gui.addColor(parameters, 'outsideColor').onChange(generateGalaxy).name('color of branches')


let bgStarsGeometry = null
let bgStarsMaterial = null
let bgStars = null

//Background stars
function generateBgStars(){

    if(bgStars!==null){
        bgStarsGeometry.dispose()
        bgStarsMaterial.dispose()
        scene.remove(bgStars)
    }

    bgStarsGeometry = new THREE.BufferGeometry()
    const bgStarsPositions = new Float32Array(parameters.stars * 3)

    for(let j = 0; j<parameters.stars; j++){
        bgStarsPositions[j*3 + 0] = (Math.random() - 0.5) * 20
        bgStarsPositions[j*3 + 1] = (Math.random() - 0.5) * 20
        bgStarsPositions[j*3 + 2] = (Math.random() - 0.5) * 20
    }

    bgStarsGeometry.setAttribute('position', new THREE.BufferAttribute(bgStarsPositions, 3))

    bgStarsMaterial = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        color: parameters.starColor,
        transparent: true,
        alphaMap: shape
    })

    bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial)

    scene.add(bgStars)
}

generateBgStars()




//gALAXY GENerator
let geometry = null
let material = null
let points = null


function generateGalaxy(){

    if(points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count *3)
    const colors = new Float32Array(parameters.count *3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)
    console.log('parameters', parameters)
    for(let i=0; i<parameters.count; i++){

        //Position
        const x = Math.random() * parameters.radius
        // const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI
        const branchAngle = Math.sqrt(i) + i
        // console.log(branchAngle)
        const spinAngle = x * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1) 
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random()<0.5 ? 1: -1)
        // console.log(randomX, randomY, randomZ)
        // positions[i * 3] = Math.random()
        // positions[i * 3 + 1] = Math.random();
        // positions[i * 3 + 2] = Math.random();
        positions[i * 3] = Math.sin(branchAngle + spinAngle) * x ;
        positions[i * 3 + 1] = randomY;
        positions[i * 3 + 2] = Math.cos(branchAngle + spinAngle) * x ;

        //Color

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, x / parameters.radius)

        colors[i*3 + 0] = mixedColor.r
        colors[i*3 + 1] = mixedColor.g
        colors[i*3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        color: 'white',
        size: parameters.size,
        depthWrite: false,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        vertexColors: true,
        transparent: true,
        alphaMap: shape
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)


}

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 2
camera.position.z = 1
scene.add(camera)


document.addEventListener("mousemove", (e) => {
    // camera.position.z = e.clientX / 1500;
    // camera.position.y = e.clientY / 200;

// camera.position.z = ( e.clientX / window.innerWidth ) / 10000 - 1;   
// camera.position.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

});

const render = (time) => {

    // const elapsedTime = clock.getElapsedTime()

    //Update the camera
    // camera.position.x = 0
    // camera.position.y = 1
    // camera.position.z = 1

    renderer.render(scene, camera);
    // loop
    requestAnimationFrame(render);
  };


// Controls
const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = false
controls.enabled = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update the camera
    points.rotation.y = elapsedTime*0.1
    bgStars.rotation.y = - elapsedTime*0.05

    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

var mouseCursor = document.querySelector('.cursor')
var mouseCursorImg = document.querySelector('.cursor img')
var avatarsLi = document.querySelectorAll('.avatars-menu li')
var avatarsWindow = document.querySelector('.avatars-window')

let selectedAvatarSrc

if (sessionStorage.getItem('selectedAvatar')) {
    selectedAvatarSrc = sessionStorage.getItem('selectedAvatar')
    mouseCursorImg.src = selectedAvatarSrc
    avatarsWindow.classList.add("display-none")
    document.querySelector("html").classList.add("cursor-none")
}

window.addEventListener('mousemove', cursor)

avatarsLi.forEach(avtar => {
    avtar.addEventListener('click', selectAvatar)
})

if (document.body.classList.contains("home")) {
    document.querySelector(".custom-space").addEventListener("mouseenter", updateAvatar)
    document.querySelector(".custom-space").addEventListener("mouseleave", defaultAvatar)
}    

function updateAvatar(e) {
    if (!selectedAvatarSrc) { return false}
    mouseCursorImg.src = "avatar2.png"
}

function defaultAvatar(e) {
    if (!selectedAvatarSrc) { return false}
    mouseCursorImg.src = selectedAvatarSrc
}

function selectAvatar(e) {
    if (e.target.tagName === "LI") {
        return false
    }
    selectedAvatarSrc = e.target.src
    sessionStorage.setItem('selectedAvatar', selectedAvatarSrc)
    mouseCursorImg.src = selectedAvatarSrc
    mouseCursor.classList.remove("display-none")
    avatarsWindow.classList.add("display-none")
    document.querySelector("html").classList.add("cursor-none")
}

function cursor(e) {
    mouseCursor.style.top = e.pageY + 'px';
    mouseCursor.style.left = e.pageX + 'px';
    if (sessionStorage.getItem('selectedAvatar')) {
        mouseCursor.classList.remove("display-none")
    }
    // mouseCursor.setAttribute("style", "top: " + e.pageY + "px; left: " + e.pageX + "px;")
}