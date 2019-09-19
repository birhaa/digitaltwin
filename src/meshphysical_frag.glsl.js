export default /* glsl */`

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

uniform float blurRadius1;
uniform float blurRadius2;
uniform vec2 blurRes1;
uniform vec2 blurRes2;

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


uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif

#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform float time;
uniform float size;
uniform bool playWave;
uniform bool useOffset;

uniform vec3 rainbow1Dir;
uniform vec3 rainbow2Dir;

varying vec3 lightDir;
varying vec3 viewDir;

vec2 sineWave(vec2 uv, vec2 phase){
	float x = sin( 25.0*uv.y + 30.0*uv.x + 6.28*phase.x) * 0.01;
	float y = sin( 25.0*uv.y + 30.0*uv.x + 6.28*phase.y) * 0.03;
	return vec2(uv.x+x, uv.y+y);
}

vec2 calculateNewUvs(bool isMaterial2){
	vec2 vUv3 = vUv;
	if( isMaterial2 ){
		if(useOffset){
			vUv3.x -= 0.01 * size;
		}
		if(playWave){
			vUv3 = sineWave(vUv3, vec2(time,0.0));
		}
	}
	return vUv3;
}

vec3 calculateRainbow(vec3 uv_tangent){
	float d = 1600.0; //nm

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

void main() {
	#include <clipping_planes_fragment>

	float nCols = 100.0/size;
	bool isMaterial2 = mod(ceil(vUv.x * nCols),2.0) == 0.0;
	vec2 vUv3 = calculateNewUvs(isMaterial2);

	vec4 diffuseColor = vec4( diffuse, opacity );
	if( isMaterial2 ){
		diffuseColor = vec4(1.0,1.0,1.0,opacity);
	}

	#include <logdepthbuf_fragment>

	vec4 texelColor = textureWithBlur(isMaterial2, vUv3, map);
	diffuseColor *= texelColor;

	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		reflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif


	vec3 reflectionColor;
	if(isMaterial2) {
		reflectionColor = calculateRainbow(rainbow2Dir);
	}else{
		reflectionColor = calculateRainbow(rainbow1Dir);
	}
	diffuseColor.rgb = diffuseColor.rgb + reflectionColor;


	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	gl_FragColor = vec4(outgoingLight, diffuseColor.a);


	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}
`;
