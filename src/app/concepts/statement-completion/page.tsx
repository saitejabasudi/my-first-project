
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <pre className="bg-muted p-4 rounded-md text-sm font-code text-muted-foreground my-4 whitespace-pre-wrap">
      <code>{code.trim()}</code>
    </pre>
  );
}

export default function StatementCompletionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="flex items-center p-4 border-b">
        <Link href="/settings" passHref>
          <Button variant="ghost" size="icon" aria-label="Back to settings">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold ml-2">Understanding Code Statements</h1>
      </header>
      <main className="p-4 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How Does a Computer Read Code?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <p>
              When you write code, you're giving the computer a series of commands. But how does it know where one command ends and the next one begins? This concept is called **statement completion**.
            </p>
            <p>
              Different programming languages have different rules for this. Let's explore the two main approaches.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Line-Based Completion (like Python)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <p>
              In languages like Python, the end of a line usually means the end of a statement. It's simple and clean. You finish a command, you press Enter, and the computer knows you're done with that thought.
            </p>
            <h3 className="font-semibold">Python Example:</h3>
            <CodeBlock
              lang="python"
              code={`
name = "Alice"
print(name)
              `}
            />
            <p>
              Here, the computer sees two separate commands because they are on two separate lines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Delimiter-Based Completion (like Java, C++, JavaScript)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <p>
              In languages like Java (which this IDE is for!), C++, and JavaScript, the end of a line doesn't matter. Instead, you use a special character called a **delimiter** to signal the end of a statement. The most common delimiter is the **semicolon (;)**.
            </p>
            <p>
              This gives you more flexibility. You can write multiple statements on one line, or spread a single statement across many lines.
            </p>
            <h3 className="font-semibold">Java Example:</h3>
            <CodeBlock
              lang="java"
              code={`
String name = "Bob"; System.out.println(name);
              `}
            />
            <p>
              Even though they are on the same line, the semicolon tells the computer that there are two distinct commands here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-Line Statements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground">
            <p>
              The delimiter-based approach makes it easy to write long statements that are more readable when split across multiple lines. The computer keeps reading until it finds that special semicolon.
            </p>
            <h3 className="font-semibold">JavaScript Example:</h3>
            <CodeBlock
              lang="javascript"
              code={`
const reallyLongMessage = "This is a very long string" +
                          " that we split into multiple lines" +
                          " for better readability.";
              `}
            />
            <p>
              In this JavaScript example, the entire assignment is one single statement. The computer knows this because it only finds the semicolon at the very end. This is also how it works in Java.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
