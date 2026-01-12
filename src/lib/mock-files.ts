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
];
