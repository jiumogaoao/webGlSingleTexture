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
			textureUrl="",
			lastMt=null,
			texture;
			
			

			function init() {
	
				var container;

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );

				scene = new THREE.Scene();

				texture = new THREE.Texture();
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
				Tloader.load( textureUrl, function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );
				// model
		
				var loader = new THREE.OBJLoader( manager );
				$.each(objs,function(i,n){
					loader.load( n, function ( object ) {

					object.traverse( function ( child ) {
							
						if ( child instanceof THREE.Mesh ) {
							
							child.material=new THREE.MeshBasicMaterial( { map: texture,overdraw:1.5,transparent:true,opacity:1 } );

						}

					} );

						scene.add( object.children[0] );
						

					}, onProgress, onError );
				})
				

		
				if ( webglAvailable() ) {
							renderer = new THREE.WebGLRenderer();
						} else {
							renderer = new THREE.CanvasRenderer();
						}
		
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setClearColor( 0xff0000 );
	
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
				document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'touchend', onDocumentTouchEnd, false );
				

				window.addEventListener( 'resize', onWindowResize, false );


			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}
			function heightLight(selectObj){
				if(lastMt){
							lastMt.opacity=1;
							lastMt.needsUpdate = true;
						}
						selectObj.material.opacity=0.5;
						selectObj.material.needsUpdate = true;
						lastMt=selectObj.material

			}
			function findObj(event){
				
				mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
					mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

					raycaster.setFromCamera( mouse, camera );
	
					var intersects = raycaster.intersectObjects( scene.children );
					
					if ( intersects.length > 0 ) {
						touch.name=intersects[ 0 ].object.name;
						touch.point=intersects[ 0 ].object
						heightLight(intersects[ 0 ].object)
					}
			}
			function onDocumentMouseDown( event ) {

				event.preventDefault();
				event.stopPropagation();
					event.preventDefault();
					touch.time=new Date().getTime();
					touch.name="";
					touch.point={};
					findObj(event)

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
					findObj(event)
				}
			}

			function onDocumentMouseUp( event ) {
				var uptime=new Date().getTime();
				if(uptime-touch.time<300){
					source.chooseObj(touch.point.name)
				}
					
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
					touch.time=new Date().getTime();
					touch.name="";
					touch.point={};
					event.clientX=event.touches[0].clientX;
					event.clientY=event.touches[0].clientY;
					findObj(event)
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

			function onDocumentTouchEnd(event){
				var uptime=new Date().getTime();
				if(uptime-touch.time<300){
					source.chooseObj(touch.point.name)
				}
					
				isUserInteracting = false;
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
				textureUrl=array;
			}
			
			source.load=init;
			source.setObj=setObj;
			source.setTexture=setTexture;
			source.play=animate;
})(player);
