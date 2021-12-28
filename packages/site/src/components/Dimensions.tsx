import {
  Dimensions,
  Frame,
  Orientation,
  Screen,
  dimensions as defaultDimensions
} from "dimmmensions"
import { motion, transform } from "framer-motion"
import {
  CSSProperties,
  ChangeEvent,
  ComponentProps,
  useCallback,
  useMemo,
  useState
} from "react"
import { springier } from "../transitions"
import { getPercentage } from "../utils/get-percentage"
import { SegmentedControl } from "./SegmentedControl"

interface Pattern {
  /**
   * A list of one or more classes.
   */
  className: string

  /**
   * A path outlining the pattern's content frame.
   */
  path?: string
}

/**
 * Sort sets of dimensions.
 *
 * @param a - The first set of dimensions.
 * @param b - The second set of dimensions.
 */
function sortDimensions(a: Dimensions, b: Dimensions) {
  return a.name.localeCompare(b.name)
}

const iPhone = defaultDimensions
  .filter((dimensions) => dimensions.device === "iPhone")
  .sort(sortDimensions)
const iPad = defaultDimensions
  .filter((dimensions) => dimensions.device === "iPad")
  .sort(sortDimensions)

const attributedDimensions = new Map(
  defaultDimensions.map((dimensions) => [dimensions.name, dimensions])
)

/**
 * Get the most recent device as a default.
 */
function getDefaultDevice() {
  const devices = defaultDimensions
    .map((dimensions) => dimensions.name.match(/\w+\s+(\d+)$/))
    .filter((devices) => devices)
    .sort((a, b) => Number(b?.[1]) - Number(a?.[1]))

  return devices?.[0]?.input ?? iPhone[0].name
}

const DEFAULT_DEVICE = getDefaultDevice()
const DEFAULT_ORIENTATION: Orientation = "portrait"
const DEFAULT_SCREEN_BOUNDS: Frame = { bottom: 0, left: 0, right: 0, top: 0 }
const DEFAULT_SCREEN_RADIUS = 6
const SCREEN_PATTERN_SIZE = 8
const SCREEN_PERCENTAGE_MIN = 50
const SCREEN_PERCENTAGE_MAX = 75

/**
 * Create a path from a frame and a reference size.
 *
 * @param frame - The frame to create path from.
 * @param width - The reference width.
 * @param height - The reference height.
 */
function getPathFromFrame(frame: Frame, width: number, height: number) {
  return `M ${frame.left} ${frame.top}
          V ${height - frame.bottom}
          H ${width - frame.right}
          V ${frame.top} Z`
}

/**
 * Create a path from bounds and a reference frame.
 *
 * @param screen - The screen dimensions.
 * @param screen.width - The screen width.
 * @param screen.height - The screen height.
 * @param reference - The reference frame to create a path from.
 * @param [bounds] - The optional bounds to inset the reference frame from.
 */
function getPathFromDimensions(
  { width, height }: Screen,
  reference: Frame,
  bounds: Frame = DEFAULT_SCREEN_BOUNDS
) {
  if (
    reference.top === bounds.top &&
    reference.right === bounds.right &&
    reference.bottom === bounds.bottom &&
    reference.left === bounds.left
  ) {
    return
  }

  return `${getPathFromFrame(reference, width, height)}
  ${getPathFromFrame(bounds, width, height)}`
}

const iPhoneIcon = (
  <g fill="currentColor">
    <path d="M6 3h8v14H6Z" fillOpacity={0.2} />
    <path d="M5 3.5A2.5 2.5 0 0 1 7.5 1h5A2.5 2.5 0 0 1 15 3.5v13a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 5 16.5ZM6.5 15a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1Z" />
  </g>
)
const iPhoneRoundedIcon = (
  <g fill="currentColor">
    <path d="M6 2h8v16H6Z" fillOpacity={0.2} />
    <path d="M5 3.5A2.5 2.5 0 0 1 7.5 1h5A2.5 2.5 0 0 1 15 3.5v13a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 5 16.5Zm1.5 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-.167a.333.333 0 0 0-.333.333.666.666 0 0 1-.667.667H8.667A.666.666 0 0 1 8 2.833a.333.333 0 0 0-.333-.333H7.5a1 1 0 0 0-1 1Z" />
  </g>
)
const iPadIcon = (
  <g fill="currentColor">
    <path d="M4 3h12v14H4Z" fillOpacity={0.2} />
    <path d="M3 3.5A2.5 2.5 0 0 1 5.5 1h9A2.5 2.5 0 0 1 17 3.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 16.5ZM4.5 15a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1Z" />
  </g>
)
const iPadRoundedIcon = (
  <g fill="currentColor">
    <path d="M4 2h12v16H4Z" fillOpacity={0.2} />
    <path d="M3 3.5A2.5 2.5 0 0 1 5.5 1h9A2.5 2.5 0 0 1 17 3.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 16.5Zm1.5 13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-13a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1Z" />
  </g>
)

/**
 * A select element containing all iOS and iPadOS devices as options.
 *
 * @param props - A set of `select` props.
 */
function Select(props: ComponentProps<"select">) {
  return (
    <select {...props}>
      <optgroup label="iPhone">
        {iPhone.map((device) => (
          <option key={device.name} value={device.name}>
            {device.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="iPad">
        {iPad.map((device) => (
          <option key={device.name} value={device.name}>
            {device.name}
          </option>
        ))}
      </optgroup>
    </select>
  )
}

/**
 * An interactive section to explore all dimensions.
 *
 * @param props - A set of `section` props.
 */
export function Dimensions(props: ComponentProps<"section">) {
  const [device, setDevice] = useState(DEFAULT_DEVICE)
  const [orientation, setOrientation] =
    useState<Orientation>(DEFAULT_ORIENTATION)
  const dimensions = useMemo(
    () => attributedDimensions.get(device) as Dimensions,
    [device]
  )
  const orientedDimensions = useMemo(
    () => dimensions[orientation],
    [dimensions, orientation]
  )
  const screen = useMemo(() => {
    const aspectRatio =
      orientedDimensions.screen.width / orientedDimensions.screen.height
    const style: CSSProperties = {
      aspectRatio: String(aspectRatio)
    }

    if (orientation === "portrait") {
      style.height = `${SCREEN_PERCENTAGE_MAX}%`
    } else {
      const percentage = transform(
        aspectRatio,
        [1, 2],
        [SCREEN_PERCENTAGE_MIN, SCREEN_PERCENTAGE_MAX]
      )

      style.width = `${percentage}%`
    }

    if (dimensions.radius) {
      const horizontalRadius = getPercentage(
        dimensions.radius,
        orientedDimensions.screen.width
      )

      const verticalRadius = getPercentage(
        dimensions.radius,
        orientedDimensions.screen.height
      )

      style.borderRadius = `${horizontalRadius} / ${verticalRadius}`
    } else {
      style.borderRadius = `${DEFAULT_SCREEN_RADIUS}px`
    }

    return style
  }, [
    dimensions.radius,
    orientation,
    orientedDimensions.screen.width,
    orientedDimensions.screen.height
  ])
  const patterns: Pattern[] = useMemo(
    () => [
      {
        className: "text-violet-500 dark:text-violet-300",
        path: getPathFromDimensions(
          orientedDimensions.screen,
          orientedDimensions.safeArea
        )
      },
      {
        className: "text-cyan-500 dark:text-cyan-300",
        path: getPathFromDimensions(
          orientedDimensions.screen,
          orientedDimensions.layoutMargins,
          orientedDimensions.safeArea
        )
      },
      {
        className: "text-lime-500 dark:text-lime-300",
        path: getPathFromDimensions(
          orientedDimensions.screen,
          orientedDimensions.readableContent,
          orientedDimensions.layoutMargins
        )
      }
    ],
    [orientedDimensions]
  )

  const icon = useMemo(() => {
    return dimensions.device === "iPad"
      ? dimensions.radius
        ? iPadRoundedIcon
        : iPadIcon
      : dimensions.radius
      ? iPhoneRoundedIcon
      : iPhoneIcon
  }, [dimensions.device, dimensions.radius])

  const handleDeviceChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setDevice(event.target.value)
    },
    []
  )

  const handleOrientationChange = useCallback((orientation: Orientation) => {
    if (orientation) {
      setOrientation(orientation)
    }
  }, [])

  return (
    <section {...props}>
      <div className="flex flex-col rounded-md border dark:border-zinc-800 border-zinc-150">
        <div className="aspect-[16/9] flex overflow-hidden justify-center items-center min-h-0">
          <div
            className="overflow-hidden relative flex-none bg-white shadow-device dark:shadow-device-invert dark:bg-zinc-850"
            key={orientation}
            style={screen}
          >
            <svg
              className="opacity-60 dark:opacity-80"
              height="100%"
              preserveAspectRatio="none"
              viewBox={`0 0 ${orientedDimensions.screen.width} ${orientedDimensions.screen.height}`}
              width="100%"
            >
              <defs>
                {patterns.map(({ className }, index) => (
                  <pattern
                    className={className}
                    height={SCREEN_PATTERN_SIZE}
                    id={`${index}`}
                    key={`pattern-${index}`}
                    patternTransform="rotate(45)"
                    patternUnits="userSpaceOnUse"
                    vectorEffect="non-scaling-stroke"
                    width={SCREEN_PATTERN_SIZE * (index ? index * 2 : 1)}
                  >
                    <line
                      className="stroke-current"
                      strokeWidth={1.25}
                      vectorEffect="non-scaling-stroke"
                      y2={SCREEN_PATTERN_SIZE}
                    />
                  </pattern>
                ))}
              </defs>
              {patterns.map(({ path, className }, index) => {
                if (!path) return null

                return (
                  <g
                    className={className}
                    fillRule="evenodd"
                    key={`fill-${index}`}
                  >
                    <path className="opacity-20 fill-current" d={path} />
                    <path d={path} fill={`url(#${index})`} />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
        <div className="flex flex-col flex-none gap-4 p-4 border-t dark:border-zinc-800 md:flex-row md:p-5 border-zinc-150">
          <div className="flex flex-col flex-none gap-4 items-center sm:flex-row md:flex-1">
            <div className="relative w-full h-9 text-zinc-400 dark:hover:text-zinc-400 sm:flex-1 hover:text-zinc-450 dark:text-zinc-450">
              <motion.svg
                animate={orientation}
                className="absolute top-2 left-2 transition-colors pointer-events-none"
                height="20"
                role="presentation"
                style={{
                  transformOrigin: "center center"
                }}
                transition={springier}
                variants={{
                  portrait: { rotate: 0 },
                  landscape: { rotate: -90 }
                }}
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                {icon}
              </motion.svg>
              <svg
                className="absolute top-2 right-1 transition-colors pointer-events-none"
                fill="currentColor"
                height="20"
                role="presentation"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  fillRule="evenodd"
                />
              </svg>
              <Select
                aria-label="Device"
                className="flex flex-none justify-center items-center pr-7 pl-9 w-full h-full text-sm font-medium text-zinc-500 truncate bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition appearance-none cursor-pointer focusable dark:bg-zinc-750 dark:text-zinc-350 hover:bg-zinc-150"
                onChange={handleDeviceChange}
                value={device}
              />
            </div>
            <SegmentedControl
              aria-label="Orientation"
              backgroundProps={{
                className:
                  "absolute inset-0.5 bg-white dark:bg-zinc-550 rounded-md shadow z-0"
              }}
              className="grid grid-flow-col auto-cols-fr gap-x-[4px] w-full h-9 text-zinc-500 bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors sm:w-auto hover:bg-zinc-150 dark:bg-zinc-750 dark:text-zinc-350"
              labels={["Portrait", "Landscape"]}
              onValueChange={handleOrientationChange}
              options={["portrait", "landscape"]}
              segmentProps={{
                className:
                  "flex relative justify-center items-center px-3 text-sm font-medium rounded-lg transition-shadow focusable"
              }}
              selectedSegmentProps={{
                className: "text-zinc-600 dark:text-zinc-100"
              }}
              value={orientation}
            />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-6 items-center py-4 px-5 sm:flex sm:gap-4 md:py-0 md:px-3">
            <div className="flex flex-col flex-1 gap-2 items-center tabular-nums whitespace-nowrap">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
                {orientedDimensions.screen.width}
                <span className="text-zinc-400">pt</span>{" "}
                <span className="text-zinc-400 dark:text-zinc-400">×</span>{" "}
                {orientedDimensions.screen.height}
                <span className="text-zinc-400">pt</span>
              </p>
              <p className="font-semibold tracking-widest text-zinc-400 uppercase text-2xs">
                Screen
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center tabular-nums whitespace-nowrap flex-3/4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
                {dimensions.radius}
                <span className="text-zinc-400">pt</span>
              </p>
              <p className="font-semibold tracking-widest text-zinc-400 uppercase text-2xs">
                Radius
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center tabular-nums whitespace-nowrap flex-3/4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
                <span className="text-zinc-400">@</span>
                {dimensions.scale}x
              </p>
              <p className="font-semibold tracking-widest text-zinc-400 uppercase text-2xs">
                Scale
              </p>
            </div>
            <div className="flex flex-col flex-1 gap-2 items-center tabular-nums whitespace-nowrap">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-200">
                <span aria-label="width" className="text-zinc-400">
                  w
                </span>
                <span
                  aria-label={orientedDimensions.sizeClass.horizontal}
                  className="uppercase"
                >
                  {orientedDimensions.sizeClass.horizontal.charAt(0)}
                </span>{" "}
                <span className="text-zinc-400 dark:text-zinc-400">×</span>{" "}
                <span
                  aria-label="height"
                  className="text-zinc-400 dark:text-zinc-400"
                >
                  h
                </span>
                <span
                  aria-label={orientedDimensions.sizeClass.vertical}
                  className="uppercase"
                >
                  {orientedDimensions.sizeClass.vertical.charAt(0)}
                </span>
              </p>
              <p className="font-semibold tracking-wider text-zinc-400 dark:text-zinc-400 uppercase text-2xs">
                Size Classes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
