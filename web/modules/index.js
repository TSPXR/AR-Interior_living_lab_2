import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';
import { DepthTexture } from './three.js/three.module.js';
import { TriangleController } from './triangle.js';
import { getArrowHelper } from './arrowHelper.js';

const renderArea = document.querySelector("#camera-render-area");
const loadingArea = document.querySelector("#loading");

const userAgent = navigator.userAgent.toLowerCase();

let isIOS, isMobile;

const triangleController = new TriangleController(0.5);
const arrowHelpers = getArrowHelper(1); // 1 유닛 길이의 화살표를 반환받습니다.

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
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
        pointer.x = (event.targetTouches[0].pageX / renderArea.clientWidth) * 2 - 1;
        pointer.y = -(event.targetTouches[0].pageY / renderArea.clientHeight) * 2 + 1;
    }

    const initXrScene = ({scene, camera}) => {
        // ArrowHelper

        // 각 화살표를 scene에 추가합니다.
        arrowHelpers.forEach(arrowHelper => {
            console.log(arrowHelper)
            scene.add(arrowHelper);
        });

        scene.add(triangleController.group);

        const light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        camera.position.set(0, 3, 0);

    }


    const showTarget = ({detail}) => {
        // console.log(detail)
        if (detail.name === "ar_marker_resized") {
            let currentMarkerPosition = detail.position;
            let currentMarkerQuaternion = detail.rotation;

            arrowHelpers[0].position.copy(detail.position);
            arrowHelpers[0].scale.set(detail.scale, detail.scale, detail.scale);

            arrowHelpers[1].position.copy(detail.position);
            arrowHelpers[1].scale.set(detail.scale, detail.scale, detail.scale);

            arrowHelpers[2].position.copy(detail.position);
            arrowHelpers[2].scale.set(detail.scale, detail.scale, detail.scale);

            // baseObject.quaternion.copy(currentMarkerQuaternion);

            triangleController.group.position.copy(detail.position);
            triangleController.group.quaternion.copy(detail.rotation);
        }
    }

    const hideTarget = ({detail}) => {
        if (detail.name === "ar_marker_resized") {
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
            
            triangleController.touchEvent(pointer);

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