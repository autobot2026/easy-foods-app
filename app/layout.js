import './globals.css';

export const metadata = {
  title: 'Kiara Easy Foods',
  description: 'Cooking-teacher app with no ingredient typing'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
