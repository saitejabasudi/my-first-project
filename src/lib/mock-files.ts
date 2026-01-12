export type JavaFile = {
  id: string;
  name: string;
  content: string;
  output: string;
};

export const mockFiles: JavaFile[] = [
  {
    id: 'hello-world',
    name: 'HelloWorld.java',
    content: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    output: 'Hello, World!',
  },
  {
    id: 'scanner-example',
    name: 'ScannerExample.java',
    content: `import java.util.Scanner;

public class ScannerExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`,
    output: 'Enter your name:\n> John Doe\nHello, John Doe!',
  },
  {
    id: 'loop-example',
    name: 'LoopExample.java',
    content: `public class LoopExample {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Iteration " + i);
        }
    }
}`,
    output: 'Iteration 1\nIteration 2\nIteration 3\nIteration 4\nIteration 5',
  },
  {
    id: 'calculator',
    name: 'Calculator.java',
    content: `public class Calculator {
    public static void main(String[] args) {
        int a = 10;
        int b = 5;
        System.out.println("Sum: " + (a + b));
        System.out.println("Difference: " + (a - b));
        System.out.println("Product: " + (a * b));
        System.out.println("Quotient: " + (a / b));
    }
}`,
    output: 'Sum: 15\nDifference: 5\nProduct: 50\nQuotient: 2',
  },
];
