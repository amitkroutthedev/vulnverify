import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - CVE Chat",
  //  description: "Analyze code vulnerabilities, identify security risks, and get intelligent recommendations tailored to your tech stack. Powered by Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
