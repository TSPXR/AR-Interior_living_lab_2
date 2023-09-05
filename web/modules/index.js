import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';

const renderArea = document.querySelector("#camera-render-area");
const loadingArea = document.querySelector("#loading");

const userAgent = navigator.userAgent.toLowerCase();

let isIOS, isMobile;

function getUserAgent() {
    if (userAgent.match("iphone") || userAgent.match("ipad") || userAgent.match("ipod") || userAgent.match("mac")) {
		isIOS = true;
        isMobile = true;
		if (!userAgent.match("safari") || userAgent.match("naver") || userAgent.match("twitter")) {
			isIOS = false;
		}
	} else {
        isMobile = userAgent.match("Android") || userAgent.match("mobile");
    }
}

function getLogTitle(text) {
    let base = "======================================";
    return (base + `\n${text}\n` +base);
}

const imageTargetPipelineModule = () => {
    let videoFile = "./assets/vid/video_ver01.mp4";

    const loader = new GLTFLoader();

    let video, videoObj;

    let sound = new Audio("./assets/sound/waves.mp3");
    sound.pause();
    sound.currentTime = 0;

    let vh = 740;
    let vw = 1080;
    let vRatio = vw / vh;
    let scale = 0.76;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
        pointer.x = (event.targetTouches[0].pageX / renderArea.clientWidth) * 2 - 1;
        pointer.y = -(event.targetTouches[0].pageY / renderArea.clientHeight) * 2 + 1;
    }

    const initXrScene = ({scene, camera}) => {

        video = document.createElement("video");

        video.src = videoFile;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        video.setAttribute("webkit-playsinline", "");

        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        texture.crossOrigin = "anonymous";

        videoObj = new THREE.Mesh(
            new THREE.PlaneGeometry(vRatio * scale, scale),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            })
        );

        videoObj.visible = false;
        videoObj.name = "Gallery";
        scene.add(videoObj);
        video.load();

        const light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        camera.position.set(0, 3, 0);
    }


    const showTarget = ({detail}) => {
        console.log(detail)
        if (detail.name === "GalleryBaton") {
            videoObj.position.copy(detail.position);
            videoObj.quaternion.copy(detail.rotation);
            videoObj.scale.set(detail.scale, detail.scale, detail.scale);
            videoObj.visible = true;
        }
    }

    const hideTarget = ({detail}) => {
        if (detail.name === "GalleryBaton") {
            //video.pause()
            //videoObj.visible = false
        }
    }

    const onStart = ({canvas}) => {
        loadingArea.style.backgroundColor = "rgb(0, 0, 0, 0.45)";

        const { scene, camera } = XR8.Threejs.xrScene();

        const renderer = XR8.Threejs.xrScene().renderer;
        
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;

        initXrScene({ scene, camera });

        canvas.addEventListener("touchstart", (event) => {
            onPointerMove(event);
            raycaster.setFromCamera(pointer, camera);
            const intersection = raycaster.intersectObjects(scene.children);

            if (intersection) {
                sound.play();
            }

            for (let i = 0; i < intersection.length; i++) {
                if (intersection[i].object.name == "Gallery") {
                    video.play();
                }
            }
        })

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault()
        })

        XR8.XrController.updateCameraProjectionMatrix({
            origin: camera.position,
            facing: camera.quaternion,
        })
    }

    setTimeout(() => {
        loadingArea.parentElement.removeChild(loadingArea);
    }, 5000);

    return {
        name: "GalleryBaton",
        onStart,
        listeners: [
            {event: "reality.imagefound", process: showTarget},
            {event: "reality.imageupdated", process: showTarget},
            {event: "reality.imagelost", process: hideTarget},
        ],
    }
}

const onxrloaded = () => {
    XR8.XrController.configure({disableWorldTracking: false});
    XR8.addCameraPipelineModules([
        XR8.GlTextureRenderer.pipelineModule(),
        XR8.Threejs.pipelineModule(),
        XR8.XrController.pipelineModule(),
        XRExtras.AlmostThere.pipelineModule(),
        XRExtras.FullWindowCanvas.pipelineModule(),
        XRExtras.Loading.pipelineModule(),
        XRExtras.RuntimeError.pipelineModule(),

        imageTargetPipelineModule(),
    ]);
    XR8.run({canvas: renderArea});
}

window.onload = async () => {
    getUserAgent();

    const permObserver = new MutationObserver((mutations) => {
        const permBox = document.querySelector(".prompt-box-8w");
        const permBtnContainer = document.querySelector(".prompt-button-container-8w")
        const permDenyBtn = document.querySelector(".prompt-button-8w");
        const permAllowBtn = document.querySelector(".button-primary-8w");
        if (permBox) {
            permBox.querySelector("p").innerHTML = "<strong>AR 서비스를 이용하실려면<br/>권한 허용이 필요합니다.</strong><br/>계속하시려면 허용 버튼을<br/>눌러주세요";
            permBox.style.fontSize = "18px";
            //permBtnContainer.insertBefore(permAllowBtn, permDenyBtn);
            permDenyBtn.innerHTML = "취소";
            permAllowBtn.innerHTML = "허용";
            permObserver.disconnect();
        }
    });

    permObserver.observe(document.body, {childList: true});

    const load = () => { XRExtras.Loading.showLoading({onxrloaded}) };
    window.XRExtras ? load() : window.addEventListener("xrextrasloaded", load);
}