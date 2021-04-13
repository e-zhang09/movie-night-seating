import { Point } from '../components/PolygonPoints'
import classifyPoint from 'robust-point-in-polygon'


const offset = {
    height: 15,
    width: 30
}

function transformPtToArrPt (point: Point): [number, number] {
    return [point.x, point.y]
}

export default function generateInitPoints (bound: Point[], radius: number): Point[] {
    let results = [] as Point[]
    let posX = 0
    let posY = offset.height

    const rowHeightDiff = Math.sin(60 * Math.PI / 180) * radius * 2
    const colIndent = radius

    let minX = Math.min(...bound.map(pt => pt.x))
    let maxX = Math.max(...bound.map(pt => pt.x))
    let minY = Math.min(...bound.map(pt => pt.y))
    let maxY = Math.max(...bound.map(pt => pt.y))

    let estimateRows = Math.ceil((maxY - minY) / radius / 1.7 + 1)
    let estimateColumns = Math.ceil((maxX - minX) / radius / 2 + 1)

    for (let i = 0; i < estimateRows; i++) {
        if (i % 2 === 0) {
            posX = offset.width
        } else {
            posX = offset.width + colIndent
        }
        for (let j = 0; j < estimateColumns; j++) {
            results.push({
                x: posX,
                y: posY
            })
            posX += radius * 2
        }
        posY += rowHeightDiff
    }

    results = results.filter(point => classifyPoint(bound.map(transformPtToArrPt), transformPtToArrPt(point)) <= 0)

    return results
}
