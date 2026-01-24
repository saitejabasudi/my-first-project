'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InputDialogProps = {
  isOpen: boolean;
  prompts: string[];
  onSubmit: (inputs: string[]) => void;
  onClose: () => void;
};

export function InputDialog({ isOpen, prompts, onSubmit, onClose }: InputDialogProps) {
  const [inputs, setInputs] = useState<string[]>(Array(prompts.length).fill(''));

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = () => {
    onSubmit(inputs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Program Input Required</DialogTitle>
          <DialogDescription>
            Your program is waiting for input. Please provide the required values below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {prompts.map((prompt, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`input-${index}`} className="text-right col-span-1">
                {prompt || `Input ${index + 1}`}
              </Label>
              <Input
                id={`input-${index}`}
                value={inputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && index === prompts.length - 1) {
                        handleSubmit();
                    }
                }}
              />
            </div>
          ))}
          {prompts.length === 0 && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`input-0`} className="text-right col-span-1">
                    Input
                </Label>
                <Input
                    id={`input-0`}
                    value={inputs[0] || ''}
                    onChange={(e) => handleInputChange(0, e.target.value)}
                    className="col-span-3"
                     onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    }}
                />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Run Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
