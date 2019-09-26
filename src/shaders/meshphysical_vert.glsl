#define STANDARD

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

//BIRGITTE

varying vec3 lightDir;
varying vec3 viewDir;
uniform float time;

//END BIRGITTE

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

	#ifdef USE_TANGENT

		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

	#endif

#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	//BIRGITTE
	vec3 lightPos = vec3(0.0,0.0,1.0);
	vec3 eyePos = vec3(0.0,0.0,1.0);//(viewMatrix * vec4(0.0,0.0,1.0,1.0)).xyz;//cameraPosition;//viewMatrix * vec4(cameraPosition,1.0)).xyz;

	vec3 viewPos = gl_Position.xyz;
	vec3 L = normalize(lightPos - viewPos);
	vec3 V = normalize(eyePos- viewPos);
	lightDir = L;
	viewDir = V;
	//END BIRGITTE

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
