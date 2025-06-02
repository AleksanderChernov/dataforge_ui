import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

export default function SymbolInfo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="symbol-format">
        <AccordionTrigger className="w-full cursor-pointer">
          What does a symbol like ETH/BTC or BTC/USDT:USDT mean?
        </AccordionTrigger>
        <AccordionContent>
          Symbols follow the format <strong>BASE/QUOTE</strong>:
          <br />
          <strong>BASE</strong>: asset you&apos;re trading (buying/selling).
          <br />
          <strong>QUOTE</strong>: asset used to price the base.
          <br />
          <br />
          <strong>ETH/BTC</strong> → Trading ETH priced in BTC.
          <br />
          <strong>BTC/USDT:USDT</strong> → BTC priced in USDT, settled or
          margined in USDT.
          <br />
          <br />
          The part after the colon (e.g., <code>:USDT</code>) often indicates a
          derivative or contract market.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
