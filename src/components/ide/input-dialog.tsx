
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InputField = {
  label: string;
  type: string;
};

type InputDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: string[]) => void;
  inputs: InputField[];
};

export function InputDialog({ isOpen, onClose, onSubmit, inputs }: InputDialogProps) {
  const [values, setValues] = useState<string[]>(() => Array(inputs.length).fill(''));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValues(Array(inputs.length).fill(''));
      setError(null);
    }
  }, [isOpen, inputs.length]);

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleSubmit = () => {
    for (let i = 0; i < inputs.length; i++) {
      if (!values[i].trim()) {
        setError(`Please fill out the '${inputs[i].label}' field.`);
        return;
      }
    }
    setError(null);
    onSubmit(values);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Program Input Required</DialogTitle>
          <DialogDescription>
            This program requires user input to run. Please provide the following values.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {inputs.map((input, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`input-${index}`} className="text-right">
                {input.label}
              </Label>
              <Input
                id={`input-${index}`}
                type={input.type}
                value={values[index]}
                onChange={(e) => handleValueChange(index, e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          ))}
          {error && <p className="col-span-4 text-sm text-destructive text-center pt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Run Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
