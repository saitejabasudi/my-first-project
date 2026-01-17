
export type JavaFile = {
  id: string;
  name: string;
  content: string;
  output: string;
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
];
