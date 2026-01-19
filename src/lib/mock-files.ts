
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
        System.out.println("Try writing your own code with variables and loops.");
    }
}`,
  },
  {
    id: 'calculator-java-2',
    name: 'Calculator.java',
    content: `public class Calculator {
    public static void main(String[] args) {
        // This program now performs real calculations.
        int a = 10;
        int b = 5;
        System.out.println("Demonstrating variables and arithmetic:");
        System.out.println("a = " + a);
        System.out.println("b = " + b);
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
    }
}`,
  },
  {
    id: 'star-pattern-java-4',
    name: 'StarPattern.java',
    content: `public class StarPattern {
    public static void main(String[] args) {
        // This program now uses a real for-loop.
        System.out.println("A right-angled triangle of stars:");
        for (int i = 1; i <= 5; i++) {
            String line = "";
            for (int j = 1; j <= i; j++) {
                line += "* ";
            }
            System.out.println(line);
        }
    }
}`,
  }
];
