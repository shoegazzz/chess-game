import { Cell } from './../Cell';
import { Colors } from './../Colors';
import { Figure, FigureNames } from './Figure';
import blackLogo from '../../assets/black-king.png'
import whiteLogo from '../../assets/white-king.png'

export class King extends Figure {
    constructor(color: Colors, cell: Cell) {
        super(color, cell);
        this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
        this.name = FigureNames.KING;
    }

    canMove(target: Cell): boolean {
        if (!super.canMove(target)) {
            return false
        }
        const x = this.cell.x
        const y = this.cell.y
        const hollowTarget = Object.assign({}, target)

        hollowTarget.figure = null;

        const checkAvaliableCells: boolean = (target.y === y || target.y + 1 === y || target.y - 1 === y)
            && (target.x === x || target.x + 1 === x || target.x - 1 === x)

        if (checkAvaliableCells
            && (this.cell.board.getCell(target.x, target.y).isEmpty() || (this.cell.isEnemy(target) && !target.isProtected()))
            && (!this.cell.isUnderAttack(target))) {
            return true;
        }

        if (this.cell.isCastling(target)) return true

        return false
    }

    moveFigure(target: Cell): void {
        super.moveFigure(target);

        if (this.cell.x - target.x > 1) {
            if (this.color === Colors.BLACK) {
                this.cell.board.getCell(0, 0).moveFigure(this.cell.board.getCell(3, 0))
            } else {
                this.cell.board.getCell(0, 7).moveFigure(this.cell.board.getCell(3, 7));
              }
            } else if (this.cell.x - target.x < -1) {
              if (this.color === Colors.BLACK) {
                this.cell.board.getCell(7, 0).moveFigure(this.cell.board.getCell(5, 0));
              } else {
                this.cell.board.getCell(7, 7).moveFigure(this.cell.board.getCell(5, 7));
            }
        }
    }
    
}