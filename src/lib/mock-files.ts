
export type JavaFile = {
  id: string;
  name: string;
  content: string;
};

export const mockFiles: JavaFile[] = [
  {
    id: 'main-java-1',
    name: 'Main.java',
    content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from JavaDroid IDE!");
        System.out.println("You can edit this code and run it.");
    }
}`,
  },
  {
    id: 'calculator-java-2',
    name: 'Calculator.java',
    content: `public class Calculator {
    public static void main(String[] args) {
        // This is a simple simulation.
        // Variables and calculations are not yet supported.
        int a = 10;
        int b = 5;
        System.out.println("Sum: 15");
        System.out.println("Difference: 5");
    }
}`,
  },
  {
    id: 'user-input-java-3',
    name: 'UserInput.java',
    content: `public class UserInput {
    public static void main(String[] args) {
        // The current version of the IDE doesn't support Scanner for input.
        // It can only display output from string literals.
        System.out.println("This is a placeholder for a program that would take user input.");
    }
}`,
  },
  {
    id: 'star-pattern-java-4',
    name: 'StarPattern.java',
    content: `public class StarPattern {
    public static void main(String[] args) {
        // This is a simple simulation.
        // Loops are not yet supported in the output.
        System.out.println("*");
        System.out.println("* *");
        System.out.println("* * *");
        System.out.println("* * * *");
        System.out.println("* * * * *");
    }
}`,
  }
];
