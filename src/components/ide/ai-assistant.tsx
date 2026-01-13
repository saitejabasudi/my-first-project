"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";

export function AIAssistant() {

  const suggestions = [
    "Add comments to code",
    "Optimize the code",
    "Add a new method"
  ];

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Assistant</span>
        </h2>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Button className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Refactor Code
        </Button>

        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                        <Button key={index} variant="ghost" className="w-full justify-start text-left h-auto">
                            {suggestion}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
