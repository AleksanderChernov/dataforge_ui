import { SetStateAction } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SymbolSelectorProps = {
  allSymbols: string[];
  selectedSymbols: string[];
  search: string;
  setSearch: (value: SetStateAction<string>) => void;
  checkForDoubleAndSave: (symbol: string) => void;
};

export default function SymbolSelector(props: SymbolSelectorProps) {
  const {
    allSymbols,
    selectedSymbols,
    search,
    setSearch,
    checkForDoubleAndSave,
  } = props;
  const searchedSymbols = allSymbols.filter((symbol) =>
    symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Choose up to 5 symbols.
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-2">
        <Input
          placeholder="Search for symbols"
          value={search}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setSearch(e.target.value)
          }
          className="mb-2"
        />
        <div
          className={`flex flex-col align-items-center justify-center ${
            searchedSymbols.length > 5 ? "pt-12" : ""
          } max-h-60 overflow-y-auto space-y-1`}
        >
          {searchedSymbols.slice(0, 50).map((symbol) => (
            <div
              key={symbol}
              className={cn(
                "cursor-pointer px-2 py-1 rounded-md flex justify-between",
                selectedSymbols.includes(symbol) && "bg-primary text-white"
              )}
              onClick={() => checkForDoubleAndSave(symbol)}
            >
              <span>{symbol}</span>
              {selectedSymbols.includes(symbol) && (
                <Check className="h-4 w-4" />
              )}
            </div>
          ))}
          {searchedSymbols.length === 0 && (
            <div className="text-muted-foreground px-2">Not found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}