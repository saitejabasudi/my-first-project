
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
        System.out.println("Welcome to Java Studio Pro!");
        System.out.println("You can edit this code and run it.");
        System.out.println("Try the other examples to see library support.");
    }
}`,
  },
  {
    id: 'calculator-java-2',
    name: 'Calculator.java',
    content: `import java.util.Scanner;

public class Calculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the first number: ");
        int a = scanner.nextInt();

        System.out.print("Enter the second number: ");
        int b = scanner.nextInt();

        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
        
        scanner.close();
    }
}`,
  },
  {
    id: 'datastructures-java-3',
    name: 'DataStructures.java',
    content: `import java.util.ArrayList;
import java.util.HashMap;

public class DataStructures {
    public static void main(String[] args) {
        // Using ArrayList
        System.out.println("--- ArrayList Example ---");
        ArrayList<String> fruits = new ArrayList<String>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        System.out.println("Fruits: " + fruits);
        System.out.println("Second fruit: " + fruits.get(1));
        System.out.println("ArrayList size: " + fruits.size());

        // Using HashMap
        System.out.println("\\n--- HashMap Example ---");
        HashMap<String, Integer> fruitPrices = new HashMap<String, Integer>();
        fruitPrices.put("Apple", 100);
        fruitPrices.put("Banana", 50);
        fruitPrices.put("Cherry", 200);
        System.out.println("Fruit Prices: " + fruitPrices);
        System.out.println("Price of an Apple: " + fruitPrices.get("Apple"));
        System.out.println("HashMap size: " + fruitPrices.size());
    }
}`,
  },
  {
    id: 'libraries-demo-4',
    name: 'LibrariesDemo.java',
    content: `import java.util.Random;
import java.util.Date;
import java.math.BigDecimal;

public class LibrariesDemo {
    public static void main(String[] args) {
        System.out.println("--- Demonstrating Standard Libraries ---");
        
        System.out.println("\\n1. java.util.Random");
        Random rand = new Random();
        int randomNumber = rand.nextInt(100); // A number between 0 and 99
        System.out.println("A random number between 0 and 99: " + randomNumber);
        
        System.out.println("\\n2. java.util.Date");
        Date now = new Date();
        System.out.println("Current date and time: " + now.toString());

        System.out.println("\\n3. java.math.BigDecimal");
        BigDecimal num1 = new BigDecimal("10.5");
        BigDecimal num2 = new BigDecimal("2.5");
        BigDecimal sum = num1.add(num2);
        System.out.println("Sum of 10.5 and 2.5 is: " + sum);
    }
}`
  }
];
