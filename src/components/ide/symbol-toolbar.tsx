'use client';

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SymbolToolbarProps = {
    onSymbolClick: (symbol: string) => void;
};

export function SymbolToolbar({ onSymbolClick }: SymbolToolbarProps) {
    const symbols = [
        ['Tab', '  '],
        ['{}', '{}'],
        ['""', '""'],
        [';', ';'],
        ['=', '='],
        ['\\', '\\'],
        ['&', '&'],
        [',', ','],
    ];

    const actions = [
        { icon: <Undo2 className="h-5 w-5" />, action: 'undo' },
        { icon: <Redo2 className="h-5 w-5" />, action: 'redo' },
        { icon: <ArrowUp className="h-5 w-5" />, action: 'up' },
        { icon: <ArrowDown className="h-5 w-5" />, action: 'down' },
        { icon: <ArrowLeft className="h-5 w-5" />, action: 'left' },
        { icon: <ArrowRight className="h-5 w-5" />, action: 'right' },
    ];

    return (
        <div className="bg-card flex-shrink-0 border-t border-border p-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {symbols.map(([label, value]) => (
                        <Button
                            key={label}
                            variant="ghost"
                            size="sm"
                            className="text-xs px-3"
                            onClick={() => onSymbolClick(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="hidden sm:flex items-center gap-1">
                     {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            // onClick={() => onAction(action.action)}
                        >
                            {action.icon}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
