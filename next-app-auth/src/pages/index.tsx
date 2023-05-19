import Image from "next/image";
import { Inter } from "next/font/google";
import { FormEvent } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  async function handleSubmit() {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "an1@demo.com", password: "password" }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  }

  return (
    <main>
      <button onClick={handleSubmit}>Submit</button>
    </main>
  );
}
