export default /* glsl */`
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec3 lightDir;
varying vec3 viewDir;
//varying vec2 vUv;
uniform float time;

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>


	vec3 lightPos = vec3(0.0,0.0,1.0);
	vec3 eyePos = vec3(0.0,0.0,1.0);//(viewMatrix * vec4(0.0,0.0,1.0,1.0)).xyz;//cameraPosition;//viewMatrix * vec4(cameraPosition,1.0)).xyz;

	vec3 viewPos = gl_Position.xyz;
	vec3 L = normalize(lightPos - viewPos);
	vec3 V = normalize(eyePos- viewPos);
	lightDir = L;
	viewDir = V;
	//vUv = uv;
}
`;
