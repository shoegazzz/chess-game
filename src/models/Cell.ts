import { Board } from "./Board";
import { Colors } from "./Colors";
import { Figure, FigureNames } from "./figures/Figure";

export class Cell {
    readonly x: number;
    readonly y: number;
    readonly color: Colors;
    figure: Figure | null;
    board: Board;
    available: boolean; // is it possible to move
    id: number; // for react key

    constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.figure = figure;
        this.board = board;
        this.available = false;
        this.id = Math.random()
    }

    isUnderAttack(target: Cell): boolean {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const cell = this.board.getCell(x, y);

                if (cell.isEnemy(this)) {
                    
                    if (cell.figure?.name === FigureNames.KING) {
                        if ((target.y === cell.y || target.y === cell.y + 1 || target.y === cell.y - 1)
                          && (target.x === cell.x || target.x === cell.x + 1 || target.x === cell.x - 1)) {
                            return true
                          }
                    }

                    if (cell.figure?.name === FigureNames.PAWN) {
                        if (cell.figure.color === Colors.BLACK) {
                          if ((target.x === cell.x + 1 || target.x === cell.x - 1) && (target.y === cell.y + 1)) return true;
                        } else {
                          if ((target.x === cell.x + 1 || target.x === cell.x - 1) && (target.y === cell.y - 1)) return true;
                        }
                    }

                    if (cell.figure?.name !== FigureNames.PAWN && cell.figure?.canMove(target)) {
                        return true
                    }
                }
            }
        }
        return false
    }

    isProtected(): boolean {
        const hollowTarget = this.createHollowCell(this);
    
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const cell = this.board.getCell(x, y);
    
            if (!cell.isEnemy(this) && (cell.x !== this.x || cell.y !== this.y) && cell.figure?.canMove(hollowTarget)) {
              return true;
            }
          }
        }
        return false;
    }

    isAttacking(): Cell | null {
        const hollowCell = this.createHollowCell(this);
    
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const cell = this.board.getCell(x, y);
    
            if (cell.isEnemy(this) && cell.figure?.canMove(hollowCell)) {
              return cell;
            }
            
            if (cell.isEnemy(this) && cell.figure?.name === FigureNames.PAWN) {
              if (cell.figure.color === Colors.BLACK) {
                if ((this.x === cell.x + 1 || this.x === cell.x - 1) && (this.y === cell.y + 1)) return cell;
              } else {
                if ((this.x === cell.x + 1 || this.x === cell.x - 1) && (this.y === cell.y - 1)) return cell;
              }
            }
          }
        }
        return null;
    }

    isCastling(target: Cell): boolean {
    const x = target.x;
    const y = target.y;

    const checkFigures = (): boolean => {
      switch (x) {
        case 2:
          return !!(this.board.getCell(x - 2, y).figure?.isFirstStep
            && this.board.getCell(x - 2, y).figure?.name === FigureNames.ROOK
            && !this.board.getCell(x - 2, y).isEnemy(this)
            && this.figure?.isFirstStep && !this.figure.cell.isAttacking());

        case 6:
          return !!(this.board.getCell(x + 1, y).figure?.isFirstStep
            && this.board.getCell(x + 1, y).figure?.name === FigureNames.ROOK
            && !this.board.getCell(x + 1, y).isEnemy(this)
            && this.figure?.isFirstStep && !this.figure.cell.isAttacking());
        default:
          return false;
      }
    }

    const checkLeftCastling = () => {
        let emptyCheck = true;
        for (let i = 0; i < 3; i++) {
          const target = this.board.getCell(x + i - 1, y);
  
          if (i !== 0) {
            emptyCheck = emptyCheck && target.isEmpty() && !this.isUnderAttack(target);
          } else {
            emptyCheck = emptyCheck && target.isEmpty();
          }
        }
        return emptyCheck;
    }

    const checkRightCastling = () => {
        let emptyCheck = true;
        for (let i = 0; i < 2; i++) {
          const target = this.board.getCell(x - i, y);
          emptyCheck = emptyCheck && target.isEmpty() && !this.isUnderAttack(target);
        }
        return emptyCheck;
      }
  
      switch (x) {
        case 2:
          if (checkFigures() && checkLeftCastling()) return true;
          break;
  
        case 6:
          if (checkFigures() && checkRightCastling()) return true;
          break;
      }
  
      return false;
    }

    createHollowCell(target: Cell) {
        const hollowCell = Object.assign({}, target);
        hollowCell.figure = null;
    
        return hollowCell;
      }
      
    isEmpty(): boolean {
        return this.figure === null
    }

    isEnemy(target: Cell): boolean {
        if (target.figure) {
            return this.figure?.color !== target.figure.color
        }
        return false
    }

    isEmptyVertical(target: Cell): boolean {
        if (this.x !== target.x) {
            return false
        }
        const min = Math.min(this.y, target.y)
        const max = Math.max(this.y, target.y)
        for (let y = min + 1; y < max; y++){
            if (!this.board.getCell(this.x, y).isEmpty()) {
                return false
            }
        }
        return true
    }

    isEmptyHorizontal(target: Cell): boolean {
        if (this.y !== target.y) {
            return false
        }
        const min = Math.min(this.x, target.x)
        const max = Math.max(this.x, target.x)
        for (let x = min + 1; x < max; x++){
            if (!this.board.getCell(x, this.y).isEmpty()) {
                return false
            }
        }
        return true
    }

    isEmptyDiagonal(target: Cell): boolean {
        const absX = Math.abs(target.x - this.x);
        const absY = Math.abs(target.y - this.y);
        if (absX !== absY) {
            return false
        }

        const dy = this.y < target.y ? 1 : -1
        const dx = this.x < target.x ? 1 : -1

        for (let i = 1; i < absX; i++) {
            if (!this.board.getCell(this.x + dx * i, this.y + dy * i).isEmpty()) {
                return false
            }
        }
        return true
    }

    setFigure(figure: Figure) {
        this.figure = figure;
        this.figure.cell = this
    }

    addLostFigure(figure: Figure) {
      figure.color === Colors.BLACK 
      ? this.board.lostBlackFigures.push(figure) 
      : this.board.lostWhiteFigures.push(figure)
    }

    moveFigure(target: Cell) {
        if(this.figure && this.figure?.canMove(target)){
            this.figure.moveFigure(target)
            if (target.figure) {
              this.addLostFigure(target.figure)
            }
            target.setFigure(this.figure)
            this.figure = null
        }
    }
}