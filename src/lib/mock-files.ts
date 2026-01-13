export type JavaFile = {
  id: string;
  name: string;
  content: string;
  output: string;
};

export const mockFiles: JavaFile[] = [
  {
    id: 'main-java',
    name: 'Main.java',
    content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java Studio Pro!");
        System.out.println("Hello from Main.java");
    }
}`,
    output: 'Hello from Java Studio Pro!\nHello from Main.java',
  },
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
];
