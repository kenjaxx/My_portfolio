import { useEffect, useRef, useState } from 'react'
import styles from './RetroGrid.module.css'

/*
  Retro Grid, ported from Magic UI to plain React + CSS Modules.
  (Your project has no Tailwind, TypeScript, shadcn or "@/lib/utils",
  so the original file can't be dropped in as-is.)

  Drop it inside any `position: relative; overflow: hidden` section:

    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <RetroGrid />
      ...your content (give it position: relative; z-index: 1)
    </section>

  It renders the perspective floor with a WebGL shader and falls back to a
  CSS-only grid if WebGL isn't available.

  Performance props:
    maxPixelRatio  resolution multiplier cap (1 = one shader run per CSS pixel,
                   0.75 = even fewer, scaled up by the browser)
    maxFps         frame-rate cap for the animation (0 = no cap)
*/

const ANIMATION_DURATION_SECONDS = 15
const GRID_HEIGHT_RATIO = 3
const GRID_LINE_ALIGNMENT_OFFSET_PX = 0.5
const GRID_LINE_ANTIALIAS_MULTIPLIER = 0.9
const GRID_LINE_WIDTH_PX = 0.92
const GRID_START_OFFSET_RATIO = -0.5
const GRID_WIDTH_RATIO = 6
const GRID_X_OFFSET_RATIO = -2
const MAX_ANGLE = 89
const MAX_DEVICE_PIXEL_RATIO = 2
const MIN_ANGLE = 1
const PERSPECTIVE_PX = 200

// A frame is drawn if at least (1000 / maxFps - this) ms have passed. The small
// tolerance lets a 30fps cap land exactly on every second frame of a 60Hz screen.
const FRAME_TOLERANCE_MS = 2

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER_SOURCE = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2 u_container_size;
uniform vec2 u_viewport_size;
uniform vec4 u_line_color;
uniform float u_angle;
uniform float u_cell_size;
uniform float u_device_pixel_ratio;
uniform float u_time;

const float animationDurationSeconds = ${ANIMATION_DURATION_SECONDS.toFixed(1)};
const float gridHeightRatio = ${GRID_HEIGHT_RATIO.toFixed(1)};
const float gridStartOffsetRatio = ${GRID_START_OFFSET_RATIO.toFixed(1)};
const float gridWidthRatio = ${GRID_WIDTH_RATIO.toFixed(1)};
const float gridXOffsetRatio = ${GRID_X_OFFSET_RATIO.toFixed(1)};
const float gridLineAlignmentOffsetPx = ${GRID_LINE_ALIGNMENT_OFFSET_PX.toFixed(1)};
const float gridLineAntialiasMultiplier = ${GRID_LINE_ANTIALIAS_MULTIPLIER.toFixed(1)};
const float horizontalLodLevelOneEndPx = 5.6;
const float horizontalLodLevelOneStartPx = 2.8;
const float horizontalLodLevelTwoEndPx = 3.0;
const float horizontalLodLevelTwoStartPx = 1.4;
const float horizontalCompressionEndPx = 2.8;
const float horizontalCompressionStartPx = 1.2;
const float lineWidthPx = ${GRID_LINE_WIDTH_PX.toFixed(2)};
const float perspectivePx = ${PERSPECTIVE_PX.toFixed(1)};
const float gridTravelRatio = 0.5;
const float verticalCompressionEndPx = 2.6;
const float verticalCompressionStartPx = 1.0;
const float verticalEdgeCompressionEnd = 0.95;
const float verticalEdgeCompressionStart = 0.45;
const float verticalLodLevelEnd = 0.64;
const float verticalLodLevelStart = 0.22;
const float verticalTopCompressionEndCells = 6.0;
const float verticalTopCompressionStartCells = 2.0;

float renderGridLine(
  float wrappedCoord,
  float antiAliasWidth,
  float softnessBoost
) {
  return 1.0 - smoothstep(
    lineWidthPx,
    lineWidthPx + (antiAliasWidth * (1.5 + softnessBoost)),
    wrappedCoord
  );
}

void main() {
  float angle = radians(clamp(u_angle, 1.0, 89.0));
  float sinAngle = sin(angle);
  float cosAngle = cos(angle);
  vec2 screen = vec2(
    (gl_FragCoord.x / u_device_pixel_ratio) - (u_container_size.x * 0.5),
    (u_container_size.y * 0.5) - (gl_FragCoord.y / u_device_pixel_ratio)
  );

  vec3 rayOrigin = vec3(0.0, 0.0, perspectivePx);
  vec3 rayDirection = normalize(vec3(screen, -perspectivePx));
  vec3 planeXAxis = vec3(1.0, 0.0, 0.0);
  vec3 planeYAxis = vec3(0.0, cosAngle, sinAngle);
  vec3 planeNormal = normalize(cross(planeXAxis, planeYAxis));
  float denominator = dot(rayDirection, planeNormal);

  if (abs(denominator) < 0.0001) {
    discard;
  }

  float distanceToPlane = dot(-rayOrigin, planeNormal) / denominator;

  if (distanceToPlane <= 0.0) {
    discard;
  }

  vec3 hitPoint = rayOrigin + (rayDirection * distanceToPlane);
  float localX = hitPoint.x;
  float localY = dot(hitPoint, planeYAxis);
  float gridWidth = u_viewport_size.x * gridWidthRatio;
  float gridHeight = u_viewport_size.y * gridHeightRatio;
  float gridScrollSpeed = (gridHeight * gridTravelRatio) / animationDurationSeconds;
  float patternOffsetY = u_time * gridScrollSpeed;
  float gridLeft = (-0.5 * u_container_size.x) + (gridXOffsetRatio * u_container_size.x);
  float gridTop = (-0.5 * u_container_size.y) + (gridStartOffsetRatio * gridHeight);
  vec2 planePosition = vec2(localX - gridLeft, localY - gridTop);

  if (
    planePosition.x < 0.0 ||
    planePosition.y < 0.0 ||
    planePosition.x > gridWidth ||
    planePosition.y > gridHeight
  ) {
    discard;
  }

  vec2 patternPosition = vec2(planePosition.x, planePosition.y - patternOffsetY);
  vec2 wrapped = mod(
    patternPosition + vec2(gridLineAlignmentOffsetPx),
    u_cell_size
  );
  vec2 patternDerivative = max(fwidth(patternPosition), vec2(0.0001));
  vec2 antiAliasWidth = patternDerivative * gridLineAntialiasMultiplier;
  float horizontalCellSpanPx = u_cell_size / patternDerivative.y;
  float horizontalCompression = 1.0 - smoothstep(
    horizontalCompressionStartPx,
    horizontalCompressionEndPx,
    horizontalCellSpanPx
  );
  float verticalCellSpanPx = u_cell_size / patternDerivative.x;
  float sideDistance = abs((planePosition.x / gridWidth) * 2.0 - 1.0);
  float verticalEdgeCompression = smoothstep(
    verticalEdgeCompressionStart,
    verticalEdgeCompressionEnd,
    sideDistance
  );
  float verticalTopCompression = 1.0 - smoothstep(
    u_cell_size * verticalTopCompressionStartCells,
    u_cell_size * verticalTopCompressionEndCells,
    planePosition.y
  );
  float verticalCompression =
    (1.0 - smoothstep(
      verticalCompressionStartPx,
      verticalCompressionEndPx,
      verticalCellSpanPx
    )) * verticalEdgeCompression * verticalTopCompression;
  float horizontalSoftnessBoost = 1.0 + (horizontalCompression * 3.0);
  float verticalSoftnessBoost = 1.0 + (verticalCompression * 3.5);
  float verticalLod = smoothstep(
    verticalLodLevelStart,
    verticalLodLevelEnd,
    verticalCompression
  );
  float verticalLineFine = renderGridLine(
    wrapped.x,
    antiAliasWidth.x,
    verticalSoftnessBoost
  );
  float verticalWrappedLod = mod(
    patternPosition.x + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float verticalLineCoarse = renderGridLine(
    verticalWrappedLod,
    antiAliasWidth.x,
    verticalSoftnessBoost + verticalLod
  );
  float verticalLine = max(
    verticalLineFine * (1.0 - verticalLod),
    verticalLineCoarse * verticalLod
  );
  float horizontalLodLevelOne = 1.0 - smoothstep(
    horizontalLodLevelOneStartPx,
    horizontalLodLevelOneEndPx,
    horizontalCellSpanPx
  );
  float horizontalLodLevelTwo = 1.0 - smoothstep(
    horizontalLodLevelTwoStartPx,
    horizontalLodLevelTwoEndPx,
    horizontalCellSpanPx
  );
  float horizontalLineFine = renderGridLine(
    wrapped.y,
    antiAliasWidth.y,
    horizontalSoftnessBoost
  );
  float horizontalWrappedLodOne = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 2.0
  );
  float horizontalWrappedLodTwo = mod(
    patternPosition.y + gridLineAlignmentOffsetPx,
    u_cell_size * 4.0
  );
  float horizontalLineCoarse = renderGridLine(
    horizontalWrappedLodOne,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne
  );
  float horizontalLineExtraCoarse = renderGridLine(
    horizontalWrappedLodTwo,
    antiAliasWidth.y,
    horizontalSoftnessBoost + horizontalLodLevelOne + horizontalLodLevelTwo
  );
  float horizontalLineReduced = max(
    horizontalLineFine * (1.0 - horizontalLodLevelOne),
    horizontalLineCoarse * horizontalLodLevelOne
  );
  float horizontalLine = max(
    horizontalLineReduced * (1.0 - horizontalLodLevelTwo),
    horizontalLineExtraCoarse * horizontalLodLevelTwo
  );
  float line = max(verticalLine, horizontalLine);

  if (line <= 0.001) {
    discard;
  }

  float alpha = u_line_color.a * line;
  gl_FragColor = vec4(u_line_color.rgb * alpha, alpha);
}
`

let colorResolveContext

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader

  gl.deleteShader(shader)
  return null
}

function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)

  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    return null
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program

  gl.deleteProgram(program)
  return null
}

function getProgramInfo(gl, program) {
  const attributeLocation = gl.getAttribLocation(program, 'a_position')
  const angle = gl.getUniformLocation(program, 'u_angle')
  const cellSize = gl.getUniformLocation(program, 'u_cell_size')
  const containerSize = gl.getUniformLocation(program, 'u_container_size')
  const devicePixelRatio = gl.getUniformLocation(program, 'u_device_pixel_ratio')
  const lineColor = gl.getUniformLocation(program, 'u_line_color')
  const time = gl.getUniformLocation(program, 'u_time')
  const viewportSize = gl.getUniformLocation(program, 'u_viewport_size')

  if (
    attributeLocation < 0 ||
    !angle ||
    !cellSize ||
    !containerSize ||
    !devicePixelRatio ||
    !lineColor ||
    !time ||
    !viewportSize
  ) {
    return null
  }

  return {
    attributeLocation,
    program,
    uniforms: { angle, cellSize, containerSize, devicePixelRatio, lineColor, time, viewportSize },
  }
}

function getColorResolveContext() {
  if (colorResolveContext !== undefined) return colorResolveContext

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  colorResolveContext = canvas.getContext('2d', { willReadFrequently: true })
  return colorResolveContext
}

// Turns any CSS color (hex, rgba(), var(--cyan)...) into 0-1 RGBA for the shader.
function resolveLineColor(color, element) {
  const resolver = document.createElement('span')
  resolver.style.color = color
  resolver.style.opacity = '0'
  resolver.style.pointerEvents = 'none'
  resolver.style.position = 'absolute'
  element.appendChild(resolver)

  const resolvedColor = getComputedStyle(resolver).color
  resolver.remove()
  const context = getColorResolveContext()

  if (!context) return new Float32Array([0.5, 0.5, 0.5, 1])

  context.clearRect(0, 0, 1, 1)
  context.fillStyle = resolvedColor
  context.fillRect(0, 0, 1, 1)
  const pixel = context.getImageData(0, 0, 1, 1).data

  return new Float32Array([pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, pixel[3] / 255])
}

export default function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lineColor = 'rgba(0, 212, 255, 0.55)',
  fadeColor = 'var(--bg)',
  maxPixelRatio = MAX_DEVICE_PIXEL_RATIO, // cap this at 1 (or lower) on weak devices
  maxFps = 30, // frame-rate cap for the animation, 0 = uncapped
  className = '',
  style,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isWebGlReady, setIsWebGlReady] = useState(false)
  const angleRef = useRef(angle)
  const cellSizeRef = useRef(cellSize)
  const lineColorRef = useRef(lineColor)
  const syncSceneRef = useRef(null)
  const maxPixelRatioRef = useRef(maxPixelRatio)
  const maxFpsRef = useRef(maxFps)

  // Keep the render loop in sync with prop changes without rebuilding WebGL.
  useEffect(() => {
    angleRef.current = angle
    cellSizeRef.current = cellSize
    lineColorRef.current = lineColor
    maxPixelRatioRef.current = maxPixelRatio
    maxFpsRef.current = maxFps
    syncSceneRef.current?.()
  }, [angle, cellSize, lineColor, maxPixelRatio, maxFps])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let animationFrameId = null
    let currentWidth = 0
    let currentHeight = 0
    let currentDevicePixelRatio = 1
    let gl = null
    let isVisible = true
    let isContextLost = false
    let color = resolveLineColor(lineColorRef.current, container)
    let positionBuffer = null
    let programInfo = null
    let lastDrawTime = 0

    const getContext = () => {
      const nextGl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      })

      if (!nextGl || !nextGl.getExtension('OES_standard_derivatives')) return null
      return nextGl
    }

    const releasePipeline = (shouldDeleteResources) => {
      if (shouldDeleteResources && gl) {
        if (positionBuffer) gl.deleteBuffer(positionBuffer)
        if (programInfo) gl.deleteProgram(programInfo.program)
      }

      positionBuffer = null
      programInfo = null

      if (shouldDeleteResources) gl = null
    }

    const initializePipeline = () => {
      const nextGl = getContext()

      if (!nextGl) {
        releasePipeline(false)
        return false
      }

      gl = nextGl
      releasePipeline(true)
      gl = nextGl

      const program = createProgram(nextGl)
      if (!program) return false

      const nextProgramInfo = getProgramInfo(nextGl, program)
      if (!nextProgramInfo) {
        nextGl.deleteProgram(program)
        return false
      }

      const nextPositionBuffer = nextGl.createBuffer()
      if (!nextPositionBuffer) {
        nextGl.deleteProgram(program)
        return false
      }

      nextGl.bindBuffer(nextGl.ARRAY_BUFFER, nextPositionBuffer)
      nextGl.bufferData(
        nextGl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        nextGl.STATIC_DRAW
      )

      positionBuffer = nextPositionBuffer
      programInfo = nextProgramInfo
      return true
    }

    const updateLineColor = () => {
      color = resolveLineColor(lineColorRef.current, container)
    }

    const resizeCanvas = () => {
      currentWidth = Math.floor(container.clientWidth)
      currentHeight = Math.floor(container.clientHeight)

      if (currentWidth === 0 || currentHeight === 0 || !gl) return

      currentDevicePixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatioRef.current)

      canvas.width = Math.floor(currentWidth * currentDevicePixelRatio)
      canvas.height = Math.floor(currentHeight * currentDevicePixelRatio)
      canvas.style.width = `${currentWidth}px`
      canvas.style.height = `${currentHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const draw = (timestamp) => {
      if (
        currentWidth === 0 ||
        currentHeight === 0 ||
        !gl ||
        !positionBuffer ||
        !programInfo ||
        isContextLost
      ) {
        return
      }

      gl.useProgram(programInfo.program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(programInfo.attributeLocation)
      gl.vertexAttribPointer(programInfo.attributeLocation, 2, gl.FLOAT, false, 0, 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(programInfo.uniforms.angle, clamp(angleRef.current, MIN_ANGLE, MAX_ANGLE))
      gl.uniform1f(programInfo.uniforms.cellSize, Math.max(cellSizeRef.current, 1))
      gl.uniform2f(programInfo.uniforms.containerSize, currentWidth, currentHeight)
      gl.uniform1f(programInfo.uniforms.devicePixelRatio, currentDevicePixelRatio)
      gl.uniform4fv(programInfo.uniforms.lineColor, color)
      gl.uniform1f(programInfo.uniforms.time, reducedMotion.matches ? 0 : timestamp / 1000)
      gl.uniform2f(programInfo.uniforms.viewportSize, window.innerWidth, window.innerHeight)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const frame = (timestamp) => {
      // Frame-rate cap: skip the (expensive) draw if it's too soon, but keep
      // the loop alive. The grid scrolls slowly, so 30fps looks identical.
      const fps = maxFpsRef.current
      const minFrameMs = fps > 0 ? 1000 / fps - FRAME_TOLERANCE_MS : 0

      if (timestamp - lastDrawTime >= minFrameMs) {
        lastDrawTime = timestamp
        draw(timestamp)
      }

      if (!reducedMotion.matches && isVisible) {
        animationFrameId = requestAnimationFrame(frame)
        return
      }

      animationFrameId = null
    }

    const syncScene = () => {
      if (isContextLost) {
        stopAnimation()
        setIsWebGlReady(false)
        return
      }

      if (!gl || !positionBuffer || !programInfo) {
        if (!initializePipeline()) {
          stopAnimation()
          setIsWebGlReady(false)
          return
        }
      }

      resizeCanvas()

      if (currentWidth === 0 || currentHeight === 0) {
        stopAnimation()
        return
      }

      updateLineColor()
      draw(performance.now())
      setIsWebGlReady(true)

      if (reducedMotion.matches || !isVisible) {
        stopAnimation()
        return
      }

      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(frame)
      }
    }

    syncSceneRef.current = syncScene

    const resizeObserver = new ResizeObserver(syncScene)
    resizeObserver.observe(container)

    // Stop rendering while the hero is scrolled off-screen.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false

      if (isVisible) {
        syncScene()
        return
      }

      stopAnimation()
    })
    intersectionObserver.observe(container)

    const handleContextLost = (event) => {
      event.preventDefault()
      isContextLost = true
      stopAnimation()
      releasePipeline(false)
      setIsWebGlReady(false)
    }

    const handleContextRestored = () => {
      isContextLost = false
      syncScene()
    }

    reducedMotion.addEventListener('change', syncScene)
    window.addEventListener('resize', syncScene)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    syncScene()

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      reducedMotion.removeEventListener('change', syncScene)
      window.removeEventListener('resize', syncScene)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      syncSceneRef.current = null
      releasePipeline(!isContextLost)
    }
  }, [])

  const normalizedAngle = clamp(angle, MIN_ANGLE, MAX_ANGLE)
  const normalizedCellSize = Math.max(cellSize, 1)

  return (
    <div
      ref={containerRef}
      className={`${styles.wrap} ${className}`.trim()}
      style={{ ...style, opacity }}
      aria-hidden="true"
    >
      {/* CSS-only fallback, shown only if WebGL isn't available. */}
      {!isWebGlReady && (
        <div className={styles.projection} style={{ perspective: `${PERSPECTIVE_PX}px` }}>
          <div className={styles.rotation} style={{ transform: `rotateX(${normalizedAngle}deg)` }}>
            <div
              className={styles.fallbackGrid}
              style={{
                backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 0), linear-gradient(to bottom, ${lineColor} 1px, transparent 0)`,
                backgroundSize: `${normalizedCellSize}px ${normalizedCellSize}px`,
              }}
            />
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${isWebGlReady ? styles.canvasOn : ''}`}
      />

      {/* Fades the near end of the floor into the page background. */}
      <div
        className={styles.fade}
        style={{ background: `linear-gradient(to top, ${fadeColor}, transparent 90%)` }}
      />
    </div>
  )
}