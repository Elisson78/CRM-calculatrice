import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ElevatorControlProps {
    label: string;
    hasElevator: boolean;
    onElevatorChange: (value: boolean) => void;
    floor: number;
    onFloorChange: (value: number) => void;
    error?: string;
    className?: string;
}

export function ElevatorControl({
    label,
    hasElevator,
    onElevatorChange,
    floor,
    onFloorChange,
    error,
    className,
}: ElevatorControlProps) {
    // Floors from 0 (RDC) to 12
    const floors = Array.from({ length: 13 }, (_, i) => i);

    return (
        <div className={cn("space-y-2", className)}>
            <label className="block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="flex flex-wrap items-center gap-4">
                {/* Toggle YES/NO */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => onElevatorChange(false)}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                            !hasElevator
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        NON
                    </button>
                    <button
                        type="button"
                        onClick={() => onElevatorChange(true)}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                            hasElevator
                                ? "bg-green-500 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        OUI
                    </button>
                </div>

                {/* Floor Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Étage :</span>
                    <select
                        value={floor}
                        onChange={(e) => onFloorChange(parseInt(e.target.value))}
                        className="block w-40 rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    // If elevator is YES, we assume it's relevant. 
                    // Even if NO elevator, they might need to specify floor for stairs.
                    >
                        {floors.map((f) => (
                            <option key={f} value={f}>
                                {f === 0 ? 'RDC' : `${f} ème`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}
