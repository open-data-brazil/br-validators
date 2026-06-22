import Link from 'next/link';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { ROUTES } from '@/lib/nav';

export default function HomePage() {
  return (
    <ValidatorPanel
      title="BR Validators Playground"
      description="Pick a document from the sidebar to validate, format, and generate test values."
    >
      <ResultSection title="Modules">
        {ROUTES.map((route) => (
          <Link key={route.slug} href={`/${route.slug}`}>
            {route.label} — {route.description}
          </Link>
        ))}
      </ResultSection>
    </ValidatorPanel>
  );
}
