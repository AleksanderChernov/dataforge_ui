import { motion } from "@/lib/framer-motion";
import { Checkbox } from "../ui/checkbox";
import { fadeIn } from "@/lib/animations";
import { FilterConditions } from "@/lib/types";

type FilterPanelProps = {
  filterConditions: FilterConditions;
  activeFilters: string[];
  toggleFilter: (label: string) => void;
};

export default function FilterPanel(props: FilterPanelProps) {
  const { filterConditions, activeFilters, toggleFilter } = props;

  return (
    <motion.div {...fadeIn}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {filterConditions.map(({ label }) => (
          <div key={label} className="flex items-center space-x-2">
            <Checkbox
              className="cursor-pointer"
              checked={activeFilters.includes(label)}
              onCheckedChange={() => toggleFilter(label)}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
