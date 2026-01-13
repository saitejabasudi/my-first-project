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
    }
}`,
    output: 'Hello from Java Studio Pro!',
  },
];
