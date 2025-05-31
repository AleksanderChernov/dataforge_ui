"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  setSearch: (value: string) => void;
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
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const searchedSymbols = useMemo(() => {
    return allSymbols.filter((symbol) =>
      symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [allSymbols, search]);

  const loadMoreSymbols = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setVisibleSymbols((prevVisibleSymbols) => {
      const startIndex = prevVisibleSymbols.length;
      const endIndex = Math.min(startIndex + 50, searchedSymbols.length);
      if (startIndex >= searchedSymbols.length) {
        setIsLoading(false);
        return prevVisibleSymbols;
      }
      const nextSymbols = searchedSymbols.slice(startIndex, endIndex);
      setIsLoading(false);
      return [...prevVisibleSymbols, ...nextSymbols];
    });
  }, [isLoading, searchedSymbols]);

  useEffect(() => {
    setVisibleSymbols(searchedSymbols.slice(0, 50));
  }, [search, searchedSymbols]);

  const setupObserver = (element: HTMLDivElement | null) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSymbols();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  };

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="mb-2"
        />
        <div className="h-100 overflow-y-auto space-y-1">
          {visibleSymbols.length === 0 ? (
            <div className="text-muted-foreground px-2">Not found</div>
          ) : (
            visibleSymbols.map((symbol, index) => (
              <div
                key={index}
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
            ))
          )}
          {isLoading && (
            <div className="text-muted-foreground px-2">Loading...</div>
          )}
          {visibleSymbols.length < searchedSymbols.length && (
            <div
              className="h-1"
              ref={(element) => {
                loadMoreRef.current = element;
                if (element) {
                  setupObserver(element);
                }
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
