import './global.css';
import { Providers } from '../components/Providers';
import { ThemeWrapper } from '../components/ThemeWrapper';

export const metadata = {
  title: 'DynaPredict',
  description: 'Plataforma de monitoramento de ativos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeWrapper>
          <Providers>{children}</Providers>
        </ThemeWrapper>
      </body>
    </html>
  );
}
