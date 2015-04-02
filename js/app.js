/**
 * @author mrdoob / http://mrdoob.com/
 */
if(!requestAnimationFrame){
	window.requestAnimationFrame = (function(){ 
		return window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame || 
			function(/* function */ callback, /* DOMElement */ element){ 
				window.setTimeout(callback, 1000 / 60); 
			}; 
	})(); 
}

function webglAvailable() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !!( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' ) )
			);
		} catch ( e ) {
			return false;
		}
	}

var player={
	chooseObj:function(name){}
};	
;(function(source){
	var camera, scene, renderer;

			var texture_placeholder,
			isUserInteracting = false,
			onMouseDownMouseX = 0, onMouseDownMouseY = 0,
			lon = 90, onMouseDownLon = 0,
			lat = 0, onMouseDownLat = 0,
			phi = 0, theta = 0,
			target = new THREE.Vector3(),
			touch={},
			raycaster = new THREE.Raycaster(),
			mouse = new THREE.Vector2(),
			objs=[],
			textureUrl=[],
			lastMt=null;
			var texture = new THREE.Texture();
			var textureHl = new THREE.Texture();
			

			function init() {

				var container, mesh;

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );

				scene = new THREE.Scene();

				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};


				var Tloader = new THREE.ImageLoader( manager );
				debugger;
				Tloader.load( textureUrl[0], function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );
				Tloader.load( textureUrl[1], function ( image ) {

					textureHl.image = image;
					textureHl.needsUpdate = true;

				} );
				// model

				var loader = new THREE.OBJLoader( manager );
				$.each(objs,function(i,n){
					loader.load( n, function ( object ) {

					object.traverse( function ( child ) {
							console.log(child)
						if ( child instanceof THREE.Mesh ) {
							console.log(child)
							child.material=new THREE.MeshBasicMaterial( { map: texture,overdraw: 0.5 } );;

						}

					} );

						scene.add( object.children[0] );
						console.log(scene)

					}, onProgress, onError );
				})
				


				if ( webglAvailable() ) {
							renderer = new THREE.WebGLRenderer();
						} else {
							renderer = new THREE.CanvasRenderer();
						}
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
				document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();
				event.stopPropagation();
					event.preventDefault();
					touch.time=new Date().getTime();
					touch.name="";
					touch.point={};
					mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
					mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	
					raycaster.setFromCamera( mouse, camera );
	
					var intersects = raycaster.intersectObjects( scene.children );
					if ( intersects.length > 0 ) {
						touch.name=intersects[ 0 ].object.name;
						touch.point=intersects[ 0 ].point
						if(lastMt){
							lastMt.map=texture;
							lastMt.needsUpdate = true;
						}
						intersects[ 0 ].object.material.map=textureHl
						intersects[ 0 ].object.material.needsUpdate = true;
						lastMt=intersects[ 0 ].object.material
						source.chooseObj(intersects[ 0 ].object.name)
					}

					console.log(intersects)

				isUserInteracting = true;

				onPointerDownPointerX = event.clientX;
				onPointerDownPointerY = event.clientY;

				onPointerDownLon = lon;
				onPointerDownLat = lat;

			}

			function onDocumentMouseMove( event ) {

				if ( isUserInteracting === true ) {

					lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
					lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

				}else{
					mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
					mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	
					raycaster.setFromCamera( mouse, camera );
	
					var intersects = raycaster.intersectObjects( scene.children );
					if ( intersects.length > 0 ) {
						touch.name=intersects[ 0 ].object.name;
						touch.point=intersects[ 0 ].point
						if(lastMt){
							lastMt.map=texture;
							lastMt.needsUpdate = true;
						}
						intersects[ 0 ].object.material.map=textureHl
						intersects[ 0 ].object.material.needsUpdate = true;
						lastMt=intersects[ 0 ].object.material
					}

					console.log(intersects)
				}
			}

			function onDocumentMouseUp( event ) {

				isUserInteracting = false;

			}

			function onDocumentMouseWheel( event ) {

				// WebKit

				if ( event.wheelDeltaY ) {

					camera.fov -= event.wheelDeltaY * 0.05;

				// Opera / Explorer 9

				} else if ( event.wheelDelta ) {

					camera.fov -= event.wheelDelta * 0.05;

				// Firefox

				} else if ( event.detail ) {

					camera.fov -= event.detail * 0.05;

				}

				camera.updateProjectionMatrix();

			}

			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					onPointerDownPointerX = event.touches[ 0 ].pageX;
					onPointerDownPointerY = event.touches[ 0 ].pageY;

					onPointerDownLon = lon;
					onPointerDownLat = lat;

				}

			}

			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
					lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

				}

			}

			function animate() {

				requestAnimationFrame( animate );
				update();

			}

			function update() {

				if ( isUserInteracting === false ) {

					lon += 0.1;

				}

				lat = Math.max( - 85, Math.min( 85, lat ) );
				phi = THREE.Math.degToRad( 90 - lat );
				theta = THREE.Math.degToRad( lon );

				target.x = 500 * Math.sin( phi ) * Math.cos( theta );
				target.y = 500 * Math.cos( phi );
				target.z = 500 * Math.sin( phi ) * Math.sin( theta );

				camera.position.copy( target ).negate();
				camera.lookAt( target );

				renderer.render( scene, camera );

			}
			function setObj(array){
				objs=array;
			}
			function setTexture(array){
				textureUrl=array;debugger;
			}
			
			source.load=init;
			source.setObj=setObj;
			source.setTexture=setTexture;
			source.play=animate;
})(player);
