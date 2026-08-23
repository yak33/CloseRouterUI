/**
 * 单调三次埃尔米特插值（Fritsch–Carlson）。
 *
 * 为什么不用更省事的 Catmull-Rom：用量类数据是非负的，Catmull-Rom 在陡峭
 * 转折处会「甩」出低于 0 的过冲，画出来像数据出错。单调插值保证曲线
 * 不越过任何数据点，视觉上既平滑又诚实。
 *
 * @param points 已换算为像素坐标的点序列，x 需单调递增
 * @return SVG path 的 d 属性字符串（不含闭合，供描边或再拼接填充使用）
 * @author ZHANGCHAO
 * @date 2026/08/22
 */
export function monotonePath(points: ReadonlyArray<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  const slopes = points.slice(0, -1).map((point, i) => {
    const next = points[i + 1]
    return (next.y - point.y) / (next.x - point.x)
  })

  // 端点取邻段斜率，内部点取相邻斜率均值；异号处置零以消除拐点抖动
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0]
    if (i === points.length - 1) return slopes[slopes.length - 1]
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2
  })

  // Fritsch–Carlson 限幅：把切线拉回单调区间，这一步才是「不过冲」的保证
  slopes.forEach((slope, i) => {
    if (slope === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      return
    }
    const alpha = tangents[i] / slope
    const beta = tangents[i + 1] / slope
    const magnitude = alpha * alpha + beta * beta
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude)
      tangents[i] = scale * alpha * slope
      tangents[i + 1] = scale * beta * slope
    }
  })

  const segments = points.slice(1).map((point, i) => {
    const prev = points[i]
    const third = (point.x - prev.x) / 3
    const c1x = prev.x + third
    const c1y = prev.y + tangents[i] * third
    const c2x = point.x - third
    const c2y = point.y - tangents[i + 1] * third
    return `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${point.x} ${point.y}`
  })

  return `M ${points[0].x} ${points[0].y} ${segments.join(' ')}`
}
