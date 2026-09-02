import React from 'react';
import { Coffee } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // предполагаем, что useToast импортирован

export default function ScheduleWindow({ start, end }) {
  const { toast } = useToast(); // используем useToast, если нужно

  return (
    <div className="rounded-xl border border-dashed border-black-300 bg-black-100 p-5 flex items-center justify-center gap-2">
      <Coffee className="w-6 h-6" />
      <div className="font-medium text-black-800 text-lg"> 
        Окно
      </div>
      <div className="text-xs text-muted-foreground"> 
        {start}–{end}
      </div>
    </div>
  );
}
