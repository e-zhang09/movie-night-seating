import classifyPoint from "robust-point-in-polygon";

export interface Point {
  x: number
  y: number
}

const offset = {
  height: 15,
  width: 30,
};

function transformPtToArrPt(point: Point): [number, number] {
  return [point.x, point.y];
}

export default function generateInitialPoints(): Point[] {
  // 10px = 1ft
  // radius of 40px = 4ft
  // 4 ft *  = 8 ft distance > 6 safety
  const radius = 40;

  // *less.. accurate*
  /*
  ----540----
       |
      665
       |
    --400--
   */
  const QuadOutline = [
    {
      x: 0,
      y: 0,
    },
    {
      x: 540,
      y: 0,
    },
    {
      x: 472,
      y: 665,
    },
    {
      x: 68,
      y: 665,
    },
  ] as Point[];

  return generateInitPoints(QuadOutline, radius);
}

export function generateInitPoints(bound: Point[], radius: number): Point[] {
  let results = [] as Point[];
  let posX = 0;
  let posY = offset.height;

  const rowHeightDiff = Math.sin(60 * Math.PI / 180) * radius * 2;
  const colIndent = radius;

  const minX = Math.min(...bound.map(pt => pt.x));
  const maxX = Math.max(...bound.map(pt => pt.x));
  const minY = Math.min(...bound.map(pt => pt.y));
  const maxY = Math.max(...bound.map(pt => pt.y));

  const estimateRows = Math.ceil((maxY - minY) / radius / 1.7 + 1);
  const estimateColumns = Math.ceil((maxX - minX) / radius / 2 + 1);

  for (let i = 0; i < estimateRows; i++) {
    if (i % 2 === 0) {
      posX = offset.width;
    } else {
      posX = offset.width + colIndent;
    }
    for (let j = 0; j < estimateColumns; j++) {
      results.push({
        x: posX,
        y: posY,
      });
      posX += radius * 2;
    }
    posY += rowHeightDiff;
  }

  results = results.filter(point => classifyPoint(bound.map(transformPtToArrPt), transformPtToArrPt(point)) <= 0);

  return results;
}
