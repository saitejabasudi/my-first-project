
export type JavaFile = {
  id: string;
  name: string;
  content: string;
  output: string;
  isInteractive?: boolean;
  inputs?: { label: string; type: string }[];
};

export const mockFiles: JavaFile[] = [
  {
    id: 'main-java-1',
    name: 'Main.java',
    content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from JavaDroid IDE!");
    }
}`,
    output: 'Hello from JavaDroid IDE!',
  },
  {
    id: 'calculator-java-2',
    name: 'Calculator.java',
    content: `public class Calculator {
    public static void main(String[] args) {
        int a = 10;
        int b = 5;
        System.out.println("Sum: " + (a + b));
        System.out.println("Difference: " + (a - b));
    }
}`,
    output: 'Sum: 15\nDifference: 5',
  },
  {
    id: 'user-input-java-3',
    name: 'UserInput.java',
    content: `import java.util.Scanner;

public class UserInput {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = input.nextLine();
        System.out.print("Enter your age: ");
        int age = input.nextInt();
        System.out.println("\\nHello, " + name + "! You are " + age + " years old.");
        input.close();
    }
}`,
    output: 'Enter your name: {input0}\nEnter your age: {input1}\n\nHello, {input0}! You are {input1} years old.',
    isInteractive: true,
    inputs: [
        { label: 'Your Name', type: 'text' },
        { label: 'Your Age', type: 'number' },
    ],
  },
  {
    id: 'star-pattern-java-4',
    name: 'StarPattern.java',
    content: `public class StarPattern {
    public static void main(String[] args) {
        int rows = 5;
        // loop to iterate for the given number of rows
        for (int i = 1; i <= rows; ++i) {
            // loop to print the stars in each row
            for (int j = 1; j <= i; ++j) {
                System.out.print("* ");
            }
            // moves to the next line
            System.out.println();
        }
    }
}`,
    output: `* \n* * \n* * * \n* * * * \n* * * * * `,
  }
];
