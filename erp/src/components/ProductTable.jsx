import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatComma } from "@/lib/utils";

export default function ProductTable({ products }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SaleRate</TableHead>
            <TableHead>Sizes</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.id}</TableCell>
              <TableCell className="font-medium flex items-center space-x-2">
                <div>{p.title}</div>
                {p.isNew && (
                  <div className="bg-rose-400 p-0 h-[14px] px-1 rounded text-white text-[7pt]">
                    N
                  </div>
                )}
                {p.isBest && (
                  <div className="bg-primary p-0 h-[14px] px-1 rounded text-white text-[7pt]">
                    B
                  </div>
                )}
              </TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>{p.saleRate && `${p.saleRate}%`}</TableCell>
              <TableCell className="text-xs flex space-x-1">
                {p.sizes?.map((s) => (
                  <div
                    key={s}
                    className={
                      p.disabled?.includes(s)
                        ? "text-stone-400 line-through"
                        : ""
                    }
                  >
                    {" "}
                    {s}
                  </div>
                ))}
              </TableCell>
              <TableCell className="text-right">
                {formatComma(p.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
