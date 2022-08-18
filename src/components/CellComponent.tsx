import React, { FC } from "react";
import { Cell } from "../models/Cell";

interface ICellProps {
  cell: Cell;
  selected: boolean;
  click: (cell: Cell) => void;
}
const CellComponent: FC<ICellProps> = ({ cell, selected, click }) => {
  return (
    <div
      className={["cell", cell.color, selected ? "selected" : ""].join(" ")}
      onClick={() => click(cell)}
      style={{ background: cell.figure && cell.available ? "green" : "" }}
    >
      {cell.available && !cell.figure && <div className="available" />}
      {cell.figure?.logo && <img src={cell.figure.logo} alt="" />}
    </div>
  );
};

export default CellComponent;
