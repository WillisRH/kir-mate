import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KIR-Mate",
  description: "Sebuah web app untuk menjangkau segala kebutuhan eskul KIR di SMAN 12 Jakarta. ^^",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="KIR-Mate" />
        <meta property="og:description" content="Sebuah web app untuk menjangkau segala kebutuhan eskul KIR di SMAN 12 Jakarta. ^^" />
        <meta property="og:image" content="https://cdn.discordapp.com/attachments/866552863264997376/1257758070176747600/image.png?ex=668591fb&is=6684407b&hm=f52d383005080b2e4cac9145c981454a74748dd8be2f7d38629ce6ff814c3cf2&" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}