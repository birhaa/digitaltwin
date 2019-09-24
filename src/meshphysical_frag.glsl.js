export default /* glsl */ `
#define STANDARD

//BIRGITTE UNIFORMS

//Blur
uniform float blurRadius1;
uniform float blurRadius2;
uniform vec2 blurRes1;
uniform vec2 blurRes2;

//Stripes
uniform float size;
uniform bool useOffset;

//Animation
uniform float time;
uniform bool playWave;
uniform float waveSpeed;
uniform float waveFrequency;
uniform vec2 waveSize;

//Rainbow
uniform vec3 rainbow1Dir;
uniform vec3 rainbow2Dir;
varying vec3 lightDir;
varying vec3 viewDir;

//END BIRGITTE UNIFORMS

//BIRGITTE METHODS

vec3 bump3y (vec3 x, vec3 yoffset)
{
	vec3 y = vec3(1.,1.,1.) - x * x;
	y = saturate(y-yoffset);
	return y;
}

vec3 spectral_zucconi (float w)
{
		// w: [400, 700]
	// x: [0,   1]
	float x = saturate((w - 400.0)/ 300.0);

	const vec3 cs = vec3(3.54541723, 2.86670055, 2.29421995);
	const vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
	const vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);

	return bump3y (	cs * (x - xs), ys);
}

// --- Spectral Zucconi 6 --------------------------------------------

// Based on GPU Gems
// Optimised by Alan Zucconi
vec3 spectral_zucconi6 (float w)
{
	// w: [400, 700]
	// x: [0,   1]
	float x = saturate((w - 400.0)/ 300.0);

	const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
	const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
	const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);

	const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
	const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
	const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);

	return
		bump3y(c1 * (x - x1), y1) +
		bump3y(c2 * (x - x2), y2) ;
}

//START BLUR

vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
	vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

vec4 textureWithBlur( bool isMaterial2, vec2 vUv3, sampler2D map){
	float blurRadius;
	vec2 blurRes;
	if(isMaterial2){
		blurRadius = blurRadius2;
		blurRes = blurRes2;
	} else{
		blurRadius = blurRadius1;
		blurRes = blurRes1;
	}
	vec4 texelColor;
	if(blurRadius > 0.0){
		vec4 texelColor1 =  blur(map, vUv3, blurRes, vec2(blurRadius, 0.0));
		vec4 texelColor2 =  blur(map, vUv3, blurRes, vec2(0.0, blurRadius));
		texelColor = (texelColor1 + texelColor2)/2.0;
	}else{
		texelColor = texture2D( map, vUv3 );
	}
	texelColor = mapTexelToLinear( texelColor );
	return texelColor;
}

//END BLUR

vec2 sineWave(vec2 uv, vec2 phase){
	float x = sin( waveFrequency*uv.y + waveFrequency*uv.x + 6.28*phase.x) * waveSize.x;
	float y = cos( waveFrequency*uv.y + waveFrequency*uv.x + 6.28*phase.y) * waveSize.y;
	return vec2(uv.x+x, uv.y+y);
}

vec2 calculateNewUvs(vec2 vUv, bool isMaterial2){
	vec2 vUv3 = vUv;
	if( isMaterial2 ){
		if(useOffset){
			vUv3.x -= 0.01 * size;
		}
	}
	else{
		if(playWave){
			vUv3 = sineWave(vUv3, vec2(time* waveSpeed,0.0));
		}
	}
	return vUv3;
}

vec3 calculateRainbow(vec3 uv_tangent){
	float d = 2400.0; //nm

	vec3 L = lightDir;
	vec3 V = viewDir;

	vec3 H = L + V;
	float u = abs(dot(uv_tangent, H));

	if(u > 0.0){
		// Calculates the reflection color
		vec3 reflectionColor = vec3(0.0,0.0,0.0);
		for (float n = 1.0; n <= 8.0; n++){
			float wavelength = u * d / n;
			reflectionColor += spectral_zucconi(wavelength);
		}
		reflectionColor = saturate(reflectionColor)*(1.0-u);
		return reflectionColor;
	}
	return vec3(0.0,0.0,0.0);
}

//END BIRGITTE METHODS



#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSPARENCY
#endif

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

#ifdef TRANSPARENCY
	uniform float transparency;
#endif

#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif

#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif

#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_normalmap_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>


void main() {

	#include <clipping_planes_fragment>

	//BIRGITTE
	float nCols = 100.0/size;
	bool isMaterial2 = mod(ceil(vUv.x * nCols),2.0) == 0.0;
	vec2 vUv3 = calculateNewUvs(vUv,isMaterial2);
	//END BIRGITTE

	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>

	//BIRGITTE
	vec4 texelColor = textureWithBlur(isMaterial2, vUv3, map);
	diffuseColor *= texelColor;
	//END BIRGITTE

	#include <color_fragment>

	//BIRGITTE

	vec3 reflectionColor;
	if(isMaterial2) {
		reflectionColor = calculateRainbow(rainbow2Dir);
	}else{
		reflectionColor = calculateRainbow(rainbow1Dir);
	}
	diffuseColor.rgb = diffuseColor.rgb + reflectionColor;

	//END BIRGITTE

	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	// this is a stub for the transparency model
	#ifdef TRANSPARENCY
		diffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );
	#endif

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;
